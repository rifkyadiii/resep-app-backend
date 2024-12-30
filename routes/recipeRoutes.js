const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  addRecipe, 
  getAllRecipes, 
  updateRecipe,
  deleteRecipe,
  getAllPublicRecipes
} = require('../controllers/recipeController');

// Setup multer untuk menangani upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Public route
router.get('/public', getAllPublicRecipes);

// Protected routes - butuh auth middleware
router.post('/', upload.single('image'), addRecipe);
router.get('/', getAllRecipes);
router.put('/:id', upload.single('image'), updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;