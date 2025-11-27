import { useNavigate } from 'react-router-dom';
import logo from '../../shared/assets/logo.svg';

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
            onClick={() => onActionClick(room.id)}
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
    </div>
  );
}

export default Sidebar;
