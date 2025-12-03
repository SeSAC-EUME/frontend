import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/admin-responsive.css';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import axiosBlob, { downloadBlob, extractFilename } from '../../shared/api/axiosBlob';
import { formatKoreanDateTime, formatKoreanDate, toKoreanTime } from '../../shared/utils/dateUtils';

// 아이콘 import
import downloadIcon from '../assets/icons/download.svg';
import usersIcon from '../assets/icons/users.svg';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';
import userIcon from '../assets/icons/user.svg';
import phoneIcon from '../assets/icons/phone.svg';
import settingsIcon from '../assets/icons/settings.svg';

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
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [userEmotionHistory, setUserEmotionHistory] = useState([]);
  const [isLoadingEmotions, setIsLoadingEmotions] = useState(false);

  const itemsPerPage = 10;

  // 샘플 데이터 (API 폴백용)
  const sampleUsersData = [
    {
      id: 1,
      name: '김민수',
      age: 24,
      gender: '남',
      address: '서울시 강남구',
      phone: '010-1234-5678',
      status: 'active',
      riskLevel: 'high',
      riskScore: 85,
      lastActive: '2025-11-26 09:30',
      joinDate: '2025-10-01',
      emotionStatus: '우울',
      conversationCount: 45,
      emergencyCount: 2
    },
    {
      id: 2,
      name: '박지원',
      age: 28,
      gender: '여',
      address: '서울시 마포구',
      phone: '010-2345-6789',
      status: 'warning',
      riskLevel: 'medium',
      riskScore: 55,
      lastActive: '2025-11-25 14:20',
      joinDate: '2025-09-15',
      emotionStatus: '보통',
      conversationCount: 32,
      emergencyCount: 1
    },
    {
      id: 3,
      name: '이서연',
      age: 22,
      gender: '여',
      address: '서울시 종로구',
      phone: '010-3456-7890',
      status: 'active',
      riskLevel: 'low',
      riskScore: 25,
      lastActive: '2025-11-26 10:15',
      joinDate: '2025-10-20',
      emotionStatus: '좋음',
      conversationCount: 28,
      emergencyCount: 0
    },
    {
      id: 4,
      name: '최준호',
      age: 31,
      gender: '남',
      address: '서울시 송파구',
      phone: '010-4567-8901',
      status: 'active',
      riskLevel: 'low',
      riskScore: 30,
      lastActive: '2025-11-26 08:45',
      joinDate: '2025-09-01',
      emotionStatus: '좋음',
      conversationCount: 52,
      emergencyCount: 0
    },
    {
      id: 5,
      name: '정수빈',
      age: 26,
      gender: '여',
      address: '서울시 서초구',
      phone: '010-5678-9012',
      status: 'active',
      riskLevel: 'medium',
      riskScore: 60,
      lastActive: '2025-11-25 16:30',
      joinDate: '2025-10-10',
      emotionStatus: '보통',
      conversationCount: 38,
      emergencyCount: 1
    },
    {
      id: 6,
      name: '강태현',
      age: 29,
      gender: '남',
      address: '서울시 영등포구',
      phone: '010-6789-0123',
      status: 'inactive',
      riskLevel: 'high',
      riskScore: 90,
      lastActive: '2025-11-20 11:20',
      joinDate: '2025-08-15',
      emotionStatus: '매우 우울',
      conversationCount: 15,
      emergencyCount: 3
    },
    {
      id: 7,
      name: '한지우',
      age: 23,
      gender: '여',
      address: '서울시 동작구',
      phone: '010-7890-1234',
      status: 'active',
      riskLevel: 'low',
      riskScore: 20,
      lastActive: '2025-11-26 09:00',
      joinDate: '2025-10-25',
      emotionStatus: '매우 좋음',
      conversationCount: 22,
      emergencyCount: 0
    },
    {
      id: 8,
      name: '오성민',
      age: 33,
      gender: '남',
      address: '서울시 관악구',
      phone: '010-8901-2345',
      status: 'active',
      riskLevel: 'medium',
      riskScore: 50,
      lastActive: '2025-11-25 19:45',
      joinDate: '2025-09-20',
      emotionStatus: '보통',
      conversationCount: 41,
      emergencyCount: 1
    }
  ];

  // 사용자 목록 로드
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS);
      // 백엔드 응답 구조에 따라 조정
      const apiUsers = response.users || response || [];

      // API 응답을 프론트엔드 형식으로 매핑
      const mappedUsers = apiUsers.map(user => ({
        id: user.id,
        name: user.userName || user.nickname || '이름 없음',
        age: user.age || '-',
        gender: user.gender || '-',
        address: user.sigunguName || '-',
        phone: user.phone || '-',
        status: user.userStatus?.toLowerCase() || 'active',
        riskLevel: user.riskLevel || 'low',
        riskScore: user.riskScore || 0,
        lastActive: formatKoreanDateTime(user.lastLoginDate),
        joinDate: formatKoreanDate(user.createdAt),
        emotionStatus: user.emotionStatus || '-',
        conversationCount: user.conversationCount || 0,
        emergencyCount: user.emergencyCount || 0,
        email: user.email || '-',
        nickname: user.nickname || '-',
        profileImage: user.profileImage || '',
      }));

      setUsersData(mappedUsers);
    } catch (error) {
      console.error('사용자 목록 로드 오류:', error);
      // API 실패 시 샘플 데이터 사용 (개발용)
      setUsersData(sampleUsersData);
    } finally {
      setIsLoading(false);
    }
  };

  // 샘플 데이터 (API 실패 시 폴백용)

  // 필터링 및 검색된 사용자 목록
  const getFilteredUsers = () => {
    let filtered = [...usersData];

    // 검색
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        (user.name || '').toLowerCase().includes(query) ||
        (user.address || '').toLowerCase().includes(query) ||
        (user.phone || '').includes(query)
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

  const viewUserDetail = async (userId) => {
    setIsLoadingUserDetail(true);
    setIsLoadingEmotions(true);
    setShowUserModal(true);
    document.body.style.overflow = 'hidden';

    try {
      // API에서 실시간 사용자 상세 정보 조회
      const userDetail = await axiosInstance.get(API_ENDPOINTS.ADMIN.USER_DETAIL(userId));

      // API 응답을 프론트엔드 형식으로 매핑
      const mappedDetail = {
        id: userDetail.id,
        name: userDetail.userName || userDetail.nickname || '이름 없음',
        age: userDetail.age || '-',
        gender: userDetail.gender || '-',
        address: userDetail.sigunguName || '-',
        phone: userDetail.phone || '-',
        status: userDetail.userStatus?.toLowerCase() || 'active',
        riskLevel: userDetail.riskLevel || 'low',
        riskScore: userDetail.riskScore || 0,
        lastActive: formatKoreanDateTime(userDetail.lastLoginDate),
        joinDate: formatKoreanDate(userDetail.createdAt),
        emotionStatus: userDetail.emotionStatus || '-',
        conversationCount: userDetail.conversationCount || 0,
        emergencyCount: userDetail.emergencyCount || 0,
        email: userDetail.email || '-',
        nickname: userDetail.nickname || '-',
        profileImage: userDetail.profileImage || '',
      };

      setSelectedUserDetail(mappedDetail);
    } catch (error) {
      console.error('사용자 상세 조회 오류:', error);
      // API 실패 시 로컬 데이터 사용 (폴백)
      const user = usersData.find(u => u.id === userId);
      if (user) {
        setSelectedUserDetail(user);
      } else {
        alert('사용자 정보를 불러올 수 없습니다.');
        closeUserDetailModal();
      }
    } finally {
      setIsLoadingUserDetail(false);
    }

    // 감정 이력 조회 (별도로 처리하여 사용자 정보 로딩과 독립적으로 진행)
    try {
      const emotionResponse = await axiosInstance.get(
        `${API_ENDPOINTS.ADMIN.USER_EMOTIONS(userId)}?size=10`
      );
      setUserEmotionHistory(emotionResponse.emotions || []);
    } catch (error) {
      console.error('감정 이력 조회 오류:', error);
      setUserEmotionHistory([]);
    } finally {
      setIsLoadingEmotions(false);
    }
  };

  const closeUserDetailModal = () => {
    setShowUserModal(false);
    setSelectedUserDetail(null);
    setUserEmotionHistory([]);
    document.body.style.overflow = 'auto';
  };

  const editUser = (userId) => {
    alert(`사용자 ID ${userId}의 정보 수정 페이지로 이동합니다.\n이 기능은 추후 구현됩니다.`);
  };

  const exportUsers = async () => {
    setIsExporting(true);
    try {
      const response = await axiosBlob.get(API_ENDPOINTS.ADMIN.USERS_EXPORT);

      // Content-Disposition에서 파일명 추출 또는 기본값 사용
      const contentDisposition = response.headers['content-disposition'];
      const defaultFilename = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filename = extractFilename(contentDisposition, defaultFilename);

      // MIME 타입 지정하여 다운로드
      downloadBlob(
        response.data,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    } catch (error) {
      console.error('이용자 데이터 내보내기 오류:', error);
      alert('Excel 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const bulkAction = () => {
    if (selectedUsers.size === 0) {
      alert('선택된 사용자가 없습니다.');
      return;
    }
    alert(`${selectedUsers.size}명의 사용자에 대한 일괄 작업을 수행합니다.\n이 기능은 추후 구현됩니다.`);
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

  // 감정 점수를 감정 상태 텍스트로 변환 (점수가 높을수록 위험)
  // 0~29: 안전, 30~59: 주의, 60~79: 고위험, 80~100: 매우 심각
  const mapScoreToEmotion = (score) => {
    if (score === null || score === undefined) return '-';
    if (score >= 80) return '매우 심각';
    if (score >= 60) return '고위험';
    if (score >= 30) return '주의';
    return '안전';
  };

  // 감정 점수에 따른 레벨 (스타일용) - 점수가 높을수록 위험
  const getEmotionLevelFromScore = (score) => {
    if (score === null || score === undefined) return 'normal';
    if (score >= 60) return 'danger';
    if (score >= 30) return 'warning';
    return 'good';
  };

  const formatDateTime = (dateStr) => {
    const date = toKoreanTime(dateStr);
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

  return (
    <AdminLayout>
        {/* 페이지 헤더 */}
        <div className="page-header">
          <h2>이용자 관리</h2>
          <div className="page-actions">
            <button className="action-button" onClick={exportUsers} disabled={isExporting}>
              <img src={downloadIcon} alt="내보내기" className="button-icon" />
              {isExporting ? '내보내는 중...' : 'Excel 내보내기'}
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
              <img src={usersIcon} alt="검색" className="search-icon" />
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
              <option value="10-19">10대</option>
              <option value="20-29">20대</option>
              <option value="30-39">30대</option>
              <option value="40+">40대 이상</option>
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
                <img src={refreshCwIcon} alt="새로고침" />
                새로고침
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="users-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                <th className="sortable" onClick={() => handleSort('name')}>이용자</th>
                <th>주소</th>
                <th className="sortable" onClick={() => handleSort('status')}>상태</th>
                <th className="sortable" onClick={() => handleSort('riskScore')}>위험도</th>
                <th className="sortable" onClick={() => handleSort('lastActive')}>최근 활동</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <div className="empty-icon">
                      <img src={usersIcon} alt="사용자 없음" />
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
                        <div className="user-avatar">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span
                            style={{
                              display: user.profileImage ? 'none' : 'flex',
                              width: '100%',
                              height: '100%',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {user.name?.[0] || '?'}
                          </span>
                        </div>
                        <div className="user-details">
                          <span className="user-name">{user.name}</span>
                        </div>
                      </div>
                    </td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

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

      {/* 사용자 상세 정보 모달 */}
      {showUserModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.className === 'modal-overlay') closeUserDetailModal(); }}>
          <div className="modal-container" style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {isLoadingUserDetail ? '정보 불러오는 중...' : `${selectedUserDetail?.name || ''} 님의 상세 정보`}
              </h3>
              <button className="modal-close" onClick={closeUserDetailModal}>×</button>
            </div>
            <div className="modal-body">
              {isLoadingUserDetail ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-light)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                  <div>사용자 정보를 불러오는 중...</div>
                </div>
              ) : !selectedUserDetail ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-text-light)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
                  <div>사용자 정보를 불러올 수 없습니다</div>
                </div>
              ) : (
                <>
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

              {/* 감정 이력 */}
              <div style={{ background: 'var(--admin-bg)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--admin-text-dark)' }}>감정 분석 이력</h4>
                {isLoadingEmotions ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--admin-text-light)' }}>
                    감정 이력을 불러오는 중...
                  </div>
                ) : userEmotionHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--admin-text-light)' }}>
                    감정 분석 이력이 없습니다
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                          <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--admin-text-light)' }}>분석일</th>
                          <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)' }}>감정 상태</th>
                          <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)' }}>감정 점수</th>
                          <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)' }}>우울</th>
                          <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)' }}>불안</th>
                          <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)' }}>스트레스</th>
                          <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', color: 'var(--admin-text-light)' }}>키워드</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userEmotionHistory.map((emotion, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                            <td style={{ padding: '10px 8px' }}>
                              {formatKoreanDateTime(emotion.analysisDate)}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <span className={`emotion-badge ${getEmotionLevelFromScore(emotion.emotionScore)}`}>
                                {mapScoreToEmotion(emotion.emotionScore)}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600' }}>
                              {emotion.emotionScore ?? '-'}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <span style={{
                                color: getEmotionLevelFromScore(emotion.depressionScore) === 'danger' ? '#EF4444' :
                                       getEmotionLevelFromScore(emotion.depressionScore) === 'warning' ? '#F59E0B' : 'inherit'
                              }}>
                                {emotion.depressionScore ?? '-'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <span style={{
                                color: getEmotionLevelFromScore(emotion.anxietyScore) === 'danger' ? '#EF4444' :
                                       getEmotionLevelFromScore(emotion.anxietyScore) === 'warning' ? '#F59E0B' : 'inherit'
                              }}>
                                {emotion.anxietyScore ?? '-'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <span style={{
                                color: getEmotionLevelFromScore(emotion.stressScore) === 'danger' ? '#EF4444' :
                                       getEmotionLevelFromScore(emotion.stressScore) === 'warning' ? '#F59E0B' : 'inherit'
                              }}>
                                {emotion.stressScore ?? '-'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              {emotion.keywords && emotion.keywords.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {emotion.keywords.slice(0, 3).map((keyword, idx) => (
                                    <span key={idx} style={{
                                      background: 'var(--admin-primary-light)',
                                      color: 'var(--admin-primary)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '11px'
                                    }}>
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeUserDetailModal}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Users;
