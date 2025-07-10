const express = require('express');
const { Product, License } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const upload = require('../../utils/s3'); // uses multer + AWS S3
const { Op } = require("sequelize");

// Helper to fetch licenses
const getLicenses = () => {
  return License.findAll({
    attributes: ['id', 'name', 'price'],
  });
};

// GET /api/products - Get all products
router.get('/', async (req, res, next) => {
  try {
    const { Op } = require("sequelize");
    const search = req.query.search?.toLowerCase();

    const where = search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const products = await Product.findAll({
      where,
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


// GET /api/products/:productId
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

// POST /api/products - Admin only
router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'downloadFile', maxCount: 1 },
  ]),
  async (req, res, next) => {
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
        downloadUrl, // fallback if no file uploaded
      } = req.body;

      const normalizedType = type?.toLowerCase();
      const allowedTypes = ['beat', 'loop_kit', 'drum_kit'];

      if (!title || !normalizedType || !allowedTypes.includes(normalizedType)) {
        return res.status(400).json({ message: 'Title and valid type are required.' });
      }

      if (normalizedType === 'beat' && price !== null && price !== undefined) {
        return res.status(400).json({ message: 'Beats use license prices, not fixed price.' });
      }

      if ((normalizedType === 'loop_kit' || normalizedType === 'drum_kit') &&
          (price === null || price === undefined)) {
        return res.status(400).json({ message: 'Loop kits and drum kits must have a price.' });
      }

      const imageUrl = req.files?.image?.[0]?.location || null;
      const finalDownloadUrl = req.files?.downloadFile?.[0]?.location || downloadUrl || null;

      const newProduct = await Product.create({
        userId: req.user.id,
        title,
        description: description || '',
        type: normalizedType,
        youtubeLink: youtubeLink || null,
        audioPreviewUrl: audioPreviewUrl || null,
        price: price || null,
        imageUrl,
        downloadUrl: finalDownloadUrl,
      });

      return res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      next(error);
    }
  }
);

// PUT /api/products/:productId - Admin only
router.put(
  '/:productId',
  requireAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'downloadFile', maxCount: 1 },
  ]),
  async (req, res, next) => {
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
        downloadUrl,
      } = req.body;

      const normalizedType = type?.toLowerCase() || product.type;
      const allowedTypes = ['beat', 'loop_kit', 'drum_kit'];

      if (!allowedTypes.includes(normalizedType)) {
        return res.status(400).json({ message: 'Invalid product type.' });
      }

      if (normalizedType === 'beat' && price !== null && price !== undefined) {
        return res.status(400).json({ message: 'Beats should not have fixed prices.' });
      }

      if ((normalizedType === 'loop_kit' || normalizedType === 'drum_kit') &&
          (price === null || price === undefined)) {
        return res.status(400).json({ message: 'Loop kits and drum kits must have a price.' });
      }

      // Apply changes
      if (title !== undefined) product.title = title;
      if (description !== undefined) product.description = description;
      if (type !== undefined) product.type = normalizedType;
      if (youtubeLink !== undefined) product.youtubeLink = youtubeLink;
      if (audioPreviewUrl !== undefined) product.audioPreviewUrl = audioPreviewUrl;
      if (price !== undefined) product.price = price;
      if (req.files?.image?.[0]) product.imageUrl = req.files.image[0].location;
      if (req.files?.downloadFile?.[0]) {
        product.downloadUrl = req.files.downloadFile[0].location;
      } else if (downloadUrl !== undefined) {
        product.downloadUrl = downloadUrl;
      }

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
  }
);

// DELETE /api/products/:productId - Admin only
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
