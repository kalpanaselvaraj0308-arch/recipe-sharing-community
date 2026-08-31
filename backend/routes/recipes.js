const express = require('express');
const Recipe = require('../models/Recipe');
const Rating = require('../models/Rating');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function parseListField(value) {
  // Accepts either a JSON array string or newline-separated text from a form.
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (_) {
    // not JSON, fall through to newline split
  }
  return value.split('\n').map(s => s.trim()).filter(Boolean);
}

// GET /api/recipes — search & list
router.get('/', (req, res) => {
  const { q, category, sort, page, limit, userId } = req.query;
  const result = Recipe.search({
    q: q?.trim(),
    category,
    sort,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 12,
    userId: userId ? parseInt(userId, 10) : undefined,
  });
  res.json(result);
});

// GET /api/recipes/categories
router.get('/categories', (req, res) => {
  res.json({ categories: Recipe.listCategories() });
});

// GET /api/recipes/:id
router.get('/:id', optionalAuth, (req, res) => {
  const recipe = Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });

  const ratings = Rating.listForRecipe(recipe.id);
  const myRating = req.user ? Rating.findUserRating(recipe.id, req.user.id) : null;

  res.json({ recipe, ratings, myRating: myRating || null });
});

// POST /api/recipes — create (with optional image)
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  try {
    const { title, description, category, cook_time_minutes, servings } = req.body;
    const ingredients = parseListField(req.body.ingredients);
    const instructions = parseListField(req.body.instructions);

    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Recipe title must be at least 3 characters.' });
    }
    if (ingredients.length === 0) {
      return res.status(400).json({ error: 'Add at least one ingredient.' });
    }
    if (instructions.length === 0) {
      return res.status(400).json({ error: 'Add at least one instruction step.' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : '';

    const recipe = Recipe.create({
      userId: req.user.id,
      title: title.trim(),
      description,
      ingredients,
      instructions,
      category,
      cook_time_minutes: cook_time_minutes ? parseInt(cook_time_minutes, 10) : 0,
      servings: servings ? parseInt(servings, 10) : 1,
      image_url,
    });

    res.status(201).json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong creating the recipe.' });
  }
});

// PUT /api/recipes/:id — update (owner only)
router.put('/:id', requireAuth, upload.single('image'), (req, res) => {
  const existing = Recipe.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Recipe not found.' });
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own recipes.' });
  }

  const { title, description, category, cook_time_minutes, servings } = req.body;
  const fields = {
    title: title?.trim(),
    description,
    category,
    cook_time_minutes: cook_time_minutes ? parseInt(cook_time_minutes, 10) : undefined,
    servings: servings ? parseInt(servings, 10) : undefined,
  };
  if (req.body.ingredients) fields.ingredients = parseListField(req.body.ingredients);
  if (req.body.instructions) fields.instructions = parseListField(req.body.instructions);
  if (req.file) fields.image_url = `/uploads/${req.file.filename}`;

  const recipe = Recipe.update(req.params.id, fields);
  res.json({ recipe });
});

// DELETE /api/recipes/:id — owner only
router.delete('/:id', requireAuth, (req, res) => {
  const existing = Recipe.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Recipe not found.' });
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own recipes.' });
  }
  Recipe.delete(req.params.id);
  res.json({ success: true });
});

// POST /api/recipes/:id/ratings — rate or update rating
router.post('/:id/ratings', requireAuth, (req, res) => {
  const recipe = Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found.' });

  const { rating, comment } = req.body;
  const numRating = parseInt(rating, 10);
  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
  }

  Rating.upsert({ recipeId: recipe.id, userId: req.user.id, rating: numRating, comment });
  const updated = Recipe.findById(recipe.id);
  const ratings = Rating.listForRecipe(recipe.id);
  res.status(201).json({ recipe: updated, ratings });
});

// DELETE /api/recipes/:id/ratings — remove my rating
router.delete('/:id/ratings', requireAuth, (req, res) => {
  Rating.delete(req.params.id, req.user.id);
  const updated = Recipe.findById(req.params.id);
  const ratings = Rating.listForRecipe(req.params.id);
  res.json({ recipe: updated, ratings });
});

module.exports = router;
