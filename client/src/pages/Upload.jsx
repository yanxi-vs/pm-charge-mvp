import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileVideo, Tag, AlignLeft, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = '/api';

export default function UploadPage() {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    knowledge_tag: '',
    category_id: '',
    video_url: '',
    duration: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: data.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.video_url || !formData.category_id) {
      alert('请填写必填项');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          author_id: user.id,
          cover_url: `https://picsum.photos/seed/${Date.now()}/400/700`,
          duration: parseInt(formData.duration) || 30
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert('上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold mb-1">创作中心</h1>
        <p className="text-white/60 text-sm">分享你的产品经验</p>
      </div>

      {success ? (
        <div className="mx-4 p-6 bg-green-500/20 border border-green-500/30 rounded-2xl text-center">
          <Upload className="mx-auto text-green-400 mb-3" size={48} />
          <h3 className="text-xl font-bold mb-2">发布成功！</h3>
          <p className="text-white/70">正在返回首页...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4 space-y-4">
          <div className="p-6 border-2 border-dashed border-white/20 rounded-2xl text-center">
            <FileVideo className="mx-auto text-white/40 mb-3" size={48} />
            <p className="text-white/60 text-sm mb-2">MVP 版本支持视频链接上传</p>
            <p className="text-white/40 text-xs">正式版将支持本地上传和在线剪辑</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <AlignLeft size={16} /> 视频标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例如：3招识别伪需求"
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FileVideo size={16} /> 视频链接
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Tag size={16} /> 知识点标签
            </label>
            <input
              type="text"
              value={formData.knowledge_tag}
              onChange={(e) => setFormData({ ...formData, knowledge_tag: e.target.value })}
              placeholder="例如：需求分析"
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">知识分类</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-dark">{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Clock size={16} /> 视频时长（秒）
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="30"
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">视频描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="补充视频内容简介..."
              rows={4}
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Upload size={20} />
                发布视频
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
