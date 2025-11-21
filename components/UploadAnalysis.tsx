
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Home, Trash2, AlertCircle, Palette, LayoutGrid, Type as TypeIcon, Box, Shapes, Send, Zap, Star, X, CheckCircle2, Target, ChevronRight } from 'lucide-react';
import { analyzeImage, chatWithDesignMentor } from '../services/geminiService';
import { AnalysisResult, ChatMessage, MetricDetail } from '../types';

type ViewMode = 'upload' | 'chat' | 'result';

const metricDefinitions: Record<string, string> = {
  layout: "그리드 시스템, 여백(Whitespace), 시각적 균형 및 정보 계층 구조의 효율성을 측정합니다.",
  typography: "서체(Font)의 가독성, 크기 대비(Hierarchy), 행간/자간 및 폰트 페어링의 조화를 평가합니다.",
  color: "색상 팔레트의 심미적 조화, 대비(Accessibility), 및 브랜드 아이덴티티 전달력을 분석합니다.",
  components: "버튼, 카드, 입력창 등 UI 요소의 스타일 일관성(Consistency) 및 재사용성을 평가합니다.",
  formLanguage: "모서리(Radius), 도형, 그림자 등 형태적 언어의 통일성과 디자인 무드를 측정합니다."
};

const metricIcons: Record<string, React.ElementType> = {
    layout: LayoutGrid,
    typography: TypeIcon,
    color: Palette,
    components: Box,
    formLanguage: Shapes
};

const metricColors: Record<string, string> = {
    layout: "blue",
    typography: "amber",
    color: "pink",
    components: "purple",
    formLanguage: "teal"
};

const UploadAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "안녕하세요! 디자인 멘토 dysproto입니다. 포트폴리오 파일을 업로드하면 디자인 시스템과 시각적 특징을 분석해드립니다.",
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Modal State for Metrics
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Gesture State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // File Validation
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return "지원하지 않는 파일 형식입니다. JPEG, PNG, WebP만 지원합니다.";
    }
    if (file.size > maxSize) {
      return "파일 크기가 5MB를 초과합니다. 더 작은 파일을 업로드해주세요.";
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setAnalysisResult(null);
      setUploadProgress(0);
      
      // Simulate Upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Switch to Chat Mode (Loading View) immediately upon file selection and upload complete
          setViewMode('chat');
          
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: `"${selectedFile.name}" 파일 업로드 완료. 디자인 DNA 분석을 시작합니다.`,
            timestamp: Date.now()
          }]);
          
          handleAnalyze(selectedFile);
        }
      }, 150);
    }
  };

  const handleAnalyze = async (selectedFile: File) => {
    setIsAnalyzing(true);
    setError(null);
    
    // Initial system message
    setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "AI 엔진이 시각적 요소를 스캔하고 있습니다...",
        timestamp: Date.now()
    }]);

    // Real-time progress simulation in chat (Granular Korean stages)
    const steps = [
        { text: "🔍 레이아웃 그리드 및 여백 구조 추출 중... (Analyzing Layout Structure)", delay: 1500 },
        { text: "🎨 주요 색상 팔레트 및 대비율 계산 중... (Extracting Color DNA)", delay: 3500 },
        { text: "🔤 타이포그래피 계층 및 폰트 스타일 분석 중... (Evaluating Typography)", delay: 5500 },
        { text: "🧩 UI 컴포넌트 패턴 및 일관성 검증 중... (Checking Consistency)", delay: 7500 },
        { text: "✨ 디자인 트렌드 비교 및 최종 리포트 생성 중... (Finalizing Report)", delay: 9500 },
    ];

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    steps.forEach((step, index) => {
        const timeout = setTimeout(() => {
            setChatMessages(prev => [...prev, {
                id: `progress-${index}`,
                role: 'model',
                text: step.text,
                timestamp: Date.now()
            }]);
        }, step.delay);
        timeouts.push(timeout);
    });

    try {
      const result = await analyzeImage(selectedFile);
      
      setAnalysisResult(result);
      
      // Add completion message to chat history
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 99).toString(),
        role: 'model',
        text: `분석이 완료되었습니다! (종합 점수 ${result.metrics.overall}점). 결과 대시보드를 표시합니다.`,
        timestamp: Date.now()
      }]);

      // AUTO TRANSITION: Go directly to result view
      setViewMode('result');

    } catch (error) {
      console.error(error);
      setError("분석에 실패했습니다.");
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 99).toString(),
        role: 'model',
        text: "죄송합니다, 분석 중 기술적 오류가 발생했습니다. 다시 시도해주세요.",
        timestamp: Date.now()
      }]);
      setViewMode('upload');
    } finally {
      setIsAnalyzing(false);
      timeouts.forEach(t => clearTimeout(t));
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    // Construct context (Fallback mock if analysisResult is missing)
    const context = analysisResult || {
        fileName: file?.name || 'No file',
        timestamp: new Date().toLocaleString(),
        summary: '분석 중...',
        metrics: { 
            layout: { score: 0, reason: '', benchmark: '', keyElements: [] },
            typography: { score: 0, reason: '', benchmark: '', keyElements: [] },
            color: { score: 0, reason: '', benchmark: '', keyElements: [] },
            components: { score: 0, reason: '', benchmark: '', keyElements: [] },
            formLanguage: { score: 0, reason: '', benchmark: '', keyElements: [] },
            overall: 0 
        },
        colors: [],
        keywords: [],
        detectedObjects: [],
        suggestions: ''
    };

    const responseText = await chatWithDesignMentor(chatMessages, inputMessage, context);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, botMsg]);
    setIsChatLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setUploadProgress(0);
    setViewMode('upload');
    setChatMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: "새로운 작업을 업로드할 준비가 되었습니다.",
        timestamp: Date.now()
    }]);
  };

  // Navigation to Search
  const goToSearch = () => {
    navigate('/search', { 
        state: { 
            source: 'upload',
            analysis: analysisResult,
            keywords: analysisResult?.keywords 
        } 
    });
  };

  // Swipe/Gesture Handling
  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
        touchStartX.current = e.touches[0].clientX;
    } else {
        touchStartX.current = (e as React.MouseEvent).clientX;
    }
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
        touchEndX.current = e.touches[0].clientX;
    } else {
        touchEndX.current = (e as React.MouseEvent).clientX;
    }
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 100; // Threshold

    if (isLeftSwipe && viewMode === 'result') {
        goToSearch();
    }
    
    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, viewMode]);

  // Keyboard shortcut hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (viewMode === 'upload' && file && !isAnalyzing) {
           handleAnalyze(file);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, viewMode, isAnalyzing]);

  // Helper to get metric data safely
  const getMetricData = (key: string): MetricDetail | null => {
      if (!analysisResult) return null;
      const data = analysisResult.metrics[key];
      if (typeof data === 'number') return null; // Should not happen for keys other than overall
      return data as MetricDetail;
  };

  return (
    <div 
        className="flex flex-col h-full w-full bg-white relative font-sans overflow-hidden text-slate-900 ml-16 md:ml-0" // Offset for fixed sidebar on mobile
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        // For mouse drag simulation
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        onMouseMove={(e) => { if (e.buttons === 1) onTouchMove(e); }}
    >
      
      {/* 1. WORKSPACE AREA - Main Scroll Container */}
      <div className="flex-1 flex flex-col relative overflow-y-auto scroll-smooth scrollbar-hide w-full">
        
        {/* Content Wrapper - Unified Grid Constraints */}
        <div className="flex-1 flex flex-col px-4 md:px-10 max-w-[1600px] mx-auto w-full pt-8 md:pt-10 pb-48 relative">
            
            {/* TOP NAVIGATION (Breadcrumbs / Actions) - For Result View */}
            {viewMode === 'result' && (
                <div className="flex justify-between items-center mb-6 md:mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-primary-50 rounded-xl">
                           <Home className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                        </div>
                        <span className="text-slate-300 text-lg font-light">/</span>
                        <span className="text-xs md:text-sm font-bold text-slate-500 tracking-tight uppercase">Workspace</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="px-3 md:px-4 py-2 md:py-2.5 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-[1.5rem] text-xs md:text-sm font-bold transition-colors flex items-center gap-2 border border-slate-100 hover:border-red-100">
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden md:inline">Reset Analysis</span>
                            <span className="md:hidden">Reset</span>
                        </button>
                    </div>
                </div>
            )}
            
            {/* === MODE: UPLOAD === */}
            {viewMode === 'upload' && (
                <div className="flex-1 flex flex-col animate-fade-in">
                     {/* Profile Icon - Absolute Top Right within Grid for Stability */}
                     <div className="absolute top-4 md:top-10 right-4 md:right-10 z-10">
                         <Link to="/mypage" className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 md:pr-4 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-md transition-all hover:bg-slate-50 group/profile">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 p-0.5">
                                <div className="w-full h-full rounded-full bg-white overflow-hidden">
                                    <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <span className="text-sm font-bold text-slate-700 hidden md:block group-hover/profile:text-primary-600">Kim Design</span>
                         </Link>
                     </div>

                     {/* Centered Content - No negative margins, right padding for optical centering */}
                     <div className="flex-1 flex flex-col items-center justify-center md:pr-32">
                         <div className="text-center mb-8 md:mb-10">
                             <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-primary-500 text-white text-3xl md:text-4xl font-bold mb-4 md:mb-6 shadow-xl shadow-primary-200 transform hover:scale-105 transition-transform duration-500">d</div>
                             <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight font-sans">
                                 Design DNA Analysis
                             </h1>
                             <p className="text-slate-500 font-medium font-sans text-base md:text-lg max-w-xs md:max-w-md mx-auto leading-relaxed">Upload your interface design to discover objective metrics and get mentorship.</p>
                         </div>

                        <div className="w-full max-w-xs md:max-w-3xl">
                            {/* Upload Area */}
                            {uploadProgress > 0 && uploadProgress < 100 ? (
                               <div className="relative rounded-[2rem] md:rounded-[3rem] aspect-[4/3] md:aspect-[16/9] max-h-[500px] bg-slate-50 flex flex-col items-center justify-center border border-slate-100">
                                   <div className="w-48 md:w-64 space-y-4 text-center">
                                       <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                           <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                       </div>
                                       <p className="text-primary-600 font-bold animate-pulse text-sm md:text-base">Uploading... {uploadProgress}%</p>
                                   </div>
                               </div>
                            ) : (
                               <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] aspect-[4/3] md:aspect-[16/9] max-h-[500px] flex flex-col items-center justify-center transition-all duration-500 group bg-slate-50/50 hover:border-primary-400 hover:bg-white hover:shadow-[0_30px_80px_rgba(135,92,255,0.15)] overflow-hidden">
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    
                                    {/* Decorative Background Elements */}
                                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-100 rounded-full blur-2xl" />
                                        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl" />
                                    </div>

                                    <div className="text-center pointer-events-none transform transition-transform duration-500 group-hover:scale-105 p-4 md:p-6 z-10">
                                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-white shadow-2xl shadow-primary-100/50 flex items-center justify-center mb-4 md:mb-8 mx-auto border border-white ring-4 ring-slate-50 group-hover:ring-primary-50 transition-all">
                                            <Upload className="w-6 h-6 md:w-10 md:h-10 text-primary-500" strokeWidth={2} />
                                        </div>
                                        <h3 className="text-lg md:text-2xl font-bold text-slate-800 mb-2 md:mb-3 font-sans">Drag & Drop your design</h3>
                                        <p className="text-slate-400 mb-6 md:mb-8 font-sans text-xs md:text-base">Support JPEG, PNG, WebP up to 5MB</p>
                                        <div className="flex items-center justify-center gap-2 md:gap-3 opacity-60">
                                            {['JPG', 'PNG', 'WEBP'].map(fmt => (
                                                <span key={fmt} className="px-2 md:px-3 py-1 md:py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] text-slate-500 font-bold tracking-wider uppercase shadow-sm">
                                                    {fmt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 text-sm font-bold shadow-sm animate-bounce">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* === MODE: CHAT (Analyzing / Ready) === */}
            {viewMode === 'chat' && previewUrl && (
                <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-in pb-10">
                     {/* Central Visual */}
                     <div className="relative w-48 h-48 md:w-96 md:h-96 mb-8 md:mb-12">
                        {/* Pulse Effects */}
                        <div className={`absolute inset-0 bg-primary-500/10 rounded-[2rem] md:rounded-[3rem] blur-3xl transition-all duration-1000 ${isAnalyzing ? 'animate-pulse scale-110' : 'scale-100'}`} />
                        
                        <div className="relative w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.1)] border-[6px] md:border-[8px] border-white bg-white z-10 transform transition-transform hover:scale-[1.02]">
                            <img src={previewUrl} alt="Analyzing" className="w-full h-full object-cover" />
                            
                            {/* Overlay Status */}
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[2px]">
                                {isAnalyzing ? (
                                    <div className="bg-white/90 backdrop-blur-xl px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 border border-white/50">
                                        <div className="flex gap-1 md:gap-1.5">
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-primary-500 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-primary-500 rounded-full animate-bounce delay-75" />
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-primary-500 rounded-full animate-bounce delay-150" />
                                        </div>
                                        <span className="text-sm md:text-base font-bold text-slate-800">Analyzing...</span>
                                    </div>
                                ) : (
                                    <div className="bg-white/95 backdrop-blur-xl px-6 md:px-8 py-3 md:py-4 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up border border-white/50">
                                        <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                        <span className="text-sm md:text-base font-bold text-slate-800">Analysis Complete</span>
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                     
                     <div className="text-center max-w-lg px-6">
                         <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 font-sans">
                            {isAnalyzing ? "Reading Visual DNA" : "Analysis Complete"}
                         </h2>
                         <p className="text-slate-500 font-medium text-base md:text-lg font-sans leading-relaxed">
                            {isAnalyzing 
                                ? "심층 디자인 분석 알고리즘이 이미지를 스캔하고 있습니다." 
                                : "결과 대시보드를 생성하고 있습니다."}
                         </p>
                     </div>
                </div>
            )}

            {/* === MODE: RESULT (Grid Dashboard) === */}
            {viewMode === 'result' && analysisResult && (
                <div className="animate-fade-in space-y-6 md:space-y-8 w-full relative">
                    
                    {/* Navigation Hint (Right Arrow) */}
                    <div 
                        className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-2 group cursor-pointer"
                        onClick={goToSearch}
                    >
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:border-primary-200 group-hover:scale-110 transition-all">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded-lg shadow-sm">
                            Explore
                        </span>
                    </div>

                    {/* 1. Hero Image Section */}
                    <div className="w-full h-[30vh] min-h-[250px] md:h-[45vh] bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 relative group">
                         <img src={previewUrl!} alt="Analyzed Design" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 md:p-10">
                            <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                               <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold mb-2 border border-white/20">Original Asset</div>
                               <h2 className="text-2xl md:text-4xl font-bold font-sans mb-1 truncate max-w-[80vw]">{file?.name}</h2>
                               <p className="opacity-80 font-sans font-medium text-xs md:text-sm">{analysisResult.timestamp}</p>
                            </div>
                         </div>
                    </div>

                    {/* 2. 3x2 Grid Section (Infographic Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        
                        {/* Card 1: Overall Score (Impact) */}
                        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-primary-500/20 group min-h-[200px]">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
                             <div className="relative z-10 h-full flex flex-col justify-between">
                                 <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Zap className="w-5 h-5" /></div>
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-sm">Score</span>
                                 </div>
                                 <div>
                                    <h3 className="text-white/80 font-medium mb-1">Overall Score</h3>
                                    <div className="text-5xl md:text-6xl font-bold tracking-tighter">{analysisResult.metrics.overall}</div>
                                 </div>
                                 <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
                                     <div className="h-full bg-white rounded-full" style={{ width: `${analysisResult.metrics.overall}%` }} />
                                 </div>
                             </div>
                        </div>

                        {/* Metric Cards */}
                        {Object.keys(metricDefinitions).map((key) => {
                            const data = getMetricData(key);
                            if (!data) return null;
                            const Icon = metricIcons[key];
                            
                            return (
                                <div 
                                    key={key}
                                    onClick={() => setSelectedMetricKey(key)}
                                    className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all relative overflow-hidden group cursor-pointer min-h-[200px]"
                                >
                                     {/* Hover Hint */}
                                     <div className="absolute top-4 right-4 bg-primary-50 text-primary-600 text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
                                         Click for Details
                                     </div>

                                     <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 bg-${metricColors[key]}-50 rounded-xl text-${metricColors[key]}-500`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <h3 className="font-bold text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                        </div>
                                        <span className="text-2xl font-bold text-slate-900">{data.score}</span>
                                     </div>

                                     {/* Visualizations based on metric type */}
                                     {key === 'color' && (
                                        <div className="flex h-20 md:h-24 rounded-2xl overflow-hidden ring-4 ring-slate-50 group-hover:ring-primary-50 transition-all relative z-10">
                                            {analysisResult.colors.slice(0, 5).map((color, idx) => (
                                                <div key={idx} className="flex-1" style={{ backgroundColor: color.hex }} />
                                            ))}
                                        </div>
                                     )}
                                     {/* ... other metrics ... */}
                                     {key === 'layout' && (
                                         <div className="flex gap-2 mb-4 relative z-10">
                                             {[1,2,3,4,5].map(i => (
                                                 <div key={i} className={`h-10 md:h-12 flex-1 rounded-lg ${i*20 <= data.score ? 'bg-blue-100' : 'bg-slate-50'}`} />
                                             ))}
                                         </div>
                                     )}
                                     {/* ... Simplified for brevity in XML ... */}
                                     {key === 'typography' && (
                                         <div className="space-y-2 mb-4 relative z-10">
                                             <div className="text-3xl font-bold text-slate-800">Aa</div>
                                             <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                 <div className="h-full bg-amber-400 rounded-full" style={{ width: `${data.score}%` }} />
                                             </div>
                                         </div>
                                     )}
                                     {key === 'components' && (
                                         <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
                                             {[1,2,3].map(i => (
                                                 <div key={i} className="aspect-square rounded-xl bg-purple-50 border border-purple-100" />
                                             ))}
                                         </div>
                                     )}
                                     {key === 'formLanguage' && (
                                         <div className="flex justify-center items-center h-12 md:h-16 mb-2 relative z-10">
                                             <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-teal-400 rounded-full" />
                                             <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-teal-400 rounded-xl -ml-4 bg-white" />
                                             <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-teal-400 rounded-none -ml-4 bg-white" />
                                         </div>
                                     )}

                                     <p className="mt-2 md:mt-4 text-xs md:text-sm text-slate-400 font-medium relative z-10 line-clamp-2">
                                         {data.reason}
                                     </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* 3. Suggestions & Keywords Section */}
                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                        <div className="flex-1 bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> AI Suggestion
                            </h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line font-medium text-sm md:text-base">
                                {analysisResult.suggestions}
                            </p>
                        </div>
                        <div className="lg:w-1/3 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Related Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.keywords.map(keyword => (
                                    <span key={keyword} onClick={goToSearch} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs md:text-sm font-medium rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors cursor-pointer border border-slate-100">
                                        #{keyword}
                                    </span>
                                ))}
                            </div>
                            <h3 className="font-bold text-slate-800 mt-6 md:mt-8 mb-4">Detected Objects</h3>
                            <div className="space-y-2">
                                {analysisResult.detectedObjects.map((obj, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-600">{obj.name}</span>
                                        <span className="text-slate-400 font-mono">{Math.round(obj.confidence * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* 4. Footer Section */}
                    <div className="pt-8 pb-8 text-center border-t border-slate-100 mt-8">
                        <p className="text-slate-400 font-medium text-[10px] md:text-sm uppercase tracking-widest">AI Analysis Summary based on dysproto engine</p>
                    </div>

                </div>
            )}
        </div>
      </div>

      {/* METRIC DETAIL MODAL (Responsive) */}
      {selectedMetricKey && analysisResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedMetricKey(null)} />
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full relative shadow-2xl animate-fade-in-up z-10 overflow-y-auto max-h-[90vh]">
                  <button 
                    onClick={() => setSelectedMetricKey(null)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
                  >
                      <X className="w-5 h-5 text-slate-500" />
                  </button>
                  
                  <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-bold uppercase tracking-wider">Metric Detail</span>
                          <span className="text-2xl font-bold text-primary-500">{getMetricData(selectedMetricKey)?.score}/100</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 capitalize">{selectedMetricKey.replace(/([A-Z])/g, ' $1').trim()}</h2>
                      <p className="text-slate-400 mt-1 font-medium text-sm">{metricDefinitions[selectedMetricKey]}</p>
                  </div>

                  <div className="space-y-6">
                      {/* Benchmark, Key Elements, Reasoning blocks (same content, responsive text) */}
                      <div>
                          <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-2 text-sm md:text-base">
                              <Target className="w-4 h-4 text-slate-400" /> Benchmark (기준)
                          </h4>
                          <div className="p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed">
                              {getMetricData(selectedMetricKey)?.benchmark || "표준 디자인 가이드라인"}
                          </div>
                      </div>
                      {/* ... repeated structures with responsive padding/text ... */}
                      <div>
                          <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-2 text-sm md:text-base">
                              <CheckCircle2 className="w-4 h-4 text-slate-400" /> Key Elements (주요 요소)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {getMetricData(selectedMetricKey)?.keyElements?.map((el, i) => (
                                  <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-500 font-medium">
                                      {el}
                                  </span>
                              )) || <span className="text-slate-400 text-sm">분석된 요소 없음</span>}
                          </div>
                      </div>
                      <div>
                          <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-2 text-sm md:text-base">
                              <Zap className="w-4 h-4 text-slate-400" /> AI Reasoning (상세 분석)
                          </h4>
                          <p className="text-slate-600 leading-relaxed font-medium text-sm md:text-base">
                              {getMetricData(selectedMetricKey)?.reason}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 2. CHAT OVERLAY DRAWER - Fixed Bottom "Trace" Mode */}
      <div 
         className={`fixed bottom-0 left-16 md:left-64 right-0 z-50 flex flex-col justify-end transition-all duration-500 ease-out pointer-events-none
            ${viewMode !== 'upload' ? 'translate-y-0' : 'translate-y-full'}
         `}
      >
         {/* Interaction Container: Handles hover state */}
         <div 
            className="pointer-events-auto w-full max-w-[1600px] mx-auto px-4 md:px-10 pb-4 md:pb-8 group/chat"
         >
            {/* Drawer Content */}
            <div className={`
                bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-white/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 ease-out
                ${viewMode === 'result' 
                    ? 'translate-y-[30%] opacity-70 scale-[0.98] hover:translate-y-0 hover:opacity-100 hover:scale-100 hover:shadow-[0_-20px_60px_rgba(135,92,255,0.15)]' 
                    : 'translate-y-0 opacity-100 scale-100'}
            `}>
                
                {/* Messages Area */}
                <div className={`
                    overflow-y-auto scrollbar-hide transition-all duration-500
                    ${viewMode === 'result' ? 'max-h-0 group-hover/chat:max-h-[300px] md:group-hover/chat:max-h-[400px]' : 'max-h-[300px] md:max-h-[400px]'}
                    ${viewMode === 'result' ? 'p-0 group-hover/chat:p-4 md:group-hover/chat:p-6' : 'p-4 md:p-6'}
                `}>
                    <div className="space-y-4">
                        {chatMessages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`
                                    max-w-[90%] md:max-w-[80%] rounded-2xl p-3 md:p-4 text-sm leading-relaxed font-medium
                                    ${msg.role === 'user' 
                                        ? 'bg-primary-500 text-white rounded-tr-none shadow-md shadow-primary-200' 
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}
                                `}>
                                    {/* Render structured formatting if present */}
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                        
                        {isChatLoading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-2 items-center">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className={`bg-white border-t border-slate-100 flex items-center gap-2 md:gap-4 transition-all duration-300 ${viewMode === 'result' ? 'p-3 md:p-4 group-hover/chat:p-4 md:group-hover/chat:p-6' : 'p-4 md:p-6'}`}>
                    <div className="flex-1 relative group/input">
                        <input 
                            type="text" 
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about design..."
                            className="w-full bg-slate-50 border-0 rounded-full pl-4 md:pl-6 pr-10 md:pr-14 py-3 md:py-4 text-sm md:text-base text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-200 transition-all font-medium"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-white rounded-full shadow-sm">
                            <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary-400" />
                        </div>
                    </div>
                    
                    {/* Send Button Group */}
                    <div className="flex items-center gap-2 group/send">
                         <button 
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isChatLoading}
                            className="w-10 h-10 md:w-14 md:h-14 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-200 hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                         >
                            <Send className="w-4 h-4 md:w-6 md:h-6 ml-0.5" />
                         </button>
                    </div>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default UploadAnalysis;
