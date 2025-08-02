const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('../../utils/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-session', requireAuth, async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    console.log("🛒 Incoming cartItems:", cartItems);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Extract file keys from downloadUrls
    const allFileKeys = cartItems.flatMap(item => {
      let downloadUrls = [];

      try {
        if (typeof item.downloadUrls === 'string') {
          downloadUrls = JSON.parse(item.downloadUrls);
        } else if (Array.isArray(item.downloadUrls)) {
          downloadUrls = item.downloadUrls;
        }
      } catch (err) {
        console.error('⚠️ Failed to parse downloadUrls:', err);
        return [];
      }

      return downloadUrls.map(urlObj => {
        if (!urlObj?.url) return null;
        try {
          const url = new URL(urlObj.url);
          const rawKey = url.pathname.slice(1); // Remove leading "/"
          const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
          console.log("🔑 Extracted key:", key);
          return key;
        } catch (err) {
          console.error('❌ Invalid URL in downloadUrls:', urlObj.url, err);
          return null;
        }
      }).filter(Boolean);
    });

    if (allFileKeys.length === 0) {
      console.warn("⚠️ No downloadable file keys found.");
    }

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
        fileKeys: JSON.stringify(allFileKeys), // Save safely as stringified array
      },
      customer_email: req.user.email,
    });

    console.log("✅ Stripe session created:", session.id);
    console.log("📦 Session metadata:", session.metadata);

    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('🔥 Stripe session creation error:', error);
    return res.status(500).json({ message: 'Failed to create Stripe checkout session.' });
  }
});

module.exports = router;
