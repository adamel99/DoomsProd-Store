// backend/routes/api/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const rateLimit = require('../../utils/rateLimit');

const safeUser = (user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    role: user.role,
    isSubscribedToEmails: user.isSubscribedToEmails,
});

const validateProfileUpdate = [
    check('firstName')
        .exists({ checkFalsy: true })
        .trim()
        .isLength({ min: 1, max: 80 })
        .withMessage('First name is required and must be 80 characters or less.'),
    check('lastName')
        .exists({ checkFalsy: true })
        .trim()
        .isLength({ min: 1, max: 80 })
        .withMessage('Last name is required and must be 80 characters or less.'),
    check('email')
        .exists({ checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email.')
        .isLength({ max: 255 })
        .withMessage('Email must be 255 characters or less.'),
    check('isSubscribedToEmails')
        .optional()
        .isBoolean()
        .withMessage('Email subscription preference must be true or false.'),
    handleValidationErrors
];

const validatePasswordUpdate = [
    check('currentPassword')
        .exists({ checkFalsy: true })
        .withMessage('Current password is required.'),
    check('newPassword')
        .exists({ checkFalsy: true })
        .isLength({ min: 12, max: 128 })
        .withMessage('New password must be between 12 and 128 characters.')
        .matches(/[a-z]/)
        .withMessage('New password must include at least one lowercase letter.')
        .matches(/[A-Z]/)
        .withMessage('New password must include at least one uppercase letter.')
        .matches(/\d/)
        .withMessage('New password must include at least one number.')
        .matches(/[^A-Za-z0-9]/)
        .withMessage('New password must include at least one symbol.'),
    handleValidationErrors
];

const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 12, max: 128 })
        .withMessage('Password must be between 12 and 128 characters.')
        .matches(/[a-z]/)
        .withMessage('Password must include at least one lowercase letter.')
        .matches(/[A-Z]/)
        .withMessage('Password must include at least one uppercase letter.')
        .matches(/\d/)
        .withMessage('Password must include at least one number.')
        .matches(/[^A-Za-z0-9]/)
        .withMessage('Password must include at least one symbol.'),
    check('isSubscribedToEmails')
        .optional()
        .isBoolean()
        .withMessage('Email subscription preference must be true or false.'),
    handleValidationErrors
];



// Sign up
router.post("", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), validateSignup, async (req, res) => {
    const { firstName, lastName, email, password, username, isSubscribedToEmails } = req.body;
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      hashedPassword,
      isSubscribedToEmails: isSubscribedToEmails === true,
    });

    await setTokenCookie(res, user);

    return res.json({
      user: safeUser(user),
    });
  });

router.put(
  "/me",
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 12 }),
  validateProfileUpdate,
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, isSubscribedToEmails } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      const existingEmailUser = await User.findOne({ where: { email: normalizedEmail } });
      if (existingEmailUser && existingEmailUser.id !== req.user.id) {
        return res.status(400).json({ errors: { email: "Email is already in use." } });
      }

      await req.user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        isSubscribedToEmails: isSubscribedToEmails === true,
      });

      return res.json({ user: safeUser(req.user) });
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  "/me/password",
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }),
  validatePasswordUpdate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.unscoped().findByPk(req.user.id);

      if (!user || !bcrypt.compareSync(currentPassword, user.hashedPassword.toString())) {
        return res.status(401).json({ errors: { currentPassword: "Current password is incorrect." } });
      }

      user.hashedPassword = bcrypt.hashSync(newPassword);
      user.tokenVersion += 1;
      await user.save();
      await setTokenCookie(res, user);

      return res.json({ message: "Password updated successfully.", user: safeUser(user) });
    } catch (err) {
      return next(err);
    }
  }
);


module.exports = router;
