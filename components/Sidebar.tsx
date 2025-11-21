
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Upload, Search, User, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-200 shrink-0">
             d
           </div>
           <span className="text-2xl font-bold text-primary-500 hidden md:block tracking-tight">dys</span>
        </div>
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
        <div className="flex items-center justify-center md:justify-start p-2 md:p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors cursor-pointer group">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex-shrink-0 shadow-md ring-2 ring-white" />
            <div className="ml-3 hidden md:block overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate group-hover:text-primary-600 transition-colors">Kim Design</p>
                <p className="text-xs text-slate-400 truncate">Pro Member</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
