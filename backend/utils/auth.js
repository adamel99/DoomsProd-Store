// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;
// backend/utils/auth.js
// ...

const tokenCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };
};

// Sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // Create the token.
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        tokenVersion: user.tokenVersion || 0,
    };
    const token = jwt.sign(
        { data: safeUser },
        secret,
        { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );

    // Set the token cookie
    res.cookie('token', token, {
        maxAge: expiresIn * 1000, // maxAge in milliseconds
        ...tokenCookieOptions(),
    });

    return token;
};

// backend/utils/auth.js
// ...

const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            return next();
        }

        try {
            const { id, tokenVersion } = jwtPayload.data;
            req.user = await User.findByPk(id, {
                attributes: {
                    include: ['email', 'createdAt', 'updatedAt']
                }
            });
            if (req.user && (req.user.tokenVersion || 0) !== (tokenVersion || 0)) {
                req.user = null;
                res.clearCookie('token', tokenCookieOptions());
            }
        } catch (e) {
            res.clearCookie('token', tokenCookieOptions());
            return next();
        }

        if (!req.user) res.clearCookie('token', tokenCookieOptions());

        return next();
    });
};


// If there is no current user, return an error
const requireAuth = function (req, _res, next) {
    if (req.user) return next();

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
}

const requireAdmin = function (req, res, next) {
    if (!req.user) return requireAuth(req, res, next);
    if (req.user.role === 'admin') return next();

    const err = new Error('Admin authorization required');
    err.title = 'Admin authorization required';
    err.errors = { message: 'Admin authorization required' };
    err.status = 403;
    return next(err);
}



module.exports = { setTokenCookie, restoreUser, requireAuth, requireAdmin, tokenCookieOptions  };
