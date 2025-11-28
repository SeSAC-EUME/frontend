import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import logo from '../../shared/assets/logo.svg';
import { JAVA_URL, API_ENDPOINTS } from '../../shared/api/config';
import { useTheme } from '../../shared/contexts/ThemeContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { STORAGE_KEYS } from '../../shared/constants/storage';
import axiosInstance from '../../shared/api/axios';
import { toFrontendTheme } from '../../shared/utils/themeMapper';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 이미 로그인된 사용자는 적절한 페이지로 리다이렉트
  useEffect(() => {
    const checkAuthStatus = async () => {
      const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      const oauthUser = localStorage.getItem(STORAGE_KEYS.OAUTH_USER);
      const onboardingComplete = localStorage.getItem(STORAGE_KEYS.USER_ONBOARDING);

      if (userInfo) {
        // 온보딩 완료된 사용자 -> 홈으로
        navigate('/user/home');
        return;
      }

      if (oauthUser && !onboardingComplete) {
        // OAuth 로그인했지만 온보딩 미완료 -> 온보딩으로
        navigate('/user/onboarding-1');
        return;
      }

      // localStorage에 정보가 없지만, 쿠키로 인증되어 있을 수 있음
      // 백엔드 API로 확인
      try {
        const userData = await axiosInstance.get(API_ENDPOINTS.USER.ME);
        if (userData && userData.email) {
          // 인증된 사용자 - localStorage에 정보 저장
          const userInfoToSave = {
            id: userData.id,
            email: userData.email,
            userName: userData.userName || userData.name,
            nickname: userData.nickname,
            profileImage: userData.profileImage,
            backgroundTheme: toFrontendTheme(userData.backgroundTheme),
          };
          localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfoToSave));
          localStorage.setItem(STORAGE_KEYS.USER_THEME, userInfoToSave.backgroundTheme || 'ocean');
          localStorage.setItem(STORAGE_KEYS.USER_VISITED, 'true');
          navigate('/user/home');
          return;
        }
      } catch (err) {
        // 인증되지 않은 사용자 - 로그인 페이지 표시
        console.log('인증되지 않은 사용자');
      }

      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [navigate]);

  const emptyUser = {
    userId: '',
    email: '',
    userName: '게스트',
    nickname: '',
    profileImage: '',
  };

  const handleGoogleLogin = () => {
    setError('');

    try {
      // Spring Security OAuth2 로그인 엔드포인트로 리다이렉트
      // 백엔드에서 Google OAuth 인증을 처리하고 /oauth2/redirect로 콜백됩니다
      window.location.href = `${JAVA_URL}oauth2/authorization/google`;
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      setError('Google 로그인에 실패했습니다');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleActionClick = (id) => {
    navigate('/user/home');
  };

  // 인증 확인 중에는 로딩 표시
  if (isCheckingAuth) {
    return (
      <div className={`theme-${theme} home-page`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p>확인 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-${theme} home-page`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        selectedChatId=""
        onActionClick={handleActionClick}
        chatHistory={[]}
        onSelectRoom={() => {}}
        userInfo={emptyUser}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
      />

      <div className="chat-main" style={{ marginLeft: isSidebarOpen ? 320 : 60 }}>
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

        <div className="chat-messages">
          <div className="login-container-centered">
            {/* 로고 및 타이틀 */}
            <div className="login-logo-section">
              <img src={logo} alt="서비스 로고" className="splash-logo" />
              <h1 className="login-app-title">
                이음이
              </h1>
              <p className="login-app-subtitle">
                마음을 잇는 AI 친구
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="login-error" style={{ marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* 구글 소셜 로그인 */}
            <button
              onClick={handleGoogleLogin}
              className="login-google-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </button>

            {/* 안내 텍스트 */}
            <div className="login-footer">
              <p className="login-footer-text">
                해커톤 청년 정서 돌봄 서비스
              </p>
              <p className="login-footer-copyright">
                © 2025 해커톤 이음이. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
