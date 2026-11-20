const express = require('express');
const { requireAuth, requireAdmin } = require('../../utils/auth');
const { Op } = require('sequelize');
const { Order, User, OrderItem, Product, License, Promotion, sequelize } = require('../../db/models');

const router = express.Router();

const toNumber = (value) => Number(value || 0);
const monthKey = (date) => new Date(date).toISOString().slice(0, 7);
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

const normalizePromotionInput = (body) => {
  const type = ['code', 'first_purchase', 'bundle'].includes(body.type) ? body.type : null;
  const discountPercent = Number(body.discountPercent);
  if (!body.name?.trim() || !type || !Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
    const error = new Error('Provide a name, sale type, and discount from 0.01% to 100%.');
    error.status = 400;
    throw error;
  }
  if (type === 'code' && !String(body.code || '').trim()) {
    const error = new Error('Promo code is required for code sales.');
    error.status = 400;
    throw error;
  }
  const minBasicBeatCount = Number(body.minBasicBeatCount || 2);
  if (type === 'bundle' && (!Number.isInteger(minBasicBeatCount) || minBasicBeatCount < 2)) {
    const error = new Error('Bundle sales need a whole number of at least 2 Basic beat leases.');
    error.status = 400;
    throw error;
  }
  const startsAt = body.startsAt ? new Date(body.startsAt) : null;
  const endsAt = body.endsAt ? new Date(body.endsAt) : null;
  if (body.isIndefinite === false && !endsAt) {
    const error = new Error('Choose an end date or mark the sale as indefinite.');
    error.status = 400;
    throw error;
  }
  if ((startsAt && Number.isNaN(startsAt.getTime())) || (endsAt && Number.isNaN(endsAt.getTime()))
    || (startsAt && endsAt && endsAt < startsAt)) {
    const error = new Error('Sale dates are invalid or the end date comes before the start date.');
    error.status = 400;
    throw error;
  }
  return {
    name: body.name.trim(),
    type,
    code: type === 'code' ? String(body.code).trim().toUpperCase() : null,
    discountPercent: discountPercent.toFixed(2),
    minBasicBeatCount: type === 'bundle' ? minBasicBeatCount : 0,
    startsAt,
    endsAt,
    isActive: body.isActive !== false,
  };
};

router.get('/promotions', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const promotions = await Promotion.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ promotions });
  } catch (error) { return next(error); }
});

router.post('/promotions', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const promotion = await Promotion.create(normalizePromotionInput(req.body));
    return res.status(201).json({ promotion });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'That promo code already exists.' });
    return next(error);
  }
});

router.put('/promotions/:promotionId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const promotion = await Promotion.findByPk(req.params.promotionId);
    if (!promotion) return res.status(404).json({ message: 'Sale not found.' });
    await promotion.update(normalizePromotionInput(req.body));
    return res.json({ promotion });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ message: 'That promo code already exists.' });
    return next(error);
  }
});

router.patch('/promotions/:promotionId/toggle', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const promotion = await Promotion.findByPk(req.params.promotionId);
    if (!promotion) return res.status(404).json({ message: 'Sale not found.' });
    await promotion.update({ isActive: Boolean(req.body.isActive) });
    return res.json({ promotion });
  } catch (error) { return next(error); }
});

router.get('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ users });
  } catch (error) {
    return next(error);
  }
});

router.delete('/users/:userId', requireAuth, requireAdmin, async (req, res, next) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'User id must be valid.' });
  }

  try {
    await sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(userId, {
        transaction,
        lock: { level: transaction.LOCK.UPDATE, of: User },
      });
      if (!user) {
        const error = new Error('User not found.');
        error.status = 404;
        throw error;
      }
      if (user.role === 'admin' || user.id === req.user.id) {
        const error = new Error('Admin accounts cannot be deleted from the customer dashboard.');
        error.status = 403;
        throw error;
      }

      const pendingOrders = await Order.count({ where: { userId, status: 'pending' }, transaction });
      if (pendingOrders) {
        const error = new Error('This account has a pending order. Cancel or resolve it before deleting the account.');
        error.status = 409;
        throw error;
      }

      // Keep catalog items available if an account still owns any products.
      await Product.update({ userId: req.user.id }, { where: { userId }, transaction });
      await user.destroy({ transaction });
    });
    return res.status(204).end();
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    return next(error);
  }
});

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

