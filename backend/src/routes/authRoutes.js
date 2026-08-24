const express = require('express');
const passport = require('../config/passport');
const { getMe, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Authentication routes (Google OAuth only).
const router = express.Router();

// Current user profile route
router.get('/me', protect, getMe);

// Google OAuth login endpoint.
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile'],
    session: false,
  })
);

// Google OAuth callback returns the user token to the frontend.
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  googleCallback
);

module.exports = router;
