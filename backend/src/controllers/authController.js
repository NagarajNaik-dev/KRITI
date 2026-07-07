const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isValidEmail = (email) => EMAIL_REGEX.test(email);

const normalizeAvatar = (avatar = '') => {
  if (!avatar || typeof avatar !== 'string') return '';
  return avatar.startsWith('//') ? `https:${avatar}` : avatar;
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Create a signed JWT for a given user ID.
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Send the auth token and safe user details back to the frontend.
const sendTokenResponse = (user, res) => {
  const token = signToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: normalizeAvatar(user.avatar),
    },
  });
};

// Create an SMTP transporter for sending password reset emails.
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendVerificationEmail = async (user, verificationToken) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;
  const transporter = getTransporter();
  let responsePayload = {
    message: 'Account created. Please verify your email before signing in.',
    requiresVerification: true,
  };

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Verify your email - Kriti',
      html: `<p>Hi ${user.name},</p><p>Click <a href="${verifyUrl}">here</a> to verify your email. This link expires in 24 hours.</p>`,
    });
  } else {
    console.log('Email verification URL (dev):', verifyUrl);
    if (process.env.NODE_ENV !== 'production') {
      responsePayload.verifyUrl = verifyUrl;
    }
  }

  return responsePayload;
};

// Register a new user account with name, email, and password.
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.googleId && !existing.password) {
        return res.status(400).json({ message: 'This email uses Google sign-in. Please continue with Google.' });
      }
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      emailVerified: false,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000,
    });

    const responsePayload = await sendVerificationEmail(user, verificationToken);
    res.status(201).json(responsePayload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticate a user with email and password.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Allow accounts created before email verification was added.
    if (!user.emailVerified && !user.emailVerificationToken) {
      user.emailVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before signing in.',
        requiresVerification: true,
      });
    }

    sendTokenResponse(user, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

// Request a password reset email for an account.
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const transporter = getTransporter();
    let responsePayload = { message: 'If that email exists, a reset link has been sent' };

    if (transporter) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'Password Reset - AI Interview Platform',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      });
    } else {
      console.log('Password reset URL (dev):', resetUrl);
      if (process.env.NODE_ENV !== 'production') {
        responsePayload.resetUrl = resetUrl;
      }
    }

    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset the user's password using a secure token from email.
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify a user's email address using the token sent by email.
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resend the email verification link.
exports.resendVerification = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.emailVerified || !user.password) {
      return res.json({ message: 'If that account needs verification, a new link has been sent.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const responsePayload = await sendVerificationEmail(user, verificationToken);
    res.json({ message: responsePayload.message, verifyUrl: responsePayload.verifyUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// OAuth callback: issue a token and redirect back to the frontend.
exports.googleCallback = (req, res) => {
  const token = signToken(req.user._id);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.redirect(`${clientUrl}/auth/callback?token=${token}`);
};
