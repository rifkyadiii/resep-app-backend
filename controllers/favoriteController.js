const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

// Tambah favorit
exports.addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;
    
    // Cek apakah resep ada
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Cek apakah sudah difavoritkan
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      recipe: recipeId
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }

    // Buat favorit baru
    const favorite = new Favorite({
      user: req.user.id,
      recipe: recipeId
    });

    await favorite.save();

    res.status(201).json({ 
      success: true,
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
};

// Hapus favorit
exports.removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;
    
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      recipe: recipeId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ 
      success: true,
      message: 'Removed from favorites' 
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
};

// Get favorit user
exports.getUserFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate({
        path: 'recipe',
        populate: {
          path: 'user',
          select: 'username'
        }
      })
      .sort({ createdAt: -1 });

    const formattedFavorites = favorites.map(fav => ({
      id: fav.recipe._id,
      title: fav.recipe.title,
      description: fav.recipe.description,
      servings: fav.recipe.servings,
      cookingTime: fav.recipe.cookingTime,
      ingredients: fav.recipe.ingredients,
      imageUrl: fav.recipe.image
        ? `${req.protocol}://${req.get('host')}${fav.recipe.image}`
        : null,
      author: fav.recipe.user.username,
      createdAt: fav.createdAt
    }));

    res.status(200).json({
      success: true,
      favorites: formattedFavorites
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
};