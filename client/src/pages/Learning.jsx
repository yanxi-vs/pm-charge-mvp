import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookMarked, StickyNote, Play, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = '/api';

export default function Learning() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchHistory();
      fetchBookmarks();
      fetchNotes();
    }
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

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/learning/history/${user.id}`);
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`${API_URL}/learning/bookmarks/${user.id}`);
      const data = await res.json();
      if (data.success) setBookmarks(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/learning/notes/${user.id}`);
      const data = await res.json();
      if (data.success) setNotes(data.data);
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

  const tabs = [
    { id: 'overview', label: '总览', icon: TrendingUp },
    { id: 'history', label: '历史', icon: Clock },
    { id: 'bookmarks', label: '收藏', icon: BookMarked },
    { id: 'notes', label: '笔记', icon: StickyNote },
  ];

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold mb-1">学习中心</h1>
        <p className="text-white/60 text-sm">记录你的产品经理成长之路</p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 px-4 mb-6">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-2xl border border-primary/20">
            <Clock className="text-primary mb-2" size={24} />
            <p className="text-2xl font-bold">{formatDuration(stats.total_watch_seconds)}</p>
            <p className="text-xs text-white/60">累计学习时长</p>
          </div>
          <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 p-4 rounded-2xl border border-secondary/20">
            <Play className="text-secondary mb-2" size={24} />
            <p className="text-2xl font-bold">{stats.watched_count}</p>
            <p className="text-xs text-white/60">已看视频</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-4 rounded-2xl border border-purple-500/20">
            <BookMarked className="text-purple-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{stats.bookmarks_count}</p>
            <p className="text-xs text-white/60">收藏内容</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 p-4 rounded-2xl border border-green-500/20">
            <StickyNote className="text-green-400 mb-2" size={24} />
            <p className="text-2xl font-bold">{stats.notes_count}</p>
            <p className="text-xs text-white/60">学习笔记</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex px-4 gap-2 mb-4 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === id ? 'bg-primary text-white' : 'bg-white/10 text-white/70'
            }`}
          >
            <Icon size={16} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 pb-4">
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <h3 className="font-bold mb-3">最近学习</h3>
            {history.slice(0, 5).map(item => (
              <div 
                key={item.id}
                onClick={() => navigate(`/video/${item.video_id}`)}
                className="flex gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              >
                <img src={item.cover_url} alt={item.title} className="w-24 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-white/60 mt-1">{item.author_name}</p>
                  <p className="text-xs text-white/40 mt-1">{item.knowledge_tag}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.map(item => (
              <div 
                key={item.id}
                onClick={() => navigate(`/video/${item.video_id}`)}
                className="flex gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              >
                <img src={item.cover_url} alt={item.title} className="w-24 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-white/60 mt-1">{item.author_name}</p>
                  <p className="text-xs text-white/40 mt-1">{item.duration}秒 · {item.knowledge_tag}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="grid grid-cols-2 gap-3">
            {bookmarks.map(video => (
              <div 
                key={video.id}
                onClick={() => navigate(`/video/${video.id}`)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
              >
                <img src={video.cover_url} alt={video.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-sm font-bold line-clamp-2">{video.title}</h4>
                  <p className="text-xs text-white/70 mt-1">{video.author_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            {notes.map(note => (
              <div 
                key={note.id}
                onClick={() => navigate(`/video/${note.video_id}`)}
                className="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={note.cover_url} alt="" className="w-8 h-8 rounded object-cover" />
                  <div>
                    <h4 className="text-sm font-bold line-clamp-1">{note.video_title}</h4>
                    <p className="text-xs text-white/50">{note.author_name}</p>
                  </div>
                </div>
                <p className="text-sm text-white/80 line-clamp-3">{note.content}</p>
                <p className="text-xs text-white/40 mt-2">{new Date(note.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
