const jwt = require('jsonwebtoken');

const normalizeAvatar = (avatar = '') => {
  if (!avatar || typeof avatar !== 'string') return '';
  return avatar.startsWith('//') ? `https:${avatar}` : avatar;
};

// Create a signed JWT for a given user ID.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Return the currently authenticated user's profile.
exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: normalizeAvatar(req.user.avatar),
    },
  });
};

// OAuth callback: issue a token and redirect back to the frontend.
exports.googleCallback = (req, res) => {
  const token = signToken(req.user._id);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/auth/callback?token=${token}`);
};
