const express = require('express');
const { getProfile, updatePhoto, updateName } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint untuk mendapatkan profil
router.get('/', authMiddleware, getProfile);

// Endpoint untuk memperbarui foto
router.put('/photo', authMiddleware, updatePhoto);

// Endpoint untuk memperbarui nama
router.put('/name', authMiddleware, updateName);

module.exports = router;