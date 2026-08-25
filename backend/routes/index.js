const express = require('express');
const router = express.Router();
const apiRouter = require('./api');

router.use('/', apiRouter);

// Add XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
  router.get('/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      secure: false,
      sameSite: 'lax',
    });
    res.status(201).json({});
  });
}

module.exports = router;
