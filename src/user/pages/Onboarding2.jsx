import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { useTheme } from '../../shared/contexts/ThemeContext';

function Onboarding2() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    // 기존에 저장된 이름 로드
    const saved = localStorage.getItem('eume_userName');
    if (saved) {
      setUserName(saved);
    }
  }, []);

  const handleBack = () => {
    navigate('/user/onboarding-1');
  };

  const handleNext = () => {
    const name = userName.trim();
    if (name) {
      localStorage.setItem('eume_userName', name);
      navigate('/user/onboarding-3');
    }
  };

  const handleSetName = (name) => {
    setUserName(name);
  };

  return (
    <div className={`theme-${theme} onboarding-page`}>
      <div className="onboarding-container">
        {/* 뒤로가기 버튼 */}
        <button className="back-button" onClick={handleBack}>
          ←
        </button>

        {/* 진행 표시 */}
        <div className="progress-dots">
          <span className="progress-dot completed"></span>
          <span className="progress-dot active"></span>
          <span className="progress-dot"></span>
          <span className="progress-dot"></span>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="onboarding-content">
          <h1 className="onboarding-title">
            어떻게<br />
            불러드릴까요?
          </h1>

          <p className="onboarding-description">
            편하게 불러드릴<br />
            닉네임을 알려주세요
          </p>

          <div className="input-container">
            <div className="input-group">
              <input
                type="text"
                className="input input-large"
                placeholder="예: 철수, 영희"
                maxLength="10"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
              <p className="input-hint">💡 본명이나 별명 모두 좋아요</p>
            </div>

            {/*빠른 선택 */}
            {/*<div className="quick-select">*/}
            {/*  <p className="quick-select-label">또는 선택하세요:</p>*/}
            {/*  <div className="name-options">*/}
            {/*    <button className="name-option" onClick={() => handleSetName('어르신')}>*/}
            {/*      어르신*/}
            {/*    </button>*/}
            {/*    <button className="name-option" onClick={() => handleSetName('선생님')}>*/}
            {/*      선생님*/}
            {/*    </button>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="button-container">
          <button
            className="btn btn-primary btn-large btn-full"
            onClick={handleNext}
            disabled={userName.trim().length === 0}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding2;
