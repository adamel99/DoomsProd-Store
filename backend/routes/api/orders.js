const express = require('express');
const { requireAuth, requireAdmin } = require('../../utils/auth');
const { Order, User, OrderItem } = require('../../db/models');
const { createOrderFromCart } = require('../../utils/checkout');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();
const allowedStatuses = ['pending', 'completed', 'cancelled'];

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
    const orders = await Order.findAll({
      include: { model: User, attributes: ['id', 'username', 'email'] },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
});

// Logged-in user: Get their orders only
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ orders });
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
