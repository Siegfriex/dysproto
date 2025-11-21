
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Image as ImageIcon, Sparkles, Bookmark, Award, X, Zap, BarChart3, Check, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { AnalysisResult, SearchResult } from '../types';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [styleReflect, setStyleReflect] = useState(80);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  
  // Context from Upload Page (if navigated from there)
  const analysisContext = location.state as { source?: string; analysis?: AnalysisResult; keywords?: string[] } | null;
  
  // Extract baselines for comparison (default to mock values if direct navigation)
  const baselineScores = {
      color: analysisContext?.analysis?.metrics?.color?.score ?? 85,
      layout: analysisContext?.analysis?.metrics?.layout?.score ?? 80,
      typography: analysisContext?.analysis?.metrics?.typography?.score ?? 70
  };

  const categories = ['All', 'Web Design', 'Mobile UI', 'Branding', 'Print', 'Typography', 'Art Direction', '3D'];

  // Generate Mock Data with "Trend" logic
  useEffect(() => {
    const keywords = analysisContext?.keywords || ['Modern', 'Minimal', 'Clean'];
    
    const mockResults: SearchResult[] = Array.from({ length: 30 }).map((_, i) => {
        // Simulate "Trend" priority (Red Dot, etc.) for top items
        const isTrend = i < 4; 
        const awards = isTrend ? (i % 2 === 0 ? ['Red Dot Winner 2024'] : ['Legacy Media Pick']) : undefined;
        const similarity = Math.floor(Math.random() * 15) + 80; // 80-95% match

        return {
            id: i.toString(),
            imageUrl: `https://picsum.photos/400/${300 + (i % 4) * 50}?random=${i + 200}`,
            title: `Ref ${keywords[i % keywords.length]} ${i + 1}`,
            similarity: similarity,
            category: categories[(i % 5) + 1],
            reason: `Matches ${keywords[i % keywords.length]} tone`,
            awards: awards,
            isSaved: false
        };
    });
    
    setSearchResults(mockResults);

    // Auto-populate search if coming from upload
    if (analysisContext?.keywords && analysisContext.keywords.length > 0) {
        setSearchTerm(analysisContext.keywords.join(', '));
    }
  }, [analysisContext]);

  const handleSave = (id: string) => {
      setSearchResults(prev => prev.map(item => 
          item.id === id ? { ...item, isSaved: !item.isSaved } : item
      ));
      if (selectedResult && selectedResult.id === id) {
          setSelectedResult(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
      }
  };

  return (
    <div className="h-full flex flex-col bg-white font-sans overflow-hidden">
        {/* Header / Search Bar Area */}
        <div className="px-8 pt-8 pb-4 bg-white z-20 border-b border-transparent">
            <div className="max-w-[1800px] mx-auto">
                 <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 hidden md:block">Reference Discovery</h1>
                    <div className="flex gap-2">
                        {analysisContext?.analysis && (
                            <div className="px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-lg text-primary-700 text-xs font-bold flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                Based on your analysis
                            </div>
                        )}
                    </div>
                 </div>
                 
                 <div className="flex gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search styles, keywords, or trends..." 
                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-base font-medium placeholder-slate-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button className="h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-primary-300 transition-all flex items-center gap-2 text-slate-600 font-bold">
                        <ImageIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Image</span>
                    </button>
                    <button className="h-14 px-6 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-200 transition-all flex items-center gap-2 font-bold">
                        <Sparkles className="w-5 h-5" />
                        <span className="hidden md:inline">My Style Search</span>
                    </button>
                 </div>

                 {/* Filters Row */}
                 <div className="flex items-center gap-4 mt-6 overflow-x-auto scrollbar-hide pb-2">
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                                    activeCategory === cat 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-2 flex-shrink-0" />
                    <div className="flex items-center gap-4 flex-shrink-0">
                         <span className="text-xs font-bold text-slate-400 uppercase">Style Match</span>
                         <input 
                            type="range" 
                            min="0" max="100" 
                            value={styleReflect} 
                            onChange={(e) => setStyleReflect(parseInt(e.target.value))}
                            className="w-32 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                 </div>
            </div>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 scrollbar-hide">
            <div className="max-w-[1800px] mx-auto pb-20">
                {/* 6-Column Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {searchResults.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedResult(item)}
                            className="group relative break-inside-avoid bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                        >
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
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

                            {/* Awards Badge */}
                            {item.awards && (
                                <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-yellow-400 text-black text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Pick
                                </div>
                            )}

                            <div className="relative aspect-[3/4] bg-slate-100">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Detail Modal (Popup) */}
        {selectedResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedResult(null)} />
                
                <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-[85vh] flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl animate-fade-in-up">
                    
                    {/* Close Button */}
                    <button 
                        onClick={() => setSelectedResult(null)}
                        className="absolute top-6 right-6 z-30 p-2 bg-white/50 hover:bg-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-800" />
                    </button>

                    {/* Left: Image */}
                    <div className="w-full md:w-1/2 h-1/2 md:h-full bg-slate-100 relative group">
                        <img src={selectedResult.imageUrl} alt={selectedResult.title} className="w-full h-full object-contain p-4 md:p-8 bg-slate-50" />
                        <div className="absolute bottom-8 left-8 flex gap-3">
                            <button className="px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-xl text-sm font-bold text-slate-900 shadow-sm hover:bg-white transition-colors flex items-center gap-2">
                                Visit Source <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Analysis & Reasoning */}
                    <div className="w-full md:w-1/2 h-1/2 md:h-full bg-white p-8 md:p-10 overflow-y-auto">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {selectedResult.awards && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <Award className="w-3 h-3" /> Award Winner
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        {selectedResult.category}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2 font-sans">{selectedResult.title}</h2>
                                <p className="text-slate-400 font-medium">Found via 'My Style Search'</p>
                            </div>
                            
                            <button 
                                onClick={() => handleSave(selectedResult.id)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
                                    selectedResult.isSaved 
                                    ? 'bg-primary-50 border-primary-200 text-primary-600' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-primary-200 hover:text-primary-500'
                                }`}
                            >
                                {selectedResult.isSaved ? <Check className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                                <span className="text-[10px] font-bold uppercase">{selectedResult.isSaved ? 'Saved' : 'Save'}</span>
                            </button>
                        </div>

                        {/* Match Reasoning Section */}
                        <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 mb-8">
                             <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                     <Zap className="w-5 h-5 text-primary-500 fill-primary-500" /> 
                                     Why this matches
                                 </h3>
                                 <div className="text-4xl font-bold text-primary-600">{selectedResult.similarity}%</div>
                             </div>
                             
                             <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                                 This reference was selected because its visual structure strongly correlates with your uploaded design 
                                 {analysisContext?.analysis?.fileName ? ` (${analysisContext.analysis.fileName})` : ''}.
                                 <br/><br/>
                                 Specifically, it aligns with your <strong>Color Harmony</strong> ({baselineScores.color}%) and <strong>Composition</strong> ({baselineScores.layout}%) metrics, 
                                 providing a relevant benchmark for {analysisContext?.keywords?.[0] || 'current trends'}.
                             </p>

                             {/* Comparative Infographics */}
                             <div className="space-y-6">
                                 <div className="space-y-2">
                                     <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                                         <span>Color Palette Match</span>
                                         <span className="text-slate-900">92%</span>
                                     </div>
                                     <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                         {/* Comparison Markers */}
                                         <div 
                                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                                            style={{ left: `${baselineScores.color}%` }} 
                                            title={`Your Design: ${baselineScores.color}%`} 
                                         />
                                         <div className="h-full bg-pink-400 rounded-full" style={{ width: '92%' }} />
                                     </div>
                                     <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                         <span>Reference Score</span>
                                         <span>Your Baseline ({baselineScores.color}%)</span>
                                     </div>
                                 </div>

                                 <div className="space-y-2">
                                     <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                                         <span>Composition Structure</span>
                                         <span className="text-slate-900">88%</span>
                                     </div>
                                     <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                         <div 
                                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                                            style={{ left: `${baselineScores.layout}%` }} 
                                         />
                                         <div className="h-full bg-blue-400 rounded-full" style={{ width: '88%' }} />
                                     </div>
                                     <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                         <span>Reference Score</span>
                                         <span>Your Baseline ({baselineScores.layout}%)</span>
                                     </div>
                                 </div>

                                 <div className="space-y-2">
                                     <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                                         <span>Typography Style</span>
                                         <span className="text-slate-900">76%</span>
                                     </div>
                                     <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                         <div 
                                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                                            style={{ left: `${baselineScores.typography}%` }} 
                                         />
                                         <div className="h-full bg-amber-400 rounded-full" style={{ width: '76%' }} />
                                     </div>
                                     <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                         <span>Reference Score</span>
                                         <span>Your Baseline ({baselineScores.typography}%)</span>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Keywords / Connection */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-slate-400" />
                                Connected Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['Minimal', 'Swiss Style', 'Grid System', 'Clean Layout', 'Sans Serif'].map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bold hover:bg-primary-50 hover:text-primary-600 hover:border-primary-100 transition-colors cursor-pointer">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                             <button className="text-slate-400 font-bold text-sm hover:text-slate-600 flex items-center gap-2 transition-colors">
                                 <MoreHorizontal className="w-4 h-4" /> More Actions
                             </button>
                             <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                                 Add to Project
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
