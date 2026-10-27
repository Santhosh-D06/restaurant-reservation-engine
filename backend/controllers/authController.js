const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendAuth = (res, status, user) => {
  const u = user.toObject();
  delete u.password;
  res.status(status).json({ success: true, token: signToken(user._id), user: u });
};

// POST /api/auth/register  (always creates a customer; admins come from the seed script)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (await User.findOne({ email: email.toLowerCase() })) {
    throw new AppError('Email is already registered', 409);
  }
  const user = await User.create({ name, email, password, phone, role: 'customer' });
  sendAuth(res, 201, user);
});

// POST /api/auth/login  (customers and admins)
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  sendAuth(res, 200, user);
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
