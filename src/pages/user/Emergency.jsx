import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';

function Emergency() {
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState('경기도 파주시 금촌동 123-45');

  const callEmergency = (number) => {
    if (window.confirm(`${number}에 전화하시겠습니까?`)) {
      window.location.href = `tel:${number}`;
    }
  };

  const callGuardian = () => {
    const guardianName = '홍길동';
    const guardianNumber = '010-1234-5678';
    if (window.confirm(`${guardianName}에게 전화하시겠습니까?`)) {
      window.location.href = `tel:${guardianNumber}`;
    }
  };

  const callWelfare = () => {
    const welfareNumber = '031-940-1234';
    if (window.confirm('복지센터에 전화하시겠습니까?')) {
      window.location.href = `tel:${welfareNumber}`;
    }
  };

  const shareLocation = () => {
    if (window.confirm('현재 위치를 공유하시겠습니까?')) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            alert('위치가 공유되었습니다');
          },
          (error) => {
            console.error('위치 정보 오류:', error);
            alert('위치 정보를 가져올 수 없습니다');
          }
        );
      } else {
        alert('위치 서비스를 사용할 수 없습니다');
      }
    }
  };

  const sendQuickMessage = (message) => {
    if (window.confirm(`"${message}" 메시지를 보내시겠습니까?`)) {
      setTimeout(() => {
        alert('메시지가 전송되었습니다');
      }, 500);
    }
  };

  return (
    <div className="app-container">
      <header className="emergency-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span>←</span>
        </button>
        <h1>긴급 연락</h1>
        <div className="header-spacer"></div>
      </header>

      <section className="emergency-notice">
        <div className="alert-icon pulse">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p>위급한 상황이신가요?</p>
        <p className="sub-text">아래 버튼을 눌러 도움을 요청하세요</p>
      </section>

      <section className="emergency-buttons">
        <button className="emergency-button critical" onClick={() => callEmergency('119')}>
          <div className="button-content">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="text-wrapper">
              <span className="number">119</span>
              <span className="description">응급상황</span>
            </div>
          </div>
          <div className="pulse-effect"></div>
        </button>

        <button className="emergency-button critical" onClick={() => callEmergency('112')}>
          <div className="button-content">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="text-wrapper">
              <span className="number">112</span>
              <span className="description">경찰</span>
            </div>
          </div>
        </button>

        <button className="emergency-button guardian" onClick={callGuardian}>
          <div className="button-content">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="text-wrapper">
              <span className="number">보호자</span>
              <span className="description">홍길동</span>
            </div>
          </div>
        </button>

        <button className="emergency-button welfare" onClick={callWelfare}>
          <div className="button-content">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <path d="M9 22v-4h6v4"/>
                <path d="M8 6h.01"/>
                <path d="M16 6h.01"/>
                <path d="M12 6h.01"/>
                <path d="M12 10h.01"/>
                <path d="M12 14h.01"/>
                <path d="M16 10h.01"/>
                <path d="M16 14h.01"/>
                <path d="M8 10h.01"/>
                <path d="M8 14h.01"/>
              </svg>
            </div>
            <div className="text-wrapper">
              <span className="number">복지센터</span>
              <span className="description">파주시 노인복지관</span>
            </div>
          </div>
        </button>
      </section>

      <section className="location-share">
        <div className="location-card">
          <div className="location-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>내 현재 위치</span>
          </div>
          <div className="location-info">
            <p className="address">{currentLocation}</p>
            <button className="share-location-btn" onClick={shareLocation}>
              위치 공유하기
            </button>
          </div>
        </div>
      </section>

      <section className="quick-messages">
        <h2>빠른 메시지 전송</h2>
        <div className="message-buttons">
          <button className="quick-msg-btn" onClick={() => sendQuickMessage('넘어졌어요')}>
            넘어졌어요
          </button>
          <button className="quick-msg-btn" onClick={() => sendQuickMessage('아파요')}>
            아파요
          </button>
          <button className="quick-msg-btn" onClick={() => sendQuickMessage('도움이 필요해요')}>
            도움이 필요해요
          </button>
          <button className="quick-msg-btn" onClick={() => sendQuickMessage('급해요')}>
            급해요
          </button>
        </div>
      </section>

      <nav className="nav-bottom">
        <button className="nav-item" onClick={() => navigate('/user/home')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-label">홈</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/chat')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="nav-label">대화</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/welfare')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="nav-label">정보</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/health')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="nav-label">건강</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/settings')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="nav-label">설정</span>
        </button>
      </nav>
    </div>
  );
}

export default Emergency;
