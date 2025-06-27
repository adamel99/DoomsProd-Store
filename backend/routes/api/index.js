const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const productsRouter = require('./products.js');
const ordersRouter = require('./orders.js');
const licensesRouter = require('./licenses.js');
const playbackHistoryRouter = require('./playbackHistory.js');
const cartsRouter = require('./cart.js');    // corrected folder/file name
const cartItemsRouter = require('./cartItems');

const { restoreUser, setTokenCookie, requireAuth } = require('../../utils/auth.js');
const { User } = require('../../db/models');

// Connect restoreUser middleware to the API router
router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/carts', cartsRouter);                // fix route path: '/carts' not './carts'
router.use('/playbackHistory', playbackHistoryRouter);  // fix route path and name to '/playbackHistory'
router.use('/licenses', licensesRouter);
router.use('/cart-items', cartItemsRouter);

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
