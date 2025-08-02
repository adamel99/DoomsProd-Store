const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getSignedFileUrl } = require('../../utils/sendProduct');

function isValidSessionId(id) {
  return typeof id === 'string' && id.startsWith('cs_');
}

router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  console.log("📥 Incoming request for sessionId:", sessionId);

  if (!isValidSessionId(sessionId)) {
    return res.status(400).json({ message: 'Invalid session ID format.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("💳 Retrieved Stripe session:", session);

    if (!session || !session.metadata || !session.metadata.fileKeys) {
      return res.status(400).json({ message: 'Download information missing in Stripe session metadata.' });
    }

    let fileKeys;
    try {
      fileKeys = JSON.parse(session.metadata.fileKeys);
    } catch (err) {
      console.error("❌ Error parsing fileKeys from metadata:", err);
      return res.status(400).json({ message: 'Malformed fileKeys in metadata.' });
    }

    if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
      return res.status(400).json({ message: 'No valid file keys found.' });
    }

    const signedUrls = await Promise.all(
      fileKeys.map(async (key) => {
        try {
          const signed = await getSignedFileUrl(key);
          console.log("🔐 Signed URL for:", key, "=>", signed);
          return signed;
        } catch (err) {
          console.error("❌ Failed to generate signed URL for:", key, err);
          return null;
        }
      })
    );

    const validUrls = signedUrls.filter(Boolean);

    if (validUrls.length === 0) {
      return res.status(500).json({ message: 'No downloadable URLs could be generated.' });
    }

    return res.json({
      email: session.customer_email || null,
      downloadLinks: validUrls,
    });
  } catch (err) {
    console.error("🔥 Stripe session fetch error:", err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
