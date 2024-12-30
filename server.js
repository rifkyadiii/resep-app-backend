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

// Konfigurasi CORS
const allowedOrigins = ['http://localhost:3000', 'http://curious-framing-442217-n0.et.r.appspot.com/']; // Daftar origin yang diizinkan

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) { // Cek apakah origin ada di daftar, atau jika request dari server itu sendiri (!origin)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions)); // Terapkan CORS dengan konfigurasi
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

app.use('/favorites', authMiddleware, favoriteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));