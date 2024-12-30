const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const path = require('path');
const multer = require('multer');
const favoriteRoutes = require('./routes/favoriteRoutes');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute untuk login dan register
app.use('/auth', authRoutes);

// Rute untuk profil (perlu auth)
app.use('/profile', authMiddleware, profileRoutes);
app.use('/uploads', express.static('uploads'));

// Route untuk recipes dengan selective auth
app.use('/recipes', (req, res, next) => {
  // Skip auth middleware untuk endpoint public
  if (req.path === '/public') {
    return next();
  }
  // Terapkan auth middleware untuk route lainnya
  return authMiddleware(req, res, next);
}, recipeRoutes);

app.use('/favorites', favoriteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));