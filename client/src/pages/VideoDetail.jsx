import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, Send, ChevronLeft, StickyNote, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = '/api';

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchVideo();
    fetchComments();
    if (user) {
      checkInteractions();
      recordHistory();
    }
  }, [id, user]);

  const fetchVideo = async () => {
    try {
      const res = await fetch(`${API_URL}/videos/${id}`);
      const data = await res.json();
      if (data.success) {
        setVideo(data.data);
        setLiked(data.data.liked);
        setBookmarked(data.data.bookmarked);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/interactions/comments/${id}`);
      const data = await res.json();
      if (data.success) setComments(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const checkInteractions = async () => {
    try {
      const [likeRes, bookmarkRes] = await Promise.all([
        fetch(`${API_URL}/interactions/like-status?user_id=${user.id}&video_id=${id}`),
        fetch(`${API_URL}/interactions/bookmark-status?user_id=${user.id}&video_id=${id}`)
      ]);
      const likeData = await likeRes.json();
      const bookmarkData = await bookmarkRes.json();
      setLiked(likeData.data.liked);
      setBookmarked(bookmarkData.data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const recordHistory = async () => {
    try {
      await fetch(`${API_URL}/learning/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, video_id: id, progress: 0 })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await fetch(`${API_URL}/interactions/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, video_id: id })
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.data.liked);
        setVideo(prev => ({ ...prev, likes: data.data.liked ? prev.likes + 1 : prev.likes - 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await fetch(`${API_URL}/interactions/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, video_id: id })
      });
      const data = await res.json();
      if (data.success) {
        setBookmarked(data.data.bookmarked);
        setVideo(prev => ({ ...prev, bookmarks: data.data.bookmarked ? prev.bookmarks + 1 : prev.bookmarks - 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${API_URL}/interactions/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, video_id: id, content: newComment, username: user.username })
      });
      const data = await res.json();
      if (data.success) {
        setComments([data.data, ...comments]);
        setNewComment('');
        setVideo(prev => ({ ...prev, comments: prev.comments + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNote = async () => {
    if (!user) { navigate('/login'); return; }
    if (!noteContent.trim()) return;

    try {
      const res = await fetch(`${API_URL}/learning/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, video_id: id, content: noteContent, timestamp: 0 })
      });
      const data = await res.json();
      if (data.success) {
        setNoteContent('');
        setShowNoteInput(false);
        alert('笔记已保存');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="h-full overflow-y-auto bg-dark pb-20">
      {/* Video player */}
      <div className="relative aspect-[9/16] max-h-[60vh] bg-black">
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.cover_url}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 z-20 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Video info */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <span 
              className="inline-block px-2 py-1 rounded text-xs text-white mb-2"
              style={{ backgroundColor: video.category_color || '#2563EB' }}
            >
              {video.knowledge_tag}
            </span>
            <h1 className="text-xl font-bold mb-2">{video.title}</h1>
            <p className="text-sm text-white/60">{video.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
          <span className="flex items-center gap-1"><Clock size={14} /> {video.duration}秒</span>
          <span>{video.views}次观看</span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mt-4 p-3 bg-white/5 rounded-xl">
          <img src={video.author_avatar} alt={video.author_name} className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <h3 className="font-bold">{video.author_name}</h3>
            <p className="text-xs text-white/50">产品经理创作者</p>
          </div>
          <button className="px-4 py-1.5 bg-primary rounded-full text-sm font-medium">
            关注
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
              liked ? 'bg-red-500 text-white' : 'bg-white/10 text-white'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{video.likes}</span>
          </button>
          <button 
            onClick={handleBookmark}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors ${
              bookmarked ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white'
            }`}
          >
            <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
            <span>{video.bookmarks}</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 text-white">
            <Share2 size={18} />
            <span>分享</span>
          </button>
        </div>

        {/* Note section */}
        <div className="mt-4">
          {!showNoteInput ? (
            <button 
              onClick={() => user ? setShowNoteInput(true) : navigate('/login')}
              className="w-full flex items-center gap-2 p-3 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
            >
              <StickyNote size={18} className="text-primary" />
              <span className="text-sm">记笔记...</span>
            </button>
          ) : (
            <div className="p-3 bg-white/5 rounded-xl">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="记录这个视频的关键知识点..."
                rows={3}
                className="w-full bg-transparent text-white text-sm resize-none focus:outline-none"
              />
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setShowNoteInput(false)}
                  className="flex-1 py-2 text-sm text-white/60 hover:text-white"
                >
                  取消
                </button>
                <button 
                  onClick={handleNote}
                  className="flex-1 py-2 bg-primary rounded-lg text-sm font-medium"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageCircle size={20} />
            评论 ({comments.length})
          </h3>

          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "写下你的看法..." : "登录后评论"}
              disabled={!user}
              className="flex-1 bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!user}
              className="px-4 bg-primary rounded-xl disabled:bg-primary/50"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3 p-3 bg-white/5 rounded-xl">
                <img 
                  src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`} 
                  alt={comment.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white/80">{comment.username}</h4>
                  <p className="text-sm text-white/70 mt-1">{comment.content}</p>
                  <p className="text-xs text-white/40 mt-2">{new Date(comment.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
