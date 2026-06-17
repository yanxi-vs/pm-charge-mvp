const { v4: uuidv4 } = require('uuid');
const { initDatabase, getDb } = require('./database');

// 真实视频数据：来自 Pexels 的免费商用竖屏商务/科技/办公场景视频
const sampleVideos = [
  'https://videos.pexels.com/video-files/10374892/10374892-hd_1080_1920_24fps.mp4',
  'https://videos.pexels.com/video-files/10375446/10375446-hd_720_1280_30fps.mp4',
  'https://videos.pexels.com/video-files/12893579/12893579-hd_720_1280_24fps.mp4',
  'https://videos.pexels.com/video-files/19532053/19532053-hd_720_1280_30fps.mp4',
  'https://videos.pexels.com/video-files/33314914/14188114_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/33315117/14188162_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/33315143/14188174_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/34578211/14652362_720_1280_30fps.mp4',
  'https://videos.pexels.com/video-files/34771072/14741689_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/36825184/15602542_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/37198879/15758319_720_1280_60fps.mp4',
  'https://videos.pexels.com/video-files/5377697/5377697-hd_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/6755168/6755168-hd_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/6799745/6799745-hd_1080_1920_30fps.mp4',
  'https://videos.pexels.com/video-files/7579943/7579943-uhd_2160_4096_25fps.mp4',
  'https://videos.pexels.com/video-files/7646402/7646402-hd_1080_1920_25fps.mp4',
  'https://videos.pexels.com/video-files/7646445/7646445-hd_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/7817207/7817207-hd_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/7989667/7989667-hd_720_1280_25fps.mp4',
  'https://videos.pexels.com/video-files/8125752/8125752-hd_720_1280_25fps.mp4'
];

// 从 Pexels 视频 URL 提取视频 ID 并生成预览封面
function getPexelsCover(videoUrl) {
  const match = videoUrl.match(/video-files\/(\d+)/);
  if (match) {
    return `https://images.pexels.com/videos/${match[1]}/pexels-photo-${match[1]}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=630`;
  }
  return `https://picsum.photos/seed/${Date.now()}/400/700`;
}

const categories = [
  { id: 'cat_001', name: '产品思维', icon: 'Brain', color: '#2563EB' },
  { id: 'cat_002', name: '需求分析', icon: 'Search', color: '#7C3AED' },
  { id: 'cat_003', name: '产品设计', icon: 'Palette', color: '#DB2777' },
  { id: 'cat_004', name: '数据分析', icon: 'BarChart3', color: '#059669' },
  { id: 'cat_005', name: '用户增长', icon: 'TrendingUp', color: '#EA580C' },
  { id: 'cat_006', name: '项目管理', icon: 'ListTodo', color: '#0891B2' },
  { id: 'cat_007', name: '商业化', icon: 'DollarSign', color: '#CA8A04' },
  { id: 'cat_008', name: '职业成长', icon: 'Rocket', color: '#DC2626' }
];

