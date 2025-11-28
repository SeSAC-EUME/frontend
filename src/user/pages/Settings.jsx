import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { useTheme } from '../../shared/contexts/ThemeContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import { STORAGE_KEYS, clearAllUserData } from '../../shared/constants/storage';
import { toBackendTheme } from '../../shared/utils/themeMapper';

function Settings() {
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: '',
    email: '',
    userName: '사용자',
    nickname: '',
    profileImage: '',
  });
  const [textSize, setTextSizeState] = useState('large');
  const [selectedTheme, setSelectedTheme] = useState('ocean');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [settings, setSettings] = useState({
    textSize: 'large',
    theme: 'ocean',
    highContrast: false,
    voiceGuide: false,
    pushNotification: true,
  });

  // Toast 메시지 표시 함수
  const showToast = (message) => {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 2500);
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
    // 사용자 정보 로드
    const storedUser = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.USER_INFO) || '{}'
    );
    setUserInfo({
      userId: storedUser.id || storedUser.userId || '',
      email: storedUser.email || '',
      userName: storedUser.userName || storedUser.name || '사용자',
      nickname: storedUser.nickname || '',
      profileImage: storedUser.profileImage || '',
    });

    // 테마 로드
    const storedTheme = localStorage.getItem(STORAGE_KEYS.USER_THEME);
    if (storedTheme) {
      setSelectedTheme(storedTheme);
      setSettings((prev) => ({ ...prev, theme: storedTheme }));
    }

    // 설정 로드
    const stored = localStorage.getItem('eume_settings');
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsedSettings }));
        if (parsedSettings.textSize) setTextSizeState(parsedSettings.textSize);
        if (parsedSettings.theme) {
          setSelectedTheme(parsedSettings.theme);
        }
      } catch (e) {
        console.error('설정 로드 오류:', e);
      }
    }
  }, []);

  // body 클래스 적용 (textSize, theme, highContrast)
  useEffect(() => {
    const body = document.body;
    body.className = '';
    body.classList.add(`theme-${settings.theme}`);

    if (settings.textSize === 'large') {
      body.classList.add('text-large');
    } else if (settings.textSize === 'xlarge') {
      body.classList.add('text-xlarge');
    }

    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }
  }, [settings.theme, settings.textSize, settings.highContrast]);

  // 글자 크기 변경
  const handleTextSizeChange = (size) => {
    const body = document.body;
    body.classList.remove('text-large', 'text-xlarge');

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
    setSelectedTheme(settings.theme);
    setShowThemeModal(true);
  };

  // 테마 선택 모달 닫기
  const closeThemeSelector = () => {
    setShowThemeModal(false);
  };

  // 테마 적용 (백엔드 동기화 포함)
  const applyTheme = async () => {
    const themeValue = selectedTheme;

    // ThemeContext 업데이트 (다른 화면 즉시 반영)
    setTheme(themeValue);

    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '').trim();
    body.classList.add(`theme-${themeValue}`);

    if (settings.textSize === 'large') {
      body.classList.add('text-large');
    } else if (settings.textSize === 'xlarge') {
      body.classList.add('text-xlarge');
    }
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    }

    const newSettings = { ...settings, theme: themeValue };
    setSettings(newSettings);
    saveSettings(newSettings);

    // localStorage에도 테마 저장
    localStorage.setItem(STORAGE_KEYS.USER_THEME, themeValue);

    // 백엔드에 테마 동기화
    try {
      await axiosInstance.put(API_ENDPOINTS.USER.ME, {
        backgroundTheme: toBackendTheme(themeValue),
      });
      console.log('테마 백엔드 동기화 완료');
    } catch (error) {
      console.error('테마 백엔드 동기화 실패:', error);
      // 로컬 저장은 성공했으므로 에러 표시하지 않음
    }

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
        showToast(newValue ? '음성 안내가 켜졌습니다' : '음성 안내가 꺼졌습니다');
        break;
      case 'pushNotification':
        showToast(newValue ? '푸시 알림이 켜졌습니다' : '푸시 알림이 꺼졌습니다');
        break;
      default:
        break;
    }
  };

  // 계정 비활성화
  const handleDeactivate = async () => {
    if (!window.confirm('계정을 비활성화하시겠습니까?\n언제든 다시 로그인하여 활성화할 수 있습니다.')) {
      return;
    }

    try {
      await axiosInstance.post(API_ENDPOINTS.USER.DEACTIVATE);
      alert('계정이 비활성화되었습니다.');
      // 로그아웃 처리
      performLogout();
    } catch (error) {
      console.error('계정 비활성화 오류:', error);
      if (error.response?.status === 409) {
        alert('이미 비활성화된 계정입니다.');
      } else {
        alert('계정 비활성화 중 오류가 발생했습니다.');
      }
    }
  };

  // 회원 탈퇴
  const handleWithdraw = async () => {
    const confirmMessage = '정말 탈퇴하시겠습니까?\n\n모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // 2차 확인
    const finalConfirm = window.prompt('탈퇴를 진행하려면 "탈퇴합니다"를 입력해주세요.');
    if (finalConfirm !== '탈퇴합니다') {
      alert('입력이 일치하지 않아 탈퇴가 취소되었습니다.');
      return;
    }

    try {
      await axiosInstance.post(API_ENDPOINTS.USER.WITHDRAW);
      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
      // 모든 로컬 데이터 삭제 후 로그인 페이지로
      performLogout();
    } catch (error) {
      console.error('회원 탈퇴 오류:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다.');
    }
  };

  // 로컬 데이터 정리 및 로그인 페이지로 이동
  const performLogout = () => {
    // localStorage 정리 (테마 제외 모든 사용자 데이터 삭제)
    clearAllUserData();
    localStorage.removeItem('eume_settings');

    navigate('/user/login');
  };

  // 로그아웃
  const logout = async () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      try {
        // 백엔드 로그아웃 API 호출 (쿠키 삭제)
        await axiosInstance.post(API_ENDPOINTS.USER.LOGOUT);
      } catch (error) {
        console.error('로그아웃 API 오류:', error);
        // API 실패해도 로컬 데이터는 삭제
      }

      // localStorage 정리 (테마 제외 모든 사용자 데이터 삭제)
      clearAllUserData();
      localStorage.removeItem('eume_settings');

      showToast('로그아웃되었습니다');
      setTimeout(() => {
        navigate('/user/login');
      }, 1000);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleActionClick = (id) => {
    navigate('/user/home');
  };

  const themeNames = {
    ocean: '🌊 바다',
    sunset: '🌅 노을',
    forest: '🌳 숲',
    lavender: '💜 라벤더',
    rose: '🌹 장미'
  };

  return (
    <div className={`theme-${currentTheme} home-page`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        selectedChatId=""
        onActionClick={handleActionClick}
        chatHistory={[]}
        onSelectRoom={() => {}}
        userInfo={userInfo}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
      />

      <div className="chat-main" style={{ marginLeft: isSidebarOpen ? 320 : 60 }}>
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

        <div className="chat-messages">
          <div className="settings-container">
            <h1 className="settings-title">마이페이지</h1>

            {/* 프로필 섹션 */}
            <section className="profile-section">
              <div className="profile-card">
                <div className="profile-avatar">
                  {userInfo.profileImage ? (
                    <img src={userInfo.profileImage} alt="프로필" />
                  ) : (
                    <span className="avatar-emoji">👤</span>
                  )}
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">{userInfo.userName || '사용자'}</h2>
                  <p className="profile-desc">{userInfo.email}</p>
                  {userInfo.nickname && <p className="profile-nickname">@{userInfo.nickname}</p>}
                </div>
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
                      onClick={() => handleTextSizeChange('normal')}
                    >
                      <span className="size-preview small">가</span>
                      <span className="size-label">보통</span>
                    </button>
                    <button
                      className={`size-option ${textSize === 'large' ? 'active' : ''}`}
                      onClick={() => handleTextSizeChange('large')}
                    >
                      <span className="size-preview medium">가</span>
                      <span className="size-label">크게</span>
                    </button>
                    <button
                      className={`size-option ${textSize === 'xlarge' ? 'active' : ''}`}
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
                    <span className="current-theme">{themeNames[settings.theme]}</span>
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
                      checked={settings.pushNotification}
                      onChange={() => handleSettingToggle('pushNotification')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* 계정 관리 */}
            <section className="settings-group">
              <h3 className="group-title">
                <span className="title-icon">👤</span>
                계정 관리
              </h3>

              {/* 로그아웃 */}
              <div className="setting-item">
                <div className="setting-info">
                  <h4 className="setting-title">로그아웃</h4>
                  <p className="setting-desc">현재 계정에서 로그아웃합니다</p>
                </div>
                <div className="setting-control">
                  <button className="setting-button" onClick={logout}>
                    로그아웃
                  </button>
                </div>
              </div>

              {/* 계정 비활성화 */}
              <div className="setting-item">
                <div className="setting-info">
                  <h4 className="setting-title">계정 비활성화</h4>
                  <p className="setting-desc">계정을 일시적으로 비활성화합니다. 언제든 다시 로그인하여 활성화할 수 있습니다.</p>
                </div>
                <div className="setting-control">
                  <button className="setting-button warning" onClick={handleDeactivate}>
                    비활성화
                  </button>
                </div>
              </div>

              {/* 회원 탈퇴 */}
              <div className="setting-item">
                <div className="setting-info">
                  <h4 className="setting-title">회원 탈퇴</h4>
                  <p className="setting-desc">모든 데이터가 삭제되며 복구할 수 없습니다.</p>
                </div>
                <div className="setting-control">
                  <button className="setting-button danger" onClick={handleWithdraw}>
                    탈퇴하기
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 테마 선택 모달 */}
      {showThemeModal && (
        <div className="theme-modal">
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
    </div>
  );
}

export default Settings;
