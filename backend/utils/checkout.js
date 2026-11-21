const { Cart, CartItem, Product, License, Order, OrderItem, Promotion, User, sequelize } = require('../db/models');
const { Op } = require('sequelize');

const cents = (amount) => Math.round(Number(amount || 0) * 100);

const getItemPrice = (cartItem) => {
  if (cartItem.License) return Number(cartItem.License.price);
  return Number(cartItem.Product?.price || 0);
};

const validateLineItem = (item) => {
  if (!item.Product) {
    const err = new Error('A cart item references a product that no longer exists.');
    err.status = 400;
    throw err;
  }

  if (item.Product.type === 'beat' && !item.License) {
    const err = new Error('A license is required for beat products.');
    err.status = 400;
    throw err;
  }

  if (item.Product.type !== 'beat' && item.License) {
    const err = new Error('Licenses can only be selected for beat products.');
    err.status = 400;
    throw err;
  }

  const price = getItemPrice(item);
  if (!Number.isFinite(price) || price < 0) {
    const err = new Error('A cart item has an invalid price.');
    err.status = 400;
    throw err;
  }
};

const getDownloadFilesFromProduct = (product) => {
  const files = Array.isArray(product?.downloadUrls) ? product.downloadUrls : [];
  return files
    .map((file) => {
      const type = String(file?.type || '').toLowerCase();
      if (['zip', 'wav'].includes(type)) return { type, key: file.key };
      if (type === 'mp3') return { type, url: file.url };
      return null;
    })
    .filter((file) => (
      file
      && (
        (['zip', 'wav'].includes(file.type) && typeof file.key === 'string' && file.key.startsWith('products/'))
        || (file.type === 'mp3' && typeof file.url === 'string' && /^https?:\/\//i.test(file.url))
      )
    ));
};

const beatDownloadTypesForLicense = (license) => {
  const name = String(license?.name || '').trim().toLowerCase();

  if (name === 'basic') return new Set(['mp3']);
  if (name === 'premium') return new Set(['mp3', 'wav']);
  if (name === 'unlimited' || name === 'exclusive') return new Set(['mp3', 'wav', 'zip']);

  return new Set(['mp3']);
};

const getDownloadFilesForOrderItem = (item) => {
  const files = getDownloadFilesFromProduct(item.Product);
  if (item.Product?.type !== 'beat') return files;

  const allowedTypes = beatDownloadTypesForLicense(item.License);
  return files.filter((file) => allowedTypes.has(file.type));
};

const getFileKeysFromProduct = (product) => {
  return getDownloadFilesFromProduct(product).map((file) => file.key).filter(Boolean);
};

const getUserCartItems = async (userId, transaction) => {
  const cart = await Cart.findOne({
    where: { userId },
    transaction,
    lock: transaction ? true : undefined,
  });
  if (!cart) return [];

  return CartItem.findAll({
    where: { cartId: cart.id },
    include: [
      { model: Product, attributes: ['id', 'title', 'type', 'price', 'downloadUrls'] },
      { model: License, attributes: ['id', 'name', 'price'] },
    ],
    transaction,
    lock: transaction ? { level: transaction.LOCK.UPDATE, of: CartItem } : undefined,
  });
};

const getPromotionQuote = async (userId, cartItems, promoCode = '') => {
  const lineItems = cartItems.map((item) => {
    validateLineItem(item);
    return {
      cartItem: item,
      product: item.Product,
      license: item.License,
      quantity: item.quantity || 1,
      price: getItemPrice(item),
    };
  });
  const subtotalCents = lineItems.reduce((sum, item) => sum + cents(item.price) * item.quantity, 0);
  const discountableCents = lineItems.reduce((sum, item) => (
    sum + (item.price > 0 ? cents(item.price) * item.quantity : 0)
  ), 0);
  const now = new Date();
  const promotions = await Promotion.findAll({ where: { isActive: true } });
  const normalizedCode = String(promoCode || '').trim().toUpperCase();
  const basicBeatCount = lineItems.reduce((sum, item) => (
    item.price > 0 && item.product.type === 'beat' && String(item.license?.name || '').trim().toLowerCase() === 'basic'
      ? sum + item.quantity : sum
  ), 0);
  const buyer = await User.findByPk(userId, { attributes: ['email'] });
  const completedPurchaseMatches = [{ userId }];
  if (buyer?.email) {
    const emailLike = Order.sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
    completedPurchaseMatches.push({
      userId: null,
      customerEmail: { [emailLike]: String(buyer.email).trim() },
    });
  }
  const completedPaidPurchases = await Order.count({
    where: {
      status: 'completed',
      subtotalPrice: { [Op.gt]: 0 },
      [Op.or]: completedPurchaseMatches,
    },
  });
  const activePromotions = promotions.filter((promotion) => {
    if (promotion.startsAt && new Date(promotion.startsAt) > now) return false;
    if (promotion.endsAt && new Date(promotion.endsAt) < now) return false;
    return true;
  });
  const matchingCode = activePromotions.find((promotion) => (
    promotion.type === 'code' && String(promotion.code || '').trim().toUpperCase() === normalizedCode
  ));
  if (normalizedCode && !matchingCode) {
    const error = new Error('That promo code is invalid, inactive, expired, or not eligible for this cart.');
    error.status = 400;
    throw error;
  }
  const eligible = discountableCents > 0 ? activePromotions.filter((promotion) => {
    if (promotion.type === 'code') return promotion === matchingCode;
    if (promotion.type === 'first_purchase') return completedPaidPurchases === 0;
    if (promotion.type === 'bundle') return basicBeatCount >= Number(promotion.minBasicBeatCount || 2);
    return false;
  }) : [];
  const selectedPromotion = eligible.sort((a, b) => Number(b.discountPercent) - Number(a.discountPercent))[0] || null;
  const discountPercent = selectedPromotion ? Number(selectedPromotion.discountPercent) : 0;
  const discountedLineItems = lineItems.map((item) => ({
    ...item,
    originalPrice: item.price,
    price: item.price > 0 ? Math.round(cents(item.price) * (100 - discountPercent) / 100) / 100 : 0,
  }));
  const totalCents = discountedLineItems.reduce((sum, item) => sum + cents(item.price) * item.quantity, 0);
  const discountCents = subtotalCents - totalCents;
  const promotion = discountCents > 0 ? selectedPromotion : null;
  return {
    lineItems: discountedLineItems,
    promotion,
    subtotalCents,
    discountCents,
    totalCents,
    totalPrice: totalCents / 100,
    subtotalPrice: subtotalCents / 100,
  };
};

const previewCartPromotion = async (userId, promoCode = '') => {
  const cartItems = await getUserCartItems(userId);
  if (!cartItems.length) {
    const err = new Error('Cart is empty.');
    err.status = 400;
    throw err;
  }
  const quote = await getPromotionQuote(userId, cartItems, promoCode);
  return {
    subtotalPrice: quote.subtotalPrice.toFixed(2),
    totalPrice: quote.totalPrice.toFixed(2),
    discountAmount: (quote.discountCents / 100).toFixed(2),
    promotion: quote.promotion ? {
      name: quote.promotion.name,
      type: quote.promotion.type,
      code: quote.promotion.type === 'code' ? quote.promotion.code : null,
      discountPercent: Number(quote.promotion.discountPercent),
    } : null,
  };
};

const createOrderFromCart = async (userId, promoCode = '') => {
  return sequelize.transaction(async (transaction) => {
    const cartItems = await getUserCartItems(userId, transaction);
    if (!cartItems.length) {
      const err = new Error('Cart is empty.');
      err.status = 400;
      throw err;
    }

    const quote = await getPromotionQuote(userId, cartItems, promoCode);
    const { lineItems, totalPrice, subtotalPrice, promotion, discountCents } = quote;

    const order = await Order.create({
      userId,
      subtotalPrice: subtotalPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      promotionName: promotion?.name || null,
      promoCode: promotion?.type === 'code' ? promotion.code : null,
      discountPercent: promotion ? Number(promotion.discountPercent).toFixed(2) : '0.00',
      discountAmount: (discountCents / 100).toFixed(2),
      status: totalPrice === 0 ? 'completed' : 'pending',
    }, { transaction });

    await OrderItem.bulkCreate(lineItems.map((item) => ({
      orderId: order.id,
      productId: item.product.id,
      licenseId: item.license?.id || null,
      quantity: item.quantity,
      priceAtPurchase: item.price.toFixed(2),
    })), { transaction });

    return { order, lineItems, totalPrice };
  });
};

const getOrderFileKeys = async (orderId, transaction) => {
  const items = await OrderItem.findAll({
    where: { orderId },
    include: [
      { model: Product, attributes: ['type', 'downloadUrls'] },
      { model: License, attributes: ['name'] },
    ],
    transaction,
  });

  return items.flatMap((item) => getDownloadFilesForOrderItem(item).map((file) => file.key).filter(Boolean));
};

const getOrderDownloadFiles = async (orderId, transaction) => {
  const items = await OrderItem.findAll({
    where: { orderId },
    include: [
      { model: Product, attributes: ['type', 'downloadUrls'] },
      { model: License, attributes: ['name'] },
    ],
    transaction,
  });

  return items.flatMap(getDownloadFilesForOrderItem);
};

const getOrderReceiptDetails = async (orderId, user, transaction) => {
  const order = await Order.findByPk(orderId, {
    include: [{
      model: OrderItem,
      include: [
        { model: Product, attributes: ['id', 'title', 'type'] },
        { model: License, attributes: ['id', 'name', 'description'] },
      ],
    }],
    transaction,
  });

  if (!order) return null;

  return {
    orderId: order.id,
    username: user?.username || String(order.customerName || '').trim().split(/\s+/)[0] || 'there',
    email: order.customerEmail || user?.email || '',
    purchasedAt: order.createdAt,
    status: order.status,
    paymentMethod: order.paymentMethod || null,
    paymentReference: order.paymentReference || null,
    totalPaid: Number(order.totalPrice || 0).toFixed(2),
    subtotalPrice: Number(order.subtotalPrice || order.totalPrice || 0).toFixed(2),
    promotionName: order.promotionName || null,
    promoCode: order.promoCode || null,
    discountPercent: Number(order.discountPercent || 0).toFixed(2),
    discountAmount: Number(order.discountAmount || 0).toFixed(2),
    items: (order.OrderItems || []).map((item) => ({
      title: item.Product?.title || 'Deleted product',
      type: item.Product?.type || null,
      license: item.License?.name || null,
      licenseDescription: item.License?.description || null,
      licenseTerms: getLicenseTermsForItem(item.Product, item.License),
      quantity: item.quantity || 1,
      price: Number(item.priceAtPurchase || 0).toFixed(2),
    })),
  };
};

const getLicenseTermsForItem = (product, license) => {
  const type = product?.type;

  if (type === 'loop_kit') {
    return 'Not royalty-free. You may use the sounds in your own music, but producer credit and royalty/publishing splits are still required for placements, major releases, sync, sample clearances, or commercial opportunities. Do not resell, repackage, redistribute, or upload the raw loops as a competing kit.';
  }

  if (type === 'drum_kit') {
    return 'Royalty-free for use in your own music productions. You may not resell, share, repackage, redistribute, or upload the raw drum sounds as a sample pack, drum kit, or competing product.';
  }

  if (type === 'beat') {
    if (String(license?.name || '').trim().toLowerCase() === 'exclusive') {
      return `${license?.description || 'Exclusive commercial usage rights to the purchased beat.'} Includes MP3, WAV, ZIP delivery and priority response for purchase questions or concerns. Copyright, publishing, and master ownership remain with doomsprod unless transferred in a separate signed agreement. Files and license rights are for the purchaser and are not transferable without written permission.`;
    }

    return `${license?.description || 'Usage rights follow the selected beat license for this purchase.'} Non-exclusive beat licenses do not transfer copyright ownership. Do not resell, redistribute, lease, share, or re-upload the beat files, trackouts, stems, WAVs, MP3s, or ZIP packages as standalone files. Content ID registration, copyright claims, and exclusive-rights claims are not allowed unless expressly included in a written exclusive agreement.`;
  }

  if (type === 'plugin') {
    return 'Plugin purchase includes the downloadable ZIP package and installation materials for the purchaser. Redistribution, resale, public sharing, license-key sharing, mirroring, or repackaging of the plugin files is not permitted.';
  }

  return 'Usage rights apply to this digital product as purchased.';
};

const clearCartForOrder = async (order, transaction) => {
  const cart = await Cart.findOne({ where: { userId: order.userId }, transaction });
  if (!cart) return;

  const orderItems = await OrderItem.findAll({
    where: { orderId: order.id },
    attributes: ['productId', 'licenseId'],
    transaction,
  });

  await Promise.all(orderItems.map((item) => CartItem.destroy({
    where: {
      cartId: cart.id,
      productId: item.productId,
      licenseId: item.licenseId || null,
    },
    transaction,
  })));
};

module.exports = {
  cents,
  clearCartForOrder,
  createOrderFromCart,
  previewCartPromotion,
  getOrderDownloadFiles,
  getOrderFileKeys,
  getOrderReceiptDetails,
};
