// 📦 Express Router for Product API — with zip/mp3/wav file support
const express = require('express');
const { Product, License } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const upload = require('../../utils/s3');
const router = express.Router();
const { Op } = require('sequelize');

const getLicenses = () => License.findAll({ attributes: ['id', 'name', 'price'] });

// 🔍 GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search?.toLowerCase();
    const where = search
      ? {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      }
      : {};

    const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });
    const licenses = await getLicenses();
    const basicLicense = licenses.find((l) => l.name.toLowerCase() === 'basic');
    if (!basicLicense) return res.status(500).json({ message: 'Basic license not configured.' });

    const productsWithLicenses = products.map((product) => {
      const productJson = product.toJSON();
      if (productJson.type === 'beat') {
        productJson.price = basicLicense.price;
        productJson.licenses = licenses;
      }
      return productJson;
    });

    res.status(200).json({ products: productsWithLicenses });
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
});

// 🔍 GET /api/products/:productId
router.get('/:productId', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const productJson = product.toJSON();
    if (productJson.type === 'beat') productJson.licenses = await getLicenses();
    res.status(200).json(productJson);
  } catch (error) {
    console.error('Error fetching product:', error);
    next(error);
  }
});

// 🔄 POST /api/products
router.post(
  '/',
  requireAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'zipFile', maxCount: 1 },
    { name: 'mp3File', maxCount: 1 },
    { name: 'wavFile', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can create products.' });

      const { title, description, type, youtubeLink, audioPreviewUrl, price } = req.body;
      const normalizedType = type?.toLowerCase();
      const allowedTypes = ['beat', 'loop_kit', 'drum_kit'];

      if (!title || !allowedTypes.includes(normalizedType)) return res.status(400).json({ message: 'Invalid product type or title missing.' });
      if (normalizedType === 'beat' && price !== undefined) return res.status(400).json({ message: 'Beats must not have fixed prices.' });
      if ((normalizedType === 'loop_kit' || normalizedType === 'drum_kit') && (price === null || price === undefined)) return res.status(400).json({ message: 'Loop kits and drum kits must have a price.' });

      const imageUrl = req.files?.image?.[0]?.location || null;
      const downloadUrls = [];

      if (req.files?.zipFile?.[0]) {
        downloadUrls.push({
          type: 'zip',
          url: req.files.zipFile[0].location,
          key: req.files.zipFile[0].key,
        });
      }
      if (req.files?.mp3File?.[0]) {
        downloadUrls.push({
          type: 'mp3',
          url: req.files.mp3File[0].location,
          key: req.files.mp3File[0].key,
        });
      }
      if (req.files?.wavFile?.[0]) {
        downloadUrls.push({
          type: 'wav',
          url: req.files.wavFile[0].location,
          key: req.files.wavFile[0].key,
        });
      }

      const newProduct = await Product.create({
        userId: req.user.id,
        title,
        description: description || '',
        type: normalizedType,
        youtubeLink: youtubeLink || null,
        audioPreviewUrl: audioPreviewUrl || null,
        price: price || null,
        imageUrl,
        downloadUrls: downloadUrls.length > 0 ? downloadUrls : null,
      });

      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      next(error);
    }
  }
);

// ✏️ PUT /api/products/:productId
router.put(
  '/:productId',
  requireAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'zipFile', maxCount: 1 },
    { name: 'mp3File', maxCount: 1 },
    { name: 'wavFile', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can update products.' });
      const product = await Product.findByPk(req.params.productId);
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      const { title, description, type, youtubeLink, audioPreviewUrl, price } = req.body;
      const normalizedType = type?.toLowerCase() || product.type;
      const allowedTypes = ['beat', 'loop_kit', 'drum_kit'];

      if (!allowedTypes.includes(normalizedType)) return res.status(400).json({ message: 'Invalid product type.' });
      if (normalizedType === 'beat' && price !== undefined && price !== null) return res.status(400).json({ message: 'Beats should not have fixed prices.' });
      if ((normalizedType === 'loop_kit' || normalizedType === 'drum_kit') && (price === null || price === undefined)) return res.status(400).json({ message: 'Loop kits and drum kits must have a price.' });

      if (title !== undefined) product.title = title;
      if (description !== undefined) product.description = description;
      if (type !== undefined) product.type = normalizedType;
      if (youtubeLink !== undefined) product.youtubeLink = youtubeLink;
      if (audioPreviewUrl !== undefined) product.audioPreviewUrl = audioPreviewUrl;
      if (price !== undefined) product.price = price;
      if (req.files?.image?.[0]) product.imageUrl = req.files.image[0].location;

      const downloadUrls = [];
      if (req.files?.zipFile?.[0]) downloadUrls.push({ type: 'zip', url: req.files.zipFile[0].location });
      if (req.files?.mp3File?.[0]) downloadUrls.push({ type: 'mp3', url: req.files.mp3File[0].location });
      if (req.files?.wavFile?.[0]) downloadUrls.push({ type: 'wav', url: req.files.wavFile[0].location });
      if (downloadUrls.length > 0) product.downloadUrls = downloadUrls;

      await product.save();

      const productJson = product.toJSON();
      if (productJson.type === 'beat') productJson.licenses = await getLicenses();
      res.status(200).json(productJson);
    } catch (error) {
      console.error('Error updating product:', error);
      next(error);
    }
  }
);

// ❌ DELETE /api/products/:productId
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can delete products.' });
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
});

module.exports = router;
