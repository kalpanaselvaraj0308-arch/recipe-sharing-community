const db = require('../config/db');

const User = {
  create({ username, email, passwordHash }) {
    const stmt = db.prepare(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`
    );
    const info = stmt.run(username, email, passwordHash);
    return User.findById(info.lastInsertRowid);
  },

  findById(id) {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  },

  findByEmail(email) {
    return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  },

  findByUsername(username) {
    return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  },

  updateProfile(id, { bio, avatar_url }) {
    db.prepare(`UPDATE users SET bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url) WHERE id = ?`)
      .run(bio ?? null, avatar_url ?? null, id);
    return User.findById(id);
  },

  toPublic(user) {
    if (!user) return null;
    const { password_hash, ...rest } = user;
    return rest;
  },
};

module.exports = User;
