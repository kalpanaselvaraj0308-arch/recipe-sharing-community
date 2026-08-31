const db = require('../config/db');

// Shared SELECT that joins author info and computed rating stats.
const BASE_SELECT = `
  SELECT
    r.*,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    COALESCE(AVG(rt.rating), 0) AS avg_rating,
    COUNT(rt.id) AS rating_count
  FROM recipes r
  JOIN users u ON u.id = r.user_id
  LEFT JOIN ratings rt ON rt.recipe_id = r.id
`;

function rowToRecipe(row) {
  if (!row) return null;
  return {
    ...row,
    ingredients: JSON.parse(row.ingredients),
    instructions: JSON.parse(row.instructions),
    avg_rating: Math.round(row.avg_rating * 10) / 10,
    rating_count: row.rating_count,
  };
}

const Recipe = {
  create({ userId, title, description, ingredients, instructions, category, cook_time_minutes, servings, image_url }) {
    const stmt = db.prepare(`
      INSERT INTO recipes (user_id, title, description, ingredients, instructions, category, cook_time_minutes, servings, image_url)
      VALUES (@userId, @title, @description, @ingredients, @instructions, @category, @cook_time_minutes, @servings, @image_url)
    `);
    const info = stmt.run({
      userId,
      title,
      description: description || '',
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
      category: category || 'Other',
      cook_time_minutes: cook_time_minutes || 0,
      servings: servings || 1,
      image_url: image_url || '',
    });
    return Recipe.findById(info.lastInsertRowid);
  },

  findById(id) {
    const row = db.prepare(`${BASE_SELECT} WHERE r.id = ? GROUP BY r.id`).get(id);
    return rowToRecipe(row);
  },

  update(id, fields) {
    const current = db.prepare(`SELECT * FROM recipes WHERE id = ?`).get(id);
    if (!current) return null;

    const merged = {
      title: fields.title ?? current.title,
      description: fields.description ?? current.description,
      ingredients: fields.ingredients ? JSON.stringify(fields.ingredients) : current.ingredients,
      instructions: fields.instructions ? JSON.stringify(fields.instructions) : current.instructions,
      category: fields.category ?? current.category,
      cook_time_minutes: fields.cook_time_minutes ?? current.cook_time_minutes,
      servings: fields.servings ?? current.servings,
      image_url: fields.image_url ?? current.image_url,
    };

    db.prepare(`
      UPDATE recipes SET
        title = @title, description = @description, ingredients = @ingredients,
        instructions = @instructions, category = @category, cook_time_minutes = @cook_time_minutes,
        servings = @servings, image_url = @image_url, updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...merged, id });

    return Recipe.findById(id);
  },

  delete(id) {
    return db.prepare(`DELETE FROM recipes WHERE id = ?`).run(id);
  },

  // search: text query, category filter, sort order, pagination
  search({ q, category, sort = 'newest', page = 1, limit = 12, userId }) {
    const conditions = [];
    const params = {};

    if (q) {
      conditions.push(`(r.title LIKE @q OR r.description LIKE @q OR r.ingredients LIKE @q)`);
      params.q = `%${q}%`;
    }
    if (category && category !== 'All') {
      conditions.push(`r.category = @category`);
      params.category = category;
    }
    if (userId) {
      conditions.push(`r.user_id = @userId`);
      params.userId = userId;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'r.created_at DESC';
    if (sort === 'oldest') orderBy = 'r.created_at ASC';
    if (sort === 'top_rated') orderBy = 'avg_rating DESC, rating_count DESC';
    if (sort === 'most_rated') orderBy = 'rating_count DESC';

    const offset = (Math.max(1, page) - 1) * limit;
    params.limit = limit;
    params.offset = offset;

    const rows = db.prepare(`
      ${BASE_SELECT}
      ${where}
      GROUP BY r.id
      ORDER BY ${orderBy}
      LIMIT @limit OFFSET @offset
    `).all(params);

    const countRow = db.prepare(`
      SELECT COUNT(*) as total FROM recipes r ${where}
    `).get(params);

    return {
      recipes: rows.map(rowToRecipe),
      total: countRow.total,
      page: Math.max(1, page),
      totalPages: Math.max(1, Math.ceil(countRow.total / limit)),
    };
  },

  listCategories() {
    return db.prepare(`SELECT DISTINCT category FROM recipes ORDER BY category`).all().map(r => r.category);
  },
};

module.exports = Recipe;
