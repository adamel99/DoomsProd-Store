// 📦 Express Router for Product API — with zip/mp3/wav file support
const express = require('express');
const { Product, License } = require('../../db/models');
const { requireAuth, requireAdmin } = require('../../utils/auth');
const upload = require('../../utils/s3');
const { validateUploadedFileSignatures, validateUploadedFileSizes } = require('../../utils/fileValidation');
const rateLimit = require('../../utils/rateLimit');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();
const { Op } = require('sequelize');
const productUploadRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 8 });
const allowedTypes = ['beat', 'loop_kit', 'drum_kit', 'plugin'];

const optionalUrl = (field) => body(field)
  .optional({ nullable: true, checkFalsy: true })
  .isURL({ require_protocol: true })
  .withMessage(`${field} must be a valid URL.`);

const validateProductList = [
  query('search')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search must be 100 characters or less.'),
  handleValidationErrors,
];

const validateProductId = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('Product id must be valid.'),
  handleValidationErrors,
];

const validateCreateProduct = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less.'),
  body('type')
    .trim()
    .toLowerCase()
    .isIn(allowedTypes)
    .withMessage('Invalid product type.'),
  body('price')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Price must be zero or greater.'),
  body('genre')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('Genre must be 80 characters or less.'),
  body('bpm')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 999 })
    .withMessage('BPM must be between 1 and 999.'),
  body('key')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Key must be 20 characters or less.'),
  body('artistTags')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Artist/type-beat tags must be 500 characters or less.'),
  optionalUrl('youtubeLink'),
  optionalUrl('audioPreviewUrl'),
  handleValidationErrors,
];

const validateUpdateProduct = [
  param('productId')
    .isInt({ min: 1 })
    .withMessage('Product id must be valid.'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title must be between 1 and 120 characters.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less.'),
  body('type')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(allowedTypes)
    .withMessage('Invalid product type.'),
  body('price')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Price must be zero or greater.'),
  body('genre')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 80 })
    .withMessage('Genre must be 80 characters or less.'),
  body('bpm')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 999 })
    .withMessage('BPM must be between 1 and 999.'),
  body('key')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Key must be 20 characters or less.'),
  body('artistTags')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Artist/type-beat tags must be 500 characters or less.'),
  optionalUrl('youtubeLink'),
  optionalUrl('audioPreviewUrl'),
  handleValidationErrors,
];

const normalizeProductPrice = (type, price, fallback = null) => {
  if (type === 'beat') return null;
  if (price === undefined || price === null || price === '') {
    return fallback === null || fallback === undefined ? '0.00' : fallback;
  }
  return Number(price).toFixed(2);
};

const getLicenses = () => License.findAll({ attributes: ['id', 'name', 'price'] });

const parseDownloadUrls = (downloadUrls) => {
  if (!downloadUrls) return [];

  let parsed;
  try {
    parsed = typeof downloadUrls === 'string' ? JSON.parse(downloadUrls) : downloadUrls;
  } catch {
    return [];
  }

  if (Array.isArray(parsed)) return parsed;

  return Object.entries(parsed).map(([type, value]) => (
    typeof value === 'string' ? { type, url: value } : { type, ...value }
  ));
};

const isPlayableAudioUrl = (url) => (
  typeof url === 'string'
  && /^https?:\/\//i.test(url)
  && /\.(mp3|wav|m4a|aac|ogg|oga|webm)(\?.*)?$/i.test(url)
);

const getPlayableAudioUrl = (productJson) => {
  if (isPlayableAudioUrl(productJson.audioPreviewUrl)) return productJson.audioPreviewUrl;

  const files = parseDownloadUrls(productJson.downloadUrls);
  const mp3File = files.find((file) => (
    String(file.type).toLowerCase() === 'mp3' && isPlayableAudioUrl(file.url)
  ));

  return mp3File?.url || null;
};

const hasZipDownload = (product) => (
  Array.isArray(product?.downloadUrls)
  && product.downloadUrls.some((file) => String(file?.type).toLowerCase() === 'zip' && file?.key)
);

const publicProduct = (product, user) => {
  const productJson = product.toJSON ? product.toJSON() : product;
  productJson.audioPreviewUrl = getPlayableAudioUrl(productJson);
  if (user?.role !== 'admin') delete productJson.downloadUrls;
  return productJson;
};

