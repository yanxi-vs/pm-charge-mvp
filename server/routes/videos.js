const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const router = express.Router();

router.get('/', async (req, res) => {
  const { category, page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;
  const db = await getDb();
  
  let query = 'SELECT v.*, c.name as category_name, c.color as category_color FROM videos v LEFT JOIN categories c ON v.category_id = c.id WHERE 1=1';
  const params = [];
  
  if (category && category !== 'all') {
    query += ' AND v.category_id = ?';
    params.push(category);
  }
  
  if (search) {
    query += ' AND (v.title LIKE ? OR v.knowledge_tag LIKE ? OR v.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  const videos = await db.all(query, params);
  res.json({ success: true, data: videos });
});

router.get('/feed/recommended', async (req, res) => {
  const { category = 'all', limit = 20 } = req.query;
  const db = await getDb();
  
  let query = 'SELECT v.*, c.name as category_name, c.color as category_color FROM videos v LEFT JOIN categories c ON v.category_id = c.id';
  const params = [];
  
  if (category && category !== 'all') {
    query += ' WHERE v.category_id = ?';
    params.push(category);
  }
  
  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(parseInt(limit));
  
  const videos = await db.all(query, params);
  res.json({ success: true, data: videos });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const db = await getDb();
  const video = await db.get('SELECT v.*, c.name as category_name FROM videos v LEFT JOIN categories c ON v.category_id = c.id WHERE v.id = ?', id);
  
  if (!video) {
    return res.status(404).json({ success: false, message: '视频不存在' });
  }
  
  await db.run('UPDATE videos SET views = views + 1 WHERE id = ?', id);
  video.views += 1;
  
  res.json({ success: true, data: video });
});

router.post('/', async (req, res) => {
  const { title, description, video_url, cover_url, category_id, author_id, knowledge_tag, duration } = req.body;
  const db = await getDb();
  
  const author = await db.get('SELECT username, avatar FROM users WHERE id = ?', author_id);
  if (!author) {
    return res.status(400).json({ success: false, message: '作者不存在' });
  }
  
  const id = uuidv4();
  await db.run(`
    INSERT INTO videos (id, title, description, video_url, cover_url, category_id, author_id, author_name, author_avatar, duration, knowledge_tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, id, title, description, video_url, cover_url, category_id, author_id, author.username, author.avatar, duration, knowledge_tag);
  
  const video = await db.get('SELECT * FROM videos WHERE id = ?', id);
  res.status(201).json({ success: true, data: video });
});

module.exports = router;
