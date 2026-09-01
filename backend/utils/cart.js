const { Cart, Product, License } = require('../db/models');

const cartItemIncludes = [
  {
    model: Product,
    attributes: ['id', 'title', 'type', 'price', 'youtubeLink', 'audioPreviewUrl', 'imageUrl'],
  },
  { model: License, attributes: ['id', 'name', 'price'] },
];

const findOrCreateUserCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    cart = await Cart.create({ userId });
  }
  return cart;
};

const findUserCartById = (cartId, userId) => Cart.findOne({
  where: { id: cartId, userId },
});

module.exports = {
  cartItemIncludes,
  findUserCartById,
  findOrCreateUserCart,
};
