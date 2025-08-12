const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();

app.use(morgan('dev'));
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
if (!isProduction) {
  app.use(cors());
}

app.use(
  helmet.crossOriginResourcePolicy({
    policy: 'cross-origin',
  })
);

// CSRF
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') return next();
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && 'Lax',
      httpOnly: true,
    },
  })(req, res, next);
});

// Routes
app.use(routes);

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
