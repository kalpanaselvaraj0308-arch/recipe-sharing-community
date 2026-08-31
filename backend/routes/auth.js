const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function makeToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are all required.' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (User.findByEmail(email)) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    if (User.findByUsername(username)) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = User.create({ username, email, passwordHash });
    const token = makeToken(user);

    res.status(201).json({ token, user: User.toPublic(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong creating your account.' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = User.findByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = makeToken(user);
    res.json({ token, user: User.toPublic(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong logging you in.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: User.toPublic(user) });
});

// PUT /api/auth/me — update bio / avatar
router.put('/me', requireAuth, upload.single('avatar'), (req, res) => {
  const { bio } = req.body;
  const avatar_url = req.file ? `/uploads/${req.file.filename}` : undefined;
  const user = User.updateProfile(req.user.id, { bio, avatar_url });
  res.json({ user: User.toPublic(user) });
});

// GET /api/auth/users/:username — public profile
router.get('/users/:username', (req, res) => {
  const user = User.findByUsername(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: User.toPublic(user) });
});

module.exports = router;
