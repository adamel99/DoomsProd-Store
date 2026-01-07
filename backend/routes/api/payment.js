const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('../../utils/auth');
const { sendProductEmail } = require('../../utils/sendProduct');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-session', async (req, res, next) => {
  try {
    const { cartItems } = req.body;
    console.log("🛒 Incoming cartItems:", JSON.stringify(cartItems, null, 2));

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Optional: use requireAuth if you want to enforce login
    let userId = null;
    let userEmail = null;

    try {
      await requireAuth(req, res, () => {});
      if (req.user) {
        userId = req.user.id.toString();
        userEmail = req.user.email;
      }
    } catch (err) {
      console.warn("⚠️ User not authenticated, proceeding without user info.");
    }

    // Extract file keys from downloadUrls - handle multiple encoding scenarios
    const allFileKeys = cartItems.flatMap(item => {
      let downloadUrls = [];

      console.log("🔍 Processing item:", item.productName);
      console.log("📦 Raw downloadUrls:", item.downloadUrls);
      console.log("📦 Type:", typeof item.downloadUrls);

      try {
        // Handle if it's already an array
        if (Array.isArray(item.downloadUrls)) {
          downloadUrls = item.downloadUrls;
        }
        // Handle if it's a JSON string
        else if (typeof item.downloadUrls === 'string') {
          downloadUrls = JSON.parse(item.downloadUrls);
        }

        console.log("✅ Parsed downloadUrls:", downloadUrls);
      } catch (err) {
        console.error('⚠️ Failed to parse downloadUrls:', err);
        return [];
      }

      // Extract S3 keys from URL objects or strings
      return downloadUrls.map(urlObj => {
        // Handle if it's already just a string key
        if (typeof urlObj === 'string' && !urlObj.startsWith('http')) {
          console.log("✅ Direct key:", urlObj);
          return urlObj;
        }

        // Handle URL objects with .url property
        const urlString = urlObj?.url || urlObj;
        if (!urlString) return null;

        try {
          const url = new URL(urlString);
          const rawKey = url.pathname.slice(1); // Remove leading "/"
          const decodedKey = decodeURIComponent(rawKey.replace(/\+/g, ' '));
          console.log("✅ Extracted key from URL:", decodedKey);
          return decodedKey;
        } catch (err) {
          console.error('❌ Invalid URL:', urlString, err);
          return null;
        }
      }).filter(Boolean);
    });

    console.log("📦 Final extracted file keys:", allFileKeys);

    if (allFileKeys.length === 0) {
      console.warn("⚠️ No downloadable file keys found - email will not contain files!");
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
        // ✅ Store as simple comma-separated string
        fileKeys: allFileKeys.join(','),
      },
      customer_email: userEmail || undefined,
    });

    console.log("✅ Stripe session created:", session.id);
    console.log("📧 Customer email:", session.customer_email);
    console.log("📦 Metadata fileKeys:", session.metadata.fileKeys);

    return res.json({ sessionId: session.id });
  } catch (error) {
    console.error('🔥 Stripe session creation error:', error);
    return res.status(500).json({ message: 'Failed to create Stripe checkout session.' });
  }
});

router.post('/free-checkout', requireAuth, async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userEmail = req.user.email;

    console.log("🆓 Processing free checkout for:", userEmail);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Check if all items are free
    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

    if (total > 0) {
      return res.status(400).json({ message: 'This endpoint is only for free items.' });
    }

    // Extract file keys
    const allFileKeys = cartItems.flatMap(item => {
      let downloadUrls = [];

      if (Array.isArray(item.downloadUrls)) {
        downloadUrls = item.downloadUrls;
      } else if (typeof item.downloadUrls === 'string') {
        try {
          downloadUrls = JSON.parse(item.downloadUrls);
        } catch (e) {
          console.error('Failed to parse downloadUrls:', e);
          return [];
        }
      }

      return downloadUrls.map(urlObj => {
        // If it's already a key string
        if (typeof urlObj === 'string' && !urlObj.startsWith('http')) {
          return urlObj;
        }

        // If it has a key property, use that
        if (urlObj?.key) {
          return urlObj.key;
        }

        // Extract from URL
        const urlString = urlObj?.url || urlObj;
        if (!urlString) return null;

        try {
          const url = new URL(urlString);
          const rawKey = url.pathname.slice(1);
          return decodeURIComponent(rawKey.replace(/\+/g, ' '));
        } catch (err) {
          console.error('Invalid URL:', urlString);
          return null;
        }
      }).filter(Boolean);
    });

    console.log("📦 File keys for free download:", allFileKeys);

    if (allFileKeys.length === 0) {
      return res.status(400).json({ message: 'No downloadable files found.' });
    }

    // Send email immediately
    await sendProductEmail(userEmail, allFileKeys);

    console.log("✅ Free product email sent to:", userEmail);

    return res.json({
      success: true,
      message: 'Download links sent to your email!'
    });

  } catch (error) {
    console.error('❌ Free checkout error:', error);
    return res.status(500).json({ message: 'Failed to process free checkout.' });
  }
});

module.exports = router;
