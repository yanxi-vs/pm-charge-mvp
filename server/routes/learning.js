const express = require('express');
const { getDb } = require('../database');
const router = express.Router();

router.post('/notes', async (req, res) => {
  const { user_id, video_id, content, timestamp } = req.body;
  const db = await getDb();
  
  await db.run('INSERT INTO notes (user_id, video_id, content, timestamp) VALUES (?, ?, ?, ?)',
    user_id, video_id, content, timestamp);
  
  const note = await db.get(`
    SELECT n.*, v.title as video_title, v.cover_url 
    FROM notes n 
    LEFT JOIN videos v ON n.video_id = v.id 
    WHERE n.id = last_insert_rowid()
  `);
  
  res.status(201).json({ success: true, data: note });
});

router.get('/notes/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const db = await getDb();
  const notes = await db.all(`
    SELECT n.*, v.title as video_title, v.cover_url, v.author_name 
    FROM notes n 
    LEFT JOIN videos v ON n.video_id = v.id 
    WHERE n.user_id = ? 
    ORDER BY n.created_at DESC
  `, user_id);
  res.json({ success: true, data: notes });
});

router.post('/history', async (req, res) => {
  const { user_id, video_id, progress } = req.body;
  const db = await getDb();
  
  const existing = await db.get('SELECT * FROM watch_history WHERE user_id = ? AND video_id = ?', user_id, video_id);
  
  if (existing) {
    await db.run('UPDATE watch_history SET progress = ?, watched_at = CURRENT_TIMESTAMP WHERE user_id = ? AND video_id = ?',
      progress, user_id, video_id);
  } else {
    await db.run('INSERT INTO watch_history (user_id, video_id, progress) VALUES (?, ?, ?)',
      user_id, video_id, progress);
  }
  
  res.json({ success: true });
});

router.get('/history/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const db = await getDb();
  const history = await db.all(`
    SELECT h.*, v.title, v.cover_url, v.author_name, v.duration, v.knowledge_tag
    FROM watch_history h 
    LEFT JOIN videos v ON h.video_id = v.id 
    WHERE h.user_id = ? 
    ORDER BY h.watched_at DESC
  `, user_id);
  res.json({ success: true, data: history });
});

router.get('/bookmarks/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const db = await getDb();
  const bookmarks = await db.all(`
    SELECT v.*, b.created_at as bookmarked_at
    FROM bookmarks b 
    LEFT JOIN videos v ON b.video_id = v.id 
    WHERE b.user_id = ? 
    ORDER BY b.created_at DESC
  `, user_id);
  res.json({ success: true, data: bookmarks });
});

router.get('/stats/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const db = await getDb();
  
  const watched = await db.get('SELECT COUNT(*) as count FROM watch_history WHERE user_id = ?', user_id);
  const notes = await db.get('SELECT COUNT(*) as count FROM notes WHERE user_id = ?', user_id);
  const bookmarks = await db.get('SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?', user_id);
  const totalWatch = await db.get(`
    SELECT SUM(v.duration) as total 
    FROM watch_history h 
    LEFT JOIN videos v ON h.video_id = v.id 
    WHERE h.user_id = ?
  `, user_id);
  
  res.json({
    success: true,
    data: {
      watched_count: watched.count,
      notes_count: notes.count,
      bookmarks_count: bookmarks.count,
      total_watch_seconds: totalWatch.total || 0
    }
  });
});

module.exports = router;
