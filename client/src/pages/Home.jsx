import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = '/api';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [muted, setMuted] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    fetchCategories();
    fetchVideos();
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/videos/feed/recommended?category=${activeCategory}&limit=20`);
      const data = await res.json();
      if (data.success) setVideos(data.data);
    } catch (err) {
      console.error('获取视频失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (videoId, type) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/interactions/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, video_id: videoId })
      });
      const data = await res.json();
      if (data.success) {
        setVideos(prev => prev.map((v, idx) => {
          if (idx !== currentIndex) return v;
          if (type === 'like') {
            return { ...v, liked: data.data.liked, likes: data.data.liked ? v.likes + 1 : v.likes - 1 };
          }
          return { ...v, bookmarked: data.data.bookmarked, bookmarks: data.data.bookmarked ? v.bookmarks + 1 : v.bookmarks - 1 };
        }));
      }
    } catch (err) {
      console.error('交互失败:', err);
    }
  };

  const handleScroll = useCallback((direction) => {
    if (direction === 'next' && currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, videos.length]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      handleScroll(diff > 0 ? 'next' : 'prev');
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) > 30) {
      handleScroll(e.deltaY > 0 ? 'next' : 'prev');
    }
  };

  useEffect(() => {
    const recordHistory = async () => {
      const video = videos[currentIndex];
      if (video && user) {
        try {
          await fetch(`${API_URL}/learning/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, video_id: video.id, progress: 0 })
          });
        } catch (err) {
          console.error('记录历史失败:', err);
        }
      }
    };
    recordHistory();
  }, [currentIndex, videos, user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full w-full relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Category tabs */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-12 pb-4 px-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeCategory === 'all' ? 'bg-primary text-white' : 'bg-white/10 text-white/80'
            }`}
          >
            推荐
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat.id ? 'bg-primary text-white' : 'bg-white/10 text-white/80'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Video slides */}
      <div 
        className="h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateY(-${currentIndex * 100}%)` }}
      >
        {videos.map((video, index) => (
          <div key={video.id} className="h-full w-full relative flex-shrink-0">
            <VideoSlide 
              video={video} 
              isActive={index === currentIndex}
              muted={muted}
              onToggleMute={() => setMuted(!muted)}
            />
          </div>
        ))}
      </div>

      {/* Right interaction bar */}
      {videos[currentIndex] && (
        <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <img 
              src={videos[currentIndex].author_avatar} 
              alt={videos[currentIndex].author_name}
              className="w-12 h-12 rounded-full border-2 border-white/30"
            />
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center -mt-2">
              <span className="text-xs">+</span>
            </div>
          </div>
          
          <button 
            onClick={() => handleInteraction(videos[currentIndex].id, 'like')}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              videos[currentIndex].liked ? 'bg-red-500 text-white' : 'bg-white/10 text-white'
            }`}>
              <Heart size={24} fill={videos[currentIndex].liked ? 'currentColor' : 'none'} />
            </div>
            <span className="text-xs text-white/90">{formatNumber(videos[currentIndex].likes)}</span>
          </button>
          
          <button 
            onClick={() => navigate(`/video/${videos[currentIndex].id}`)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <span className="text-xs text-white/90">{formatNumber(videos[currentIndex].comments)}</span>
          </button>
          
          <button 
            onClick={() => handleInteraction(videos[currentIndex].id, 'bookmark')}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              videos[currentIndex].bookmarked ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white'
            }`}>
              <Bookmark size={24} fill={videos[currentIndex].bookmarked ? 'currentColor' : 'none'} />
            </div>
            <span className="text-xs text-white/90">{formatNumber(videos[currentIndex].bookmarks)}</span>
          </button>
          
          <button className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Share2 size={24} />
            </div>
            <span className="text-xs text-white/90">分享</span>
          </button>
        </div>
      )}

      {/* Bottom info */}
      {videos[currentIndex] && (
        <div className="absolute left-4 right-20 bottom-24 z-30 text-white">
          <div 
            className="inline-block px-2 py-1 rounded text-xs mb-2 font-medium"
            style={{ backgroundColor: videos[currentIndex].category_color || '#2563EB' }}
          >
            {videos[currentIndex].knowledge_tag}
          </div>
          <h3 className="text-lg font-bold mb-2 drop-shadow-lg">{videos[currentIndex].title}</h3>
          <p className="text-sm text-white/80 mb-2 drop-shadow">{videos[currentIndex].author_name} · {formatNumber(videos[currentIndex].views)}次观看</p>
          <p className="text-sm text-white/70 line-clamp-2 drop-shadow">{videos[currentIndex].description}</p>
        </div>
      )}

      {/* Scroll indicators */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1">
        {videos.map((_, idx) => (
          <div 
            key={idx}
            className={`w-1 rounded-full transition-all ${
              idx === currentIndex ? 'h-6 bg-white' : 'h-2 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function VideoSlide({ video, isActive, muted, onToggleMute }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  return (
    <div className="h-full w-full relative bg-black">
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.cover_url}
        loop
        muted={muted}
        playsInline
        className="h-full w-full object-cover"
      />
      
      {/* Mute toggle */}
      <button 
        onClick={onToggleMute}
        className="absolute top-20 right-4 z-30 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}

function formatNumber(num) {
  if (!num) return '0';
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}