const creators = [
  { username: '老王聊产品', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', bio: '10年大厂产品总监' },
  { username: 'PM小鹿', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=deer', bio: '专注B端产品' },
  { username: '产品思维课', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=think', bio: '系统化产品方法论' },
  { username: '数据驱动派', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=data', bio: '用数据做产品决策' },
  { username: '增长黑客阿明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ming', bio: '用户增长实战专家' }
];

const videoData = [
  { title: '3招识别伪需求', category: 'cat_002', tag: '需求分析', author: 0, duration: 28 },
  { title: '用户画像到底怎么做？', category: 'cat_001', tag: '用户思维', author: 1, duration: 35 },
  { title: 'PRD撰写的黄金结构', category: 'cat_002', tag: 'PRD', author: 2, duration: 42 },
  { title: '什么是MVP？90%的人都理解错了', category: 'cat_001', tag: '产品思维', author: 0, duration: 38 },
  { title: '漏斗分析：从曝光到转化', category: 'cat_004', tag: '数据分析', author: 3, duration: 45 },
  { title: 'A/B测试的3个坑', category: 'cat_004', tag: 'A/B测试', author: 3, duration: 33 },
  { title: '留存率的秘密', category: 'cat_005', tag: '用户增长', author: 4, duration: 40 },
  { title: '敏捷开发的正确姿势', category: 'cat_006', tag: '项目管理', author: 2, duration: 36 },
  { title: '商业模式画布怎么用', category: 'cat_007', tag: '商业化', author: 0, duration: 50 },
  { title: '产品经理面试必问题', category: 'cat_008', tag: '职业成长', author: 1, duration: 55 },
  { title: '需求优先级：Kano模型', category: 'cat_002', tag: '需求分析', author: 2, duration: 44 },
  { title: '交互设计的10个原则', category: 'cat_003', tag: '交互设计', author: 1, duration: 48 },
  { title: '数据指标体系搭建', category: 'cat_004', tag: '数据分析', author: 3, duration: 52 },
  { title: '裂变增长的核心逻辑', category: 'cat_005', tag: '用户增长', author: 4, duration: 39 },
  { title: '如何做竞品分析', category: 'cat_001', tag: '产品思维', author: 0, duration: 46 },
  { title: '定价策略的5种模型', category: 'cat_007', tag: '商业化', author: 0, duration: 41 },
  { title: '跨部门协作的沟通技巧', category: 'cat_006', tag: '项目管理', author: 1, duration: 37 },
  { title: '转行产品经理的3个建议', category: 'cat_008', tag: '职业成长', author: 1, duration: 43 },
  { title: '信息架构设计实战', category: 'cat_003', tag: '信息架构', author: 2, duration: 49 },
  { title: '用户访谈的5个技巧', category: 'cat_002', tag: '需求分析', author: 1, duration: 34 }
];

async function seed() {
  await initDatabase();
  const db = await getDb();

  // 清空旧数据
  await db.exec('DELETE FROM watch_history');
  await db.exec('DELETE FROM comments');
  await db.exec('DELETE FROM notes');
  await db.exec('DELETE FROM bookmarks');
  await db.exec('DELETE FROM likes');
  await db.exec('DELETE FROM videos');
  await db.exec('DELETE FROM categories');
  await db.exec('DELETE FROM users');

  // 插入分类
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    await db.run('INSERT INTO categories (id, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)', 
      cat.id, cat.name, cat.icon, cat.color, i);
  }

  // 插入创作者用户
  const creatorIds = [];
  for (let i = 0; i < creators.length; i++) {
    const creator = creators[i];
    const id = uuidv4();
    await db.run('INSERT INTO users (id, username, email, password, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
      id, creator.username, `creator${i}@pmcharge.com`, 'password123', creator.avatar, creator.bio);
    creatorIds.push(id);
  }

  // 插入演示用户
  const demoUserId = uuidv4();
  await db.run('INSERT INTO users (id, username, email, password, avatar, bio) VALUES (?, ?, ?, ?, ?, ?)',
    demoUserId, '产品经理小白', 'demo@pmcharge.com', 'demo123', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', '正在学习产品知识');

  // 插入视频
  for (let i = 0; i < videoData.length; i++) {
    const video = videoData[i];
    const id = uuidv4();
    const creator = creators[video.author];
    const creatorId = creatorIds[video.author];
    const videoUrl = sampleVideos[i % sampleVideos.length];
    const coverUrl = getPexelsCover(videoUrl);
    const description = `关于${video.tag}的实战讲解，结合真实工作场景帮助产品经理掌握核心方法论。`;
    
    await db.run(`
      INSERT INTO videos (id, title, description, video_url, cover_url, category_id, author_id, author_name, author_avatar, duration, knowledge_tag, likes, comments, bookmarks, views)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, id, video.title, description, videoUrl, coverUrl, video.category, creatorId, creator.username, creator.avatar,
      video.duration, video.tag, Math.floor(Math.random() * 5000) + 100, Math.floor(Math.random() * 300) + 10,
      Math.floor(Math.random() * 800) + 50, Math.floor(Math.random() * 20000) + 1000);
  }

  console.log('✅ 种子数据插入成功');
  console.log(`- ${categories.length} 个分类`);
  console.log(`- ${creators.length} 个创作者 + 1 个演示用户`);
  console.log(`- ${videoData.length} 条视频`);
}

seed().catch(err => {
  console.error('❌ 种子数据失败:', err);
  process.exit(1);
});
