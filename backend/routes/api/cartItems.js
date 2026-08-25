const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product, License } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check, param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateCartItemCreate = [
  check('productId')
    .isInt({ min: 1 })
    .withMessage('productId must be a valid product id.'),
  check('licenseId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('licenseId must be a valid license id.'),
  handleValidationErrors,
];

const validateCartItemUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Cart item id must be valid.'),
  check('licenseId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('licenseId must be a valid license id.'),
  handleValidationErrors,
];

const validateCartItemId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Cart item id must be valid.'),
  handleValidationErrors,
];

const validateProductLicenseSelection = async ({ productId, licenseId }) => {
  const product = await Product.findByPk(productId, {
    attributes: ['id', 'type', 'price'],
  });
  if (!product) {
    const err = new Error('Product not found.');
    err.status = 404;
    throw err;
  }

  const normalizedLicenseId = licenseId || null;
  let license = null;
  if (normalizedLicenseId) {
    license = await License.findByPk(normalizedLicenseId, {
      attributes: ['id', 'name', 'price'],
    });
    if (!license) {
      const err = new Error('License not found.');
      err.status = 404;
      throw err;
    }
  }

  if (product.type === 'beat' && !license) {
    const err = new Error('A license is required for beat products.');
    err.status = 400;
    throw err;
  }

  if (product.type !== 'beat' && license) {
    const err = new Error('Licenses can only be selected for beat products.');
    err.status = 400;
    throw err;
  }

  return { product, license };
};

function formatCartItem(item) {
  const product = item.Product || {};
  const license = item.License || {};

  const price =
    license.price !== undefined && license.price !== null
      ? license.price
      : product.price || 0;

  return {
    id: item.id,
    productId: item.productId,
    licenseId: item.licenseId,
    productName: product.title || "Unknown Product",
    licenseType: license.name || license.type || "Standard",
    price,
    type: product.type || "unknown",
    imageUrl: product.imageUrl || null,
  };
}

// GET /api/cart-items
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          attributes: ['id', 'title', 'type', 'price', 'youtubeLink', 'audioPreviewUrl', 'imageUrl'],
        },
        { model: License, attributes: ['id', 'name', 'price'] },
      ],
    });

    const formattedItems = items.map(formatCartItem);

    return res.json({ items: formattedItems });
  } catch (err) {
    next(err);
  }
});
// POST /api/cart-items - Add item to cart
router.post('/', requireAuth, validateCartItemCreate, async (req, res, next) => {
  try {
    const { productId, licenseId } = req.body;

    await validateProductLicenseSelection({ productId, licenseId });

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

    return res.status(201).json({ item: formattedSingleItem });
  } catch (err) {
    console.error('❌ Error adding cart item:', err);
    next(err);
  }
});

// PUT /api/cart-items/:id - Update cart item (e.g., license change)
router.put('/:id', requireAuth, validateCartItemUpdate, async (req, res, next) => {
  try {
    const { licenseId } = req.body;
    const item = await CartItem.findByPk(req.params.id);

    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    const cart = await Cart.findOne({ where: { id: item.cartId, userId: req.user.id } });
    if (!cart) return res.status(403).json({ message: 'Unauthorized' });

    if (licenseId !== undefined) {
      await validateProductLicenseSelection({ productId: item.productId, licenseId });
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

    return res.json({ item: formattedUpdatedItem });
  } catch (err) {
    console.error('❌ Error updating cart item:', err);
    next(err);
  }
});

// DELETE /api/cart-items/:id - Remove item from cart
router.delete('/:id', requireAuth, validateCartItemId, async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const cart = await Cart.findOne({ where: { id: item.cartId, userId: req.user.id } });
    if (!cart) return res.status(403).json({ message: 'Unauthorized' });

    await item.destroy();

    return res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('❌ Error deleting cart item:', err);
    next(err);
  }
});

module.exports = router;
