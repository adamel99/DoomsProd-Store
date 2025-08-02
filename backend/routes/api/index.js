const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const productsRouter = require('./products.js');
const ordersRouter = require('./orders.js');
const licensesRouter = require('./licenses.js');
const playbackHistoryRouter = require('./playbackHistory.js');
const cartsRouter = require('./cart.js');
const cartItemsRouter = require('./cartItems');
const paymentRouter = require('./payment');
const webhookRouter = require('./webhook');
const downloadRouter = require('./downloads'); // <-- ADD THIS

const { restoreUser, setTokenCookie, requireAuth } = require('../../utils/auth.js');
const { User } = require('../../db/models');

router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/carts', cartsRouter);
router.use('/playbackHistory', playbackHistoryRouter);
router.use('/licenses', licensesRouter);
router.use('/cart-items', cartItemsRouter);
router.use('/payment', paymentRouter);
router.use('/webhook', webhookRouter);
router.use('/downloads', downloadRouter); // <-- ADD THIS

// Test route for debugging
router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({
    where: { username: 'Demo-lition' }
  });
  setTokenCookie(res, user);
  return res.json({ user });
});

router.get('/restore-user', (req, res) => {
  return res.json(req.user);
});

router.get('/require-auth', requireAuth, (req, res) => {
  return res.json(req.user);
});

module.exports = router;
