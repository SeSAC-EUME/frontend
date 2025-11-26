import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

function Dashboard() {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const downloadReport = () => {
    alert('보고서 다운로드 기능은 추후 구현됩니다.');
  };

  const refreshDashboard = () => {
    alert('데이터를 새로고침합니다...');
    window.location.reload();
  };

  const viewUserDetail = (userId) => {
    navigate(`/admin/users?id=${userId}`);
  };

  const currentUser = JSON.parse(localStorage.getItem('eume_admin_user') || '{}');

  return (
    <div className="admin-page">
      {/* 상단 헤더 */}
      <header className="admin-header">
        <div className="header-left">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <img src="/admin-ui/assets/icons/menu.svg" alt="메뉴" style={{ width: '20px', height: '20px' }} />
          </button>
          <img src="/shared/assets/logo2.png" alt="서비스 로고" className="header-logo" style={{ height: '32px', width: 'auto' }} />
          <h1 className="system-title">이음이 관리 시스템</h1>
        </div>

        <div className="header-right">
          <button className="header-button notification-button" onClick={() => alert('알림 기능은 추후 구현됩니다.')}>
            <img src="/admin-ui/assets/icons/bell.svg" alt="알림" style={{ width: '20px', height: '20px' }} />
            <span className="notification-badge">5</span>
          </button>

          <div className="user-info" onClick={() => setShowUserDropdown(!showUserDropdown)}>
            <div className="user-avatar" style={{ background: '#E0E7FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
              <img src="/admin-ui/assets/icons/user.svg" alt="사용자" style={{ width: '16px', height: '16px', stroke: '#667EEA' }} />
            </div>
            <div className="user-details">
              <span className="user-name">{currentUser.name || '홍길동'}</span>
              <span className="user-role">{currentUser.role || '서울시청 복지과'}</span>
            </div>
            <button className="dropdown-toggle">
              <img src="/admin-ui/assets/icons/chevron-down.svg" alt="더보기" style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        </div>
      </header>

      {/* 사이드바 네비게이션 */}
      <nav className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-menu">
          <li className="menu-item active">
            <a href="/admin/dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}>
              <img src="/admin-ui/assets/icons/chart-bar.svg" alt="대시보드" className="menu-icon" />
              <span>대시보드</span>
            </a>
          </li>
          <li className="menu-item">
            <a href="/admin/users" onClick={(e) => { e.preventDefault(); navigate('/admin/users'); }}>
              <img src="/admin-ui/assets/icons/users.svg" alt="이용자 관리" className="menu-icon" />
              <span>이용자 관리</span>
            </a>
          </li>
          <li className="menu-item">
            <a href="/admin/emotion-monitor" onClick={(e) => { e.preventDefault(); navigate('/admin/emotion-monitor'); }}>
              <img src="/admin-ui/assets/icons/heart.svg" alt="감정 모니터링" className="menu-icon" />
              <span>감정 모니터링</span>
            </a>
          </li>
          <li className="menu-item">
            <a href="/admin/conversation" onClick={(e) => { e.preventDefault(); navigate('/admin/conversation'); }}>
              <img src="/admin-ui/assets/icons/message-circle.svg" alt="대화 분석" className="menu-icon" />
              <span>대화 분석</span>
            </a>
          </li>
          <li className="menu-item">
            <a href="/admin/emergency" onClick={(e) => { e.preventDefault(); navigate('/admin/emergency'); }}>
              <img src="/admin-ui/assets/icons/triangle-alert.svg" alt="긴급 상황" className="menu-icon" />
              <span>긴급 상황</span>
            </a>
          </li>
          <li className="menu-item">
            <a href="/admin/reports" onClick={(e) => { e.preventDefault(); navigate('/admin/reports'); }}>
              <img src="/admin-ui/assets/icons/file-text.svg" alt="보고서" className="menu-icon" />
              <span>보고서</span>
            </a>
          </li>
          <li className="menu-item">
            <a href="/admin/settings" onClick={(e) => { e.preventDefault(); navigate('/admin/settings'); }}>
              <img src="/admin-ui/assets/icons/settings.svg" alt="시스템 설정" className="menu-icon" />
              <span>시스템 설정</span>
            </a>
          </li>
        </ul>

        <div className="sidebar-footer">
          <a href="#" className="footer-link">
            <img src="/admin-ui/assets/icons/info.svg" alt="도움말" className="menu-icon" />
            <span>도움말</span>
          </a>
          <a href="#" className="footer-link logout-link" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <img src="/admin-ui/assets/icons/log-out.svg" alt="로그아웃" className="menu-icon" />
            <span>로그아웃</span>
          </a>
        </div>
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className="admin-main">
        {/* 페이지 헤더 */}
        <div className="page-header">
          <h2>대시보드</h2>
          <div className="page-actions">
            <button className="action-button" onClick={downloadReport}>
              <img src="/admin-ui/assets/icons/download.svg" alt="다운로드" className="button-icon" />
              보고서 다운로드
            </button>
            <button className="action-button primary" onClick={refreshDashboard}>
              <img src="/admin-ui/assets/icons/refresh-cw.svg" alt="새로고침" className="button-icon" />
              새로고침
            </button>
          </div>
        </div>

        {/* 대시보드 콘텐츠 */}
        <div className="dashboard-content">
          {/* 통계 카드들 */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <img src="/admin-ui/assets/icons/users.svg" alt="전체 이용자" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">1,234</span>
                <span className="stat-label">전체 이용자</span>
                <span className="stat-change positive">+12% 이번 달</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">
                <img src="/admin-ui/assets/icons/circle-check.svg" alt="활성 이용자" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">892</span>
                <span className="stat-label">활성 이용자</span>
                <span className="stat-change positive">+5% 오늘</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emergency">
                <img src="/admin-ui/assets/icons/triangle-alert.svg" alt="긴급 알림" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">3</span>
                <span className="stat-label">긴급 알림</span>
                <span className="stat-change negative">요청 대기 중</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon satisfaction">
                <img src="/admin-ui/assets/icons/smile.svg" alt="평균 만족도" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">4.5</span>
                <span className="stat-label">평균 만족도</span>
                <span className="stat-change positive">+0.2 이번 주</span>
              </div>
            </div>
          </div>

          {/* 긴급 알림 */}
          <div className="emergency-alerts">
            <div className="emergency-header">
              <img src="/admin-ui/assets/icons/triangle-alert.svg" alt="긴급" style={{ width: '24px', height: '24px', stroke: '#DC2626' }} />
              <h3>긴급 알림</h3>
            </div>
            <div className="alert-item">
              <div className="alert-info">
                <div className="alert-user">김영희 님 (78세)</div>
                <div className="alert-message">우울 감정 지수 급상승 - 즉시 확인 필요</div>
              </div>
              <button className="alert-action" onClick={() => viewUserDetail(1)}>확인하기</button>
            </div>
            <div className="alert-item">
              <div className="alert-info">
                <div className="alert-user">박철수 님 (82세)</div>
                <div className="alert-message">3일간 미접속 - 안부 확인 권장</div>
              </div>
              <button className="alert-action" onClick={() => viewUserDetail(2)}>확인하기</button>
            </div>
            <div className="alert-item">
              <div className="alert-info">
                <div className="alert-user">이순자 님 (75세)</div>
                <div className="alert-message">긴급 연락 요청 - 전화 연락 필요</div>
              </div>
              <button className="alert-action" onClick={() => viewUserDetail(3)}>확인하기</button>
            </div>
          </div>

          {/* 차트 영역 */}
          <div className="charts-row">
            <div className="chart-card emotion-chart">
              <div className="chart-header">
                <h3 className="chart-title">감정 분포</h3>
                <select className="chart-filter">
                  <option>최근 7일</option>
                  <option>최근 30일</option>
                  <option>최근 3개월</option>
                </select>
              </div>
              <div className="chart-body"></div>
            </div>

            <div className="chart-card activity-chart">
              <div className="chart-header">
                <h3 className="chart-title">주간 대화 활동</h3>
                <select className="chart-filter">
                  <option>이번 주</option>
                  <option>지난 주</option>
                  <option>최근 30일</option>
                </select>
              </div>
              <div className="chart-body"></div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="recent-activities">
            <h3 style={{ marginBottom: '20px' }}>최근 활동</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">
                  <img src="/admin-ui/assets/icons/circle-check.svg" alt="완료" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">김영희 님이 복지 서비스 신청을 완료했습니다</div>
                  <div className="activity-description">청년 식사 지원 서비스 신청</div>
                </div>
                <div className="activity-time">5분 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon info">
                  <img src="/admin-ui/assets/icons/message-circle.svg" alt="대화" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">박철수 님이 이음이와 대화를 나눴습니다</div>
                  <div className="activity-description">총 15개 메시지 교환, 감정: 보통</div>
                </div>
                <div className="activity-time">12분 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon warning">
                  <img src="/admin-ui/assets/icons/triangle-alert.svg" alt="경고" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">이순자 님의 감정 상태가 변경되었습니다</div>
                  <div className="activity-description">좋음 → 보통으로 변경</div>
                </div>
                <div className="activity-time">1시간 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon success">
                  <img src="/admin-ui/assets/icons/phone.svg" alt="전화" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">김관리 님이 최영수 님에게 연락했습니다</div>
                  <div className="activity-description">안부 확인 전화 완료</div>
                </div>
                <div className="activity-time">2시간 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon info">
                  <img src="/admin-ui/assets/icons/chart-bar.svg" alt="보고서" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">주간 보고서가 생성되었습니다</div>
                  <div className="activity-description">2025년 11월 1주차 보고서</div>
                </div>
                <div className="activity-time">3시간 전</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 사용자 메뉴 드롭다운 */}
      {showUserDropdown && (
        <div className="user-dropdown show" onClick={() => setShowUserDropdown(false)}>
          <a href="#" className="dropdown-item">
            <img src="/admin-ui/assets/icons/user.svg" alt="프로필" style={{ width: '16px', height: '16px' }} />
            <span>내 프로필</span>
          </a>
          <a href="#" className="dropdown-item">
            <img src="/admin-ui/assets/icons/lock.svg" alt="비밀번호" style={{ width: '16px', height: '16px' }} />
            <span>비밀번호 변경</span>
          </a>
          <a href="#" className="dropdown-item">
            <img src="/admin-ui/assets/icons/settings.svg" alt="설정" style={{ width: '16px', height: '16px' }} />
            <span>계정 설정</span>
          </a>
          <hr className="dropdown-divider" />
          <a href="#" className="dropdown-item logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
            <img src="/admin-ui/assets/icons/log-out.svg" alt="로그아웃" style={{ width: '16px', height: '16px' }} />
            <span>로그아웃</span>
          </a>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
