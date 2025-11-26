import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInAnonymously, createUserProfile } from '../services/authService';
import { UserPlus, Sparkles } from 'lucide-react';

const Onboarding: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 앱 시작 시 자동으로 익명 인증 시도
    const initializeAuth = async () => {
      try {
        console.log('Onboarding: 익명 인증 시작');
        const userCredential = await signInAnonymously();
        console.log('Onboarding: 익명 인증 성공', userCredential.user.uid);
        setIsAuthenticating(false);
      } catch (err: any) {
        console.error('Onboarding: 익명 인증 실패:', err);
        const errorMessage = err.message || '인증에 실패했습니다.';
        setError(`${errorMessage} 페이지를 새로고침해주세요.`);
        setIsAuthenticating(false);
      }
    };

    initializeAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (displayName.length > 20) {
      setError('이름은 20자 이하로 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createUserProfile(displayName.trim(), bio.trim());
      console.log('Onboarding: 프로필 생성 완료');
      
      // 프로필 생성 후 잠시 대기하여 Firestore에 반영되도록 함
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 프로필 생성 완료 후 페이지 새로고침하여 App.tsx가 상태를 다시 확인하도록 함
      window.location.href = '/#/upload';
    } catch (err: any) {
      console.error('프로필 생성 실패:', err);
      setError(err.message || '프로필 생성에 실패했습니다. 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">초기화 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo_main.svg" alt="dysproto" className="w-32 h-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">dysproto에 오신 것을 환영합니다!</h1>
          <p className="text-slate-500">디자인 분석을 시작하려면 이름을 입력해주세요.</p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="flex items-center gap-2 mb-6 text-primary-600">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-bold">프로필 설정</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                이름 또는 닉네임 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="이름 또는 닉네임을 입력하세요"
                  required
                  maxLength={20}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none transition-all"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">최대 20자까지 입력 가능합니다.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                한 줄 소개 (선택사항)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자신을 한 줄로 소개해주세요"
                maxLength={50}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-300 outline-none transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">최대 50자까지 입력 가능합니다.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !displayName.trim()}
              className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  시작하기
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            이름만 입력하면 바로 디자인 분석을 시작할 수 있습니다.
            <br />
            나중에 설정에서 언제든지 수정할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

