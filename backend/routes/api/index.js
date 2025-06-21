// backend/routes/api/index.js
const router = require('express').Router();
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const productsRouter = require('./products.js');
const ordersRouter = require('./orders');
const licensesRouter = require('./licenses');
const historyRouter = require('./history');
const EmailLogRouter = require('./emailLogs');
const cartsRouter = require('./carts');



const { restoreUser } = require("../../utils/auth.js");
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
const { Prodcuts } = require('../../db/models')


// Connect restoreUser middleware to the API router
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/products', productsRouter);

router.use('/orders', ordersRouter);

router.use('./carts', cartsRouter);

router.use('./emailLogs', EmailLogRouter);

router.use('./history', historyRouter);

router.use('./licenses', licensesRouter);



router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({
    where: {
      username: 'Demo-lition'
    }
  });
  setTokenCookie(res, user);
  return res.json({ user: user });
});




router.get(
  '/restore-user',
  (req, res) => {
    return res.json(req.user);
  }
);

// GET /api/require-auth
const { requireAuth } = require('../../utils/auth.js');
router.get(
  '/require-auth',
  requireAuth,
  (req, res) => {
    return res.json(req.user);
  }
);

module.exports = router;
