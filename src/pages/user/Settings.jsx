import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';

function Settings() {
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState('사용자 님');
  const [textSize, setTextSizeState] = useState('large');
  const [currentTheme, setCurrentTheme] = useState('ocean');
  const [selectedTheme, setSelectedTheme] = useState('ocean');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [settings, setSettings] = useState({
    textSize: 'large',
    theme: 'ocean',
    highContrast: false,
    voiceGuide: false,
    pushNotification: true,
    medicineAlert: true,
    healthAlert: true,
    biometricAuth: false
  });

  // Toast 메시지 표시 함수
  const showToast = (message) => {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 토스트 표시
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    // 토스트 숨김
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 2500);
  };

  // 음성 안내 함수
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // 기존 음성 중지
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // 설정 저장 함수
  const saveSettings = (newSettings) => {
    try {
      localStorage.setItem('eume_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('설정 저장 오류:', e);
    }
  };

  // 초기 설정 로드
  useEffect(() => {
    const stored = localStorage.getItem('eume_settings');
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...settings, ...parsedSettings });
        if (parsedSettings.textSize) setTextSizeState(parsedSettings.textSize);
        if (parsedSettings.theme) {
          setCurrentTheme(parsedSettings.theme);
          setSelectedTheme(parsedSettings.theme);
        }
      } catch (e) {
        console.error('설정 로드 오류:', e);
      }
    }

    const userName = localStorage.getItem('eume_userName') || '사용자';
    const userSuffix = localStorage.getItem('eume_userSuffix') || '님';
    setProfileName(`${userName} ${userSuffix}`);
  }, []);

  // body 클래스 적용 (textSize, theme, highContrast)
  useEffect(() => {
    const body = document.body;

    // 기존 클래스 제거
    body.className = '';

    // 테마 적용
    body.classList.add(`theme-${settings.theme}`);

    // 글자 크기 적용
    if (settings.textSize === 'large') {
      body.classList.add('text-large');
    } else if (settings.textSize === 'xlarge') {
      body.classList.add('text-xlarge');
    }

    // 고대비 모드 적용
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }
  }, [settings.theme, settings.textSize, settings.highContrast]);

  // 글자 크기 변경
  const handleTextSizeChange = (size) => {
    const body = document.body;

    // 기존 클래스 제거
    body.classList.remove('text-large', 'text-xlarge');

    // 새 클래스 추가
    if (size === 'large') {
      body.classList.add('text-large');
    } else if (size === 'xlarge') {
      body.classList.add('text-xlarge');
    }

    setTextSizeState(size);
    const newSettings = { ...settings, textSize: size };
    setSettings(newSettings);
    saveSettings(newSettings);

    const sizeNames = {
      normal: '보통',
      large: '크게',
      xlarge: '매우 크게'
    };
    showToast(`글자 크기가 ${sizeNames[size]}로 변경되었습니다`);
  };

  // 테마 선택 모달 열기
  const openThemeSelector = () => {
    setSelectedTheme(currentTheme);
    setShowThemeModal(true);
  };

  // 테마 선택 모달 닫기
  const closeThemeSelector = () => {
    setShowThemeModal(false);
  };

  // 테마 적용
  const applyTheme = () => {
    const themeValue = selectedTheme;

    // 테마 적용
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '').trim();
    body.classList.add(`theme-${themeValue}`);

    // 글자 크기와 고대비 모드 다시 적용
    if (settings.textSize === 'large') {
      body.classList.add('text-large');
    } else if (settings.textSize === 'xlarge') {
      body.classList.add('text-xlarge');
    }
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }

    setCurrentTheme(themeValue);
    const newSettings = { ...settings, theme: themeValue };
    setSettings(newSettings);
    saveSettings(newSettings);

    closeThemeSelector();

    const themeNames = {
      ocean: '바다',
      sunset: '노을',
      forest: '숲',
      lavender: '라벤더',
      rose: '장미'
    };
    showToast(`${themeNames[themeValue]} 테마로 변경되었습니다`);
  };

  // 스위치 토글 핸들러
  const handleSettingToggle = (key) => {
    const newValue = !settings[key];
    const newSettings = {
      ...settings,
      [key]: newValue
    };
    setSettings(newSettings);
    saveSettings(newSettings);

    // 각 설정별 처리
    switch (key) {
      case 'highContrast':
        const body = document.body;
        if (newValue) {
          body.classList.add('high-contrast');
          showToast('고대비 모드가 켜졌습니다');
        } else {
          body.classList.remove('high-contrast');
          showToast('고대비 모드가 꺼졌습니다');
        }
        break;
      case 'voiceGuide':
        if (newValue) {
          speak('음성 안내가 켜졌습니다');
          showToast('음성 안내가 켜졌습니다');
        } else {
          showToast('음성 안내가 꺼졌습니다');
        }
        break;
      case 'pushNotification':
        if (newValue) {
          requestNotificationPermission();
        } else {
          showToast('푸시 알림이 꺼졌습니다');
        }
        break;
      case 'biometricAuth':
        if (newValue) {
          showToast('생체 인증이 활성화되었습니다');
        } else {
          showToast('생체 인증이 비활성화되었습니다');
        }
        break;
      case 'medicineAlert':
        if (newValue) {
          showToast('약 복용 알림이 켜졌습니다');
        } else {
          showToast('약 복용 알림이 꺼졌습니다');
        }
        break;
      case 'healthAlert':
        if (newValue) {
          showToast('건강 체크 알림이 켜졌습니다');
        } else {
          showToast('건강 체크 알림이 꺼졌습니다');
        }
        break;
      default:
        break;
    }
  };

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('알림이 활성화되었습니다');
      } else {
        showToast('알림 권한이 거부되었습니다');
      }
    } else {
      showToast('이 브라우저는 알림을 지원하지 않습니다');
    }
  };

  // 프로필 수정
  const editProfile = () => {
    const currentName = localStorage.getItem('eume_userName') || '사용자';
    const newName = window.prompt('이름을 입력해주세요:', currentName);

    if (newName && newName.trim()) {
      localStorage.setItem('eume_userName', newName.trim());
      const suffix = localStorage.getItem('eume_userSuffix') || '님';
      setProfileName(`${newName.trim()} ${suffix}`);
      showToast('프로필이 수정되었습니다');
    }
  };

  // 비밀번호 변경
  const changePassword = () => {
    showToast('비밀번호 변경 기능은 준비 중입니다');
  };

  // 데이터 백업
  const backupData = () => {
    try {
      const data = {
        settings,
        userName: localStorage.getItem('eume_userName'),
        userSuffix: localStorage.getItem('eume_userSuffix'),
        healthData: JSON.parse(localStorage.getItem('eume_health_data') || '{}'),
        emotions: JSON.parse(localStorage.getItem('eume_emotions') || '[]'),
        chatHistory: JSON.parse(localStorage.getItem('eume_chat_history') || '[]'),
        recentWelfare: JSON.parse(localStorage.getItem('eume_recent_welfare') || '[]'),
        bookmarks: JSON.parse(localStorage.getItem('eume_bookmarks') || '[]')
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `eume_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();

      URL.revokeObjectURL(url);
      showToast('데이터가 백업되었습니다');
    } catch (e) {
      console.error('백업 오류:', e);
      showToast('백업 중 오류가 발생했습니다');
    }
  };

  // 알림 시간 설정
  const setNotificationTime = () => {
    showToast('알림 시간 설정 기능은 준비 중입니다');
  };

  // 사용법 다시 보기
  const showTutorial = () => {
    if (window.confirm('온보딩 화면으로 이동하시겠습니까?')) {
      navigate('/onboarding');
    }
  };

  // 도움말
  const showHelp = () => {
    showToast('도움말 페이지는 준비 중입니다');
  };

  // 문의하기
  const contactSupport = () => {
    if (window.confirm('청년 복지센터(031-940-1234)로 전화하시겠습니까?')) {
      window.location.href = 'tel:031-940-1234';
    }
  };

  // 앱 정보
  const showAppInfo = () => {
    if (window.confirm('이음이 v1.0.0\n해커톤 청년 정서 돌봄 서비스\n\n© 2025 해커톤 이음이\n\n개발: Claude Code')) {
      // 확인 버튼 클릭 시 아무 동작 없음
    }
  };

  // 로그아웃
  const logout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      localStorage.removeItem('eume_auth_token');
      localStorage.removeItem('eume_session');
      showToast('로그아웃되었습니다');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  const themeNames = {
    ocean: '🌊 바다',
    sunset: '🌅 노을',
    forest: '🌳 숲',
    lavender: '💜 라벤더',
    rose: '🌹 장미'
  };

  return (
    <div className="app-container">
      <header className="settings-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span>←</span>
        </button>
        <h1 className="page-title">설정</h1>
        <div className="header-spacer"></div>
      </header>

      <main className="settings-content">
        {/* 프로필 섹션 */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar">
              <span className="avatar-emoji">👤</span>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{profileName}</h2>
              <p className="profile-desc">파주시 거주</p>
            </div>
            <button className="profile-edit" onClick={editProfile}>
              수정
            </button>
          </div>
        </section>

        {/* 접근성 설정 */}
        <section className="settings-group">
          <h3 className="group-title">
            <span className="title-icon">👁️</span>
            접근성 설정
          </h3>

          {/* 글자 크기 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">글자 크기</h4>
              <p className="setting-desc">화면의 글자 크기를 조절합니다</p>
            </div>
            <div className="setting-control">
              <div className="text-size-selector">
                <button
                  className={`size-option ${textSize === 'normal' ? 'active' : ''}`}
                  data-size="normal"
                  onClick={() => handleTextSizeChange('normal')}
                >
                  <span className="size-preview small">가</span>
                  <span className="size-label">보통</span>
                </button>
                <button
                  className={`size-option ${textSize === 'large' ? 'active' : ''}`}
                  data-size="large"
                  onClick={() => handleTextSizeChange('large')}
                >
                  <span className="size-preview medium">가</span>
                  <span className="size-label">크게</span>
                </button>
                <button
                  className={`size-option ${textSize === 'xlarge' ? 'active' : ''}`}
                  data-size="xlarge"
                  onClick={() => handleTextSizeChange('xlarge')}
                >
                  <span className="size-preview large">가</span>
                  <span className="size-label">매우 크게</span>
                </button>
              </div>
            </div>
          </div>

          {/* 테마 색상 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">테마 색상</h4>
              <p className="setting-desc">화면 색상을 변경합니다</p>
            </div>
            <div className="setting-control">
              <button className="setting-button" onClick={openThemeSelector}>
                <span className="current-theme">{themeNames[currentTheme]}</span>
                <span className="arrow">›</span>
              </button>
            </div>
          </div>

          {/* 고대비 모드 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">고대비 모드</h4>
              <p className="setting-desc">화면 대비를 높여 더 선명하게 표시</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  id="highContrastMode"
                  checked={settings.highContrast}
                  onChange={() => handleSettingToggle('highContrast')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* 음성 안내 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">음성 안내</h4>
              <p className="setting-desc">중요한 내용을 음성으로 읽어줍니다</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  id="voiceGuide"
                  checked={settings.voiceGuide}
                  onChange={() => handleSettingToggle('voiceGuide')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* 알림 설정 */}
        <section className="settings-group">
          <h3 className="group-title">
            <span className="title-icon">🔔</span>
            알림 설정
          </h3>

          {/* 푸시 알림 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">푸시 알림</h4>
              <p className="setting-desc">이음이의 알림을 받습니다</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  id="pushNotification"
                  checked={settings.pushNotification}
                  onChange={() => handleSettingToggle('pushNotification')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* 알림 시간 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">알림 시간</h4>
              <p className="setting-desc">알림을 받을 시간대</p>
            </div>
            <div className="setting-control">
              <button className="setting-button" onClick={setNotificationTime}>
                <span>오전 9시 - 오후 9시</span>
                <span className="arrow">›</span>
              </button>
            </div>
          </div>

          {/* 약 복용 알림 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">약 복용 알림</h4>
              <p className="setting-desc">약 먹을 시간을 알려드려요</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  id="medicineAlert"
                  checked={settings.medicineAlert}
                  onChange={() => handleSettingToggle('medicineAlert')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* 건강 체크 알림 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">건강 체크 알림</h4>
              <p className="setting-desc">매일 건강 기록을 알려드려요</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  id="healthAlert"
                  checked={settings.healthAlert}
                  onChange={() => handleSettingToggle('healthAlert')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* 개인정보 및 보안 */}
        <section className="settings-group">
          <h3 className="group-title">
            <span className="title-icon">🔒</span>
            개인정보 및 보안
          </h3>

          {/* 비밀번호 변경 */}
          <div className="setting-item clickable" onClick={changePassword}>
            <div className="setting-info">
              <h4 className="setting-title">비밀번호 변경</h4>
              <p className="setting-desc">앱 접속 비밀번호를 변경합니다</p>
            </div>
            <div className="setting-control">
              <span className="arrow">›</span>
            </div>
          </div>

          {/* 생체 인증 */}
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-title">지문/얼굴 인증</h4>
              <p className="setting-desc">간편하게 로그인합니다</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  id="biometricAuth"
                  checked={settings.biometricAuth}
                  onChange={() => handleSettingToggle('biometricAuth')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* 데이터 백업 */}
          <div className="setting-item clickable" onClick={backupData}>
            <div className="setting-info">
              <h4 className="setting-title">데이터 백업</h4>
              <p className="setting-desc">건강 기록을 안전하게 보관</p>
            </div>
            <div className="setting-control">
              <span className="arrow">›</span>
            </div>
          </div>
        </section>

        {/* 기타 설정 */}
        <section className="settings-group">
          <h3 className="group-title">
            <span className="title-icon">⚙️</span>
            기타 설정
          </h3>

          {/* 사용법 다시 보기 */}
          <div className="setting-item clickable" onClick={showTutorial}>
            <div className="setting-info">
              <h4 className="setting-title">사용법 다시 보기</h4>
              <p className="setting-desc">앱 사용 방법을 다시 확인</p>
            </div>
            <div className="setting-control">
              <span className="arrow">›</span>
            </div>
          </div>

          {/* 도움말 */}
          <div className="setting-item clickable" onClick={showHelp}>
            <div className="setting-info">
              <h4 className="setting-title">도움말</h4>
              <p className="setting-desc">자주 묻는 질문</p>
            </div>
            <div className="setting-control">
              <span className="arrow">›</span>
            </div>
          </div>

          {/* 문의하기 */}
          <div className="setting-item clickable" onClick={contactSupport}>
            <div className="setting-info">
              <h4 className="setting-title">문의하기</h4>
              <p className="setting-desc">도움이 필요하시면 연락주세요</p>
            </div>
            <div className="setting-control">
              <span className="arrow">›</span>
            </div>
          </div>

          {/* 앱 정보 */}
          <div className="setting-item clickable" onClick={showAppInfo}>
            <div className="setting-info">
              <h4 className="setting-title">앱 정보</h4>
              <p className="setting-desc">버전 1.0.0</p>
            </div>
            <div className="setting-control">
              <span className="arrow">›</span>
            </div>
          </div>
        </section>

        {/* 로그아웃 버튼 */}
        <div className="logout-container">
          <button className="logout-button" onClick={logout}>
            로그아웃
          </button>
        </div>
      </main>

      {/* 테마 선택 모달 */}
      {showThemeModal && (
        <div className="theme-modal" id="themeModal">
          <div className="modal-content">
            <h3 className="modal-title">테마 색상 선택</h3>
            <div className="theme-options">
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="ocean"
                  checked={selectedTheme === 'ocean'}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                />
                <div className="theme-card">
                  <span className="theme-emoji">🌊</span>
                  <span className="theme-name">바다</span>
                  <div className="theme-colors ocean"></div>
                </div>
              </label>

              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="sunset"
                  checked={selectedTheme === 'sunset'}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                />
                <div className="theme-card">
                  <span className="theme-emoji">🌅</span>
                  <span className="theme-name">노을</span>
                  <div className="theme-colors sunset"></div>
                </div>
              </label>

              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="forest"
                  checked={selectedTheme === 'forest'}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                />
                <div className="theme-card">
                  <span className="theme-emoji">🌳</span>
                  <span className="theme-name">숲</span>
                  <div className="theme-colors forest"></div>
                </div>
              </label>

              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="lavender"
                  checked={selectedTheme === 'lavender'}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                />
                <div className="theme-card">
                  <span className="theme-emoji">💜</span>
                  <span className="theme-name">라벤더</span>
                  <div className="theme-colors lavender"></div>
                </div>
              </label>

              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="rose"
                  checked={selectedTheme === 'rose'}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                />
                <div className="theme-card">
                  <span className="theme-emoji">🌹</span>
                  <span className="theme-name">장미</span>
                  <div className="theme-colors rose"></div>
                </div>
              </label>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={closeThemeSelector}>취소</button>
              <button className="btn btn-primary" onClick={applyTheme}>적용</button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <nav className="nav-bottom">
        <button className="nav-item active">
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

export default Settings;
