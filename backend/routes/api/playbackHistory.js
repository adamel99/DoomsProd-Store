const express = require('express');
const router = express.Router();
const { PlaybackHistory, Product } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

// GET /api/playback-history - Get current user's recent playback history (latest first)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const histories = await PlaybackHistory.findAll({
      where: { userId: req.user.id },
      include: {
        model: Product,
        attributes: ['id', 'title', 'youtubeLink', 'audioUrl', 'type'],
      },
      order: [['listenedAt', 'DESC']],
      limit: 20, // limit number of recent listens returned
    });

    return res.json({ histories });
  } catch (err) {
    next(err);
  }
});

// POST /api/playback-history - Log that user listened to a product (beat/kit)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findByPk(productId, { attributes: ['id'] });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const history = await PlaybackHistory.create({
      userId: req.user.id,
      productId,
      listenedAt: new Date(),
    });

    return res.status(201).json({ history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
