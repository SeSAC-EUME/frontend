import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

function Users() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    risk: 'all',
    age: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const itemsPerPage = 10;

  // 샘플 데이터
  const usersData = [
    {
      id: 1,
      name: '김영희',
      age: 78,
      gender: '여',
      address: '서울시 강남구',
      phone: '010-1234-5678',
      status: 'active',
      riskLevel: 'high',
      riskScore: 85,
      lastActive: '2025-11-12 09:30',
      joinDate: '2025-10-01',
      guardian: '김철수 (아들)',
      guardianPhone: '010-9876-5432',
      emotionStatus: '우울',
      conversationCount: 45,
      emergencyCount: 2
    },
    {
      id: 2,
      name: '박철수',
      age: 82,
      gender: '남',
      address: '서울시 마포구',
      phone: '010-2345-6789',
      status: 'warning',
      riskLevel: 'medium',
      riskScore: 55,
      lastActive: '2025-11-09 14:20',
      joinDate: '2025-09-15',
      guardian: '박민지 (딸)',
      guardianPhone: '010-8765-4321',
      emotionStatus: '보통',
      conversationCount: 32,
      emergencyCount: 1
    },
    {
      id: 3,
      name: '이순자',
      age: 75,
      gender: '여',
      address: '서울시 종로구',
      phone: '010-3456-7890',
      status: 'active',
      riskLevel: 'low',
      riskScore: 25,
      lastActive: '2025-11-12 10:15',
      joinDate: '2025-10-20',
      guardian: '이지훈 (아들)',
      guardianPhone: '010-7654-3210',
      emotionStatus: '좋음',
      conversationCount: 28,
      emergencyCount: 0
    },
    {
      id: 4,
      name: '최영수',
      age: 80,
      gender: '남',
      address: '서울시 송파구',
      phone: '010-4567-8901',
      status: 'active',
      riskLevel: 'low',
      riskScore: 30,
      lastActive: '2025-11-12 08:45',
      joinDate: '2025-09-01',
      guardian: '최서연 (딸)',
      guardianPhone: '010-6543-2109',
      emotionStatus: '좋음',
      conversationCount: 52,
      emergencyCount: 0
    },
    {
      id: 5,
      name: '정미란',
      age: 76,
      gender: '여',
      address: '서울시 서초구',
      phone: '010-5678-9012',
      status: 'active',
      riskLevel: 'medium',
      riskScore: 60,
      lastActive: '2025-11-11 16:30',
      joinDate: '2025-10-10',
      guardian: '정우진 (아들)',
      guardianPhone: '010-5432-1098',
      emotionStatus: '보통',
      conversationCount: 38,
      emergencyCount: 1
    },
    {
      id: 6,
      name: '강동원',
      age: 84,
      gender: '남',
      address: '서울시 영등포구',
      phone: '010-6789-0123',
      status: 'inactive',
      riskLevel: 'high',
      riskScore: 90,
      lastActive: '2025-11-05 11:20',
      joinDate: '2025-08-15',
      guardian: '강혜진 (딸)',
      guardianPhone: '010-4321-0987',
      emotionStatus: '매우 우울',
      conversationCount: 15,
      emergencyCount: 3
    },
    {
      id: 7,
      name: '한미숙',
      age: 73,
      gender: '여',
      address: '서울시 동작구',
      phone: '010-7890-1234',
      status: 'active',
      riskLevel: 'low',
      riskScore: 20,
      lastActive: '2025-11-12 09:00',
      joinDate: '2025-10-25',
      guardian: '한준호 (아들)',
      guardianPhone: '010-3210-9876',
      emotionStatus: '매우 좋음',
      conversationCount: 22,
      emergencyCount: 0
    },
    {
      id: 8,
      name: '오병호',
      age: 79,
      gender: '남',
      address: '서울시 관악구',
      phone: '010-8901-2345',
      status: 'active',
      riskLevel: 'medium',
      riskScore: 50,
      lastActive: '2025-11-11 19:45',
      joinDate: '2025-09-20',
      guardian: '오수진 (딸)',
      guardianPhone: '010-2109-8765',
      emotionStatus: '보통',
      conversationCount: 41,
      emergencyCount: 1
    }
  ];

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

  // 필터링 및 검색된 사용자 목록
  const getFilteredUsers = () => {
    let filtered = [...usersData];

    // 검색
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.address.toLowerCase().includes(query) ||
        user.phone.includes(query)
      );
    }

    // 필터
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    if (filters.risk !== 'all') {
      filtered = filtered.filter(user => user.riskLevel === filters.risk);
    }

    if (filters.age !== 'all') {
      filtered = filtered.filter(user => {
        const age = user.age;
        switch(filters.age) {
          case '60-69': return age >= 60 && age < 70;
          case '70-79': return age >= 70 && age < 80;
          case '80-89': return age >= 80 && age < 90;
          case '90+': return age >= 90;
          default: return true;
        }
      });
    }

    // 정렬
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.field];
        let bVal = b[sortConfig.field];

        if (sortConfig.field === 'lastActive' || sortConfig.field === 'joinDate') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const pageUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(pageUsers.map(user => user.id));
      setSelectedUsers(allIds);
      setSelectAll(true);
    } else {
      setSelectedUsers(new Set());
      setSelectAll(false);
    }
  };

  const handleUserSelect = (userId, checked) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === pageUsers.length);
  };

  const viewUserDetail = (userId) => {
    const user = usersData.find(u => u.id === userId);
    setSelectedUserDetail(user);
    setShowUserModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeUserDetailModal = () => {
    setShowUserModal(false);
    setSelectedUserDetail(null);
    document.body.style.overflow = 'auto';
  };

  const callGuardian = (userId) => {
    const user = usersData.find(u => u.id === userId);
    if (user && window.confirm(`${user.guardian}에게 연락하시겠습니까?\n전화번호: ${user.guardianPhone}`)) {
      alert('보호자에게 연락 중...');
    }
  };

  const editUser = (userId) => {
    alert(`사용자 ID ${userId}의 정보 수정 페이지로 이동합니다.\n이 기능은 추후 구현됩니다.`);
  };

  const exportUsers = () => {
    alert('이용자 데이터를 Excel로 내보냅니다.\n이 기능은 추후 구현됩니다.');
  };

  const bulkAction = () => {
    if (selectedUsers.size === 0) {
      alert('선택된 사용자가 없습니다.');
      return;
    }
    alert(`${selectedUsers.size}명의 사용자에 대한 일괄 작업을 수행합니다.\n이 기능은 추후 구현됩니다.`);
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      localStorage.removeItem('eume_admin_user');
      localStorage.removeItem('eume_admin_session_expiry');
      navigate('/admin/login');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'active': '활성',
      'inactive': '비활성',
      'warning': '주의'
    };
    return statusMap[status] || status;
  };

  const getRiskText = (level) => {
    const riskMap = {
      'low': '낮음',
      'medium': '보통',
      'high': '높음'
    };
    return riskMap[level] || level;
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
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
      <nav className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} id="adminSidebar">
        <ul className="sidebar-menu">
          <li className="menu-item">
            <a href="/admin/dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard'); }}>
              <img src="/admin-ui/assets/icons/chart-bar.svg" alt="대시보드" className="menu-icon" />
              <span>대시보드</span>
            </a>
          </li>
          <li className="menu-item active">
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
          <h2>이용자 관리</h2>
          <div className="page-actions">
            <button className="action-button" onClick={exportUsers}>
              <img src="/admin-ui/assets/icons/download.svg" alt="내보내기" className="button-icon" />
              Excel 내보내기
            </button>
            <button className="action-button primary" onClick={bulkAction}>
              일괄 작업
            </button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="search-filter-section">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <img src="/admin-ui/assets/icons/users.svg" alt="검색" className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="이름, 주소, 전화번호로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="warning">주의</option>
            </select>

            <select
              className="filter-select"
              value={filters.risk}
              onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
            >
              <option value="all">전체 위험도</option>
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>

            <select
              className="filter-select"
              value={filters.age}
              onChange={(e) => setFilters({ ...filters, age: e.target.value })}
            >
              <option value="all">전체 연령</option>
              <option value="60-69">60대</option>
              <option value="70-79">70대</option>
              <option value="80-89">80대</option>
              <option value="90+">90대 이상</option>
            </select>
          </div>
        </div>

        {/* 이용자 테이블 */}
        <div className="users-table-container">
          <div className="table-header">
            <div>
              <span className="table-title">이용자 목록</span>
              <span className="table-count">총 {filteredUsers.length}명</span>
            </div>
            <div className="table-actions">
              <button className="table-action-btn" onClick={() => window.location.reload()}>
                <img src="/admin-ui/assets/icons/refresh-cw.svg" alt="새로고침" />
                새로고침
              </button>
            </div>
          </div>

          <table className="users-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th className="sortable" onClick={() => handleSort('name')}>이용자</th>
                <th>연락처</th>
                <th>주소</th>
                <th className="sortable" onClick={() => handleSort('status')}>상태</th>
                <th className="sortable" onClick={() => handleSort('riskScore')}>위험도</th>
                <th className="sortable" onClick={() => handleSort('lastActive')}>최근 활동</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-icon">
                      <img src="/admin-ui/assets/icons/users.svg" alt="사용자 없음" />
                    </div>
                    <div className="empty-title">검색 결과가 없습니다</div>
                    <div className="empty-description">다른 검색어나 필터를 시도해보세요</div>
                  </td>
                </tr>
              ) : (
                pageUsers.map(user => (
                  <tr key={user.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        className="user-checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                      />
                    </td>
                    <td onClick={() => viewUserDetail(user.id)} style={{ cursor: 'pointer' }}>
                      <div className="user-info-cell">
                        <div className="user-avatar">{user.name[0]}</div>
                        <div className="user-details">
                          <span className="user-name">{user.name}</span>
                          <span className="user-id">{user.age}세 · {user.gender}</span>
                        </div>
                      </div>
                    </td>
                    <td onClick={() => viewUserDetail(user.id)} style={{ cursor: 'pointer' }}>{user.phone}</td>
                    <td onClick={() => viewUserDetail(user.id)} style={{ cursor: 'pointer' }}>{user.address}</td>
                    <td onClick={() => viewUserDetail(user.id)} style={{ cursor: 'pointer' }}>
                      <span className={`status-badge ${user.status}`}>{getStatusText(user.status)}</span>
                    </td>
                    <td onClick={() => viewUserDetail(user.id)} style={{ cursor: 'pointer' }}>
                      <div className="risk-level">
                        <div className="risk-bar">
                          <div className={`risk-fill ${user.riskLevel}`} style={{ width: `${user.riskScore}%` }}></div>
                        </div>
                        <span className={`risk-text ${user.riskLevel}`}>{getRiskText(user.riskLevel)}</span>
                      </div>
                    </td>
                    <td onClick={() => viewUserDetail(user.id)} style={{ cursor: 'pointer' }}>{formatDateTime(user.lastActive)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-icon-btn" onClick={() => viewUserDetail(user.id)} title="상세보기">
                          <img src="/admin-ui/assets/icons/user.svg" alt="상세" />
                        </button>
                        <button className="action-icon-btn" onClick={() => callGuardian(user.id)} title="보호자 연락">
                          <img src="/admin-ui/assets/icons/phone.svg" alt="전화" />
                        </button>
                        <button className="action-icon-btn" onClick={() => editUser(user.id)} title="정보수정">
                          <img src="/admin-ui/assets/icons/settings.svg" alt="수정" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="pagination">
            <div className="pagination-info">
              {filteredUsers.length > 0 ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredUsers.length)} / ${filteredUsers.length}명` : '0명'}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                다음
              </button>
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

      {/* 사용자 상세 정보 모달 */}
      {showUserModal && selectedUserDetail && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.className === 'modal-overlay') closeUserDetailModal(); }}>
          <div className="modal-container" style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">{selectedUserDetail.name} 님의 상세 정보</h3>
              <button className="modal-close" onClick={closeUserDetailModal}>×</button>
            </div>
            <div className="modal-body">
              {/* 기본 정보 */}
              <div style={{ background: 'var(--admin-bg)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--admin-text-dark)' }}>기본 정보</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>이름</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>나이</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.age}세</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>성별</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.gender}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>전화번호</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.phone}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>주소</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.address}</div>
                  </div>
                </div>
              </div>

              {/* 보호자 정보 */}
              <div style={{ background: 'var(--admin-bg)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--admin-text-dark)' }}>보호자 정보</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>보호자</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.guardian}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>연락처</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.guardianPhone}</div>
                  </div>
                </div>
              </div>

              {/* 활동 정보 */}
              <div style={{ background: 'var(--admin-bg)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--admin-text-dark)' }}>활동 정보</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>가입일</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.joinDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>최근 활동</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.lastActive}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>대화 건수</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.conversationCount}건</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>긴급 요청</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.emergencyCount}건</div>
                  </div>
                </div>
              </div>

              {/* 상태 정보 */}
              <div style={{ background: 'var(--admin-bg)', padding: '20px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--admin-text-dark)' }}>상태 정보</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>현재 상태</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{getStatusText(selectedUserDetail.status)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>감정 상태</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.emotionStatus}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>위험도</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{getRiskText(selectedUserDetail.riskLevel)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>위험 점수</div>
                    <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.riskScore}점</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeUserDetailModal}>닫기</button>
              <button className="btn-primary" onClick={() => callGuardian(selectedUserDetail.id)}>보호자 연락</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
