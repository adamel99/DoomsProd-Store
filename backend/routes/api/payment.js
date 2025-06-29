const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('../../utils/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post(
  '/create-session',
  requireAuth,
  async (req, res, next) => {
    try {
      const { cartItems } = req.body;

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const line_items = cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName,
            description: `License: ${item.licenseType}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout-cancel`,
        metadata: {
          userId: req.user.id.toString(),
        },
        locale: 'en',
      });

      return res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      next(error);
    }
  }
);

module.exports = router;
