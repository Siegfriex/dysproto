
import React, { useState, useEffect } from 'react';
import DNAChart from './RadarChart';
import { Settings, Share2, FolderOpen, Plus } from 'lucide-react';
import { callGetUserProfile, callGetAnalyses, callGetCollections } from '../services/dataService';
import type { AnalysisResult } from '../types';

const MyPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResult, analysesResult, collectionsResult] = await Promise.all([
          callGetUserProfile(),
          callGetAnalyses(10),
          callGetCollections(),
        ]);

        setProfile(profileResult.profile);
        setAnalyses(analysesResult.analyses);
        setCollections(collectionsResult.collections);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate DNA data from analyses
  const calculateDNAData = () => {
    if (analyses.length === 0) {
      return [
        { subject: 'Layout', A: 0, fullMark: 100 },
        { subject: 'Typography', A: 0, fullMark: 100 },
        { subject: 'Color', A: 0, fullMark: 100 },
        { subject: 'Components', A: 0, fullMark: 100 },
        { subject: 'Form', A: 0, fullMark: 100 },
      ];
    }

    const totals = analyses.reduce(
      (acc, analysis) => ({
        layout: acc.layout + analysis.metrics.layout.score,
        typography: acc.typography + analysis.metrics.typography.score,
        color: acc.color + analysis.metrics.color.score,
        components: acc.components + analysis.metrics.components.score,
        formLanguage: acc.formLanguage + analysis.metrics.formLanguage.score,
      }),
      { layout: 0, typography: 0, color: 0, components: 0, formLanguage: 0 }
    );

    const count = analyses.length;
    return [
      { subject: 'Layout', A: Math.round(totals.layout / count), fullMark: 100 },
      { subject: 'Typography', A: Math.round(totals.typography / count), fullMark: 100 },
      { subject: 'Color', A: Math.round(totals.color / count), fullMark: 100 },
      { subject: 'Components', A: Math.round(totals.components / count), fullMark: 100 },
      { subject: 'Form', A: Math.round(totals.formLanguage / count), fullMark: 100 },
    ];
  };

  const dnaData = calculateDNAData();
  const strongestMetric = dnaData.reduce((max, item) => (item.A > max.A ? item : max), dnaData[0]);

  if (loading) {
    return (
      <div className="p-4 md:p-8 h-full overflow-y-auto bg-white ml-16 md:ml-0 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-white ml-16 md:ml-0">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 p-1 shadow-xl shadow-primary-200">
                <div className="w-full h-full rounded-[1.3rem] bg-white overflow-hidden">
                    <img 
                      src={profile?.photoURL || "https://picsum.photos/200"} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                </div>
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {profile?.displayName || 'User'}
                    </h1>
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] md:text-xs rounded-lg font-bold border border-primary-100">
                      {profile?.subscription === 'pro' ? 'Pro' : profile?.subscription === 'premium' ? 'Premium' : 'Free'}
                    </span>
                </div>
                <p className="text-slate-500 mb-4 md:mb-6 max-w-md leading-relaxed text-sm md:text-base">
                  {profile?.bio || '디자인 포트폴리오를 관리하고 분석하세요.'}
                </p>
                <div className="flex gap-2 md:gap-3 justify-center md:justify-start">
                    <button className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-medium rounded-xl transition shadow-md hover:shadow-lg">Edit Profile</button>
                    <button className="p-2 md:p-2.5 bg-white border border-slate-200 hover:border-primary-300 text-slate-400 hover:text-primary-600 rounded-xl transition shadow-sm"><Share2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6 md:gap-10 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10 w-full md:w-auto justify-center md:justify-start">
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-slate-900">{analyses.length}</div>
                    <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Projects</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-slate-900">{collections.length}</div>
                    <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Boards</div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Style DNA */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6">Design DNA</h2>
                <DNAChart data={dnaData} />
                <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-slate-500 bg-slate-50 py-3 rounded-xl">
                    {analyses.length > 0 ? (
                      <>Your strength is <span className="text-primary-600 font-bold">{strongestMetric.subject}</span></>
                    ) : (
                      '분석 데이터가 없습니다. 첫 번째 디자인을 업로드해보세요!'
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">Style Timeline</h2>
                    <button className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline">View All</button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                    {analyses.length > 0 ? (
                      analyses.slice(0, 3).map((analysis) => (
                        <div key={analysis.id} className="flex gap-4 md:gap-5 items-center group cursor-pointer p-2 md:p-3 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
                            <img 
                              src={analysis.imageUrl || "https://picsum.photos/100/100"} 
                              className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-sm" 
                              alt={analysis.fileName} 
                            />
                            <div className="flex-1">
                                <h4 className="text-slate-900 font-bold mb-0.5 text-sm md:text-base truncate">{analysis.fileName}</h4>
                                <p className="text-[10px] md:text-xs text-slate-400 font-medium">{analysis.timestamp}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg md:text-xl font-bold text-primary-500">{analysis.metrics.overall}</div>
                                <div className="text-[8px] md:text-[10px] text-slate-400 font-semibold uppercase">Score</div>
                            </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm text-center py-8">아직 분석된 디자인이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>

        {/* Gallery Folders */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-bold text-slate-900">Collections</h2>
                <button className="p-2 md:p-2.5 bg-slate-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 transition border border-slate-100"><Plus className="w-4 h-4 md:w-5 md:h-5" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {collections.length > 0 ? (
                  collections.map((collection) => (
                    <div key={collection.id} className="aspect-square bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center group">
                        <FolderOpen className="w-8 h-8 md:w-10 md:h-10 text-slate-400 group-hover:text-primary-500 mb-2 md:mb-3 transition-colors" strokeWidth={1.5} />
                        <span className="text-xs md:text-sm text-slate-700 font-bold group-hover:text-primary-700 transition-colors text-center px-2">{collection.name}</span>
                        <span className="text-[10px] md:text-xs text-slate-400 mt-1 font-medium">{collection.analysisIds?.length || 0} items</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                    컬렉션이 없습니다. 새 컬렉션을 만들어보세요!
                  </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default MyPage;
