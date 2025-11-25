import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Image as ImageIcon, Sparkles, Bookmark, Award, X, Zap, BarChart3, Check, ArrowUpRight, Filter, Loader2, AlertCircle } from 'lucide-react';
import { AnalysisResult, SearchResult } from '../types';
import { callToggleBookmark, callGetBookmarks, callSearchImages } from '../services/dataService';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const [activeCategories, setActiveCategories] = useState<string[]>(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [styleReflect, setStyleReflect] = useState(80);
  
  // Data States
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  
  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Pagination
  const [startIndex, setStartIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Context from Upload Page
  const analysisContext = location.state as { source?: string; analysis?: AnalysisResult; keywords?: string[] } | null;
  
  const baselineScores = {
      color: analysisContext?.analysis?.metrics?.color?.score ?? 85,
      layout: analysisContext?.analysis?.metrics?.layout?.score ?? 80,
      typography: analysisContext?.analysis?.metrics?.typography?.score ?? 70
  };

  const categories = ['All', 'Web Design', 'Mobile UI', 'Branding', 'Print', 'Typography', 'Art Direction', '3D'];

  // 1. Load bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const result = await callGetBookmarks();
        const bookmarkIds = new Set(result.bookmarks.map(b => b.referenceId));
        setBookmarks(bookmarkIds);
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    };
    loadBookmarks();
  }, []);

  // 2. Generate Query Helper
  const generateSearchQuery = useCallback((analysis: AnalysisResult | null): string => {
    if (!analysis) return '';
    
    const parts: string[] = [];
    if (analysis.keywords && analysis.keywords.length > 0) {
      parts.push(...analysis.keywords.slice(0, 3));
    }
    
    const metrics = analysis.metrics;
    if (metrics.layout.score >= 80) parts.push('modern layout');
    if (metrics.color.score >= 80) parts.push('colorful');
    if (metrics.formLanguage.score >= 80) parts.push('minimal');
    
    const query = parts.length > 0 ? parts.join(' ') + ' design' : 'modern design';
    return query;
  }, []);

  // 3. Core Search Function
  const executeSearch = useCallback(async (query: string, start: number = 1, isLoadMore: boolean = false) => {
    if (!query.trim()) return;

    if (isLoadMore) {
        setIsLoadingMore(true);
    } else {
        setIsLoading(true);
        setAllResults([]); // Reset results for new search
        setStartIndex(1);
        setHasMore(true);
    }
    
    setError(null);
    
    try {
      console.log(`📡 [SearchPage] Fetching images for: "${query}" (Start: ${start}, LoadMore: ${isLoadMore})`);
      
      const result = await callSearchImages({
        query: query.trim(),
        num: 10, // API limit per request usually 10
        start: start,
      });

      console.log(`✅ [SearchPage] Received ${result.results.length} results (Total: ${result.totalResults})`);

      const formattedResults: SearchResult[] = result.results.map((item) => ({
        ...item,
        isSaved: bookmarks.has(item.id),
      }));

      if (isLoadMore) {
          setAllResults(prev => [...prev, ...formattedResults]);
      } else {
          setAllResults(formattedResults);
      }

      // Check if we have more results based on totalResults
      const currentTotal = isLoadMore ? allResults.length + formattedResults.length : formattedResults.length;
      const hasMoreResults = currentTotal < result.totalResults && formattedResults.length >= 10;
      setHasMore(hasMoreResults);
      
      if (!isLoadMore) {
          setStartIndex(11); // Next start index for pagination
      } else {
          setStartIndex(prev => prev + 10);
      }
      
      setHasSearched(true);

    } catch (error: any) {
      console.error('❌ [SearchPage] Search failed:', error);
      setError(error.message || '검색 중 오류가 발생했습니다.');
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [bookmarks, allResults.length]);

  // 4. Infinite Scroll Observer
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isLoadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && searchTerm && !isLoading && !isLoadingMore) {
        console.log('🔄 [SearchPage] Loading more results...');
        // Use current startIndex + 10 for next page
        executeSearch(searchTerm, startIndex, true);
      }
    }, {
      rootMargin: '200px' // Start loading 200px before reaching the bottom
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, hasMore, searchTerm, startIndex, executeSearch]);

  // 5. Initial Auto Search (Run ONCE)
  useEffect(() => {
    if (hasSearched) return; // Prevent repeat on re-renders

    let initialQuery = '';
    if (analysisContext?.analysis) {
        initialQuery = generateSearchQuery(analysisContext.analysis);
    } else if (analysisContext?.keywords && analysisContext.keywords.length > 0) {
        initialQuery = analysisContext.keywords.slice(0, 3).join(' ') + ' design';
    }

    if (initialQuery) {
        setSearchTerm(initialQuery);
        executeSearch(initialQuery, 1, false);
    }
  }, [analysisContext, hasSearched, generateSearchQuery, executeSearch]);

  // 6. Filter Logic (Client-side filtering)
  useEffect(() => {
    let results = allResults;

    // Filter by Category
    if (!activeCategories.includes('All')) {
        results = results.filter(item => activeCategories.includes(item.category));
    }

    // Filter by Style Reflection (Client-side simulation)
    const threshold = Math.max(0, styleReflect - 20); 
    results = results.filter(item => item.similarity >= threshold);

    setSearchResults(results);
  }, [allResults, activeCategories, styleReflect]);

  // Handlers
  const handleManualSearch = () => {
      if (searchTerm.trim() && !isLoading) {
          // Reset everything for new search
          setHasMore(true);
          setHasSearched(false);
          executeSearch(searchTerm, 1, false);
      }
  };

  const handleStyleSearch = () => {
      if (analysisContext?.analysis) {
          const query = generateSearchQuery(analysisContext.analysis);
          if (query) {
              setSearchTerm(query);
              setHasMore(true);
              setHasSearched(false);
              executeSearch(query, 1, false);
          }
      } else if (searchTerm.trim()) {
          handleManualSearch();
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
        handleManualSearch();
    }
  };

  const toggleCategory = (cat: string) => {
      if (cat === 'All') {
          setActiveCategories(['All']);
      } else {
          setActiveCategories(prev => {
              const withoutAll = prev.filter(c => c !== 'All');
              return prev.includes(cat) 
                ? withoutAll.filter(c => c !== cat).length === 0 ? ['All'] : withoutAll.filter(c => c !== cat)
                : [...withoutAll, cat];
          });
      }
  };

  const handleSave = async (id: string) => {
      const item = allResults.find(r => r.id === id);
      if (!item) return;

      try {
        const result = await callToggleBookmark({
          referenceId: id,
          imageUrl: item.imageUrl,
          title: item.title,
          category: item.category,
          similarity: item.similarity,
          reason: item.reason,
        });

        const newBookmarks = new Set(bookmarks);
        if (result.bookmarked) newBookmarks.add(id);
        else newBookmarks.delete(id);
        setBookmarks(newBookmarks);

        setAllResults(prev => prev.map(r => r.id === id ? { ...r, isSaved: result.bookmarked } : r));
      } catch (error) {
        console.error('Failed to toggle bookmark:', error);
      }
  };

  return (
    <div className="h-full flex flex-col bg-white font-sans overflow-hidden ml-16 md:ml-0">
        {/* Header Section */}
        <div className="px-4 md:px-8 pt-4 md:pt-8 pb-2 md:pb-4 bg-white z-20 border-b border-slate-50 shadow-sm">
            <div className="max-w-[1800px] mx-auto">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">레퍼런스 탐색 (Reference Discovery)</h1>
                    {analysisContext?.analysis && (
                        <div className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-primary-100">
                            <Zap className="w-3 h-3" /> 분석 기반 추천
                        </div>
                    )}
                 </div>
                 
                 <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="w-full md:flex-1 relative group">
                        <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-primary-500 transition-colors" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="스타일 검색..." 
                            className="w-full h-11 md:h-14 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm md:text-base font-medium placeholder-slate-400 focus:ring-2 focus:ring-primary-100 focus:border-primary-300 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none h-11 md:h-14 px-4 md:px-6 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl hover:bg-white hover:border-primary-300 transition-all flex items-center justify-center gap-2 text-slate-600 font-bold text-sm active:scale-95">
                            <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden lg:inline">이미지</span>
                        </button>
                        <button 
                            onClick={handleStyleSearch}
                            disabled={isLoading}
                            className="flex-1 md:flex-none h-11 md:h-14 px-4 md:px-6 bg-primary-500 text-white rounded-xl md:rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 font-bold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden lg:inline">내 스타일 검색</span>
                            <span className="lg:hidden">AI 검색</span>
                        </button>
                    </div>
                 </div>

                 {/* Filters Row */}
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

        {/* Main Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
            <div className="max-w-[1800px] mx-auto pb-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
                    {searchResults.map((item, index) => {
                        // Attach ref to the last element for infinite scroll
                        const isLast = index === searchResults.length - 1;
                        return (
                            <div 
                                key={`${item.id}-${index}`} 
                                ref={isLast ? lastElementRef : null}
                                onClick={() => setSelectedResult(item)}
                                className="group relative bg-white rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
                            >
                                {/* Image & Overlay */}
                                <div className="relative aspect-[3/4] bg-slate-100">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {item.awards && (
                                            <div className="px-2 py-1 bg-yellow-400 text-black text-[10px] font-bold rounded flex items-center gap-1 shadow-sm">
                                                <Award className="w-3 h-3" /> Pick
                                            </div>
                                        )}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleSave(item.id); }}
                                            className={`p-2 rounded-full shadow-lg transition-transform hover:scale-110 z-10 ${
                                                item.isSaved ? 'bg-primary-500 text-white' : 'bg-white text-slate-900 hover:text-primary-500'
                                            }`}
                                        >
                                            {item.isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                {/* Title */}
                                <div className="p-3">
                                    <h3 className="text-sm font-bold text-slate-900 truncate">{item.title}</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-xs text-slate-500">{item.category}</p>
                                        <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                                            {item.similarity}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Loading States */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                    </div>
                )}
                
                {isLoadingMore && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && searchResults.length === 0 && hasSearched && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium mb-2">검색 결과가 없습니다.</p>
                        <button 
                            onClick={() => {
                                setSearchTerm('');
                                setAllResults([]);
                                setHasSearched(false);
                            }}
                            className="text-primary-600 font-bold text-sm hover:underline"
                        >
                            검색 초기화
                        </button>
                    </div>
                )}
                
                {!isLoading && !hasSearched && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-medium">검색어를 입력하여 레퍼런스를 찾아보세요.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Detail Modal */}
        {selectedResult && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedResult(null)}>
                <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl flex overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                     <button 
                        onClick={() => setSelectedResult(null)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full backdrop-blur transition-colors"
                     >
                        <X className="w-6 h-6 text-slate-800" />
                     </button>

                     <div className="w-1/2 bg-slate-100 p-8 flex items-center justify-center relative">
                        <img src={selectedResult.imageUrl} className="max-w-full max-h-full object-contain shadow-lg" />
                        <a 
                            href={selectedResult.imageUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="absolute bottom-6 left-6 px-4 py-2 bg-white/90 backdrop-blur rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white transition-colors"
                        >
                            원본 보기 <ArrowUpRight className="w-4 h-4" />
                        </a>
                     </div>
                     
                     <div className="w-1/2 p-8 overflow-y-auto bg-white">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-bold uppercase">{selectedResult.category}</span>
                                {selectedResult.awards && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-bold uppercase">Award Winner</span>}
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 leading-tight">{selectedResult.title}</h2>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary-500" /> 추천 이유
                                </h3>
                                <span className="text-2xl font-bold text-primary-600">{selectedResult.similarity}%</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{selectedResult.reason}</p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100">
                            <button 
                                onClick={() => handleSave(selectedResult.id)} 
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                                    selectedResult.isSaved 
                                    ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                            >
                                {selectedResult.isSaved ? (
                                    <><Check className="w-5 h-5" /> 보드에 저장됨</>
                                ) : (
                                    <><Bookmark className="w-5 h-5" /> 보드에 저장</>
                                )}
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