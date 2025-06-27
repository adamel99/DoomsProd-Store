const express = require('express');
const { Product, License } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const upload = require('../../utils/s3');

// Helper to fetch licenses
const getLicenses = () => {
  return License.findAll({
    attributes: ['id', 'name', 'price'],
  });
};

// GET /api/products - Get all products with Basic license price for beats
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']],
    });

    const licenses = await getLicenses();
    const basicLicense = licenses.find(l => l.name.toLowerCase() === 'basic');

    if (!basicLicense) {
      return res.status(500).json({ message: 'Basic license not configured in database.' });
    }

    const productsWithLicenses = products.map(product => {
      const productJson = product.toJSON();

      if (productJson.type === 'beat') {
        productJson.price = basicLicense.price;
        productJson.licenses = licenses;
      }

      return productJson;
    });

    return res.status(200).json({ products: productsWithLicenses });
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
});

// GET /api/products/:productId - Get product by ID with licenses if beat
router.get('/:productId', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const productJson = product.toJSON();

    if (productJson.type === 'beat') {
      const licenses = await getLicenses();
      productJson.licenses = licenses;
    }

    return res.status(200).json(productJson);
  } catch (error) {
    console.error('Error fetching product:', error);
    next(error);
  }
});

// POST /api/products - Admin only create
router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create products.' });
    }

    const {
      title,
      description,
      type,
      youtubeLink,
      audioPreviewUrl,
      price,
    } = req.body;

    const normalizedType = type?.toLowerCase();

    if (!title || !normalizedType) {
      return res.status(400).json({ message: 'Title and type are required.' });
    }

    const allowedTypes = ['beat', 'loop_kit', 'drum_kit'];
    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({ message: 'Invalid product type.' });
    }

    if (normalizedType === 'beat' && price !== null && price !== undefined) {
      return res.status(400).json({ message: 'Price should not be set for beats; use licenses.' });
    }

    if ((normalizedType === 'loop_kit' || normalizedType === 'drum_kit') &&
        (price === null || price === undefined)) {
      return res.status(400).json({ message: 'Price is required for loop kits and drum kits.' });
    }

    const imageUrl = req.file ? req.file.location : null;

    const newProduct = await Product.create({
      userId: req.user.id,
      title,
      description: description || '',
      type: normalizedType,
      youtubeLink: youtubeLink || null,
      audioPreviewUrl: audioPreviewUrl || null,
      price: price || null,
      imageUrl,
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
});

// PUT /api/products/:productId - Admin only update
router.put('/:productId', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update products.' });
    }

    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const {
      title,
      description,
      type,
      youtubeLink,
      audioPreviewUrl,
      price,
    } = req.body;

    const normalizedType = type?.toLowerCase() || product.type;
    const allowedTypes = ['beat', 'loop_kit', 'drum_kit'];

    if (!allowedTypes.includes(normalizedType)) {
      return res.status(400).json({ message: 'Invalid product type.' });
    }

    if (normalizedType === 'beat' && price !== null && price !== undefined) {
      return res.status(400).json({ message: 'Price should not be set for beats; use licenses.' });
    }

    if ((normalizedType === 'loop_kit' || normalizedType === 'drum_kit') &&
        (price === null || price === undefined)) {
      return res.status(400).json({ message: 'Price is required for loop kits and drum kits.' });
    }

    // Update fields
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (type !== undefined) product.type = normalizedType;
    if (youtubeLink !== undefined) product.youtubeLink = youtubeLink;
    if (audioPreviewUrl !== undefined) product.audioPreviewUrl = audioPreviewUrl;
    if (price !== undefined) product.price = price;
    if (req.file) product.imageUrl = req.file.location;

    await product.save();

    const productJson = product.toJSON();

    if (productJson.type === 'beat') {
      const licenses = await getLicenses();
      productJson.licenses = licenses;
    }

    return res.status(200).json(productJson);
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
});

// DELETE /api/products/:productId - Admin only delete
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete products.' });
    }

    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await product.destroy();

    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
});

module.exports = router;
