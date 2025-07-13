const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product, License } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');

// Helper to format cart items consistently
function formatCartItem(item) {
  const product = item.Product || {};
  const license = item.License || {};

  // Price: prefer license price if available, else product price, else 0
  const price =
    license.price !== undefined && license.price !== null
      ? license.price
      : product.price || 0;

  return {
    id: item.id,
    productId: item.productId,
    licenseId: item.licenseId,
    productName: product.title || 'Unknown Product',
    licenseType: license.name || license.type || 'Standard',
    price,
    type: product.type || 'unknown',
    imageUrl: product.imageUrl || null,
    downloadUrl: product.downloadUrl || null,
  };
}

// GET /api/cart-items - Get all cart items for logged in user
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
        { model: License },
      ],
    });

    console.log(`🔍 Fetched raw cart items (count: ${items.length}):`);
    items.forEach((item, idx) => {
      console.log(`  Item ${idx + 1}:`, {
        id: item.id,
        productId: item.productId,
        licenseId: item.licenseId,
        productDownloadUrl: item.Product?.downloadUrl,
      });
    });

    const formattedItems = items.map(formatCartItem);

    console.log(`✅ Formatted cart items with downloadUrl:`);
    formattedItems.forEach((item, idx) => {
      console.log(`  Item ${idx + 1}:`, {
        id: item.id,
        productName: item.productName,
        downloadUrl: item.downloadUrl,
      });
    });

    return res.json({ items: formattedItems });
  } catch (err) {
    console.error('❌ Error fetching cart items:', err);
    next(err);
  }
});

// POST /api/cart-items - Add item to cart
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
        licenseId: licenseId || null,
      },
    });

    if (existingItem) {
      return res.status(400).json({ message: 'This item is already in your cart.' });
    }

    const newItem = await CartItem.create({
      userId: req.user.id,
      cartId: cart.id,
      productId,
      licenseId: licenseId || null,
    });

    const fullItem = await CartItem.findByPk(newItem.id, {
      include: [
        { model: Product },
        { model: License },
      ],
    });

    const formattedSingleItem = formatCartItem(fullItem);

    console.log('➕ Added cart item:', {
      id: formattedSingleItem.id,
      productName: formattedSingleItem.productName,
      downloadUrl: formattedSingleItem.downloadUrl,
    });

    return res.status(201).json({ item: formattedSingleItem });
  } catch (err) {
    console.error('❌ Error adding cart item:', err);
    next(err);
  }
});

// PUT /api/cart-items/:id - Update cart item (e.g., license change)
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
        { model: License },
      ],
    });

    const formattedUpdatedItem = formatCartItem(updatedItem);

    console.log('✏️ Updated cart item:', {
      id: formattedUpdatedItem.id,
      productName: formattedUpdatedItem.productName,
      downloadUrl: formattedUpdatedItem.downloadUrl,
    });

    return res.json({ item: formattedUpdatedItem });
  } catch (err) {
    console.error('❌ Error updating cart item:', err);
    next(err);
  }
});

// DELETE /api/cart-items/:id - Remove item from cart
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const cart = await Cart.findOne({ where: { id: item.cartId, userId: req.user.id } });
    if (!cart) return res.status(403).json({ message: 'Unauthorized' });

    await item.destroy();

    console.log('🗑️ Deleted cart item with id:', item.id);

    return res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('❌ Error deleting cart item:', err);
    next(err);
  }
});

module.exports = router;
