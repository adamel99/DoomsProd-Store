const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const { environment } = require('./config');
const isProduction = environment === 'production';
const app = express();

app.set('trust proxy', 1);

app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(cookieParser());

// Stripe webhook raw parser
app.use('/api/webhook', bodyParser.raw({ type: 'application/json' }));

// Conditional JSON parser
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (
    contentType.startsWith('multipart/form-data') ||
    req.originalUrl === '/api/webhook'
  ) {
    return next();
  }
  express.json()(req, res, next);
});

// Security
const allowedOrigins = [
  ...(process.env.FRONTEND_URLS || '').split(',').map((origin) => origin.trim()),
  process.env.FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
  !isProduction && 'http://localhost:3000',
  !isProduction && 'http://127.0.0.1:3000',
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    const requestOrigin = origin?.replace(/\/$/, '');
    if (!isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '')) {
      return callback(null, true);
    }
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) return callback(null, true);
    console.warn('Blocked by CORS:', requestOrigin, 'Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.stripe.com", "https://www.youtube.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  } : false,
}));

// Create csurf instance ONCE
const csrfProtection = csurf({
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
  },
  value: (req) =>
    req.headers['xsrf-token'] ||
    req.headers['XSRF-TOKEN'] ||
    req.headers['x-xsrf-token'],
});

// CSRF
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') return next();
  csrfProtection(req, res, next);
});

// CSRF restore route (production)
app.get('/api/csrf/restore', (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
  res.status(201).json({});
});

// Routes
app.use('/api', routes);

// Serve frontend in production
  if (isProduction) {
    const staticPath = path.resolve(__dirname, '../frontend/build');
  app.use(express.static(staticPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Error handling
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = 'Resource Not Found';
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

const { ValidationError } = require('sequelize');
app.use((err, _req, _res, next) => {
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

module.exports = app;
