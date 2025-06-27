const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { Order, User, OrderItem } = require('../../db/models');

const router = express.Router();

// Admin: Get all orders with user info, newest first
router.get('/', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admins only.' });
    }

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
router.get('/:orderId', requireAuth, async (req, res, next) => {
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

// Create new order (user must supply total, orderItems handled separately or here)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { total } = req.body;

    if (total === undefined) {
      return res.status(400).json({ message: 'Total amount is required.' });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      total,
    });

    // Optional: create order items here if you want, or do in separate route

    return res.status(201).json({ order: newOrder });
  } catch (error) {
    next(error);
  }
});

// Update order total (and status if you add it later) — admin only
router.put('/:orderId', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admins only.' });
    }

    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const { total } = req.body;
    if (total !== undefined) order.total = total;

    await order.save();

    return res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
});

// Delete order — admin only
router.delete('/:orderId', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admins only.' });
    }

    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    await order.destroy();

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
