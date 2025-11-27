import { useNavigate } from 'react-router-dom';

function Header({ isSidebarOpen, onToggleSidebar }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/user/login');
  };

  const handleSignup = () => {
    navigate('/user/onboarding1');
  };

  return (
    <div className="chat-main-header">
      <div className="header-center">
      </div>
      <div className="header-right">
        <button className="header-login-btn" onClick={handleLogin}>
          로그인
        </button>
        <button className="header-signup-btn" onClick={handleSignup}>
          회원가입
        </button>
      </div>
    </div>
  );
}

export default Header;
