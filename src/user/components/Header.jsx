import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../../shared/constants/storage';

function Header({ isSidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 로그인 상태 체크 (사용자 정보 존재 여부, 쿠키 기반 인증)
    const checkLoginStatus = () => {
      const user = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      setIsLoggedIn(!!user);
    };

    checkLoginStatus();

    // storage 이벤트 리스너 추가 (다른 탭에서의 변경 감지)
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [location]); // location 변경 시에도 체크

  const handleLogin = () => {
    navigate('/user/login');
  };

  const handleSignup = () => {
    navigate('/user/onboarding1');
  };

  const handleMyPage = () => {
    navigate('/user/settings');
  };

  return (
    <div className="chat-main-header">
      <div className="header-center">
      </div>
      <div className="header-right">
        {!isLoggedIn ? (
          <>
            <button className="header-login-btn" onClick={handleLogin}>
              로그인
            </button>
            <button className="header-signup-btn" onClick={handleSignup}>
              회원가입
            </button>
          </>
        ) : (
          <button className="header-signup-btn" onClick={handleMyPage}>
            마이페이지
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