// 🔍 GET /api/products
router.get('/', validateProductList, async (req, res, next) => {
  try {
    const search = req.query.search?.toLowerCase();
    const where = search
      ? {
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { genre: { [Op.iLike]: `%${search}%` } },
          { key: { [Op.iLike]: `%${search}%` } },
          { artistTags: { [Op.iLike]: `%${search}%` } },
        ],
      }
      : {};

    const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });
    const licenses = await getLicenses();
    const basicLicense = licenses.find((l) => l.name.toLowerCase() === 'basic');
    if (!basicLicense) return res.status(500).json({ message: 'Basic license not configured.' });

    const productsWithLicenses = products.map((product) => {
      const productJson = publicProduct(product, req.user);
      if (productJson.type === 'beat') {
        // productJson.price = basicLicense.price;
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
router.get('/:productId', validateProductId, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    const productJson = publicProduct(product, req.user);
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
  requireAdmin,
  productUploadRateLimit,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'zipFile', maxCount: 1 },
    { name: 'mp3File', maxCount: 1 },
    { name: 'wavFile', maxCount: 1 },
  ]),
  validateUploadedFileSizes,
  validateUploadedFileSignatures,
  validateCreateProduct,
  async (req, res, next) => {
    try {
      const { title, description, type, youtubeLink, audioPreviewUrl, price, genre, bpm, key, artistTags } = req.body;
      const normalizedType = type?.toLowerCase();

      if (!title || !allowedTypes.includes(normalizedType)) return res.status(400).json({ message: 'Invalid product type or title missing.' });
      if (normalizedType === 'beat' && price !== undefined && price !== null && price !== '') return res.status(400).json({ message: 'Beats should not have fixed prices.' });
      if (normalizedType === 'plugin' && (price === undefined || price === null || price === '')) return res.status(400).json({ message: 'Plugins require a price.' });
      if (normalizedType === 'plugin' && !description?.trim()) return res.status(400).json({ message: 'Plugins require a description.' });
      if (normalizedType === 'plugin' && !req.files?.image?.[0]) return res.status(400).json({ message: 'Plugins require an image.' });
      if (normalizedType === 'plugin' && !req.files?.zipFile?.[0]) return res.status(400).json({ message: 'Plugins require a ZIP file.' });
      if (normalizedType === 'plugin' && (req.files?.mp3File?.[0] || req.files?.wavFile?.[0])) return res.status(400).json({ message: 'Plugins only accept an image and ZIP file.' });

      const imageUrl = req.files?.image?.[0]?.location || null;
      const downloadUrls = [];

      if (req.files?.zipFile?.[0]) {
        downloadUrls.push({
          type: 'zip',
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
        genre: genre || null,
        bpm: bpm || null,
        key: key || null,
        artistTags: artistTags || null,
        price: normalizeProductPrice(normalizedType, price),
        imageUrl,
        downloadUrls: downloadUrls.length > 0 ? downloadUrls : null,
      });

      const productJson = publicProduct(newProduct, req.user);
      if (productJson.type === 'beat') productJson.licenses = await getLicenses();
      res.status(201).json(productJson);
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
  requireAdmin,
  productUploadRateLimit,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'zipFile', maxCount: 1 },
    { name: 'mp3File', maxCount: 1 },
    { name: 'wavFile', maxCount: 1 },
  ]),
  validateUploadedFileSizes,
  validateUploadedFileSignatures,
  validateUpdateProduct,
  async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.productId);
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      const { title, description, type, youtubeLink, audioPreviewUrl, price, genre, bpm, key, artistTags } = req.body;
      const normalizedType = type?.toLowerCase() || product.type;
      if (!allowedTypes.includes(normalizedType)) return res.status(400).json({ message: 'Invalid product type.' });
      if (normalizedType === 'beat' && price !== undefined && price !== null && price !== '') return res.status(400).json({ message: 'Beats should not have fixed prices.' });
      if (normalizedType === 'plugin' && (price === undefined || price === null || price === '')) return res.status(400).json({ message: 'Plugins require a price.' });
      const finalDescription = description !== undefined ? description : product.description;
      if (normalizedType === 'plugin' && !finalDescription?.trim()) return res.status(400).json({ message: 'Plugins require a description.' });
      if (normalizedType === 'plugin' && !product.imageUrl && !req.files?.image?.[0]) return res.status(400).json({ message: 'Plugins require an image.' });
      if (normalizedType === 'plugin' && !hasZipDownload(product) && !req.files?.zipFile?.[0]) return res.status(400).json({ message: 'Plugins require a ZIP file.' });
      if (normalizedType === 'plugin' && (req.files?.mp3File?.[0] || req.files?.wavFile?.[0])) return res.status(400).json({ message: 'Plugins only accept an image and ZIP file.' });

      if (title !== undefined) product.title = title;
      if (description !== undefined) product.description = description;
      if (type !== undefined) product.type = normalizedType;
      if (youtubeLink !== undefined) product.youtubeLink = youtubeLink;
      if (audioPreviewUrl !== undefined) product.audioPreviewUrl = audioPreviewUrl;
      if (genre !== undefined) product.genre = genre || null;
      if (bpm !== undefined) product.bpm = bpm || null;
      if (key !== undefined) product.key = key || null;
      if (artistTags !== undefined) product.artistTags = artistTags || null;
      if (type !== undefined || price !== undefined) product.price = normalizeProductPrice(normalizedType, price, product.price);
      if (req.files?.image?.[0]) product.imageUrl = req.files.image[0].location;

      const downloadUrls = [];
      if (req.files?.zipFile?.[0]) downloadUrls.push({ type: 'zip', key: req.files.zipFile[0].key });
      if (req.files?.mp3File?.[0]) downloadUrls.push({ type: 'mp3', url: req.files.mp3File[0].location, key: req.files.mp3File[0].key });
      if (req.files?.wavFile?.[0]) downloadUrls.push({ type: 'wav', key: req.files.wavFile[0].key });
      if (downloadUrls.length > 0) product.downloadUrls = downloadUrls;

      await product.save();

      const productJson = publicProduct(product, req.user);
      if (productJson.type === 'beat') productJson.licenses = await getLicenses();
      res.status(200).json(productJson);
    } catch (error) {
      console.error('Error updating product:', error);
      next(error);
    }
  }
);

// ❌ DELETE /api/products/:productId
router.delete('/:productId', requireAuth, requireAdmin, validateProductId, async (req, res, next) => {
  try {
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
