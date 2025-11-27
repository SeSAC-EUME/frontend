import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/admin.css';
import '../styles/admin-responsive.css';

// 아이콘 import
import menuIcon from '../assets/icons/menu.svg';
import logo from '../../shared/assets/logo.svg';
import userIcon from '../assets/icons/user.svg';
import chevronDownIcon from '../assets/icons/chevron-down.svg';
import chartBarIcon from '../assets/icons/chart-bar.svg';
import usersIcon from '../assets/icons/users.svg';
import heartIcon from '../assets/icons/heart.svg';
import messageCircleIcon from '../assets/icons/message-circle.svg';
import triangleAlertIcon from '../assets/icons/triangle-alert.svg';
import fileTextIcon from '../assets/icons/file-text.svg';
import settingsIcon from '../assets/icons/settings.svg';
import infoIcon from '../assets/icons/info.svg';
import logOutIcon from '../assets/icons/log-out.svg';
import lockIcon from '../assets/icons/lock.svg';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 인증 확인
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const currentUser = localStorage.getItem('eume_admin_user');
    const sessionExpiry = localStorage.getItem('eume_admin_session_expiry');

    if (!currentUser || !sessionExpiry) {
      navigate('/admin/login');
      return;
    }

    const now = Date.now();
    if (now >= parseInt(sessionExpiry)) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      localStorage.removeItem('eume_admin_user');
      localStorage.removeItem('eume_admin_session_expiry');
      navigate('/admin/login');
    }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('eume_admin_user');
      localStorage.removeItem('eume_admin_session_expiry');
      navigate('/admin/login');
    }
  };

  const currentUser = JSON.parse(localStorage.getItem('eume_admin_user') || '{}');

  // 현재 경로에 따라 active 메뉴 결정
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-page">
      {/* 상단 헤더 */}
      <header className="admin-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <img src={menuIcon} alt="메뉴" style={{ width: '20px', height: '20px' }} />
          </button>
          <img src={logo} alt="서비스 로고" className="header-logo" style={{ height: '32px', width: 'auto' }} />
          <h1 className="system-title">이음이 관리 시스템</h1>
        </div>

        <div className="header-right">
          <div className="user-info" onClick={() => setShowUserDropdown(!showUserDropdown)}>
            <div className="user-avatar" style={{ background: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
              <img src={userIcon} alt="사용자" style={{ width: '16px', height: '16px', stroke: '#667EEA' }} />
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser.name || '홍길동'}</span>
              <span className="user-role">{currentUser.role || '서울시청 복지과'}</span>
            </div>
            <button className="dropdown-toggle">
              <img src={chevronDownIcon} alt="더보기" style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        </div>
      </header>

      {/* 사이드바 오버레이 (모바일) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* 사이드바 네비게이션 */}
      <nav className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* 사이드바 토글 버튼 */}
        <div className="sidebar-toggle-wrapper">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "사이드바 열기" : "사이드바 닫기"}
          >
            <img src={menuIcon} alt="토글" style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className={`menu-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
            <a href="/admin/dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}>
              <img src={chartBarIcon} alt="대시보드" className="menu-icon" />
              <span>대시보드</span>
            </a>
          </li>
          <li className={`menu-item ${isActive('/admin/users') ? 'active' : ''}`}>
            <a href="/admin/users" onClick={(e) => { e.preventDefault(); navigate('/admin/users'); }}>
              <img src={usersIcon} alt="이용자 관리" className="menu-icon" />
              <span>이용자 관리</span>
            </a>
          </li>
          <li className={`menu-item ${isActive('/admin/emotion-monitor') ? 'active' : ''}`}>
            <a href="/admin/emotion-monitor" onClick={(e) => { e.preventDefault(); navigate('/admin/emotion-monitor'); }}>
              <img src={heartIcon} alt="감정 모니터링" className="menu-icon" />
              <span>감정 모니터링</span>
            </a>
          </li>
          <li className={`menu-item ${isActive('/admin/conversation') ? 'active' : ''}`}>
            <a href="/admin/conversation" onClick={(e) => { e.preventDefault(); navigate('/admin/conversation'); }}>
              <img src={messageCircleIcon} alt="대화 분석" className="menu-icon" />
              <span>대화 분석</span>
            </a>
          </li>
          <li className={`menu-item ${isActive('/admin/emergency') ? 'active' : ''}`}>
            <a href="/admin/emergency" onClick={(e) => { e.preventDefault(); navigate('/admin/emergency'); }}>
              <img src={triangleAlertIcon} alt="정서 위험 감지 기록" className="menu-icon" />
              <span>정서 위험 감지 기록</span>
            </a>
          </li>
          <li className={`menu-item ${isActive('/admin/reports') ? 'active' : ''}`}>
            <a href="/admin/reports" onClick={(e) => { e.preventDefault(); navigate('/admin/reports'); }}>
              <img src={fileTextIcon} alt="보고서" className="menu-icon" />
              <span>보고서</span>
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <a href="#" className="footer-link logout-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <img src={logOutIcon} alt="로그아웃" className="menu-icon" />
            <span>로그아웃</span>
          </a>
        </div>
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
      </main>

      {/* 사용자 메뉴 드롭다운 */}
      {showUserDropdown && (
        <div className="user-dropdown show" onClick={() => setShowUserDropdown(false)}>
          <a href="/admin/profile" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/admin/profile'); }}>
            <img src={userIcon} alt="프로필" style={{ width: '16px', height: '16px' }} />
            <span>내 프로필</span>
          </a>
          <hr className="dropdown-divider" />
          <a href="#" className="dropdown-item logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <img src={logOutIcon} alt="로그아웃" style={{ width: '16px', height: '16px' }} />
            <span>로그아웃</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;
