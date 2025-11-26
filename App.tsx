import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadAnalysis from './components/UploadAnalysis';
import SearchPage from './components/SearchPage';
import MyPage from './components/MyPage';
import SettingsPage from './components/SettingsPage';
import Onboarding from './components/Onboarding';
import { onAuthStateChange, checkUserProfile } from './services/authService';

function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    // 인증 상태 변경 감지
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('App: 인증 상태 변경', user ? `사용자: ${user.uid}` : '사용자 없음');
      
      if (user) {
        // 사용자가 인증된 경우 프로필 확인
        try {
          console.log('App: 프로필 확인 중...');
          const hasProfile = await checkUserProfile();
          console.log('App: 프로필 존재 여부:', hasProfile);
          setNeedsOnboarding(!hasProfile);
        } catch (error) {
          console.error('App: 프로필 확인 실패:', error);
          // 에러 발생 시 온보딩으로 보냄
          setNeedsOnboarding(true);
        }
      } else {
        // 사용자가 인증되지 않은 경우 온보딩으로 보냄
        console.log('App: 인증된 사용자 없음, 온보딩으로 이동');
        setNeedsOnboarding(true);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // 인증 확인 중일 때 로딩 화면 표시
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {needsOnboarding ? (
        // 프로필이 없는 경우 온보딩 페이지 표시
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      ) : (
        // 프로필이 있는 경우 메인 앱 표시
        <div className="flex h-screen bg-white text-slate-900 font-sans selection:bg-primary-100">
          <Sidebar />
          <main className="flex-1 overflow-hidden relative flex flex-col">
            {/* Background Glow Effects - Light Theme */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] pointer-events-none opacity-60" />

            <Routes>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/upload" element={<UploadAnalysis />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/*" element={<Navigate to="/upload" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;