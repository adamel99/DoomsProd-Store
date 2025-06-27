const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('../../utils/auth');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-intent
router.post('/create-intent', requireAuth, async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert dollars to cents
      currency,
      metadata: { userId: req.user.id.toString() },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
