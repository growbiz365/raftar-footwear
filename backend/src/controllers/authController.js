const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id, role, email) =>
  jwt.sign({ id, role, email }, process.env.JWT_SECRET || 'revone-jwt-secret-2026-secure', { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, password required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
    const token = signToken(user._id, user.role, user.email);
    res.status(201).json({
      success: true,
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = signToken(user._id, user.role, user.email);
    res.json({
      success: true,
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ success: true, data: req.user });
};
