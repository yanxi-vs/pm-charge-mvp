import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Learning from './pages/Learning';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Login from './pages/Login';
import VideoDetail from './pages/VideoDetail';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="h-full flex items-center justify-center">加载中...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="discover" element={<Discover />} />
        <Route path="learning" element={<RequireAuth><Learning /></RequireAuth>} />
        <Route path="upload" element={<RequireAuth><Upload /></RequireAuth>} />
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="video/:id" element={<VideoDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
