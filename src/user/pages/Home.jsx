import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { useTheme } from '../../shared/contexts/ThemeContext';

const pinnedRooms = [
  {
    id: 'new-chat',
    title: '새 채팅',
    description: '빈 대화를 시작합니다',
    icon: '＋',
  },
  {
    id: 'policy-info',
    title: '정책 정보',
    description: '정책/제도 안내를 받아보세요',
    icon: '⚖️',
  },
  {
    id: 'ieum-talk',
    title: '이음이 톡',
    description: '대화/정책 RAG로 먼저 제안하는 자동 상담',
    icon: '🤖',
    badge: 'AUTO',
  },
];

const defaultHistory = [
  { id: 'h-1', title: '세상 목욕 제공', updatedAt: '방금 전' },
  { id: 'h-2', title: 'TTS 기능 제공 여부', updatedAt: '오늘' },
  { id: 'h-3', title: '학점은행제 자격증 인정', updatedAt: '오늘' },
  { id: 'h-4', title: 'R 언어 개요 설명', updatedAt: '오늘' },
  { id: 'h-5', title: '자동 sql 실행 방법', updatedAt: '오늘' },
];

const initialMessages = {
  'ieum-talk': [
    {
      id: 'msg-1',
      text: '안녕하세요, 오늘 하루는 어떠셨어요?',
      sender: 'ai',
      timestamp: '09:12',
    },
  ],
  'policy-info': [
    {
      id: 'msg-2',
      text: '필요한 정책 키워드를 알려주시면 바로 찾아볼게요.',
      sender: 'ai',
      timestamp: '09:10',
    },
  ],
  'new-chat': [],
};

const emptyUser = {
  userId: '',
  email: '',
  userName: '사용자',
  nickname: '',
  profileImage: '',
};

