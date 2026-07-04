const express = require('express');
const passport = require('../config/passport');
const { register, login, getMe, forgotPassword, resetPassword, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public and protected authentication routes.

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Google OAuth login endpoint.
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google OAuth callback returns the user token to the frontend.
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  googleCallback
);

module.exports = router;
