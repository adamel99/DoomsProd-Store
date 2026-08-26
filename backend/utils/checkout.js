const { Cart, CartItem, Product, License, Order, OrderItem, sequelize } = require('../db/models');

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
    lock: transaction ? true : undefined,
  });
};

const createOrderFromCart = async (userId) => {
  return sequelize.transaction(async (transaction) => {
    const cartItems = await getUserCartItems(userId, transaction);
    if (!cartItems.length) {
      const err = new Error('Cart is empty.');
      err.status = 400;
      throw err;
    }

    const lineItems = cartItems.map((item) => {
      validateLineItem(item);
      const price = getItemPrice(item);
      return {
        cartItem: item,
        product: item.Product,
        license: item.License,
        quantity: item.quantity || 1,
        price,
      };
    });

    const totalPrice = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId,
      totalPrice: totalPrice.toFixed(2),
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
    username: user?.username || 'there',
    email: user?.email || '',
    purchasedAt: order.createdAt,
    status: order.status,
    totalPaid: Number(order.totalPrice || 0).toFixed(2),
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
    return 'Not royalty-free. You may use the files in your music, but producer credit and royalty/publishing splits are still required for placements, major releases, syncs, or commercial opportunities.';
  }

  if (type === 'drum_kit') {
    return 'Royalty-free. You may use the drum sounds in your own productions without owing additional royalties.';
  }

  if (type === 'beat') {
    if (String(license?.name || '').trim().toLowerCase() === 'exclusive') {
      return `${license?.description || 'Exclusive rights to the beat.'} Includes MP3, WAV, ZIP delivery and priority response for purchase questions or concerns.`;
    }

    return license?.description || 'Usage rights follow the selected beat license for this purchase.';
  }

  if (type === 'plugin') {
    return 'Plugin purchase includes the downloadable ZIP package and installation materials. Redistribution, resale, or sharing of the plugin files is not permitted.';
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
  getOrderDownloadFiles,
  getOrderFileKeys,
  getOrderReceiptDetails,
};
