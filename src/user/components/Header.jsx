import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../../shared/constants/storage';

function Header({ isSidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();

  // 매 렌더링마다 로그인 상태 확인
  // USER_INFO: 온보딩 완료 후 저장됨
  // OAUTH_USER: OAuth 로그인 직후, 온보딩 전에 저장됨
  const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  const oauthUser = localStorage.getItem(STORAGE_KEYS.OAUTH_USER);
  const isLoggedIn = !!(userInfo || oauthUser);

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
