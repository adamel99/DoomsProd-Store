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

const getFileKeysFromProduct = (product) => {
  const files = Array.isArray(product?.downloadUrls) ? product.downloadUrls : [];
  return files
    .map((file) => file?.key)
    .filter((key) => typeof key === 'string' && key.startsWith('products/'));
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
    include: [{ model: Product, attributes: ['downloadUrls'] }],
    transaction,
  });

  return items.flatMap((item) => getFileKeysFromProduct(item.Product));
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
  getOrderFileKeys,
};
