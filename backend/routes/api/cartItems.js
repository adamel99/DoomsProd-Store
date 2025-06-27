const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product, License } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

// GET /api/cart-items - Get all cart items
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // Auto-create cart if it doesn't exist
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        { model: Product },
        { model: License }
      ]
    });

    return res.json({ items });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart-items - Add item (no quantity logic)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { productId, licenseId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // Auto-create cart if it doesn't exist
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        licenseId: licenseId || null
      }
    });

    if (existingItem) {
      return res.status(400).json({ message: 'This item is already in your cart.' });
    }

    const newItem = await CartItem.create({
      userId: req.user.id,
      cartId: cart.id,
      productId,
      licenseId: licenseId || null
    });

    const fullItem = await CartItem.findByPk(newItem.id, {
      include: [
        { model: Product },
        { model: License }
      ]
    });

    return res.status(201).json({ item: fullItem });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart-items/:id - Update item (license only)
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { licenseId } = req.body;
    const item = await CartItem.findByPk(req.params.id);

    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    const cart = await Cart.findOne({ where: { id: item.cartId, userId: req.user.id } });
    if (!cart) return res.status(403).json({ message: 'Unauthorized' });

    if (licenseId !== undefined) {
      item.licenseId = licenseId;
    }

    await item.save();

    const updatedItem = await CartItem.findByPk(item.id, {
      include: [
        { model: Product },
        { model: License }
      ]
    });

    return res.json({ item: updatedItem });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart-items/:id - Remove item
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const cart = await Cart.findOne({ where: { id: item.cartId, userId: req.user.id } });
    if (!cart) return res.status(403).json({ message: 'Unauthorized' });

    await item.destroy();
    return res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
