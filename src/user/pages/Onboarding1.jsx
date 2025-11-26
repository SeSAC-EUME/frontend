import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { useTheme } from '../../shared/contexts/ThemeContext';

function Onboarding1() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSkip = () => {
    localStorage.setItem('eume_onboarding_complete', 'true');
    navigate('/user/login');
  };

  const handleNext = () => {
    navigate('/user/onboarding-2');
  };

  return (
    <div className={`theme-${theme} onboarding-page`}>
      <div className="onboarding-container">
        {/* 진행 표시 */}
        <div className="progress-dots">
          <span className="progress-dot active"></span>
          <span className="progress-dot"></span>
          <span className="progress-dot"></span>
          <span className="progress-dot"></span>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="onboarding-content">
          <div className="illustration">
            <div className="wave-hand">👋</div>
          </div>

          <h1 className="onboarding-title">
            안녕하세요!<br />
            반갑습니다
          </h1>

          <p className="onboarding-description">
            저는 <strong>이음이</strong>예요.<br />
            앞으로 매일 안부를 묻고<br />
            이야기를 나눌 친구가<br />
            되어드릴게요.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">💭</span>
              <span className="feature-text">편하게 대화해요</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📋</span>
              <span className="feature-text">복지 정보를 알려드려요</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">❤️</span>
              <span className="feature-text">건강을 챙겨드려요</span>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="button-container">
          <button className="btn btn-primary btn-large btn-full" onClick={handleNext}>
            시작하기
          </button>
          <button className="btn btn-secondary" onClick={handleSkip}>
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding1;
