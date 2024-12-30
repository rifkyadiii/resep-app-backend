const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  servings: {
    type: Number,
    required: true,
  },
  cookingTime: {
    type: Number,
    required: true,
  },
  ingredients: [{
    item: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    }
  }],
  steps: [{
    order: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    }
  }],
  image: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;