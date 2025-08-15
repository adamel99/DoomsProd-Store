const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('../../utils/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Production-safe version
router.post('/create-session', async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    console.log("🛒 Incoming cartItems:", cartItems);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Optional: use requireAuth if you want to enforce login
    let userId = null;
    let userEmail = null;

    try {
      // If logged in, requireAuth sets req.user
      await requireAuth(req, res, () => {});
      if (req.user) {
        userId = req.user.id.toString();
        userEmail = req.user.email;
      }
    } catch (err) {
      console.warn("⚠️ User not authenticated, proceeding without user info.");
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
      }

      return downloadUrls.map(urlObj => {
        if (!urlObj?.url) return null;
        try {
          const url = new URL(urlObj.url);
          const rawKey = url.pathname.slice(1); // Remove leading "/"
          return decodeURIComponent(rawKey.replace(/\+/g, ' '));
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
            name: item.productName || 'Untitled',
            description: `License: ${item.licenseType || 'Standard'}`,
          },
          unit_amount: Math.round((item.price || 0) * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout-cancel`,
      metadata: {
        userId: userId || 'guest',
        fileKeys: JSON.stringify(allFileKeys),
      },
      customer_email: userEmail || undefined, // Stripe will allow no email
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
