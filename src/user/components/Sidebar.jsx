import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../shared/assets/logo.svg';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import { STORAGE_KEYS } from '../../shared/constants/storage';

const pinnedRooms = [
  {
    id: 'new-chat',
    title: '새 채팅',
    description: '빈 대화를 시작합니다',
    icon: '✏️',
    svgIcon: '/assets/new_chat.svg',
  },
  {
    id: 'policy-info',
    title: '정책 정보',
    description: '정책/제도 안내를 받아보세요',
    icon: '📚',
    svgIcon: '/assets/documents.svg',
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
}) {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

    // localStorage 정리
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.USER_THEME);
    localStorage.removeItem(STORAGE_KEYS.USER_ONBOARDING);
    localStorage.removeItem(STORAGE_KEYS.USER_VISITED);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_USER);

    // OAuth 임시 데이터 삭제
    localStorage.removeItem(STORAGE_KEYS.OAUTH_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_REALNAME);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_USERNAME);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_BIRTHDATE);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_GENDER);
    localStorage.removeItem(STORAGE_KEYS.OAUTH_PHONE);

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
          </button>
        ))}
      </div>

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
