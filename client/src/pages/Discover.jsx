import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, BookOpen, Users } from 'lucide-react';

const API_URL = '/api';

export default function Discover() {
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchVideos();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories/with-counts`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/videos?category=${activeCategory}&limit=50`);
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`${API_URL}/videos?search=${encodeURIComponent(searchQuery)}&limit=50`);
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const hotTopics = [
    '#需求分析', '#用户增长', '#PRD写作', '#数据分析', '#AI产品',
    '#B端产品', '#面试技巧', '#竞品分析', '#商业模式', '#项目管理'
  ];

  return (
    <div className="h-full overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 glass px-4 pt-12 pb-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索产品经理知识..."
            className="w-full bg-white/10 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-primary"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
        </form>
      </div>

      {/* Hot topics */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={20} className="text-secondary" />
          <h2 className="text-lg font-bold">热门话题</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {hotTopics.map(topic => (
            <button
              key={topic}
              onClick={() => {
                setSearchQuery(topic.replace('#', ''));
                handleSearch({ preventDefault: () => {} });
              }}
              className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-white/80 hover:bg-primary/20 transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge map */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={20} className="text-primary" />
          <h2 className="text-lg font-bold">知识地图</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-4 rounded-2xl text-left transition-all ${
                activeCategory === cat.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{ backgroundColor: `${cat.color}20`, borderLeft: `4px solid ${cat.color}` }}
            >
              <h3 className="font-bold text-white mb-1">{cat.name}</h3>
              <p className="text-xs text-white/60">{cat.video_count || 0} 个视频</p>
            </button>
          ))}
        </div>
      </div>

      {/* Video grid */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">
            {activeCategory === 'all' ? '最新内容' : categories.find(c => c.id === activeCategory)?.name}
          </h2>
          <button 
            onClick={() => setActiveCategory('all')}
            className="text-sm text-primary"
          >
            全部
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {videos.map(video => (
            <div 
              key={video.id}
              onClick={() => navigate(`/video/${video.id}`)}
              className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group"
            >
              <img 
                src={video.cover_url} 
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span 
                  className="text-xs px-2 py-0.5 rounded mb-1 inline-block"
                  style={{ backgroundColor: video.category_color || '#2563EB' }}
                >
                  {video.knowledge_tag}
                </span>
                <h3 className="text-sm font-bold line-clamp-2">{video.title}</h3>
                <p className="text-xs text-white/70 mt-1">{video.author_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
