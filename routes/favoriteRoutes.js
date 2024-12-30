const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getUserFavorites
} = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua route membutuhkan auth
router.use(authMiddleware);

router.post('/', addFavorite);
router.delete('/:recipeId', removeFavorite);
router.get('/', getUserFavorites);

module.exports = router;