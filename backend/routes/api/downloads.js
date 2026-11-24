const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require('../../utils/auth');
const rateLimit = require('../../utils/rateLimit');
const { Order, Product } = require('../../db/models');
const { getSignedDownload, getSignedPublicMp3Download, sendFreeBeatDownloadEmail } = require('../../utils/sendProductEmail');
const { getOrderDownloadFiles } = require('../../utils/checkout');
const { logError } = require('../../utils/logger');

const router = express.Router();
const freeMp3RateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });

router.post('/free-mp3/:productId', requireAuth, freeMp3RateLimit, async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ message: 'Invalid beat.' });
    }

    const product = await Product.findByPk(productId);
    if (!product || product.type !== 'beat') return res.status(404).json({ message: 'Beat not found.' });

    const mp3 = (Array.isArray(product.downloadUrls) ? product.downloadUrls : [])
      .find((file) => String(file?.type).toLowerCase() === 'mp3' && file?.key);
    if (!mp3) return res.status(404).json({ message: 'A free MP3 is not available for this beat.' });

    const fileName = `${product.title.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'beat'}.mp3`;
    const downloadUrl = await getSignedPublicMp3Download(mp3.key, fileName);
    await sendFreeBeatDownloadEmail(req.user.email, req.user.username, product.title, downloadUrl);

    return res.json({ downloadUrl, fileName, message: 'Your free MP3 is downloading, and the link and terms were emailed to you.' });
  } catch (error) {
    logError('Free beat MP3 request failed', error, { userId: req.user?.id, productId: req.params.productId });
    return res.status(500).json({ message: 'Could not prepare the free MP3 download. Please try again.' });
  }
});

const resolveOrderId = async (id) => {
  if (/^\d+$/.test(id)) return id;
  if (!id.startsWith('cs_')) return null;

  const session = await stripe.checkout.sessions.retrieve(id);
  if (session.payment_status !== 'paid') return null;
  return session.metadata?.orderId || null;
};

router.get(
  '/:orderOrSessionId',
  requireAuth,
  rateLimit({ windowMs: 10 * 60 * 1000, max: 10 }),
  async (req, res) => {
    try {
      const orderId = await resolveOrderId(req.params.orderOrSessionId);
      if (!orderId) return res.status(400).json({ message: 'Invalid download request.' });

      const order = await Order.findByPk(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found.' });
      if (order.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized download request.' });
      if (order.status !== 'completed') return res.status(403).json({ message: 'Order is not ready for downloads.' });

      const files = await getOrderDownloadFiles(order.id);
      if (!files.length) return res.status(404).json({ message: 'No downloads available.' });

      const downloadLinks = await Promise.all(files.map((file) => getSignedDownload(file)));
      return res.json({ orderId: order.id, downloadLinks });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error.' });
    }
  }
);

module.exports = router;
