import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import axiosBlob, { downloadBlob, extractFilename } from '../../shared/api/axiosBlob';
import { toKoreanTime } from '../../shared/utils/dateUtils';
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
  긍정: 0,
  보통: 0,
  부정: 0,
};

// 기본 감정 분포 (폴백용)
const defaultDistribution = [
  { emotion: '매우 좋음', count: 0, percentage: 0, color: '#10B981' },
  { emotion: '좋음', count: 0, percentage: 0, color: '#34D399' },
  { emotion: '보통', count: 0, percentage: 0, color: '#FCD34D' },
  { emotion: '우울', count: 0, percentage: 0, color: '#F59E0B' },
  { emotion: '매우 우울', count: 0, percentage: 0, color: '#EF4444' },
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

  // 데이터 로드
  useEffect(() => {
    loadEmotionData();
  }, [selectedPeriod]);

  // 감정 데이터 로드
  const loadEmotionData = async () => {
    setIsLoading(true);
    try {
      // 사용자 목록 조회 (감정 정보 포함)
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS);
      const users = Array.isArray(response) ? response : response.users || [];

      // 사용자 데이터를 감정 현황 형식으로 변환
      const emotionData = users.map((user) => ({
        id: user.id || user.userId,
        name: user.userName || user.name || '사용자',
        age: calculateAge(user.birthDate),
        currentEmotion: mapEmotionLabel(user.emotionStatus || user.emotion),
        emotionLevel: getEmotionLevel(user.emotionStatus || user.emotion),
        trend: user.emotionTrend || 'stable',
        lastUpdate: formatDateTime(user.lastActiveAt || user.updatedAt),
        weeklyAvg: user.weeklyEmotionAvg || 50,
        conversationCount: user.conversationCount || 0,
      }));

      setUserEmotions(emotionData);

      // 통계 계산
      calculateStats(emotionData);
    } catch (error) {
      console.error('감정 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 통계 계산
  const calculateStats = (users) => {
    const stats = {
      총이용자: users.length,
      긍정: 0,
      보통: 0,
      부정: 0,
    };

    const distribution = {
      '매우 좋음': 0,
      '좋음': 0,
      '보통': 0,
      '우울': 0,
      '매우 우울': 0,
    };

    users.forEach((user) => {
      const emotion = user.currentEmotion;
      if (['매우 좋음', '좋음'].includes(emotion)) stats.긍정++;
      else if (emotion === '보통') stats.보통++;
      else if (['우울', '매우 우울'].includes(emotion)) stats.부정++;

      if (distribution[emotion] !== undefined) {
        distribution[emotion]++;
      }
    });

    setEmotionStats(stats);

    // 분포 계산
    const total = users.length || 1;
    setEmotionDistribution([
      { emotion: '매우 좋음', count: distribution['매우 좋음'], percentage: Math.round((distribution['매우 좋음'] / total) * 100), color: '#10B981' },
      { emotion: '좋음', count: distribution['좋음'], percentage: Math.round((distribution['좋음'] / total) * 100), color: '#34D399' },
      { emotion: '보통', count: distribution['보통'], percentage: Math.round((distribution['보통'] / total) * 100), color: '#FCD34D' },
      { emotion: '우울', count: distribution['우울'], percentage: Math.round((distribution['우울'] / total) * 100), color: '#F59E0B' },
      { emotion: '매우 우울', count: distribution['매우 우울'], percentage: Math.round((distribution['매우 우울'] / total) * 100), color: '#EF4444' },
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

  // 감정 상태 매핑
  const mapEmotionLabel = (emotion) => {
    const emotionMap = {
      'VERY_GOOD': '매우 좋음',
      'GOOD': '좋음',
      'NEUTRAL': '보통',
      'SAD': '우울',
      'VERY_SAD': '매우 우울',
    };
    return emotionMap[emotion] || emotion || '보통';
  };

  // 감정 레벨 결정
  const getEmotionLevel = (emotion) => {
    if (['VERY_SAD', '매우 우울', 'SAD', '우울'].includes(emotion)) return 'high';
    if (['NEUTRAL', '보통'].includes(emotion)) return 'medium';
    return 'low';
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
      '매우 좋음': '#10B981',
      '좋음': '#34D399',
      '보통': '#FCD34D',
      '우울': '#F59E0B',
      '매우 우울': '#EF4444'
    };
    return colorMap[emotion] || '#94A3B8';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
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

  const viewUserDetail = (userId) => {
    navigate(`/admin/users?id=${userId}`);
  };

  // 필터링된 사용자
  const filteredUsers = userEmotions.filter(user => {
    if (selectedEmotion === 'all') return true;
    if (selectedEmotion === 'positive') return ['매우 좋음', '좋음'].includes(user.currentEmotion);
    if (selectedEmotion === 'neutral') return user.currentEmotion === '보통';
    if (selectedEmotion === 'negative') return ['우울', '매우 우울'].includes(user.currentEmotion);
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
            <img src={heartIcon} alt="긍정" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{emotionStats.긍정}</span>
            <span className="stat-label">긍정 감정</span>
            <span className="stat-change positive">좋음 이상</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <img src={heartIcon} alt="보통" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{emotionStats.보통}</span>
            <span className="stat-label">보통 감정</span>
            <span className="stat-change">안정 상태</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEE2E2' }}>
            <img src={triangleAlertIcon} alt="부정" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{emotionStats.부정}</span>
            <span className="stat-label">부정 감정</span>
            <span className="stat-change negative">우울 이상</span>
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
            <option value="positive">긍정 (좋음 이상)</option>
            <option value="neutral">보통</option>
            <option value="negative">부정 (우울 이상)</option>
          </select>
        </div>
      </div>

      {/* 감정 분포 차트 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>감정 분포</h3>
          <span className="card-subtitle">전체 이용자의 현재 감정 상태</span>
        </div>
        <div className="emotion-distribution">
          {emotionDistribution.map((item, index) => (
            <div key={index} className="emotion-item">
              <div className="emotion-info">
                <span className="emotion-label">{item.emotion}</span>
                <span className="emotion-count">{item.count}명 ({item.percentage}%)</span>
              </div>
              <div className="emotion-bar-container">
                <div
                  className="emotion-bar"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
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
                <th>현재 감정</th>
                <th>추세</th>
                <th>주간 평균</th>
                <th>대화 횟수</th>
                <th>최근 업데이트</th>
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
                    <span style={{
                      fontSize: '20px',
                      color: getTrendColor(user.trend),
                      fontWeight: 'bold'
                    }}>
                      {getTrendIcon(user.trend)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        background: '#E2E8F0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${user.weeklyAvg}%`,
                          height: '100%',
                          background: user.weeklyAvg > 70 ? '#EF4444' : user.weeklyAvg > 40 ? '#FCD34D' : '#10B981',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '500', minWidth: '35px' }}>
                        {user.weeklyAvg}
                      </span>
                    </div>
                  </td>
                  <td>{user.conversationCount}회</td>
                  <td style={{ fontSize: '13px', color: '#64748B' }}>
                    {user.lastUpdate}
                  </td>
                  <td>
                    <button
                      className="table-action-btn"
                      onClick={() => viewUserDetail(user.id)}
                      style={{ fontSize: '13px', padding: '6px 12px' }}
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default EmotionMonitor;
