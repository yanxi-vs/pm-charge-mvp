const express = require('express');
const { getDb } = require('../database');
const router = express.Router();

router.get('/', async (req, res) => {
  const db = await getDb();
  const categories = await db.all('SELECT * FROM categories ORDER BY sort_order');
  res.json({ success: true, data: categories });
});

router.get('/with-counts', async (req, res) => {
  const db = await getDb();
  const categories = await db.all(`
    SELECT c.*, COUNT(v.id) as video_count 
    FROM categories c 
    LEFT JOIN videos v ON c.id = v.category_id 
    GROUP BY c.id 
    ORDER BY c.sort_order
  `);
  res.json({ success: true, data: categories });
});

module.exports = router;
