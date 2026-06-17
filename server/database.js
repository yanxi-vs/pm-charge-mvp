const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: process.env.DB_PATH || path.join(__dirname, 'pm_charge.db'),
      driver: sqlite3.Database
    });
  }
  return db;
}

async function initDatabase() {
  const database = await getDb();

  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      sort_order INTEGER DEFAULT 0
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      video_url TEXT NOT NULL,
      cover_url TEXT,
      category_id TEXT,
      author_id TEXT NOT NULL,
      author_name TEXT,
      author_avatar TEXT,
      duration INTEGER DEFAULT 0,
      knowledge_tag TEXT,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      bookmarks INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, video_id)
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, video_id)
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.exec(`
    CREATE TABLE IF NOT EXISTS watch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, video_id)
    );
  `);

  return database;
}

module.exports = { getDb, initDatabase };
