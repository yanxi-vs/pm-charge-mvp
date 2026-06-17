const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await getDb();
  const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', email, password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: '邮箱或密码错误' });
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio
    }
  });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const db = await getDb();
  
  const existing = await db.get('SELECT * FROM users WHERE email = ? OR username = ?', email, username);
  if (existing) {
    return res.status(400).json({ success: false, message: '用户名或邮箱已存在' });
  }
  
  const id = uuidv4();
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  
  await db.run('INSERT INTO users (id, username, email, password, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
    id, username, email, password, avatar, '');
  
  res.status(201).json({
    success: true,
    data: { id, username, email, avatar, bio: '' }
  });
});

module.exports = router;
