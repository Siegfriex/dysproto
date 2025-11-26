
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, Search, User, Settings } from 'lucide-react';
import { callGetUserProfile } from '../services/dataService';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await callGetUserProfile();
        if (result.success && result.profile) {
          setProfile(result.profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const navItems = [
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/mypage', icon: User, label: 'My Page' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-16 md:w-64 h-screen bg-white border-r border-slate-100 flex flex-col flex-shrink-0 transition-all duration-300 z-50 fixed md:relative">
      <div className="h-16 md:h-20 flex items-center justify-center md:justify-start md:px-8">
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-3">
           <img
             src="/logo.svg"
             alt="dysproto logo"
             className="w-10 h-10 md:w-12 md:h-12 shrink-0 transition-transform duration-200 hover:scale-105"
           />
           <span className="text-2xl font-bold text-primary-500 hidden md:block tracking-tight">dysproto</span>
        </Link>
      </div>

      <nav className="flex-1 py-4 md:py-8 flex flex-col gap-2 md:gap-3 px-2 md:px-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-center md:justify-start p-3 md:p-3.5 rounded-2xl transition-all duration-200 group
              ${isActive(item.path) 
                ? 'bg-primary-50 text-primary-600 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
          >
            <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={2} />
            <span className="ml-4 font-medium hidden md:block">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-2 md:p-6">
        <Link to="/mypage" className="flex items-center justify-center md:justify-start p-2 md:p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors cursor-pointer group">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex-shrink-0 shadow-md ring-2 ring-white overflow-hidden">
              {profile?.photoURL && (
                <img 
                  src={profile.photoURL} 
                  alt={profile.displayName || 'User'} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="ml-3 hidden md:block overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-primary-600 transition-colors">
                  {profile?.displayName || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {profile?.subscription || 'Free'} Member
                </p>
            </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
