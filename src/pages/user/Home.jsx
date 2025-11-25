import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';

function UserHome() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState({ title: '', emoji: '' });
  const [userName] = useState(localStorage.getItem('eume_userName') || '어르신');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [emotionFeedback, setEmotionFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    updateTime();
    updateGreeting();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    setCurrentTime(`${period} ${displayHours}:${displayMinutes}`);
  };

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let greetingText = '';
    let emoji = '';

    if (hour >= 5 && hour < 12) {
      greetingText = '좋은 아침이에요';
      emoji = '☀️';
    } else if (hour >= 12 && hour < 14) {
      greetingText = '점심 드셨나요?';
      emoji = '🍚';
    } else if (hour >= 14 && hour < 18) {
      greetingText = '오후도 화이팅!';
      emoji = '💪';
    } else if (hour >= 18 && hour < 22) {
      greetingText = '편안한 저녁이에요';
      emoji = '🌙';
    } else {
      greetingText = '잘 주무세요';
      emoji = '😴';
    }

    setGreeting({ title: greetingText, emoji });
  };

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    saveEmotion(emotion);
    showEmotionFeedback(emotion);
  };

  const saveEmotion = (emotion) => {
    const today = new Date().toISOString().split('T')[0];
    const emotionData = {
      date: today,
      time: new Date().toISOString(),
      emotion: emotion,
    };

    let emotions = JSON.parse(localStorage.getItem('eume_emotions') || '[]');
    const todayIndex = emotions.findIndex((e) => e.date === today);

    if (todayIndex >= 0) {
      emotions[todayIndex] = emotionData;
    } else {
      emotions.push(emotionData);
    }

    emotions = emotions.slice(-30);
    localStorage.setItem('eume_emotions', JSON.stringify(emotions));
  };

  const showEmotionFeedback = (emotion) => {
    const feedbackMessages = {
      happy: '좋으시네요! 오늘도 행복한 하루 되세요! 😊',
      normal: '괜찮으시네요. 오늘 하루도 화이팅! 💪',
      sad: '무슨 일 있으신가요? 이음이와 이야기 나누어요 💙',
      tired: '충분히 쉬세요. 건강이 가장 중요해요 🍃',
    };

    setEmotionFeedback(feedbackMessages[emotion]);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  return (
    <div className="theme-ocean" id="body">
      <div className="app-container">
        <header className="home-header">
          <div className="header-top">
            <span className="current-time">{currentTime}</span>
            <div className="header-icons">
              <button className="icon-button-small" onClick={() => navigate('/user/notifications')}>
                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
                <span className="notification-badge">3</span>
              </button>
              <button className="icon-button-small" onClick={() => navigate('/user/settings')}>
                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="home-content">
          <section className="greeting-section">
            <div className="greeting-card">
              <div className="greeting-text">
                <h1 className="greeting-title">{greeting.title}</h1>
                <p className="greeting-name">{userName}님! {greeting.emoji}</p>
              </div>
              <div className="weather-info">
                <span className="weather-icon">🌤️</span>
                <span className="weather-temp">18°C</span>
                <span className="weather-desc">맑음</span>
              </div>
            </div>

            <div className="daily-message">
              <p className="daily-text">✨ "오늘도 건강하고 행복한 하루 되세요!"</p>
            </div>
          </section>

          <section className="emotion-section">
            <h2 className="section-title">오늘 기분은 어떠신가요?</h2>
            <div className="emotion-buttons">
              <button
                className={`emotion-select-btn ${selectedEmotion === 'happy' ? 'selected' : ''}`}
                onClick={() => handleEmotionSelect('happy')}
              >
                <span className="emotion-emoji">😊</span>
                <span className="emotion-label">좋아요</span>
              </button>
              <button
                className={`emotion-select-btn ${selectedEmotion === 'normal' ? 'selected' : ''}`}
                onClick={() => handleEmotionSelect('normal')}
              >
                <span className="emotion-emoji">😐</span>
                <span className="emotion-label">보통</span>
              </button>
              <button
                className={`emotion-select-btn ${selectedEmotion === 'sad' ? 'selected' : ''}`}
                onClick={() => handleEmotionSelect('sad')}
              >
                <span className="emotion-emoji">😔</span>
                <span className="emotion-label">안좋아요</span>
              </button>
              <button
                className={`emotion-select-btn ${selectedEmotion === 'tired' ? 'selected' : ''}`}
                onClick={() => handleEmotionSelect('tired')}
              >
                <span className="emotion-emoji">😴</span>
                <span className="emotion-label">피곤해요</span>
              </button>
            </div>
            <div className={`emotion-feedback ${showFeedback ? '' : 'hidden'}`}>
              <p className="feedback-text">{emotionFeedback}</p>
            </div>
          </section>

          <section className="quick-menu-section">
            <h2 className="section-title">무엇을 도와드릴까요?</h2>
            <div className="quick-menu-grid">
              <button className="quick-menu-item" onClick={() => navigate('/user/chat')}>
                <div className="menu-icon-wrapper chat">
                  <span className="menu-emoji">💭</span>
                </div>
                <span className="menu-title">이음이와 대화</span>
                <span className="menu-desc">편하게 이야기해요</span>
              </button>

              <button className="quick-menu-item" onClick={() => navigate('/user/welfare')}>
                <div className="menu-icon-wrapper welfare">
                  <span className="menu-emoji">📋</span>
                </div>
                <span className="menu-title">복지 정보</span>
                <span className="menu-desc">맞춤 복지 안내</span>
              </button>

              <button className="quick-menu-item" onClick={() => navigate('/user/health')}>
                <div className="menu-icon-wrapper health">
                  <span className="menu-emoji">❤️</span>
                </div>
                <span className="menu-title">내 건강</span>
                <span className="menu-desc">건강 기록 관리</span>
              </button>

              <button className="quick-menu-item urgent" onClick={() => navigate('/user/emergency')}>
                <div className="menu-icon-wrapper emergency">
                  <span className="menu-emoji">🚨</span>
                </div>
                <span className="menu-title">긴급 연락</span>
                <span className="menu-desc">도움이 필요해요</span>
              </button>
            </div>
          </section>

          <section className="today-activities">
            <h2 className="section-title">오늘의 활동</h2>
            <div className="activity-cards">
              <div className="activity-card">
                <span className="activity-icon">💊</span>
                <div className="activity-info">
                  <p className="activity-title">약 복용</p>
                  <p className="activity-time">오후 2:00</p>
                </div>
                <span className="activity-status pending">대기중</span>
              </div>

              <div className="activity-card">
                <span className="activity-icon">🚶</span>
                <div className="activity-info">
                  <p className="activity-title">산책</p>
                  <p className="activity-time">오후 4:00</p>
                </div>
                <span className="activity-status">예정</span>
              </div>
            </div>
          </section>
        </main>

        <nav className="nav-bottom">
          <button className="nav-item active">
            <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span className="nav-label">홈</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/user/chat')}>
            <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
            </svg>
            <span className="nav-label">대화</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/user/welfare')}>
            <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span className="nav-label">정보</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/user/health')}>
            <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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
    </div>
  );
}

export default UserHome;
