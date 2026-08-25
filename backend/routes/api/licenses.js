const express = require('express');
const { requireAuth, requireAdmin } = require('../../utils/auth');
const { License } = require('../../db/models');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateLicenseId = [
  param('licenseId')
    .isInt({ min: 1 })
    .withMessage('License id must be valid.'),
  handleValidationErrors,
];

const validateCreateLicense = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Name must be between 1 and 80 characters.'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be zero or greater.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less.'),
  body('downloadLimit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Download limit must be a positive integer.'),
  handleValidationErrors,
];

const validateUpdateLicense = [
  ...validateLicenseId.slice(0, -1),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage('Name must be between 1 and 80 characters.'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be zero or greater.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be 5000 characters or less.'),
  body('downloadLimit')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Download limit must be a positive integer.'),
  handleValidationErrors,
];

// GET all licenses (public)
router.get('/', async (req, res, next) => {
  try {
    const licenses = await License.findAll({
      order: [['price', 'ASC']],
    });

    return res.status(200).json(licenses);
  } catch (err) {
    next(err);
  }
});

// GET a single license by ID (public)
router.get('/:licenseId', validateLicenseId, async (req, res, next) => {
  try {
    const { licenseId } = req.params;

    const license = await License.findByPk(licenseId);

    if (!license) {
      return res.status(404).json({ message: 'License not found.' });
    }

    return res.status(200).json(license);
  } catch (err) {
    next(err);
  }
});

// POST a new license (admin only)
router.post('/', requireAuth, requireAdmin, validateCreateLicense, async (req, res, next) => {
  try {
    const { name, price, description, downloadLimit } = req.body;

    const newLicense = await License.create({
      name,
      price,
      description,
      downloadLimit,
    });

    return res.status(201).json(newLicense);
  } catch (err) {
    next(err);
  }
});

// PUT update license (admin only)
router.put('/:licenseId', requireAuth, requireAdmin, validateUpdateLicense, async (req, res, next) => {
  try {
    const { licenseId } = req.params;
    const license = await License.findByPk(licenseId);

    if (!license) {
      return res.status(404).json({ message: 'License not found.' });
    }

    const { name, price, description, downloadLimit } = req.body;

    if (name !== undefined) license.name = name;
    if (price !== undefined) license.price = price;
    if (description !== undefined) license.description = description;
    if (downloadLimit !== undefined) license.downloadLimit = downloadLimit;

    await license.save();

    return res.status(200).json(license);
  } catch (err) {
    next(err);
  }
});

// DELETE a license (admin only)
router.delete('/:licenseId', requireAuth, requireAdmin, validateLicenseId, async (req, res, next) => {
  try {
    const { licenseId } = req.params;
    const license = await License.findByPk(licenseId);

    if (!license) {
      return res.status(404).json({ message: 'License not found.' });
    }

    await license.destroy();

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
