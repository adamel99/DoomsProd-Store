const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('../../utils/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-session', requireAuth, async (req, res, next) => {
  try {
    const { cartItems } = req.body;

    console.log("Received cartItems:", cartItems); // ⬅️ Add this

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // ✅ Log their download URLs
    const downloadUrls = cartItems.map(item => item.downloadUrl);
    console.log("Download URLs from cartItems:", downloadUrls);

    // 🔧 Build comma-separated fileKeys
    const fileKeys = downloadUrls
      .filter(url => typeof url === 'string' && url.trim() !== '')
      .join(',');

    console.log("Final fileKeys string to be added to metadata:", fileKeys); // ⬅️ Add this

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ['card'],
      line_items: cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName,
            description: `License: ${item.licenseType}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout-cancel`,
      metadata: {
        userId: req.user.id.toString(),
        fileKeys: fileKeys || '',
      },
      customer_email: req.user.email,
    });

    console.log("✅ Created Stripe session with metadata:", session.metadata);


    console.log("Created Stripe session:", session.id, session.metadata); // ⬅️ Check metadata here

    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('❌ Error creating Stripe session:', error);
    next(error);
  }
});



module.exports = router;
