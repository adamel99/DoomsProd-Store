// backend/routes/api/session.js
const express = require('express')
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, tokenCookieOptions } = require('../../utils/auth');
const { LoginAttempt, User, sequelize } = require('../../db/models');
const rateLimit = require('../../utils/rateLimit');
const router = express.Router();
const normalizeCredential = (credential = '') => credential.trim().toLowerCase();
const loginIpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8 });
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

const loginAccountLimiter = async (req, res, next) => {
  const credential = normalizeCredential(req.body?.credential);
  if (!credential) return next();

  try {
    const now = new Date();
    const resetAt = new Date(now.getTime() + LOGIN_WINDOW_MS);

    const attempt = await sequelize.transaction(async (transaction) => {
      const existingAttempt = await LoginAttempt.findByPk(credential, {
        transaction,
        lock: true,
      });

      if (!existingAttempt || existingAttempt.resetAt <= now) {
        await LoginAttempt.upsert({
          credential,
          count: 1,
          resetAt,
        }, { transaction, returning: true });
        return LoginAttempt.findByPk(credential, { transaction });
      }

      existingAttempt.count += 1;
      await existingAttempt.save({ transaction });
      return existingAttempt;
    });

    if (attempt.count > LOGIN_MAX_ATTEMPTS) {
      res.set('Retry-After', Math.ceil((attempt.resetAt.getTime() - Date.now()) / 1000));
      return res.status(429).json({ message: 'Too many login attempts for this account. Please try again later.' });
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];


// Log in
router.post("/", loginIpLimiter, loginAccountLimiter, validateLogin, async (req, res, next) => {
  const { password } = req.body;
  const credential = normalizeCredential(req.body.credential);

  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential,
      },
    },
  });

  if (
    !user ||
    !bcrypt.compareSync(password, user.hashedPassword.toString())
  ) {
    const err = new Error("Login failed");
    err.status = 401;
    err.title = "Login failed";
    err.errors = { credential: "The provided credentials were invalid." };
    return next(err);
  }

  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  await setTokenCookie(res, user);
  await LoginAttempt.destroy({ where: { credential } });

  return res.json({
    user: safeUser,
  });
});

// Logout
router.delete(
  '/',
  async (req, res) => {
      if (req.user) {
        await req.user.increment('tokenVersion');
      }
      res.clearCookie('token', tokenCookieOptions());
      return res.json({ message: 'success' });
  }
);

// GET CURRENT USER
router.get('/', (req, res) => {
  if (req.user) {
    // User is logged in
    res.status(200).json({
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role
      }
    });
  } else {
    // No user logged in
    res.status(200).json({ user: null });
  }
});










module.exports = router;
