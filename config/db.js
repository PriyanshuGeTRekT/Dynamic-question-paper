// backend/config/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'question_paper.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening SQLite DB:', err);
    } else {
        console.log('Connected to SQLite database:', dbPath);
    }
});

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
    );

    db.run(
        `CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
      marks INTEGER NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )`
    );
});

function query(sql, params = []) {
    const isSelect = sql.trim().toLowerCase().startsWith('select');

    if (isSelect) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve({ rows });
            });
        });
    } else {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }
}

module.exports = { query };
