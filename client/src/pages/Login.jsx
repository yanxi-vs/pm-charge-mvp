import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.username, formData.email, formData.password);
    }

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || '操作失败');
    }
    setLoading(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-dark">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
          <Zap size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">产品经理充电站</h1>
        <p className="text-white/60 text-center mb-8">
          每天刷一刷，产品能力蹭蹭涨
        </p>

        {error && (
          <div className="w-full max-w-sm p-3 mb-4 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="用户名"
                className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="邮箱"
              className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="密码"
              className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold py-4 rounded-xl transition-colors"
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/60 hover:text-white text-sm"
          >
            {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>

        {/* Demo account */}
        {isLogin && (
          <div className="mt-8 p-4 bg-white/5 rounded-xl max-w-sm">
            <p className="text-xs text-white/50 mb-2">演示账号</p>
            <p className="text-sm text-white/70">邮箱：demo@pmcharge.com</p>
            <p className="text-sm text-white/70">密码：demo123</p>
          </div>
        )}
      </div>
    </div>
  );
}
