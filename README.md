# 产品经理充电站 MVP

基于 PRD 文档构建的短视频产品经理知识学习平台 MVP，融合抖音沉浸式短视频体验与快手社区化学习场景。

## 项目结构

```
pm-charge-mvp/
├── client/              # React 18 + Vite + Tailwind CSS 前端
│   ├── src/
│   │   ├── components/  # 公共组件
│   │   ├── contexts/    # 状态管理（AuthContext）
│   │   ├── pages/       # 页面组件
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── dist/            # 生产构建产物
├── server/              # Node.js + Express + SQLite 后端
│   ├── routes/          # API 路由
│   ├── database.js      # 数据库初始化
│   ├── seed.js          # 种子数据
│   └── index.js         # 服务入口
└── package.json         # 根目录脚本
```

## 技术栈

- **前端**：React 18、Vite、Tailwind CSS、React Router、Lucide Icons
- **后端**：Node.js、Express、SQLite（sqlite3 + sqlite）
- **数据**：SQLite 本地文件存储

## 功能特性

### V1.0 MVP 已实现
- ✅ 首页沉浸式短视频流（上下滑动、自动播放）
- ✅ 知识分类筛选（产品思维、需求分析、数据分析等 8 大类）
- ✅ 点赞、收藏、评论、分享
- ✅ 视频详情页与笔记功能
- ✅ 发现页（知识地图、热门话题、搜索）
- ✅ 学习中心（学习统计、观看历史、收藏、笔记）
- ✅ 创作者上传（视频链接 + 元数据）
- ✅ 用户注册/登录
- ✅ 20 条产品经理知识种子视频

## 快速启动

### 方式一：根目录一键启动（推荐）

```bash
cd /Users/zhuyan/pm-charge-mvp
npm run dev
```

然后访问 http://localhost:3001

### 方式二：分别启动前后端

**启动后端：**
```bash
cd server
npm run dev
```
后端运行在 http://localhost:3001

**启动前端（开发模式）：**
```bash
cd client
npm run dev
```
前端开发服务器运行在 http://localhost:3000

### 重新生成种子数据

```bash
cd server
node seed.js
```

## 演示账号

- 邮箱：`demo@pmcharge.com`
- 密码：`demo123`

## 客户端演示要点

1. **首页刷视频**：打开即进入竖屏短视频流，上下滑动切换，自动播放
2. **分类学习**：顶部标签切换不同 PM 知识领域
3. **发现页**：浏览知识地图、热门话题、搜索内容
4. **创作页**：上传自己的视频链接和知识点
5. **学习中心**：查看学习时长、历史记录、收藏和笔记
6. **视频详情**：播放完整视频、点赞收藏、记笔记、评论

## 已知限制（MVP 范围）

- 视频上传目前仅支持外部视频链接，暂不支持本地上传
- 推荐算法使用随机排序，正式版将基于用户行为推荐
- 未接入真实支付和会员体系
- 直播功能未实现

## 后续迭代方向

- 接入 Embedding 模型，实现 RAG 知识检索
- 完善推荐算法
- 增加付费专栏和会员体系
- 支持本地上传和视频剪辑
- 增加直播和社群功能
