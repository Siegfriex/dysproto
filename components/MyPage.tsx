import React from 'react';
import DNAChart from './RadarChart';
import { Settings, Share2, FolderOpen, Plus } from 'lucide-react';

const MyPage: React.FC = () => {
  const dnaData = [
    { subject: 'Layout', A: 85, fullMark: 100 },
    { subject: 'Typography', A: 65, fullMark: 100 },
    { subject: 'Color', A: 90, fullMark: 100 },
    { subject: 'Components', A: 75, fullMark: 100 },
    { subject: 'Form', A: 80, fullMark: 100 },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto bg-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 p-1 shadow-xl shadow-primary-200">
                <div className="w-full h-full rounded-[1.3rem] bg-white overflow-hidden">
                    <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900">Kim Design</h1>
                    <span className="px-2.5 py-1 bg-primary-50 text-primary-600 text-xs rounded-lg font-bold border border-primary-100">Pro</span>
                </div>
                <p className="text-slate-500 mb-6 max-w-md leading-relaxed">Junior UI/UX Designer focused on minimalist interfaces and accessible color systems.</p>
                <div className="flex gap-3 justify-center md:justify-start">
                    <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition shadow-md hover:shadow-lg">Edit Profile</button>
                    <button className="p-2.5 bg-white border border-slate-200 hover:border-primary-300 text-slate-400 hover:text-primary-600 rounded-xl transition shadow-sm"><Share2 className="w-5 h-5" /></button>
                </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-10 border-l border-slate-100 pl-10 py-2">
                <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">24</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Projects</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">12</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Boards</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Style DNA */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Design DNA</h2>
                <DNAChart data={dnaData} />
                <div className="mt-6 text-center text-sm text-slate-500 bg-slate-50 py-3 rounded-xl">
                    Your strength is <span className="text-primary-600 font-bold">Color Harmony</span>
                </div>
            </div>

            {/* Recent Activity / Timeline */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Style Timeline</h2>
                    <button className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline">View All</button>
                </div>
                
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-5 items-center group cursor-pointer p-3 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
                            <img src={`https://picsum.photos/100/100?random=${i+10}`} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Work" />
                            <div className="flex-1">
                                <h4 className="text-slate-900 font-bold mb-0.5">Portfolio Update v{i}</h4>
                                <p className="text-xs text-slate-400 font-medium">Analyzed 2 days ago</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-primary-500">8{i}</div>
                                <div className="text-[10px] text-slate-400 font-semibold uppercase">Score</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Gallery Folders */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-900">Collections</h2>
                <button className="p-2.5 bg-slate-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition border border-slate-100"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Modern Web', 'App Inspirations', 'Typography Ideas', 'Archive'].map((folder, i) => (
                    <div key={i} className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center group">
                        <FolderOpen className="w-10 h-10 text-slate-400 group-hover:text-primary-500 mb-3 transition-colors" strokeWidth={1.5} />
                        <span className="text-sm text-slate-700 font-bold group-hover:text-primary-700 transition-colors">{folder}</span>
                        <span className="text-xs text-slate-400 mt-1 font-medium">{3 + i} items</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default MyPage;