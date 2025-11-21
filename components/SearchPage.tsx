
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Image as ImageIcon, Sparkles, Bookmark, Award, X, Zap, BarChart3, Check, MoreHorizontal, ArrowUpRight, Filter } from 'lucide-react';
import { AnalysisResult, SearchResult } from '../types';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const [activeCategories, setActiveCategories] = useState<string[]>(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [styleReflect, setStyleReflect] = useState(80);
  const [allResults, setAllResults] = useState<SearchResult[]>([]); // Store raw mock data
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // Store filtered data
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  
  // Context from Upload Page
  const analysisContext = location.state as { source?: string; analysis?: AnalysisResult; keywords?: string[] } | null;
  
  const baselineScores = {
      color: analysisContext?.analysis?.metrics?.color?.score ?? 85,
      layout: analysisContext?.analysis?.metrics?.layout?.score ?? 80,
      typography: analysisContext?.analysis?.metrics?.typography?.score ?? 70
  };

  const categories = ['All', 'Web Design', 'Mobile UI', 'Branding', 'Print', 'Typography', 'Art Direction', '3D'];

  // 1. Generate Mock Data
  useEffect(() => {
    const keywords = analysisContext?.keywords || ['Modern', 'Minimal', 'Clean'];
    
    const mockResults: SearchResult[] = Array.from({ length: 30 }).map((_, i) => {
        const isTrend = i < 4; 
        const awards = isTrend ? (i % 2 === 0 ? ['Red Dot Winner 2024'] : ['Legacy Media Pick']) : undefined;
        const similarity = Math.floor(Math.random() * 15) + 80; 

        return {
            id: i.toString(),
            imageUrl: `https://picsum.photos/400/${300 + (i % 4) * 50}?random=${i + 200}`,
            title: `Ref ${keywords[i % keywords.length]} ${i + 1}`,
            similarity: similarity,
            category: categories[(i % 5) + 1],
            reason: `스타일 톤(${keywords[i % keywords.length]}) 일치`,
            awards: awards,
            isSaved: false
        };
    });
    
    setAllResults(mockResults);

    if (analysisContext?.keywords && analysisContext.keywords.length > 0) {
        setSearchTerm(analysisContext.keywords.join(', '));
    }
  }, [analysisContext]);

  // 2. Filter Logic
  useEffect(() => {
    let results = allResults;

    // Filter by Category
    if (!activeCategories.includes('All')) {
        results = results.filter(item => activeCategories.includes(item.category));
    }

    // Filter by Search Term
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        results = results.filter(item => 
            item.title.toLowerCase().includes(lowerTerm) || 
            item.category.toLowerCase().includes(lowerTerm)
        );
    }

    // Filter by Style Reflection (Mock logic: filter out low similarity items based on slider)
    const threshold = Math.max(0, styleReflect - 20); 
    results = results.filter(item => item.similarity >= threshold);

    setSearchResults(results);
  }, [allResults, activeCategories, searchTerm, styleReflect]);

  const toggleCategory = (cat: string) => {
      if (cat === 'All') {
          setActiveCategories(['All']);
      } else {
          setActiveCategories(prev => {
              const withoutAll = prev.filter(c => c !== 'All');
              if (prev.includes(cat)) {
                  const remaining = withoutAll.filter(c => c !== cat);
                  return remaining.length === 0 ? ['All'] : remaining;
              } else {
                  return [...withoutAll, cat];
              }
          });
      }
  };

  const handleSave = (id: string) => {
      const updateList = (list: SearchResult[]) => list.map(item => 
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      );

      setAllResults(prev => updateList(prev)); 
      
      if (selectedResult && selectedResult.id === id) {
          setSelectedResult(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
      }
  };

  return (
    <div className="h-full flex flex-col bg-white font-sans overflow-hidden ml-16 md:ml-0">
        {/* Header / Search Bar Area */}
        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-2 md:pb-4 bg-white z-20 border-b border-slate-50 md:border-transparent shadow-sm md:shadow-none">
            <div className="max-w-[1800px] mx-auto">
                 {/* Top Row: Title & Badges */}
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">레퍼런스 탐색 (Reference Discovery)</h1>
                    <div className="flex gap-2 self-start md:self-auto">
                        {analysisContext?.analysis && (
                            <div className="px-2 md:px-3 py-1 bg-primary-50 border border-primary-100 rounded-lg text-primary-700 text-[10px] md:text-xs font-bold flex items-center gap-1.5">
                                <Zap className="w-3 h-3" />
                                <span>분석 기반 추천</span>
                            </div>
                        )}
                    </div>
                 </div>
                 
                 {/* Search Inputs Row */}
                 <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="w-full md:flex-1 relative group">
                        <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-primary-500 transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="스타일 검색..." 
                            className="w-full h-11 md:h-14 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm md:text-base font-medium placeholder-slate-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all shadow-sm appearance-none"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none h-11 md:h-14 px-4 md:px-6 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl hover:bg-white hover:border-primary-300 transition-all flex items-center justify-center gap-2 text-slate-600 font-bold text-sm active:scale-95">
                            <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden lg:inline">이미지</span>
                        </button>
                        <button className="flex-1 md:flex-none h-11 md:h-14 px-4 md:px-6 bg-primary-500 text-white rounded-xl md:rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 font-bold text-sm active:scale-95">
                            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden lg:inline">내 스타일 검색</span>
                            <span className="lg:hidden">AI 검색</span>
                        </button>
                    </div>
                 </div>

                 {/* Filters Row - Touch Optimized Scrolling */}
                 <div className="flex items-center gap-4 mt-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-2 flex-nowrap">
                        <div className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex-shrink-0">
                            <Filter className="w-4 h-4" />
                        </div>
                        {categories.map(cat => {
                            const isActive = activeCategories.includes(cat);
                            return (
                                <button 
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-4 py-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
                                        isActive
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {isActive && cat !== 'All' && <Check className="w-3 h-3" />}
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-2 flex-shrink-0 hidden md:block" />
                    <div className="items-center gap-3 flex-shrink-0 hidden md:flex">
                         <span className="text-xs font-bold text-slate-400 uppercase">일치도</span>
                         <input 
                            type="range" 
                            min="0" max="100" 
                            value={styleReflect} 
                            onChange={(e) => setStyleReflect(parseInt(e.target.value))}
                            className="w-24 md:w-32 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                 </div>
            </div>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 pt-2 md:pt-4 scrollbar-hide">
            <div className="max-w-[1800px] mx-auto pb-24 md:pb-20">
                {/* Responsive Grid: 6 Cols on XL */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                    {searchResults.length > 0 ? (
                        searchResults.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedResult(item)}
                                className="group relative break-inside-avoid bg-white rounded-xl md:rounded-2xl overflow-hidden border border-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] md:hover:-translate-y-1"
                            >
                                {/* Desktop Hover Overlay */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 hidden md:block">
                                    <div className="absolute top-3 right-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleSave(item.id); }}
                                            className={`p-2 rounded-full shadow-lg transform transition-all hover:scale-110 ${
                                                item.isSaved 
                                                ? 'bg-primary-500 text-white' 
                                                : 'bg-white text-slate-900 hover:bg-primary-50 hover:text-primary-600'
                                            }`}
                                        >
                                            {item.isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-sm truncate pr-2">{item.title}</span>
                                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono">
                                                <span>{item.similarity}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Indicators (Always Visible or Top Right) */}
                                <div className="absolute top-2 right-2 z-20 flex gap-1 md:hidden">
                                    {item.isSaved && (
                                        <div className="p-1.5 bg-primary-500 rounded-full text-white shadow-sm">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Awards Badge */}
                                {item.awards && (
                                    <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-yellow-400 text-black text-[8px] md:text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1">
                                        <Award className="w-2 h-2 md:w-3 md:h-3" /> Pick
                                    </div>
                                )}

                                <div className="relative aspect-[3/4] bg-slate-50">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                    {/* Mobile Title Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden flex items-end p-3">
                                        <span className="text-white text-xs font-bold truncate w-full">{item.title}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-medium">검색 결과가 없습니다.</p>
                            <button onClick={() => setActiveCategories(['All'])} className="mt-4 text-primary-600 font-bold text-sm hover:underline">
                                필터 초기화
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Detail Modal (Popup) */}
        {selectedResult && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center md:p-4 lg:p-8">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedResult(null)} />
                
                {/* Responsive Modal Container */}
                <div className="bg-white w-full h-[100dvh] md:h-[85vh] md:rounded-[2.5rem] md:max-w-6xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl animate-fade-in-up">
                    
                    {/* Close Button - Fixed/Floating on Mobile */}
                    <button 
                        onClick={() => setSelectedResult(null)}
                        className="absolute top-4 right-4 z-30 p-2 bg-white/80 md:bg-white/50 hover:bg-white rounded-full backdrop-blur-md transition-colors shadow-sm md:shadow-none"
                    >
                        <X className="w-6 h-6 text-slate-800" />
                    </button>

                    {/* Left: Image Section */}
                    <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-slate-100 relative group flex-shrink-0">
                        <img src={selectedResult.imageUrl} alt={selectedResult.title} className="w-full h-full object-contain p-4 md:p-8 bg-slate-50" />
                        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto flex gap-3 z-20 justify-center md:justify-start">
                            <button className="px-4 py-2.5 md:px-5 md:py-2.5 bg-white/90 backdrop-blur-md rounded-xl text-xs md:text-sm font-bold text-slate-900 shadow-sm hover:bg-white transition-colors flex items-center gap-2 active:scale-95">
                                원본 보기 <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Analysis & Reasoning Section */}
                    <div className="w-full md:w-1/2 h-full bg-white flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-5 md:p-10">
                            
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6 md:mb-8 mt-2 md:mt-0 pr-10 md:pr-0">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {selectedResult.awards && (
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Award className="w-3 h-3" /> Award Winner
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                            {selectedResult.category}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 font-sans leading-tight">{selectedResult.title}</h2>
                                    <p className="text-slate-400 font-medium text-xs md:text-sm">'내 스타일 검색' 결과</p>
                                </div>
                            </div>

                            {/* Match Reasoning Card */}
                            <div className="bg-slate-50 rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-slate-100 mb-6 md:mb-8">
                                 <div className="flex items-center justify-between mb-4">
                                     <h3 className="text-base md:text-xl font-bold text-slate-800 flex items-center gap-2">
                                         <Zap className="w-4 h-4 md:w-5 md:h-5 text-primary-500 fill-primary-500" /> 
                                         추천 이유 (Why this matches)
                                     </h3>
                                     <div className="text-2xl md:text-4xl font-bold text-primary-600">{selectedResult.similarity}%</div>
                                 </div>
                                 
                                 <p className="text-slate-600 leading-relaxed mb-6 font-medium text-sm md:text-base">
                                     이 레퍼런스는 업로드한 디자인의 <strong>색상 조화</strong>({baselineScores.color}%) 및 <strong>레이아웃 구조</strong>({baselineScores.layout}%)와 높은 일치도를 보입니다.
                                 </p>

                                 {/* Comparative Infographics */}
                                 <div className="space-y-4 md:space-y-6">
                                     <div className="space-y-2">
                                         <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                             <span>색상 팔레트 일치도 (Color Match)</span>
                                             <span className="text-slate-900">92%</span>
                                         </div>
                                         <div className="relative h-2 md:h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                             <div 
                                                className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                                                style={{ left: `${baselineScores.color}%` }} 
                                             />
                                             <div className="h-full bg-pink-400 rounded-full" style={{ width: '92%' }} />
                                         </div>
                                     </div>

                                     <div className="space-y-2">
                                         <div className="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                                             <span>구성 및 레이아웃 일치도 (Layout Match)</span>
                                             <span className="text-slate-900">88%</span>
                                         </div>
                                         <div className="relative h-2 md:h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                             <div 
                                                className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                                                style={{ left: `${baselineScores.layout}%` }} 
                                             />
                                             <div className="h-full bg-blue-400 rounded-full" style={{ width: '88%' }} />
                                         </div>
                                     </div>
                                 </div>
                            </div>

                            {/* Keywords */}
                            <div className="mb-8">
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                                    <BarChart3 className="w-4 h-4 text-slate-400" />
                                    연관 키워드 (Connected Keywords)
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Minimal', 'Swiss Style', 'Grid System', 'Clean', 'Sans Serif'].map(tag => (
                                        <span key={tag} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs md:text-sm font-bold transition-colors">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Sticky Footer Action */}
                        <div className="p-4 md:p-8 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0 pb-safe">
                             <button 
                                onClick={() => handleSave(selectedResult.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all flex-1 md:flex-none justify-center md:justify-start mr-3 md:mr-0 ${
                                    selectedResult.isSaved
                                    ? 'bg-primary-50 border-primary-200 text-primary-600'
                                    : 'bg-white border-slate-200 text-slate-500'
                                }`}
                             >
                                 {selectedResult.isSaved ? <Check className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                                 <span className="font-bold text-sm">{selectedResult.isSaved ? '저장됨' : '저장'}</span>
                             </button>
                             
                             <button className="flex-[2] md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 active:scale-95">
                                 프로젝트에 추가
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SearchPage;