router.get('/dashboard', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const orderWhere = {};
    addDateRange(orderWhere, req.query.startDate, req.query.endDate);

    const orders = await Order.findAll({
      where: orderWhere,
      include: [
        {
          model: User,
          attributes: [
            'id',
            'username',
            'email',
            'firstName',
            'lastName',
            'totalPurchases',
            'rewardDiscount',
            'isSubscribedToEmails',
            'role',
            'createdAt',
          ],
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'type', 'price', 'genre', 'bpm', 'key', 'artistTags', 'imageUrl'],
            },
            { model: License, attributes: ['id', 'name', 'description'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const completedOrders = orders.filter((order) => order.status === 'completed');
    const pendingOrders = orders.filter((order) => order.status === 'pending');
    const cancelledOrders = orders.filter((order) => order.status === 'cancelled');
    const customers = new Map();
    const products = new Map();
    const licenses = new Map();
    const revenueByMonth = new Map();
    const revenueByDay = new Map();
    const ordersByDay = new Map();
    const revenueByProductType = new Map();
    const ordersByStatus = {
      completed: completedOrders.length,
      pending: pendingOrders.length,
      cancelled: cancelledOrders.length,
    };

    completedOrders.forEach((order) => {
      const orderMonth = monthKey(order.createdAt);
      const orderDay = dayKey(order.createdAt);
      revenueByMonth.set(orderMonth, (revenueByMonth.get(orderMonth) || 0) + toNumber(order.totalPrice));
      revenueByDay.set(orderDay, (revenueByDay.get(orderDay) || 0) + toNumber(order.totalPrice));
      ordersByDay.set(orderDay, (ordersByDay.get(orderDay) || 0) + 1);

      const user = order.User;
      if (user) {
        const existing = customers.get(user.id) || {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          totalPurchases: user.totalPurchases,
          rewardDiscount: user.rewardDiscount,
          isSubscribedToEmails: user.isSubscribedToEmails,
          role: user.role,
          orderCount: 0,
          lifetimeSpend: 0,
          averageOrderValue: 0,
          lastOrderDate: null,
        };

        existing.orderCount += 1;
        existing.lifetimeSpend += toNumber(order.totalPrice);
        if (!existing.lastOrderDate || new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
        customers.set(user.id, existing);
      }

      (order.OrderItems || []).forEach((item) => {
        const quantity = item.quantity || 1;
        const itemRevenue = toNumber(item.priceAtPurchase) * quantity;
        const product = item.Product;
        const license = item.License;

        if (product) {
          const existing = products.get(product.id) || {
            id: product.id,
            title: product.title,
            type: product.type,
            genre: product.genre,
            bpm: product.bpm,
            key: product.key,
            price: toNumber(product.price),
            unitsSold: 0,
            grossRevenue: 0,
            orderCount: 0,
            averageSalePrice: 0,
            licenseCounts: {},
            firstSoldAt: order.createdAt,
            lastSoldAt: order.createdAt,
          };

          existing.unitsSold += quantity;
          existing.grossRevenue += itemRevenue;
          existing.orderCount += 1;
          if (!existing.firstSoldAt || new Date(order.createdAt) < new Date(existing.firstSoldAt)) {
            existing.firstSoldAt = order.createdAt;
          }
          if (!existing.lastSoldAt || new Date(order.createdAt) > new Date(existing.lastSoldAt)) {
            existing.lastSoldAt = order.createdAt;
          }
          if (license?.name) {
            existing.licenseCounts[license.name] = (existing.licenseCounts[license.name] || 0) + quantity;
          }
          products.set(product.id, existing);
        }

        if (product?.type) {
          const existingType = revenueByProductType.get(product.type) || {
            type: product.type,
            unitsSold: 0,
            grossRevenue: 0,
          };
          existingType.unitsSold += quantity;
          existingType.grossRevenue += itemRevenue;
          revenueByProductType.set(product.type, existingType);
        }

        if (license) {
          const existing = licenses.get(license.id) || {
            id: license.id,
            name: license.name,
            unitsSold: 0,
            grossRevenue: 0,
          };

          existing.unitsSold += quantity;
          existing.grossRevenue += itemRevenue;
          licenses.set(license.id, existing);
        }
      });
    });

    const customerRows = Array.from(customers.values()).map((customer) => ({
      ...customer,
      averageOrderValue: customer.orderCount ? customer.lifetimeSpend / customer.orderCount : 0,
    }));

    const productRows = Array.from(products.values()).map((product) => {
      const topLicense = Object.entries(product.licenseCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

      return {
        ...product,
        averageSalePrice: product.unitsSold ? product.grossRevenue / product.unitsSold : 0,
        revenuePerOrder: product.orderCount ? product.grossRevenue / product.orderCount : 0,
        topLicense,
      };
    });

    const completedRevenue = completedOrders.reduce((sum, order) => sum + toNumber(order.totalPrice), 0);
    const pendingRevenue = pendingOrders.reduce((sum, order) => sum + toNumber(order.totalPrice), 0);
    const totalProductsSold = completedOrders.reduce((sum, order) => (
      sum + (order.OrderItems || []).reduce((itemSum, item) => itemSum + (item.quantity || 1), 0)
    ), 0);
    const licenseRows = Array.from(licenses.values()).sort((a, b) => b.unitsSold - a.unitsSold);
    const bestSellingProduct = [...productRows].sort((a, b) => b.unitsSold - a.unitsSold)[0];
    const dailyRevenueRows = Array.from(revenueByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));
    let cumulativeRevenue = 0;
    const cumulativeRevenueRows = dailyRevenueRows.map((row) => {
      cumulativeRevenue += row.revenue;
      return { date: row.date, revenue: cumulativeRevenue };
    });

    return res.status(200).json({
      summary: {
        totalRevenue: completedRevenue,
        completedRevenue,
        pendingRevenue,
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        cancelledOrders: cancelledOrders.length,
        averageOrderValue: completedOrders.length ? completedRevenue / completedOrders.length : 0,
        uniqueCustomers: customerRows.length,
        totalProductsSold,
        bestSellingProduct: bestSellingProduct?.title || 'None',
        mostCommonLicense: licenseRows[0]?.name || 'None',
      },
      customers: customerRows.sort((a, b) => b.lifetimeSpend - a.lifetimeSpend),
      products: productRows.sort((a, b) => b.grossRevenue - a.grossRevenue),
      licenses: licenseRows,
      breakdowns: {
        ordersByStatus,
        ordersByDay: Array.from(ordersByDay.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, orders]) => ({ date, orders })),
        revenueByDay: dailyRevenueRows,
        cumulativeRevenue: cumulativeRevenueRows,
        revenueByMonth: Array.from(revenueByMonth.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, revenue]) => ({ month, revenue })),
        revenueByProductType: Array.from(revenueByProductType.values())
          .sort((a, b) => b.grossRevenue - a.grossRevenue),
        topProductsByRevenue: [...productRows].sort((a, b) => b.grossRevenue - a.grossRevenue).slice(0, 8),
        topProductsByUnits: [...productRows].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 8),
        topCustomersBySpend: [...customerRows].sort((a, b) => b.lifetimeSpend - a.lifetimeSpend).slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
