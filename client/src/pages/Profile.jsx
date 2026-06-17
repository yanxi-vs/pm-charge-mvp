import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Edit3, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = '/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/learning/stats/${user.id}`);
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0分钟';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}分钟`;
    const hours = Math.floor(mins / 60);
    return `${hours}小时${mins % 60}分钟`;
  };

  return (
    <div className="h-full overflow-y-auto pb-20">
      {/* Header background */}
      <div className="h-32 bg-gradient-to-r from-primary to-secondary relative">
        <div className="absolute -bottom-12 left-4">
          <img 
            src={user?.avatar} 
            alt={user?.username}
            className="w-24 h-24 rounded-full border-4 border-dark bg-dark"
          />
        </div>
      </div>

      {/* User info */}
      <div className="pt-14 px-4 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-white/60 text-sm mt-1">{user?.email}</p>
            <p className="text-white/50 text-sm mt-1">{user?.bio || '正在产品经理成长之路上...'}</p>
          </div>
          <button className="p-2 bg-white/10 rounded-full">
            <Edit3 size={18} />
          </button>
        </div>

        {/* Follow stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="font-bold">128</p>
            <p className="text-xs text-white/50">关注</p>
          </div>
          <div className="text-center">
            <p className="font-bold">3.2k</p>
            <p className="text-xs text-white/50">粉丝</p>
          </div>
          <div className="text-center">
            <p className="font-bold">45.6k</p>
            <p className="text-xs text-white/50">获赞</p>
          </div>
        </div>
      </div>

      {/* Learning achievements */}
      {stats && (
        <div className="px-4 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Award size={20} className="text-secondary" />
            学习成就
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 p-4 rounded-2xl text-center">
              <p className="text-xl font-bold text-primary">{formatDuration(stats.total_watch_seconds)}</p>
              <p className="text-xs text-white/50">学习时长</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-center">
              <p className="text-xl font-bold text-secondary">{stats.watched_count}</p>
              <p className="text-xs text-white/50">已看视频</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-center">
              <p className="text-xl font-bold text-green-400">{stats.notes_count}</p>
              <p className="text-xs text-white/50">笔记数</p>
            </div>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold mb-3">我的徽章</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {['初级PM', '学习达人', '笔记高手', '收藏专家'].map((badge, idx) => (
            <div key={badge} className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-white/10">
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 space-y-2">
        <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-white/60" />
            <span>设置</span>
          </div>
          <span className="text-white/40">›</span>
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-red-400"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} />
            <span>退出登录</span>
          </div>
          <span>›</span>
        </button>
      </div>
    </div>
  );
}
