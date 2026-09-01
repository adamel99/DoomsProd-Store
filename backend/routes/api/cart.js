const express = require('express');
const router = express.Router();
const { CartItem } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { cartItemIncludes, findOrCreateUserCart } = require('../../utils/cart');

// GET /api/cart - Get cart summary (items + total)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // 🔧 Auto-create cart if missing
    const cart = await findOrCreateUserCart(req.user.id);

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: cartItemIncludes,
    });

    const total = items.reduce((sum, item) => {
      const basePrice = item.License ? parseFloat(item.License.price) : parseFloat(item.Product.price || 0);
      return sum + (basePrice * item.quantity);
    }, 0);

    return res.json({ cart: items, total: total.toFixed(2) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
