const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Ambil token dari header Authorization

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token is not valid' });
    }
  };

// Endpoint untuk memverifikasi token yang dikirimkan
router.post('/verify-token', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Token is valid', user: req.user });
}); 

  module.exports = authMiddleware;
