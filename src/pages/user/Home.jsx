import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';
import { API_ENDPOINTS } from '../../api/config';
import axiosInstance from '../../api/axios';
import { useTheme } from '../../contexts/ThemeContext';

function Home() {
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAiSelectorOpen, setIsAiSelectorOpen] = useState(false);
  const [selectedAi, setSelectedAi] = useState('gemini');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatRooms, setChatRooms] = useState([
    { id: 1, title: '오늘의 대화', lastMessage: '안녕하세요!', timestamp: '방금 전' },
    { id: 2, title: '어제 대화', lastMessage: '오늘 기분이 어떠세요?', timestamp: '어제' },
    { id: 3, title: '일주일 전', lastMessage: '건강 체크를 해볼까요?', timestamp: '1주일 전' },
  ]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState({
    userId: '',
    email: '',
    userName: '',
    nickname: '',
    birthDate: '',
    gender: '',
    phone: '',
    profileImage: '',
    backgroundTheme: 'ocean',
  });

  // 수정용 임시 상태
  const [editFormData, setEditFormData] = useState({ ...userInfo });

  // AI 모델 목록
  const aiModels = [
    { id: 'gemini', name: 'Google Gemini', icon: '🤖', description: '구글의 강력한 AI' },
    { id: 'chatgpt', name: 'ChatGPT', icon: '💬', description: 'OpenAI의 대화형 AI' },
    { id: 'claude', name: 'Claude', icon: '🧠', description: 'Anthropic의 안전한 AI' },
    { id: 'grok', name: 'Grok', icon: '⚡', description: 'xAI의 실시간 AI' },
  ];

  useEffect(() => {
    // AI 모델 로드
    const savedAi = localStorage.getItem('eume_ai_model') || 'gemini';
    setSelectedAi(savedAi);

    // 사용자 정보 로드
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const loadedUserInfo = {
      userId: user.userId || '',
      email: user.email || localStorage.getItem('eume_email') || '',
      userName: user.name || localStorage.getItem('eume_userName') || '사용자',
      nickname: user.nickname || localStorage.getItem('eume_userName') || '사용자',
      birthDate: localStorage.getItem('eume_birthDate') || '',
      gender: localStorage.getItem('eume_gender') || '',
      phone: localStorage.getItem('eume_phone') || '',
      profileImage: user.profileImage || '',
      backgroundTheme: currentTheme,
    };
    setUserInfo(loadedUserInfo);
    setEditFormData(loadedUserInfo);
  }, [currentTheme]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const openEditProfile = () => {
    setIsEditProfileOpen(true);
    setIsProfileOpen(false);
  };

  const closeEditProfile = () => {
    setIsEditProfileOpen(false);
    setEditFormData({ ...userInfo });
  };

  const openAiSelector = () => {
    setIsAiSelectorOpen(true);
  };

  const closeAiSelector = () => {
    setIsAiSelectorOpen(false);
  };

  const handleAiSelect = (aiId) => {
    setSelectedAi(aiId);
    localStorage.setItem('eume_ai_model', aiId);
    closeAiSelector();
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        userId: editFormData.userId,
        email: editFormData.email,
        userPw: '', // 비밀번호는 별도 변경
        userName: editFormData.userName,
        nickname: editFormData.nickname,
        loginType: 'SOCIAL',
        providerId: '',
        groupId: '',
        birthDate: editFormData.birthDate,
        gender: editFormData.gender,
        phone: editFormData.phone,
        profileImage: editFormData.profileImage,
        backgroundTheme: editFormData.backgroundTheme || 'ocean',
      };

      await axiosInstance.put(API_ENDPOINTS.USER.UPDATE, updateData);

      // 로컬 상태 업데이트
      setUserInfo(editFormData);

      // 전역 테마 업데이트 (즉시 사이드바 색상 반영)
      const themeToSave = editFormData.backgroundTheme || 'ocean';
      setTheme(themeToSave);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...user,
        name: editFormData.userName,
        email: editFormData.email,
        backgroundTheme: themeToSave,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('프로필이 성공적으로 수정되었습니다!');
      closeEditProfile();
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      alert('프로필 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      // 로컬스토리지 클리어
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('eume_auth_token');
      localStorage.removeItem('eume_session');

      alert('로그아웃되었습니다.');
      navigate('/user/login');
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');

      // AI 응답 시뮬레이션
      setTimeout(() => {
        const currentAi = aiModels.find(ai => ai.id === selectedAi);
        const aiResponse = {
          id: Date.now() + 1,
          text: `안녕하세요! ${currentAi?.name || 'AI'}입니다. 무엇을 도와드릴까요?`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const getThemeEmoji = (theme) => {
    const themeEmojis = {
      ocean: '🌊',
      sunset: '🌅',
      forest: '🌳',
      lavender: '💜',
      rose: '🌹'
    };
    return themeEmojis[theme] || '🌊';
  };

  const getCurrentAiModel = () => {
    return aiModels.find(ai => ai.id === selectedAi) || aiModels[0];
  };

  return (
    <div className={`theme-${currentTheme} home-page`}>
      {/* 좌측 사이드바 (채팅방 목록) */}
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">이전 대화</h2>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
        <div className="chat-rooms-list">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              className={`chat-room-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
              onClick={() => selectRoom(room)}
            >
              <div className="room-title">{room.title}</div>
              <div className="room-last-message">{room.lastMessage}</div>
              <div className="room-timestamp">{room.timestamp}</div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <button className="new-chat-btn">+ 새 대화</button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 로그아웃
          </button>
        </div>
      </div>

      {/* 오버레이 */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* 메인 채팅 영역 */}
      <div className="chat-main">
        {/* 헤더 */}
        <div className="chat-main-header">
          <button className="menu-btn" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="header-center">
            <h1 className="chat-title">이음이</h1>
            <button className="ai-model-selector" onClick={openAiSelector}>
              <span className="ai-icon">{getCurrentAiModel().icon}</span>
              <span className="ai-name">{getCurrentAiModel().name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
          </div>
          <button className="profile-btn" onClick={toggleProfile}>
            <div className="profile-avatar">
              {userInfo.profileImage ? (
                <img src={userInfo.profileImage} alt="프로필" />
              ) : (
                <span>👤</span>
              )}
            </div>
          </button>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="welcome-icon">💬</div>
              <h2 className="welcome-title">안녕하세요, {userInfo.userName}님!</h2>
              <p className="welcome-subtitle">무엇을 도와드릴까요?</p>
              <p className="welcome-ai-info">현재 AI: {getCurrentAiModel().name}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-timestamp">{msg.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 입력 영역 */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder={`${getCurrentAiModel().name}에게 메시지를 입력하세요...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage} disabled={!inputMessage.trim()}>
              <span>➤</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI 선택 팝업 */}
      {isAiSelectorOpen && (
        <>
          <div className="profile-overlay" onClick={closeAiSelector}></div>
          <div className="ai-selector-popup">
            <div className="profile-popup-header">
              <h3>AI 모델 선택</h3>
              <button className="close-btn" onClick={closeAiSelector}>
                ✕
              </button>
            </div>
            <div className="ai-models-list">
              {aiModels.map((ai) => (
                <div
                  key={ai.id}
                  className={`ai-model-item ${selectedAi === ai.id ? 'selected' : ''}`}
                  onClick={() => handleAiSelect(ai.id)}
                >
                  <div className="ai-model-icon">{ai.icon}</div>
                  <div className="ai-model-info">
                    <div className="ai-model-name">{ai.name}</div>
                    <div className="ai-model-description">{ai.description}</div>
                  </div>
                  {selectedAi === ai.id && <div className="ai-model-check">✓</div>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 프로필 팝업 */}
      {isProfileOpen && (
        <>
          <div className="profile-overlay" onClick={toggleProfile}></div>
          <div className="profile-popup">
            <div className="profile-popup-header">
              <h3>프로필</h3>
              <button className="close-btn" onClick={toggleProfile}>
                ✕
              </button>
            </div>
            <div className="profile-popup-content">
              <div className="profile-info-avatar">
                {userInfo.profileImage ? (
                  <img src={userInfo.profileImage} alt="프로필" />
                ) : (
                  <div className="avatar-placeholder">👤</div>
                )}
              </div>
              <div className="profile-info-item">
                <span className="info-label">이름</span>
                <span className="info-value">{userInfo.userName}</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">닉네임</span>
                <span className="info-value">{userInfo.nickname}</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">이메일</span>
                <span className="info-value">{userInfo.email}</span>
              </div>
              <div className="profile-info-item">
                <span className="info-label">전화번호</span>
                <span className="info-value">{userInfo.phone || '미등록'}</span>
              </div>
              <button className="edit-profile-btn" onClick={openEditProfile}>
                프로필 수정
              </button>
            </div>
          </div>
        </>
      )}

      {/* 프로필 수정 팝업 */}
      {isEditProfileOpen && (
        <>
          <div className="profile-overlay" onClick={closeEditProfile}></div>
          <div className="profile-edit-popup">
            <div className="profile-popup-header">
              <h3>프로필 수정</h3>
              <button className="close-btn" onClick={closeEditProfile}>
                ✕
              </button>
            </div>
            <div className="profile-edit-content">
              <div className="edit-form-group">
                <label>이름</label>
                <input
                  type="text"
                  value={editFormData.userName}
                  onChange={(e) => handleEditFormChange('userName', e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>닉네임</label>
                <input
                  type="text"
                  value={editFormData.nickname}
                  onChange={(e) => handleEditFormChange('nickname', e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>이메일</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>생년월일</label>
                <input
                  type="date"
                  value={editFormData.birthDate}
                  onChange={(e) => handleEditFormChange('birthDate', e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>성별</label>
                <div className="gender-options">
                  <button
                    type="button"
                    className={`gender-option ${editFormData.gender === 'M' ? 'selected' : ''}`}
                    onClick={() => handleEditFormChange('gender', 'M')}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    className={`gender-option ${editFormData.gender === 'F' ? 'selected' : ''}`}
                    onClick={() => handleEditFormChange('gender', 'F')}
                  >
                    여성
                  </button>
                </div>
              </div>
              <div className="edit-form-group">
                <label>전화번호</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  placeholder="010-1234-5678"
                />
              </div>
              <div className="edit-form-group">
                <label>테마 색상</label>
                <div className="theme-selector-compact">
                  {['ocean', 'sunset', 'forest', 'lavender', 'rose'].map((theme) => (
                    <label key={theme} className="theme-option-compact">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={(editFormData.backgroundTheme || 'ocean') === theme}
                        onChange={() => handleEditFormChange('backgroundTheme', theme)}
                      />
                      <div className={`theme-preview-compact ${theme}`}>
                        <span className="theme-name-compact">
                          {getThemeEmoji(theme)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="edit-form-actions">
                <button className="btn btn-secondary" onClick={closeEditProfile}>
                  취소
                </button>
                <button className="btn btn-primary" onClick={handleUpdateProfile}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
