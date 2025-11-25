import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import UploadAnalysis from './components/UploadAnalysis';
import SearchPage from './components/SearchPage';
import MyPage from './components/MyPage';
import SettingsPage from './components/SettingsPage';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;