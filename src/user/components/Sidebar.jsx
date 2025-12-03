import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../shared/assets/logo.svg';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import { STORAGE_KEYS, clearAllUserData } from '../../shared/constants/storage';

const pinnedRooms = [
  {
    id: 'new-chat',
    title: '새 채팅',
    description: '빈 대화를 시작합니다',
    icon: '✏️',
    svgIcon: '/assets/new_chat.svg',
  },
  {
    id: 'ieum-talk',
    title: '이음이 톡',
    description: '대화/정책 RAG로 먼저 제안하는 자동 상담',
    icon: '💬',
    svgIcon: '/assets/eume_chat.svg',
    badge: 'AUTO',
  },
];

function Sidebar({
  isSidebarOpen,
  onToggleSidebar,
  selectedChatId,
  onActionClick,
  chatHistory,
  onSelectRoom,
  userInfo,
  isUserMenuOpen,
  setIsUserMenuOpen,
  chatListPagination = { page: 0, hasMore: false, isLoading: false },
  onLoadMoreChatList,
  hasNewEumeMessage = false,
}) {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const chatHistoryListRef = useRef(null);

  // 채팅 목록 무한 스크롤
  useEffect(() => {
    const container = chatHistoryListRef.current;
    if (!container || !isSidebarOpen) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // 맨 아래에서 50px 이내일 때 추가 로드
      if (scrollHeight - scrollTop - clientHeight < 50) {
        if (chatListPagination.hasMore && !chatListPagination.isLoading && onLoadMoreChatList) {
          onLoadMoreChatList();
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isSidebarOpen, chatListPagination, onLoadMoreChatList]);

  // 로그인 여부 확인
  const isLoggedIn = () => {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    const oauthUser = localStorage.getItem(STORAGE_KEYS.OAUTH_USER);
    return !!(userInfo || oauthUser);
  };

  // 채팅 버튼 클릭 핸들러
  const handleRoomClick = (roomId) => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    onActionClick(roomId);
  };

  // 로그인 페이지로 이동
  const goToLogin = () => {
    setShowLoginModal(false);
    navigate('/user/login');
  };

  const handleLogout = async () => {
    try {
      // 백엔드 로그아웃 API 호출 (쿠키 삭제)
      await axiosInstance.post(API_ENDPOINTS.USER.LOGOUT);
    } catch (error) {
      console.error('로그아웃 API 오류:', error);
    }

    // localStorage 정리 (테마 제외 모든 사용자 데이터 삭제)
    clearAllUserData();

    setIsUserMenuOpen(false);
    navigate('/user/login');
  };

  const handleOpenSettings = () => {
    navigate('/user/settings');
    setIsUserMenuOpen(false);
  };

  const handleOpenSidebar = () => {
    if (!isSidebarOpen) {
      onToggleSidebar();
    }
  };

  const handleCloseSidebar = () => {
    if (isSidebarOpen) {
      onToggleSidebar();
    }
  };

  return (
    <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        {!isSidebarOpen ? (
          <div className="sidebar-logo-container group" onClick={handleOpenSidebar} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="EUME Logo" className="group-hover:hidden" />
            <img src="/assets/sidebar_close.svg" alt="사이드바 열기" className="hidden group-hover:block sidebar-close-rotate" />
          </div>
        ) : (
          <>
            <div className="sidebar-logo-container">
              <img src={logo} alt="EUME Logo" />
            </div>
            <button className="sidebar-close-btn" onClick={handleCloseSidebar} aria-label="사이드바 닫기">
              <img src="/assets/sidebar_close.svg" alt="닫기" />
            </button>
          </>
        )}
      </div>

      <div className="sidebar-actions-collapsed">
        {pinnedRooms.map((room) => (
          <button
            key={room.id}
            className={`sidebar-icon-btn group ${selectedChatId === room.id ? 'active' : ''}`}
            onClick={() => handleRoomClick(room.id)}
            title={room.title}
            aria-label={room.title}
            style={{ position: 'relative' }}
          >
            <object
              data={room.svgIcon}
              type="image/svg+xml"
              width="24"
              height="24"
              style={{ pointerEvents: 'none' }}
            >
              <span style={{ fontSize: '24px' }}>{room.icon}</span>
            </object>
            {isSidebarOpen && <span className="sidebar-icon-text">{room.title}</span>}
            {/* 이음이 톡 새 메시지 알림 표시 */}
            {room.id === 'ieum-talk' && hasNewEumeMessage && (
              <span
                className="new-message-badge"
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: isSidebarOpen ? '8px' : '4px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#EF4444',
                  borderRadius: '50%',
                  border: '2px solid var(--bg-primary)',
                  animation: 'pulse 2s infinite',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 채팅방 목록 (사이드바가 열렸을 때만 표시) */}
      {isSidebarOpen && chatHistory && chatHistory.length > 0 && (
        <div className="sidebar-chat-history">
          <div className="chat-history-header">
            <span>채팅 기록</span>
          </div>
          <div className="chat-history-list" ref={chatHistoryListRef}>
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className={`chat-history-item ${selectedChatId === chat.id ? 'active' : ''}`}
                onClick={() => onSelectRoom(chat.id)}
                title={chat.title}
              >
                <span className="chat-history-icon">💬</span>
                <div className="chat-history-info">
                  <span className="chat-history-title">{chat.title}</span>
                  <span className="chat-history-time">{chat.updatedAt}</span>
                </div>
              </button>
            ))}
            {/* 무한 스크롤 로딩 인디케이터 */}
            {chatListPagination.isLoading && (
              <div style={{ textAlign: 'center', padding: '10px', color: '#888', fontSize: '12px' }}>
                불러오는 중...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sidebar-spacer"></div>

      <div className="sidebar-profile-collapsed">
        <div className="profile-avatar-small">
          {userInfo.profileImage ? (
            <img src={userInfo.profileImage} alt="프로필" />
          ) : (
            <span>{userInfo.userName?.[0] || '유'}</span>
          )}
        </div>
      </div>

      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div
          className="modal-overlay"
          style={{ display: 'flex' }}
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="modal-container"
            style={{ maxWidth: '400px', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">로그인이 필요합니다</h3>
              <button
                className="modal-close"
                onClick={() => setShowLoginModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <p style={{ marginBottom: '8px', color: '#374151' }}>
                채팅 기능을 사용하려면 로그인이 필요합니다.
              </p>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>
                Google 계정으로 간편하게 로그인하세요.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowLoginModal(false)}
              >
                취소
              </button>
              <button
                className="btn-primary"
                onClick={goToLogin}
              >
                로그인하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
