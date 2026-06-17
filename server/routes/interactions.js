const express = require('express');
const { getDb } = require('../database');
const router = express.Router();

router.post('/like', async (req, res) => {
  const { user_id, video_id } = req.body;
  const db = await getDb();
  
  const existing = await db.get('SELECT * FROM likes WHERE user_id = ? AND video_id = ?', user_id, video_id);
  
  if (existing) {
    await db.run('DELETE FROM likes WHERE user_id = ? AND video_id = ?', user_id, video_id);
    await db.run('UPDATE videos SET likes = likes - 1 WHERE id = ?', video_id);
    res.json({ success: true, data: { liked: false } });
  } else {
    await db.run('INSERT INTO likes (user_id, video_id) VALUES (?, ?)', user_id, video_id);
    await db.run('UPDATE videos SET likes = likes + 1 WHERE id = ?', video_id);
    res.json({ success: true, data: { liked: true } });
  }
});

router.get('/like-status', async (req, res) => {
  const { user_id, video_id } = req.query;
  const db = await getDb();
  const existing = await db.get('SELECT * FROM likes WHERE user_id = ? AND video_id = ?', user_id, video_id);
  res.json({ success: true, data: { liked: !!existing } });
});

router.post('/bookmark', async (req, res) => {
  const { user_id, video_id } = req.body;
  const db = await getDb();
  
  const existing = await db.get('SELECT * FROM bookmarks WHERE user_id = ? AND video_id = ?', user_id, video_id);
  
  if (existing) {
    await db.run('DELETE FROM bookmarks WHERE user_id = ? AND video_id = ?', user_id, video_id);
    await db.run('UPDATE videos SET bookmarks = bookmarks - 1 WHERE id = ?', video_id);
    res.json({ success: true, data: { bookmarked: false } });
  } else {
    await db.run('INSERT INTO bookmarks (user_id, video_id) VALUES (?, ?)', user_id, video_id);
    await db.run('UPDATE videos SET bookmarks = bookmarks + 1 WHERE id = ?', video_id);
    res.json({ success: true, data: { bookmarked: true } });
  }
});

router.get('/bookmark-status', async (req, res) => {
  const { user_id, video_id } = req.query;
  const db = await getDb();
  const existing = await db.get('SELECT * FROM bookmarks WHERE user_id = ? AND video_id = ?', user_id, video_id);
  res.json({ success: true, data: { bookmarked: !!existing } });
});

router.get('/comments/:video_id', async (req, res) => {
  const { video_id } = req.params;
  const db = await getDb();
  const comments = await db.all(`
    SELECT c.*, u.avatar as user_avatar 
    FROM comments c 
    LEFT JOIN users u ON c.user_id = u.id 
    WHERE c.video_id = ? 
    ORDER BY c.created_at DESC
  `, video_id);
  res.json({ success: true, data: comments });
});

router.post('/comments', async (req, res) => {
  const { user_id, video_id, content, username } = req.body;
  const db = await getDb();
  
  await db.run('INSERT INTO comments (user_id, video_id, username, content) VALUES (?, ?, ?, ?)',
    user_id, video_id, username, content);
  await db.run('UPDATE videos SET comments = comments + 1 WHERE id = ?', video_id);
  
  const comment = await db.get(`
    SELECT c.*, u.avatar as user_avatar 
    FROM comments c 
    LEFT JOIN users u ON c.user_id = u.id 
    WHERE c.id = last_insert_rowid()
  `);
  
  res.status(201).json({ success: true, data: comment });
});

module.exports = router;
