// backend/routes/api/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const rateLimit = require('../../utils/rateLimit');


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

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    await setTokenCookie(res, user);

    return res.json({
      user: safeUser,
    });
  });


module.exports = router;
