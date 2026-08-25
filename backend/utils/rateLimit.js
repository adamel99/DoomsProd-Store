const expressRateLimit = require('express-rate-limit');

const rateLimit = ({ windowMs, max, message = 'Too many requests. Please try again later.' }) => {
  return expressRateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = rateLimit;
