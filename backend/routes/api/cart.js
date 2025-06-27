const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product, License } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

// GET /api/cart - Get cart summary (items + total)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // 🔧 Auto-create cart if missing
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        { model: Product, attributes: ['id', 'title', 'type', 'price', 'youtubeLink', 'audioPreviewUrl'] },
        { model: License, attributes: ['id', 'name', 'price'] }
      ]
    });

    const total = items.reduce((sum, item) => {
      const basePrice = item.License ? parseFloat(item.License.price) : parseFloat(item.Product.price);
      return sum + (basePrice * item.quantity);
    }, 0);

    return res.json({ cart: items, total: total.toFixed(2) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
