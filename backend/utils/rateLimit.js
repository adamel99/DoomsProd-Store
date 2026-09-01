const expressRateLimit = require('express-rate-limit');

const logRateLimitHit = (req, res, _next, options) => {
  console.warn('Rate limit exceeded:', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || null,
    limit: options.limit,
    windowMs: options.windowMs,
    userAgent: req.get('user-agent') || null,
  });

  return res.status(options.statusCode).json(options.message);
};

const rateLimit = ({
  windowMs,
  max,
  message = 'Too many requests. Please try again later.',
  skip,
}) => {
  return expressRateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    skip,
    handler: logRateLimitHit,
  });
};

module.exports = rateLimit;
