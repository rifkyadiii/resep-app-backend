const express = require('express');
const { login, register } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Endpoint untuk verifikasi token
router.post('/verify-token', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
});

// Endpoint untuk registrasi
router.post('/register', register);

// Endpoint untuk login
router.post('/login', login);

module.exports = router;
