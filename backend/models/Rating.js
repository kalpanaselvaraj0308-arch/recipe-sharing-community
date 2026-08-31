const db = require('../config/db');

const Rating = {
  // Creates a new rating, or updates the user's existing rating for this recipe.
  upsert({ recipeId, userId, rating, comment }) {
    const existing = db.prepare(
      `SELECT * FROM ratings WHERE recipe_id = ? AND user_id = ?`
    ).get(recipeId, userId);

    if (existing) {
      db.prepare(
        `UPDATE ratings SET rating = ?, comment = ?, created_at = datetime('now') WHERE id = ?`
      ).run(rating, comment || '', existing.id);
      return db.prepare(`SELECT * FROM ratings WHERE id = ?`).get(existing.id);
    }

    const info = db.prepare(
      `INSERT INTO ratings (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`
    ).run(recipeId, userId, rating, comment || '');
    return db.prepare(`SELECT * FROM ratings WHERE id = ?`).get(info.lastInsertRowid);
  },

  listForRecipe(recipeId) {
    return db.prepare(`
      SELECT rt.*, u.username, u.avatar_url
      FROM ratings rt
      JOIN users u ON u.id = rt.user_id
      WHERE rt.recipe_id = ?
      ORDER BY rt.created_at DESC
    `).all(recipeId);
  },

  findUserRating(recipeId, userId) {
    return db.prepare(`SELECT * FROM ratings WHERE recipe_id = ? AND user_id = ?`).get(recipeId, userId);
  },

  delete(recipeId, userId) {
    return db.prepare(`DELETE FROM ratings WHERE recipe_id = ? AND user_id = ?`).run(recipeId, userId);
  },
};

module.exports = Rating;
