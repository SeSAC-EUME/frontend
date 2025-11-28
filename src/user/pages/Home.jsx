import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/user.css';
import { useTheme } from '../../shared/contexts/ThemeContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import axiosRaw from '../../shared/api/axiosRaw';
import { STORAGE_KEYS } from '../../shared/constants/storage';

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
  const { theme: currentTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messagesByRoom, setMessagesByRoom] = useState(initialMessages);
  const [isStreamingByRoom, setIsStreamingByRoom] = useState({});
  const [chatHistory, setChatHistory] = useState(defaultHistory);
  const [selectedChatId, setSelectedChatId] = useState('ieum-talk');
  const [userInfo, setUserInfo] = useState(emptyUser);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const messagesContainerRef = useRef(null);

  // 사용자 정보 및 채팅방 초기화
  useEffect(() => {
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

    // Eume AI 채팅방 초기화
    initializeEumeChat();
  }, []);

  // Eume AI 채팅방 생성 또는 조회
  const initializeEumeChat = async () => {
    try {
      // POST /api/eume-chats (201: 새로 생성, 409: 이미 존재)
      const response = await axiosRaw.post(API_ENDPOINTS.EUME_CHAT.CREATE);
      if (response.status === 201) {
        console.log('Eume 채팅방 생성:', response.data);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        // 이미 채팅방 존재 - 기존 채팅 내역 로드
        console.log('기존 Eume 채팅방 사용');
        await loadExistingChat();
      } else {
        console.error('채팅방 초기화 오류:', error);
      }
    }
  };

  // 기존 채팅 내역 로드
  const loadExistingChat = async () => {
    try {
      const chatInfo = await axiosInstance.get(API_ENDPOINTS.EUME_CHAT.ME);
      console.log('기존 채팅 정보:', chatInfo);
      // 채팅 내역이 있으면 메시지 상태에 반영
      // 백엔드 응답 구조에 따라 추가 구현 필요
    } catch (error) {
      console.error('채팅 내역 로드 오류:', error);
    }
  };

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

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const roomId = selectedChatId;
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
    const messageText = prompt.trim();
    setPrompt('');

    setChatHistory((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, updatedAt: '지금' } : room
      )
    );

    setIsStreamingByRoom((prev) => ({ ...prev, [roomId]: true }));

    try {
      // ieum-talk인 경우 Eume AI API 호출
      if (roomId === 'ieum-talk') {
        // 먼저 채팅방 ID 조회
        const chatInfo = await axiosInstance.get(API_ENDPOINTS.EUME_CHAT.ME);
        const chatListId = chatInfo.id;

        // POST /api/eume-chats/{chatListId}/contents
        const response = await axiosInstance.post(
          API_ENDPOINTS.EUME_CHAT.CONTENTS(chatListId),
          { messageContent: messageText }
        );

        // 백엔드 응답에서 AI 메시지 추출
        const aiMessage = {
          id: `ai-${Date.now()}`,
          text: response.eumeMessage?.messageContent || '답변을 생성할 수 없습니다.',
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
      } else {
        // 기타 채팅방은 기존 목업 로직 유지
        setTimeout(() => {
          const aiMessage = {
            id: `ai-${Date.now()}`,
            text: '이 기능은 아직 준비 중입니다.',
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
        }, 600);
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: '메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), errorMessage],
      }));
    } finally {
      setIsStreamingByRoom((prev) => ({
        ...prev,
        [roomId]: false,
      }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const hasMessages = currentMessages.length > 0;

  return (
    <div className={`theme-${currentTheme} home-page`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        selectedChatId={selectedChatId}
        onActionClick={handleActionClick}
        chatHistory={chatHistory}
        onSelectRoom={handleSelectRoom}
        userInfo={userInfo}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
      />

      <div className="chat-main" style={{ marginLeft: isSidebarOpen ? 320 : 60 }}>
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

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
