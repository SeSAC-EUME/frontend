import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import axiosBlob, { downloadBlob, extractFilename } from '../../shared/api/axiosBlob';
import { toKoreanTime, formatKoreanDateTime, formatKoreanDate } from '../../shared/utils/dateUtils';
import '../styles/admin.css';
import '../styles/admin-responsive.css';

// 아이콘 import
import downloadIcon from '../assets/icons/download.svg';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';
import heartIcon from '../assets/icons/heart.svg';
import usersIcon from '../assets/icons/users.svg';
import triangleAlertIcon from '../assets/icons/triangle-alert.svg';

// 기본 통계 데이터 (폴백용)
const defaultStats = {
  총이용자: 0,
  안전: 0,
  주의: 0,
  위험: 0,
};

// 기본 감정 분포 (폴백용)
const defaultDistribution = [
  { emotion: '안전', count: 0, percentage: 0, color: '#10B981' },
  { emotion: '주의', count: 0, percentage: 0, color: '#F59E0B' },
  { emotion: '고위험', count: 0, percentage: 0, color: '#EF4444' },
  { emotion: '매우 심각', count: 0, percentage: 0, color: '#DC2626' },
];

function EmotionMonitor() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedEmotion, setSelectedEmotion] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 감정 통계 상태
  const [emotionStats, setEmotionStats] = useState(defaultStats);

  // 감정 분포 상태
  const [emotionDistribution, setEmotionDistribution] = useState(defaultDistribution);

  // 이용자별 감정 현황 상태
  const [userEmotions, setUserEmotions] = useState([]);

  // 선택된 사용자 감정 상세
  const [selectedUserEmotion, setSelectedUserEmotion] = useState(null);
  const [showEmotionDetailModal, setShowEmotionDetailModal] = useState(false);
  const [userEmotionHistory, setUserEmotionHistory] = useState([]);

  // 사용자 상세 모달 상태
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [userDetailEmotionHistory, setUserDetailEmotionHistory] = useState([]);
  const [isLoadingUserDetailEmotions, setIsLoadingUserDetailEmotions] = useState(false);
  const [userDetailEmotionPage, setUserDetailEmotionPage] = useState(1);
  const [userDetailEmotionPageSize, setUserDetailEmotionPageSize] = useState(5);

  // 데이터 로드
  useEffect(() => {
    loadEmotionData();
  }, [selectedPeriod]);

  // 기간에 따른 날짜 범위 계산
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (selectedPeriod) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  // 감정 데이터 로드
  const loadEmotionData = async () => {
    setIsLoading(true);
    try {
      // 사용자 목록 조회
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS);
      const users = Array.isArray(response) ? response : response.users || [];

      const { startDate, endDate } = getDateRange();

      // 각 사용자의 감정 데이터 조회
      const emotionDataPromises = users.map(async (user) => {
        const userId = user.id || user.userId;
        try {
          const emotionResponse = await axiosInstance.get(
            `${API_ENDPOINTS.ADMIN.USER_EMOTIONS(userId)}?startDate=${startDate}&endDate=${endDate}&size=10`
          );
          const emotions = emotionResponse.emotions || [];
          const latestEmotion = emotions[0] || null;

          // 감정 점수 기반으로 감정 상태 결정
          const emotionScore = latestEmotion?.emotionScore ?? 50;
          const currentEmotion = mapScoreToEmotion(emotionScore);
          const trend = calculateTrend(emotions);

          return {
            id: userId,
            name: user.userName || user.name || '사용자',
            age: calculateAge(user.birthDate),
            currentEmotion,
            emotionLevel: getEmotionLevelFromScore(emotionScore),
            trend,
            lastUpdate: formatDateTime(latestEmotion?.analysisDate || user.lastLoginDate),
            emotionScore,
            depressionScore: latestEmotion?.depressionScore ?? 0,
            anxietyScore: latestEmotion?.anxietyScore ?? 0,
            stressScore: latestEmotion?.stressScore ?? 0,
            keywords: latestEmotion?.keywords || [],
            conversationCount: user.conversationCount || 0,
            hasEmotionData: emotions.length > 0,
          };
        } catch {
          // 감정 데이터 없는 경우
          return {
            id: userId,
            name: user.userName || user.name || '사용자',
            age: calculateAge(user.birthDate),
            currentEmotion: '데이터 없음',
            emotionLevel: 'none',
            trend: 'stable',
            lastUpdate: formatDateTime(user.lastLoginDate),
            emotionScore: 0,
            depressionScore: 0,
            anxietyScore: 0,
            stressScore: 0,
            keywords: [],
            conversationCount: user.conversationCount || 0,
            hasEmotionData: false,
          };
        }
      });

      const emotionData = await Promise.all(emotionDataPromises);
      setUserEmotions(emotionData);

      // 통계 계산
      calculateStats(emotionData);
    } catch (error) {
      console.error('감정 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 감정 점수를 감정 라벨로 변환 (점수가 높을수록 위험)
  // 0~29: 안전, 30~59: 주의, 60~79: 고위험, 80~100: 매우 심각
  const mapScoreToEmotion = (score) => {
    if (score >= 80) return '매우 심각';
    if (score >= 60) return '고위험';
    if (score >= 30) return '주의';
    return '안전';
  };

  // 감정 점수 기반 레벨 결정 (점수가 높을수록 위험)
  const getEmotionLevelFromScore = (score) => {
    if (score >= 60) return 'high'; // 고위험
    if (score >= 30) return 'medium'; // 주의
    return 'low'; // 안전
  };

  // 추세 계산 (점수가 올라가면 악화, 내려가면 개선)
  const calculateTrend = (emotions) => {
    if (emotions.length < 2) return 'stable';
    const recent = emotions[0]?.emotionScore ?? 50;
    const previous = emotions[1]?.emotionScore ?? 50;
    if (recent > previous + 5) return 'up'; // 점수 상승 = 상태 악화
    if (recent < previous - 5) return 'down'; // 점수 하락 = 상태 개선
    return 'stable';
  };

  // 통계 계산 (점수가 높을수록 위험)
  const calculateStats = (users) => {
    const stats = {
      총이용자: users.length,
      안전: 0,    // 0~29점
      주의: 0,    // 30~59점
      위험: 0,    // 60점 이상
    };

    const distribution = {
      '안전': 0,
      '주의': 0,
      '고위험': 0,
      '매우 심각': 0,
    };

    users.forEach((user) => {
      const emotion = user.currentEmotion;
      if (emotion === '안전') stats.안전++;
      else if (emotion === '주의') stats.주의++;
      else if (['고위험', '매우 심각'].includes(emotion)) stats.위험++;

      if (distribution[emotion] !== undefined) {
        distribution[emotion]++;
      }
    });

    setEmotionStats(stats);

    // 분포 계산
    const total = users.length || 1;
    setEmotionDistribution([
      { emotion: '안전', count: distribution['안전'], percentage: Math.round((distribution['안전'] / total) * 100), color: '#10B981' },
      { emotion: '주의', count: distribution['주의'], percentage: Math.round((distribution['주의'] / total) * 100), color: '#F59E0B' },
      { emotion: '고위험', count: distribution['고위험'], percentage: Math.round((distribution['고위험'] / total) * 100), color: '#EF4444' },
      { emotion: '매우 심각', count: distribution['매우 심각'], percentage: Math.round((distribution['매우 심각'] / total) * 100), color: '#DC2626' },
    ]);
  };

  // 나이 계산
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // 날짜 포맷 (UTC -> 한국 시간 변환)
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = toKoreanTime(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEmotionColor = (emotion) => {
    const colorMap = {
      '안전': '#10B981',      // 녹색 (0~29점)
      '주의': '#F59E0B',      // 주황색 (30~59점)
      '고위험': '#EF4444',    // 빨간색 (60~79점)
      '매우 심각': '#DC2626'  // 진한 빨간색 (80~100점)
    };
    return colorMap[emotion] || '#94A3B8';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return '#EF4444'; // 점수 상승 = 악화 = 빨간색
    if (trend === 'down') return '#10B981'; // 점수 하락 = 개선 = 녹색
    return '#94A3B8';
  };

  const exportData = async () => {
    setIsExporting(true);
    try {
      const response = await axiosBlob.get(API_ENDPOINTS.ADMIN.USERS_EXPORT);
      const contentDisposition = response.headers['content-disposition'];
      const defaultFilename = `emotion_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filename = extractFilename(contentDisposition, defaultFilename);
      downloadBlob(
        response.data,
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    } catch (error) {
      console.error('데이터 내보내기 오류:', error);
      alert('데이터 내보내기에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const refreshData = () => {
    loadEmotionData();
  };

  // 나이 계산 함수
  const calculateUserAge = (birthDate) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // 감정 점수에 따른 레벨 (스타일용)
  const getEmotionLevelFromScoreForStyle = (score) => {
    if (score === null || score === undefined) return 'normal';
    if (score >= 60) return 'danger';
    if (score >= 30) return 'warning';
    return 'good';
  };

  // 사용자 상세 보기 (모달)
  const viewUserDetail = async (userId) => {
    setIsLoadingUserDetail(true);
    setIsLoadingUserDetailEmotions(true);
    setShowUserDetailModal(true);
    setUserDetailEmotionPage(1);

    try {
      const userDetail = await axiosInstance.get(API_ENDPOINTS.ADMIN.USER_DETAIL(userId));

      // 주소 조합
      const fullAddress = [userDetail.sigungu?.sido, userDetail.sigungu?.sigungu]
        .filter(Boolean)
        .join(' ') || '-';

      const mappedDetail = {
        id: userDetail.id,
        name: userDetail.userName || userDetail.nickname || '이름 없음',
        age: calculateUserAge(userDetail.birthDate),
        birthDate: userDetail.birthDate ? formatKoreanDate(userDetail.birthDate) : '-',
        gender: userDetail.gender || '-',
        address: fullAddress,
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
      alert('사용자 정보를 불러올 수 없습니다.');
      closeUserDetailModal();
    } finally {
      setIsLoadingUserDetail(false);
    }

    // 감정 이력 조회
    try {
      const emotionResponse = await axiosInstance.get(
        `${API_ENDPOINTS.ADMIN.USER_EMOTIONS(userId)}?size=50`
      );
      setUserDetailEmotionHistory(emotionResponse.emotions || []);
    } catch (error) {
      console.error('감정 이력 조회 오류:', error);
      setUserDetailEmotionHistory([]);
    } finally {
      setIsLoadingUserDetailEmotions(false);
    }
  };

  // 사용자 상세 모달 닫기
  const closeUserDetailModal = () => {
    setShowUserDetailModal(false);
    setSelectedUserDetail(null);
    setUserDetailEmotionHistory([]);
    setUserDetailEmotionPage(1);
    setUserDetailEmotionPageSize(5);
  };

  // 상태 텍스트
  const getStatusText = (status) => {
    const statusMap = { 'active': '활성', 'inactive': '비활성', 'warning': '주의' };
    return statusMap[status] || status;
  };

  // 위험도 텍스트
  const getRiskText = (level) => {
    const riskMap = { 'low': '낮음', 'medium': '보통', 'high': '높음' };
    return riskMap[level] || level;
  };

  // 감정 상세 보기
  const viewEmotionDetail = async (user) => {
    setSelectedUserEmotion(user);
    setShowEmotionDetailModal(true);

    try {
      const { startDate, endDate } = getDateRange();
      const emotionResponse = await axiosInstance.get(
        `${API_ENDPOINTS.ADMIN.USER_EMOTIONS(user.id)}?startDate=${startDate}&endDate=${endDate}&size=20`
      );
      setUserEmotionHistory(emotionResponse.emotions || []);
    } catch (error) {
      console.error('감정 이력 조회 오류:', error);
      setUserEmotionHistory([]);
    }
  };

  // 모달 닫기
  const closeEmotionDetailModal = () => {
    setShowEmotionDetailModal(false);
    setSelectedUserEmotion(null);
    setUserEmotionHistory([]);
  };

  // 필터링된 사용자
  const filteredUsers = userEmotions.filter(user => {
    if (selectedEmotion === 'all') return true;
    if (selectedEmotion === 'safe') return user.currentEmotion === '안전';
    if (selectedEmotion === 'caution') return user.currentEmotion === '주의';
    if (selectedEmotion === 'danger') return ['고위험', '매우 심각'].includes(user.currentEmotion);
    return true;
  });

  return (
    <AdminLayout>
      {/* 페이지 헤더 */}
      <div className="page-header">
        <h2>감정 모니터링</h2>
        <div className="page-actions">
          <button className="action-button" onClick={exportData} disabled={isExporting}>
            <img src={downloadIcon} alt="내보내기" className="button-icon" />
            {isExporting ? '내보내는 중...' : '데이터 내보내기'}
          </button>
          <button className="action-button primary" onClick={refreshData} disabled={isLoading}>
            <img src={refreshCwIcon} alt="새로고침" className="button-icon" />
            {isLoading ? '로딩 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 감정 통계 카드 */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0E7FF' }}>
            <img src={usersIcon} alt="총 이용자" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{emotionStats.총이용자}</span>
            <span className="stat-label">총 이용자</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#D1FAE5' }}>
            <img src={heartIcon} alt="안전" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{emotionStats.안전}</span>
            <span className="stat-label">안전</span>
            <span className="stat-change positive">0~29점</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <img src={heartIcon} alt="주의" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{emotionStats.주의}</span>
            <span className="stat-label">주의</span>
            <span className="stat-change">30~59점</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEE2E2' }}>
            <img src={triangleAlertIcon} alt="위험" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{emotionStats.위험}</span>
            <span className="stat-label">위험</span>
            <span className="stat-change negative">60점 이상</span>
          </div>
        </div>
      </div>

      {/* 필터 및 기간 선택 */}
      <div className="search-filter-section" style={{ marginBottom: '24px' }}>
        <div className="filter-group">
          <select
            className="filter-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="day">오늘</option>
            <option value="week">최근 7일</option>
            <option value="month">최근 30일</option>
            <option value="quarter">최근 3개월</option>
          </select>

          <select
            className="filter-select"
            value={selectedEmotion}
            onChange={(e) => setSelectedEmotion(e.target.value)}
          >
            <option value="all">전체 감정</option>
            <option value="safe">안전 (0~29점)</option>
            <option value="caution">주의 (30~59점)</option>
            <option value="danger">위험 (60점 이상)</option>
          </select>
        </div>
      </div>

      {/* 감정 분포 차트 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>감정 분포</h3>
          <span className="card-subtitle">전체 이용자의 현재 감정 상태</span>
        </div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', padding: '20px' }}>
          {/* 도넛 차트 */}
          <div style={{ position: 'relative', width: '200px', height: '200px', flexShrink: 0 }}>
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: (() => {
                  const total = emotionDistribution.reduce((sum, item) => sum + item.count, 0);
                  if (total === 0) return '#E2E8F0';

                  let cumulative = 0;
                  const segments = emotionDistribution.map(item => {
                    const start = cumulative;
                    cumulative += (item.count / total) * 100;
                    return `${item.color} ${start}% ${cumulative}%`;
                  });
                  return `conic-gradient(${segments.join(', ')})`;
                })(),
              }}
            />
            {/* 도넛 중앙 원 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1E293B' }}>
                {emotionStats.총이용자}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>전체 이용자</div>
            </div>
          </div>

          {/* 범례 및 상세 정보 */}
          <div style={{ flex: 1 }}>
            {emotionDistribution.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${item.color}`
                }}
              >
                {/* 컬러 인디케이터 */}
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: item.color,
                    marginRight: '12px',
                    flexShrink: 0
                  }}
                />
                {/* 감정 라벨 */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#1E293B' }}>
                    {item.emotion}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {item.emotion === '안전' && '0~29점'}
                    {item.emotion === '주의' && '30~59점'}
                    {item.emotion === '고위험' && '60~79점'}
                    {item.emotion === '매우 심각' && '80~100점'}
                  </div>
                </div>
                {/* 인원수 및 퍼센트 */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: item.color }}>
                    {item.count}명
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {item.percentage}%
                  </div>
                </div>
                {/* 미니 프로그레스 바 */}
                <div
                  style={{
                    width: '60px',
                    height: '6px',
                    background: '#E2E8F0',
                    borderRadius: '3px',
                    marginLeft: '16px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 이용자별 감정 현황 테이블 */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>이용자별 감정 현황</h3>
            <span className="card-subtitle">{filteredUsers.length}명의 이용자</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>이용자</th>
                <th>감정 상태</th>
                <th>감정 점수</th>
                <th>우울</th>
                <th>불안</th>
                <th>스트레스</th>
                <th>추세</th>
                <th>최근 분석</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '500' }}>{user.name}</span>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>{user.age}세</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getEmotionColor(user.currentEmotion) + '20',
                        color: getEmotionColor(user.currentEmotion),
                        border: `1px solid ${getEmotionColor(user.currentEmotion)}`
                      }}
                    >
                      {user.currentEmotion}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '60px',
                        height: '6px',
                        background: '#E2E8F0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${user.emotionScore}%`,
                          height: '100%',
                          background: user.emotionScore >= 60 ? '#10B981' : user.emotionScore >= 40 ? '#FCD34D' : '#EF4444',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '500', minWidth: '30px' }}>
                        {user.emotionScore}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: user.depressionScore >= 60 ? '#EF4444' : user.depressionScore >= 30 ? '#F59E0B' : '#10B981'
                    }}>
                      {user.depressionScore}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: user.anxietyScore >= 60 ? '#EF4444' : user.anxietyScore >= 30 ? '#F59E0B' : '#10B981'
                    }}>
                      {user.anxietyScore}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: user.stressScore >= 60 ? '#EF4444' : user.stressScore >= 30 ? '#F59E0B' : '#10B981'
                    }}>
                      {user.stressScore}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '20px',
                      color: getTrendColor(user.trend),
                      fontWeight: 'bold'
                    }}>
                      {getTrendIcon(user.trend)}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748B' }}>
                    {user.lastUpdate}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="table-action-btn"
                        onClick={() => viewEmotionDetail(user)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                        disabled={!user.hasEmotionData}
                      >
                        감정이력
                      </button>
                      <button
                        className="table-action-btn"
                        onClick={() => viewUserDetail(user.id)}
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        상세
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 감정 상세 모달 */}
      {showEmotionDetailModal && selectedUserEmotion && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeEmotionDetailModal}>
          <div
            className="modal-container"
            style={{ maxWidth: '950px', maxHeight: '85vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">{selectedUserEmotion.name}님의 감정 분석 이력</h3>
              <button className="modal-close" onClick={closeEmotionDetailModal}>×</button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              {/* 현재 감정 요약 */}
              <div style={{ marginBottom: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>현재 감정 상태</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: selectedUserEmotion.emotionScore >= 60 ? '#EF4444' : selectedUserEmotion.emotionScore >= 30 ? '#F59E0B' : '#10B981'
                    }}>
                      {selectedUserEmotion.emotionScore}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>감정 점수</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: selectedUserEmotion.depressionScore >= 60 ? '#EF4444' : selectedUserEmotion.depressionScore >= 30 ? '#F59E0B' : '#10B981'
                    }}>
                      {selectedUserEmotion.depressionScore}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>우울 지수</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: selectedUserEmotion.anxietyScore >= 60 ? '#EF4444' : selectedUserEmotion.anxietyScore >= 30 ? '#F59E0B' : '#10B981'
                    }}>
                      {selectedUserEmotion.anxietyScore}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>불안 지수</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: selectedUserEmotion.stressScore >= 60 ? '#EF4444' : selectedUserEmotion.stressScore >= 30 ? '#F59E0B' : '#10B981'
                    }}>
                      {selectedUserEmotion.stressScore}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>스트레스 지수</div>
                  </div>
                </div>
                {selectedUserEmotion.keywords && selectedUserEmotion.keywords.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>감정 키워드</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedUserEmotion.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 8px',
                            background: '#E0E7FF',
                            color: '#4F46E5',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 감정 이력 테이블 */}
              <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>감정 분석 이력</h4>
              {userEmotionHistory.length > 0 ? (
                <div className="table-responsive">
                  <table className="users-table" style={{ fontSize: '13px', tableLayout: 'fixed', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '120px' }}>분석 일시</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>감정 점수</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>우울</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>불안</th>
                        <th style={{ width: '70px', textAlign: 'center' }}>스트레스</th>
                        <th>분석 내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userEmotionHistory.map((emotion, idx) => {
                        // 분석일을 날짜와 시간 두 줄로 표시
                        const analysisDate = emotion.analysisDate ? toKoreanTime(emotion.analysisDate) : null;
                        const dateLine = analysisDate ? analysisDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }) : '-';
                        const timeLine = analysisDate ? analysisDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';

                        return (
                          <tr key={emotion.id || idx}>
                            <td style={{ verticalAlign: 'middle' }}>
                              <div style={{ lineHeight: '1.4' }}>
                                <div>{dateLine}</div>
                                <div style={{ color: '#64748B', fontSize: '12px' }}>{timeLine}</div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <span style={{
                                fontWeight: '500',
                                color: emotion.emotionScore >= 60 ? '#EF4444' : emotion.emotionScore >= 30 ? '#F59E0B' : '#10B981'
                              }}>
                                {emotion.emotionScore}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{emotion.depressionScore}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{emotion.anxietyScore}</td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{emotion.stressScore}</td>
                            <td style={{ verticalAlign: 'middle' }}>
                              <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                                {emotion.keywords || '-'}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  감정 분석 이력이 없습니다.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeEmotionDetailModal}>닫기</button>
              <button className="btn-primary" onClick={() => { closeEmotionDetailModal(); viewUserDetail(selectedUserEmotion.id); }}>
                사용자 상세 보기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 상세 정보 모달 */}
      {showUserDetailModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={(e) => { if (e.target.className === 'modal-overlay') closeUserDetailModal(); }}>
          <div className="modal-container" style={{ maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!isLoadingUserDetail && selectedUserDetail && (
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--admin-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {selectedUserDetail.profileImage ? (
                      <img
                        src={selectedUserDetail.profileImage}
                        alt={selectedUserDetail.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span style={{
                      display: selectedUserDetail.profileImage ? 'none' : 'flex',
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'var(--admin-primary)'
                    }}>
                      {selectedUserDetail.name?.[0] || '?'}
                    </span>
                  </div>
                )}
                <h3 className="modal-title">
                  {isLoadingUserDetail ? '정보 불러오는 중...' : `${selectedUserDetail?.name || ''} 님의 상세 정보`}
                </h3>
              </div>
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
                        <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>생년월일</div>
                        <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.birthDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>나이</div>
                        <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.age !== '-' ? `${selectedUserDetail.age}세` : '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>성별</div>
                        <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.gender}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: 'var(--admin-text-light)', marginBottom: '4px' }}>전화번호</div>
                        <div style={{ fontSize: '15px', fontWeight: '500' }}>{selectedUserDetail.phone}</div>
                      </div>
                      <div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--admin-text-dark)', margin: 0 }}>감정 분석 이력</h4>
                      {userDetailEmotionHistory.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--admin-text-light)' }}>표시 개수:</span>
                          <select
                            value={userDetailEmotionPageSize}
                            onChange={(e) => {
                              setUserDetailEmotionPageSize(Number(e.target.value));
                              setUserDetailEmotionPage(1);
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--admin-border)',
                              fontSize: '13px',
                              background: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            <option value={5}>5개</option>
                            <option value={10}>10개</option>
                            <option value={20}>20개</option>
                          </select>
                        </div>
                      )}
                    </div>
                    {isLoadingUserDetailEmotions ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--admin-text-light)' }}>
                        감정 이력을 불러오는 중...
                      </div>
                    ) : userDetailEmotionHistory.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--admin-text-light)' }}>
                        감정 분석 이력이 없습니다
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                              <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', color: 'var(--admin-text-light)', width: '130px' }}>분석일</th>
                              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)', width: '70px' }}>감정 상태</th>
                              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)', width: '70px' }}>감정 점수</th>
                              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)', width: '70px' }}>우울</th>
                              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)', width: '70px' }}>불안</th>
                              <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '600', color: 'var(--admin-text-light)', width: '70px' }}>스트레스</th>
                              <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: '600', color: 'var(--admin-text-light)' }}>분석 내용</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userDetailEmotionHistory
                              .slice((userDetailEmotionPage - 1) * userDetailEmotionPageSize, userDetailEmotionPage * userDetailEmotionPageSize)
                              .map((emotion, index) => {
                                const analysisDate = emotion.analysisDate ? toKoreanTime(emotion.analysisDate) : null;
                                const dateLine = analysisDate ? analysisDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' }) : '-';
                                const timeLine = analysisDate ? analysisDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';

                                return (
                                  <tr key={index} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                    <td style={{ padding: '8px 4px', verticalAlign: 'middle' }}>
                                      <div style={{ lineHeight: '1.4' }}>
                                        <div>{dateLine}</div>
                                        <div style={{ color: 'var(--admin-text-light)', fontSize: '12px' }}>{timeLine}</div>
                                      </div>
                                    </td>
                                    <td style={{ padding: '4px 2px', textAlign: 'center', verticalAlign: 'middle' }}>
                                      <span style={{
                                        display: 'inline-block',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap',
                                        background: getEmotionLevelFromScoreForStyle(emotion.emotionScore) === 'danger' ? '#FEE2E2' :
                                                   getEmotionLevelFromScoreForStyle(emotion.emotionScore) === 'warning' ? '#FEF3C7' : '#D1FAE5',
                                        color: getEmotionLevelFromScoreForStyle(emotion.emotionScore) === 'danger' ? '#DC2626' :
                                               getEmotionLevelFromScoreForStyle(emotion.emotionScore) === 'warning' ? '#D97706' : '#059669'
                                      }}>
                                        {mapScoreToEmotion(emotion.emotionScore)}
                                      </span>
                                    </td>
                                    <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '600', verticalAlign: 'middle' }}>
                                      {emotion.emotionScore ?? '-'}
                                    </td>
                                    <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                                      <span style={{
                                        color: getEmotionLevelFromScoreForStyle(emotion.depressionScore) === 'danger' ? '#EF4444' :
                                               getEmotionLevelFromScoreForStyle(emotion.depressionScore) === 'warning' ? '#F59E0B' : 'inherit'
                                      }}>
                                        {emotion.depressionScore ?? '-'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                                      <span style={{
                                        color: getEmotionLevelFromScoreForStyle(emotion.anxietyScore) === 'danger' ? '#EF4444' :
                                               getEmotionLevelFromScoreForStyle(emotion.anxietyScore) === 'warning' ? '#F59E0B' : 'inherit'
                                      }}>
                                        {emotion.anxietyScore ?? '-'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '8px 4px', textAlign: 'center', verticalAlign: 'middle' }}>
                                      <span style={{
                                        color: getEmotionLevelFromScoreForStyle(emotion.stressScore) === 'danger' ? '#EF4444' :
                                               getEmotionLevelFromScoreForStyle(emotion.stressScore) === 'warning' ? '#F59E0B' : 'inherit'
                                      }}>
                                        {emotion.stressScore ?? '-'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '8px 4px', verticalAlign: 'middle' }}>
                                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                                        {emotion.keywords || '-'}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                        {/* 페이지네이션 */}
                        {userDetailEmotionHistory.length > 0 && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--admin-border)'
                          }}>
                            <div style={{ fontSize: '13px', color: 'var(--admin-text-light)' }}>
                              {(userDetailEmotionPage - 1) * userDetailEmotionPageSize + 1}-{Math.min(userDetailEmotionPage * userDetailEmotionPageSize, userDetailEmotionHistory.length)} / 총 {userDetailEmotionHistory.length}건
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => setUserDetailEmotionPage(prev => Math.max(prev - 1, 1))}
                                disabled={userDetailEmotionPage === 1}
                                style={{
                                  padding: '6px 12px',
                                  border: '1px solid var(--admin-border)',
                                  borderRadius: '4px',
                                  background: userDetailEmotionPage === 1 ? 'var(--admin-bg)' : 'white',
                                  color: userDetailEmotionPage === 1 ? 'var(--admin-text-light)' : 'var(--admin-text)',
                                  cursor: userDetailEmotionPage === 1 ? 'not-allowed' : 'pointer',
                                  fontSize: '13px'
                                }}
                              >
                                이전
                              </button>
                              {Array.from({ length: Math.ceil(userDetailEmotionHistory.length / userDetailEmotionPageSize) }, (_, i) => i + 1).map(page => (
                                <button
                                  key={page}
                                  onClick={() => setUserDetailEmotionPage(page)}
                                  style={{
                                    padding: '6px 10px',
                                    border: '1px solid',
                                    borderColor: page === userDetailEmotionPage ? 'var(--admin-primary)' : 'var(--admin-border)',
                                    borderRadius: '4px',
                                    background: page === userDetailEmotionPage ? 'var(--admin-primary)' : 'white',
                                    color: page === userDetailEmotionPage ? 'white' : 'var(--admin-text)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: page === userDetailEmotionPage ? '600' : '400'
                                  }}
                                >
                                  {page}
                                </button>
                              ))}
                              <button
                                onClick={() => setUserDetailEmotionPage(prev => Math.min(prev + 1, Math.ceil(userDetailEmotionHistory.length / userDetailEmotionPageSize)))}
                                disabled={userDetailEmotionPage === Math.ceil(userDetailEmotionHistory.length / userDetailEmotionPageSize)}
                                style={{
                                  padding: '6px 12px',
                                  border: '1px solid var(--admin-border)',
                                  borderRadius: '4px',
                                  background: userDetailEmotionPage === Math.ceil(userDetailEmotionHistory.length / userDetailEmotionPageSize) ? 'var(--admin-bg)' : 'white',
                                  color: userDetailEmotionPage === Math.ceil(userDetailEmotionHistory.length / userDetailEmotionPageSize) ? 'var(--admin-text-light)' : 'var(--admin-text)',
                                  cursor: userDetailEmotionPage === Math.ceil(userDetailEmotionHistory.length / userDetailEmotionPageSize) ? 'not-allowed' : 'pointer',
                                  fontSize: '13px'
                                }}
                              >
                                다음
                              </button>
                            </div>
                          </div>
                        )}
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

export default EmotionMonitor;
