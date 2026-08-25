const express = require('express');
const Stripe = require('stripe');
const { requireAuth } = require('../../utils/auth');
const { sendProductEmail, getSignedFileUrl } = require('../../utils/sendProductEmail');
const rateLimit = require('../../utils/rateLimit');
const { cents, clearCartForOrder, createOrderFromCart, getOrderFileKeys } = require('../../utils/checkout');
const { Order } = require('../../db/models');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const getReusableCheckoutSessionId = async (userId) => {
  const pendingOrder = await Order.findOne({
    where: { userId, status: 'pending' },
    order: [['createdAt', 'DESC']],
  });

  if (!pendingOrder?.paymentIntentId?.startsWith('cs_')) return null;

  try {
    const session = await stripe.checkout.sessions.retrieve(pendingOrder.paymentIntentId);
    if (session.status === 'open' && session.payment_status === 'unpaid') {
      return session.id;
    }
  } catch (_err) {
    return null;
  }

  return null;
};

router.post(
  '/create-session',
  requireAuth,
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10 }),
  async (req, res) => {
    try {
      const reusableSessionId = await getReusableCheckoutSessionId(req.user.id);
      if (reusableSessionId) return res.json({ sessionId: reusableSessionId });

      const { order, lineItems, totalPrice } = await createOrderFromCart(req.user.id);

      if (totalPrice <= 0) {
        return res.status(400).json({ message: 'Use free checkout for free carts.' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.product.title || 'Untitled',
              description: `License: ${item.license?.name || 'Standard'}`,
            },
            unit_amount: cents(item.price),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout-cancel`,
        metadata: {
          orderId: String(order.id),
          userId: String(req.user.id),
        },
        customer_email: req.user.email,
      });

      order.paymentIntentId = session.payment_intent || session.id;
      await order.save();

      return res.json({ sessionId: session.id });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: status === 500 ? 'Failed to create Stripe checkout session.' : error.message });
    }
  }
);

router.post(
  '/free-checkout',
  requireAuth,
  rateLimit({ windowMs: 10 * 60 * 1000, max: 6 }),
  async (req, res) => {
    try {
      const { order, totalPrice } = await createOrderFromCart(req.user.id);

      if (totalPrice > 0) {
        await order.update({ status: 'cancelled' });
        return res.status(400).json({ message: 'This endpoint is only for free items.' });
      }

      const fileKeys = await getOrderFileKeys(order.id);
      if (!fileKeys.length) {
        return res.status(400).json({ message: 'No downloadable files found.' });
      }

      const signedUrls = await Promise.all(fileKeys.map((key) => getSignedFileUrl(key)));
      await sendProductEmail(req.user.email, fileKeys);
      await clearCartForOrder(order);

      return res.json({
        success: true,
        message: 'Download links sent to your email.',
        orderId: order.id,
        downloadLinks: signedUrls,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: status === 500 ? 'Failed to process free checkout.' : error.message });
    }
  }
);

module.exports = router;
