const Recipe = require('../models/Recipe');

exports.getAllPublicRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    const recipesWithFullUrls = recipes.map(recipe => ({
      id: recipe._id,
      title: recipe.title,
      description: recipe.description,
      servings: recipe.servings,
      cookingTime: recipe.cookingTime,
      ingredients: recipe.ingredients.map(ing => ({
        item: ing.item || '',
        quantity: ing.quantity || '',
        unit: ing.unit || ''
      })),
      steps: recipe.steps.map((step, index) => ({
        description: step.description || '',
        order: index + 1
      })),
      imageUrl: recipe.image 
        ? `${req.protocol}://${req.get('host')}${recipe.image}`
        : null,
      author: recipe.user?.name || 'Anonymous',
      createdAt: recipe.createdAt
    }));

    res.status(200).json({
      success: true,
      recipes: recipesWithFullUrls
    });
  } catch (error) {
    console.error('Error fetching public recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public recipes',
      error: error.message
    });
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    const recipesWithFullUrls = recipes.map(recipe => ({
      id: recipe._id,
      title: recipe.title,
      description: recipe.description,
      servings: recipe.servings,
      cookingTime: recipe.cookingTime,
      ingredients: recipe.ingredients.map(ing => ({
        item: ing.item || '',
        quantity: ing.quantity || '',
        unit: ing.unit || ''
      })),
      steps: recipe.steps.map((step, index) => ({
        description: step.description || '',
        order: index + 1
      })),
      imageUrl: recipe.image 
        ? `${req.protocol}://${req.get('host')}${recipe.image}`
        : null,
      createdAt: recipe.createdAt,
      userId: recipe.user
    }));

    res.status(200).json({
      success: true,
      recipes: recipesWithFullUrls
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recipes',
      error: error.message
    });
  }
};

exports.addRecipe = async (req, res) => {
  try {
    const { title, description, servings, cookingTime, ingredients, steps } = req.body;

    if (!title || !description || !ingredients || !steps) {
      return res.status(400).json({ 
        message: 'Please provide title, description, ingredients, and steps' 
      });
    }

    const parsedIngredients = JSON.parse(ingredients);
    const parsedSteps = JSON.parse(steps);

    // Validate ingredients structure
    if (!Array.isArray(parsedIngredients) || !parsedIngredients.every(ing => 
      ing.item && ing.quantity && ing.unit)) {
      return res.status(400).json({
        message: 'Invalid ingredients format. Each ingredient must have item, quantity, and unit'
      });
    }

    // Validate steps structure
    if (!Array.isArray(parsedSteps) || !parsedSteps.every(step => 
      step.description && typeof step.description === 'string')) {
      return res.status(400).json({
        message: 'Invalid steps format. Each step must have a description'
      });
    }

    const recipeData = {
      title,
      description,
      servings: Number(servings),
      cookingTime: Number(cookingTime),
      ingredients: parsedIngredients,
      steps: parsedSteps.map((step, index) => ({
        description: step.description,
        order: index + 1
      })),
      user: req.user.id
    };

    if (req.file) {
      recipeData.image = `/uploads/${req.file.filename}`;
    }

    const newRecipe = new Recipe(recipeData);
    await newRecipe.save();

    res.status(201).json({ 
      message: 'Recipe added successfully', 
      recipe: newRecipe 
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(400).json({ 
      message: 'Error creating recipe', 
      error: error.message 
    });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const { title, description, servings, cookingTime, ingredients, steps } = req.body;
    
    const parsedIngredients = JSON.parse(ingredients);
    const parsedSteps = JSON.parse(steps);

    // Validate ingredients and steps structure
    if (!Array.isArray(parsedIngredients) || !parsedIngredients.every(ing => 
      ing.item && ing.quantity && ing.unit)) {
      return res.status(400).json({
        message: 'Invalid ingredients format'
      });
    }

    if (!Array.isArray(parsedSteps) || !parsedSteps.every(step => 
      step.description && typeof step.description === 'string')) {
      return res.status(400).json({
        message: 'Invalid steps format'
      });
    }

    const updateData = {
      title,
      description,
      servings: Number(servings),
      cookingTime: Number(cookingTime),
      ingredients: parsedIngredients,
      steps: parsedSteps.map((step, index) => ({
        description: step.description,
        order: index + 1
      }))
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ 
      message: 'Recipe updated successfully', 
      recipe 
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ 
      message: 'Error updating recipe', 
      error: error.message 
    });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ 
      message: 'Error deleting recipe', 
      error: error.message 
    });
  }
};