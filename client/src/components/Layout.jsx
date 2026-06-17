import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Compass, BookOpen, PlusSquare, User } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/discover', icon: Compass, label: '发现' },
  { path: '/upload', icon: PlusSquare, label: '创作' },
  { path: '/learning', icon: BookOpen, label: '学习' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function Layout() {
  return (
    <div className="h-full w-full flex flex-col bg-dark">
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
      
      <nav className="glass h-16 flex-shrink-0 border-t border-white/10 z-50">
        <div className="h-full flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Icon size={22} strokeWidth={2} />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
