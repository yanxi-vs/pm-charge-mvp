const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/learning', require('./routes/learning'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PM Charge MVP API is running' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

async function start() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Mobile access: http://192.168.x.x:${PORT} (replace with your local IP)`);
  });
}

start().catch(err => {
  console.error('❌ 启动失败:', err);
  process.exit(1);
});
