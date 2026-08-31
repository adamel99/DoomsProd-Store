const express = require('express');
const { requireAuth, requireAdmin } = require('../../utils/auth');
const { Op } = require('sequelize');
const { Order, User, OrderItem, Product, License } = require('../../db/models');
const { createOrderFromCart, getOrderDownloadFiles, getOrderReceiptDetails } = require('../../utils/checkout');
const { sendProductEmail } = require('../../utils/sendProductEmail');
const rateLimit = require('../../utils/rateLimit');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();
const allowedStatuses = ['pending', 'completed', 'cancelled'];
const getSortOrder = (sort, direction) => {
  if (sort === 'totalPrice') return [['totalPrice', direction]];
  if (sort === 'status') return [['status', direction]];
  if (sort === 'customer') return [[User, 'firstName', direction], [User, 'lastName', direction]];
  return [['createdAt', direction]];
};

const adminUserAttributes = [
  'id',
  'username',
  'email',
  'firstName',
  'lastName',
  'totalPurchases',
  'rewardDiscount',
  'isSubscribedToEmails',
  'createdAt',
  'updatedAt',
];

const adminProductAttributes = [
  'id',
  'title',
  'description',
  'type',
  'price',
  'genre',
  'bpm',
  'key',
  'artistTags',
  'imageUrl',
  'youtubeLink',
  'audioPreviewUrl',
  'createdAt',
  'updatedAt',
];

const addDateRange = (where, startDate, endDate) => {
  const createdAt = {};
  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime())) createdAt[Op.gte] = start;
  }
  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      createdAt[Op.lte] = end;
    }
  }
  if (Object.keys(createdAt).length) where.createdAt = createdAt;
};

const validateOrderId = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('Order id must be valid.'),
  handleValidationErrors,
];

const validateOrderUpdate = [
  param('orderId')
    .isInt({ min: 1 })
    .withMessage('Order id must be valid.'),
  body('status')
    .optional()
    .isIn(allowedStatuses)
    .withMessage('Invalid order status.'),
  handleValidationErrors,
];

// Admin: Get all orders with user info, newest first
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const {
      status,
      type,
      search,
      startDate,
      endDate,
      sort = 'createdAt',
      direction = 'DESC',
    } = req.query;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const size = Math.min(Math.max(parseInt(req.query.size || '25', 10), 1), 100);
    const orderWhere = {};
    const productWhere = {};
    const userWhere = {};
    const normalizedDirection = String(direction).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const likeOperator = Order.sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;

    if (allowedStatuses.includes(status)) orderWhere.status = status;
    if (type && type !== 'all') productWhere.type = type;
    addDateRange(orderWhere, startDate, endDate);

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      orderWhere[Op.or] = [
        { paymentIntentId: { [likeOperator]: term } },
        { '$User.username$': { [likeOperator]: term } },
        { '$User.email$': { [likeOperator]: term } },
        { '$User.firstName$': { [likeOperator]: term } },
        { '$User.lastName$': { [likeOperator]: term } },
        { '$OrderItems.Product.title$': { [likeOperator]: term } },
        { '$OrderItems.License.name$': { [likeOperator]: term } },
      ];

      const numericSearch = Number(search);
      if (Number.isInteger(numericSearch)) {
        orderWhere[Op.or].push({ id: numericSearch });
      }
    }

    const include = [
        {
          model: User,
          attributes: adminUserAttributes,
          where: userWhere,
        },
        {
          model: OrderItem,
          required: Boolean(type && type !== 'all'),
          include: [
            {
              model: Product,
              attributes: adminProductAttributes,
              where: productWhere,
              required: Boolean(type && type !== 'all'),
            },
            { model: License, attributes: ['id', 'name', 'description'] },
          ],
        },
      ];

    const { count, rows: orders } = await Order.findAndCountAll({
      where: orderWhere,
      include,
      order: getSortOrder(sort, normalizedDirection),
      limit: size,
      offset: (page - 1) * size,
      distinct: true,
      subQuery: false,
    });

    return res.status(200).json({
      orders,
      pagination: {
        page,
        size,
        total: count,
        totalPages: Math.ceil(count / size),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logged-in user: Get their orders only
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: {
        model: OrderItem,
        include: [
          { model: Product, attributes: ['id', 'title', 'type', 'imageUrl'] },
          { model: License, attributes: ['id', 'name', 'description'] },
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
});

// Resend receipt and fresh download links for a completed order
router.post(
  '/:orderId/resend-receipt',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  validateOrderId,
  async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }],
    });

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (req.user.role !== 'admin' && req.user.id !== order.userId) {
      return res.status(403).json({ message: 'Unauthorized to resend this receipt.' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Receipts can only be resent for completed orders.' });
    }

    const files = await getOrderDownloadFiles(order.id);
    const receipt = await getOrderReceiptDetails(order.id, order.User);
    await sendProductEmail(order.User.email, files, receipt);

    return res.status(200).json({ message: 'Receipt resent.' });
  } catch (error) {
    next(error);
  }
});

// Get one order by ID (admin or owner), including order items
router.get('/:orderId', requireAuth, validateOrderId, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: { model: OrderItem },
    });

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (req.user.role !== 'admin' && req.user.id !== order.userId) {
      return res.status(403).json({ message: 'Unauthorized to view this order.' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
});

// Create new order from the authenticated user's cart
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { order } = await createOrderFromCart(req.user.id);
    return res.status(201).json({ order });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
});

// Update order total (and status if you add it later) — admin only
router.put('/:orderId', requireAuth, requireAdmin, validateOrderUpdate, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const { status } = req.body;
    if (status !== undefined) order.status = status;

    await order.save();

    return res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
});

// Delete order — admin only
router.delete('/:orderId', requireAuth, requireAdmin, validateOrderId, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    await order.destroy();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
