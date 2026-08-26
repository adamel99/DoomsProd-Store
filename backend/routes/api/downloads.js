const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require('../../utils/auth');
const rateLimit = require('../../utils/rateLimit');
const { Order } = require('../../db/models');
const { getSignedDownload } = require('../../utils/sendProductEmail');
const { getOrderDownloadFiles } = require('../../utils/checkout');

const router = express.Router();

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