function Home() {
  const navigate = useNavigate();
  const { theme: currentTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [messagesByRoom, setMessagesByRoom] = useState(initialMessages);
  const [isStreamingByRoom, setIsStreamingByRoom] = useState({});
  const [chatHistory, setChatHistory] = useState(defaultHistory);
  const [selectedChatId, setSelectedChatId] = useState('ieum-talk');
  const [userInfo, setUserInfo] = useState(emptyUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo({
      userId: storedUser.userId || '',
      email: storedUser.email || '',
      userName: storedUser.name || '사용자',
      nickname: storedUser.nickname || '',
      profileImage: storedUser.profileImage || '',
    });
  }, []);

  const selectedChat = useMemo(() => {
    return (
      pinnedRooms.find((room) => room.id === selectedChatId) ||
      chatHistory.find((room) => room.id === selectedChatId) ||
      pinnedRooms[0]
    );
  }, [chatHistory, selectedChatId]);

  const currentMessages = messagesByRoom[selectedChatId] || [];
  const isStreaming = !!isStreamingByRoom[selectedChatId];

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages, isStreaming, selectedChatId]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleSelectRoom = (roomId) => {
    setSelectedChatId(roomId);
    setMessagesByRoom((prev) =>
      prev[roomId] ? prev : { ...prev, [roomId]: [] }
    );
    setPrompt('');
    setIsSidebarOpen(false);
  };

  const handleStartNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newEntry = { id: newId, title: '새 채팅', updatedAt: '방금 전' };
    setChatHistory((prev) => [newEntry, ...prev]);
    setMessagesByRoom((prev) => ({ ...prev, [newId]: [] }));
    handleSelectRoom(newId);
  };

  const handleActionClick = (id) => {
    if (id === 'new-chat') {
      handleStartNewChat();
      return;
    }
    handleSelectRoom(id);
  };

  const handleSendMessage = () => {
    if (!prompt.trim()) return;

    const roomId = selectedChatId;
    const roomTitle = selectedChat?.title || '이음이';
    const timestamp = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage = {
      id: `user-${Date.now()}`,
      text: prompt.trim(),
      sender: 'user',
      timestamp,
    };

    setMessagesByRoom((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), userMessage],
    }));
    setPrompt('');

    setChatHistory((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, updatedAt: '지금' } : room
      )
    );

    setIsStreamingByRoom((prev) => ({ ...prev, [roomId]: true }));

    setTimeout(() => {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: `${roomTitle}에서 답변을 준비하고 있어요.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), aiMessage],
      }));
      setIsStreamingByRoom((prev) => ({
        ...prev,
        [roomId]: false,
      }));
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('eume_user_token');
    localStorage.removeItem('eume_onboarding_complete');
    localStorage.removeItem('eume_visited');
    setIsUserMenuOpen(false);
    navigate('/user/login');
  };

  const handleOpenSettings = () => {
    navigate('/user/settings');
    setIsUserMenuOpen(false);
  };

  const hasMessages = currentMessages.length > 0;

  return (
    <div className={`theme-${currentTheme} home-page`}>
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">ChatGPT</div>
          <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="사이드바 닫기">
            ×
          </button>
        </div>

        <div className="sidebar-actions">
          {pinnedRooms.map((room) => (
            <button
              key={room.id}
              className={`sidebar-action ${selectedChatId === room.id ? 'active' : ''}`}
              onClick={() => handleActionClick(room.id)}
            >
              <span className="action-icon" aria-hidden>
                {room.icon}
              </span>
              <div className="action-text">
                <div className="action-title">
                  {room.title}
                  {room.badge ? <span className="ieum-badge">{room.badge}</span> : null}
                </div>
                <div className="action-desc">{room.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="chat-list-section">
          <div className="chat-section-title">채팅 목록</div>
          <div className="chat-rooms-list">
            {chatHistory.map((room) => (
              <div
                key={room.id}
                className={`chat-room-item ${selectedChatId === room.id ? 'active' : ''}`}
                onClick={() => handleSelectRoom(room.id)}
              >
                <div className="room-title">{room.title}</div>
                <div className="room-timestamp">{room.updatedAt}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <div
            className="sidebar-profile"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div className="profile-avatar">
              {userInfo.profileImage ? (
                <img src={userInfo.profileImage} alt="프로필" />
              ) : (
                <span>{userInfo.userName?.[0] || '유'}</span>
              )}
            </div>
            <div className="profile-meta">
              <div className="profile-name">{userInfo.userName}</div>
              <div className="profile-email">{userInfo.email || '이메일 미등록'}</div>
            </div>
            {isUserMenuOpen ? (
              <div className="user-menu-dropdown">
                <button className="user-menu-item" onClick={handleOpenSettings}>
                  설정
                </button>
                <button className="user-menu-item" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="chat-main" style={{ marginLeft: isSidebarOpen ? 320 : 0 }}>
        <div className="chat-main-header">
          <button className="menu-btn" onClick={toggleSidebar} aria-label="사이드바 열기">
            ☰
          </button>
          <div className="header-center">
            <h1 className="chat-title">ChatGPT</h1>
            <p className="chat-subtitle">무엇이든 물어보세요</p>
          </div>
        </div>

        <div className="chat-messages" ref={messagesContainerRef}>
          {!hasMessages ? (
            <div className="chat-welcome">
              <h2 className="welcome-title">어디서부터 시작할까요?</h2>
              <div className="prompt-bar prompt-bar-large">
                <span className="prompt-icon">＋</span>
                <input
                  className="prompt-input"
                  placeholder="무엇이든 물어보세요"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <div className="prompt-actions">
                  <button className="prompt-action" aria-label="음성 입력">🎙️</button>
                  <button className="prompt-action" aria-label="업로드">⬆️</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentMessages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-content">
                    <div className="message-text">{msg.text}</div>
                    <div className="message-timestamp">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              {isStreaming ? (
                <div className="message ai">
                  <div className="message-content">
                    <div className="message-text">답변 작성 중...</div>
                    <div className="message-timestamp">지금</div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {hasMessages && (
          <div
            className="chat-input-container"
            style={
              isSidebarOpen
                ? { left: 320, width: 'calc(100% - 320px)' }
                : { left: 0, width: '100%' }
            }
          >
            <div className="chat-input-wrapper chat-input-floating">
              <textarea
                className="chat-input"
                placeholder="메시지를 입력하세요..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
              />
              <button className="send-btn" onClick={handleSendMessage} disabled={!prompt.trim()}>
                ➤
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
