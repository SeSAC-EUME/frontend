import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/admin-responsive.css';

// 아이콘 import
import downloadIcon from '../assets/icons/download.svg';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';
import heartIcon from '../assets/icons/heart.svg';
import usersIcon from '../assets/icons/users.svg';
import triangleAlertIcon from '../assets/icons/triangle-alert.svg';

function EmotionMonitor() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedEmotion, setSelectedEmotion] = useState('all');

  // 샘플 데이터 - 감정 통계
  const emotionStats = {
    총이용자: 8,
    긍정: 3,
    보통: 3,
    부정: 2,
    위험: 2
  };

  // 샘플 데이터 - 감정 분포
  const emotionDistribution = [
    { emotion: '매우 좋음', count: 1, percentage: 12.5, color: '#10B981' },
    { emotion: '좋음', count: 2, percentage: 25, color: '#34D399' },
    { emotion: '보통', count: 3, percentage: 37.5, color: '#FCD34D' },
    { emotion: '우울', count: 1, percentage: 12.5, color: '#F59E0B' },
    { emotion: '매우 우울', count: 1, percentage: 12.5, color: '#EF4444' }
  ];

  // 샘플 데이터 - 이용자별 감정 현황
  const userEmotions = [
    {
      id: 1,
      name: '김민수',
      age: 24,
      currentEmotion: '우울',
      emotionLevel: 'high',
      trend: 'down',
      lastUpdate: '2025-11-26 09:30',
      weeklyAvg: 65,
      conversationCount: 45
    },
    {
      id: 2,
      name: '박지원',
      age: 28,
      currentEmotion: '보통',
      emotionLevel: 'medium',
      trend: 'stable',
      lastUpdate: '2025-11-25 14:20',
      weeklyAvg: 50,
      conversationCount: 32
    },
    {
      id: 3,
      name: '이서연',
      age: 22,
      currentEmotion: '좋음',
      emotionLevel: 'low',
      trend: 'up',
      lastUpdate: '2025-11-26 10:15',
      weeklyAvg: 30,
      conversationCount: 28
    },
    {
      id: 4,
      name: '최준호',
      age: 31,
      currentEmotion: '좋음',
      emotionLevel: 'low',
      trend: 'stable',
      lastUpdate: '2025-11-26 08:45',
      weeklyAvg: 25,
      conversationCount: 52
    },
    {
      id: 5,
      name: '정수빈',
      age: 26,
      currentEmotion: '보통',
      emotionLevel: 'medium',
      trend: 'stable',
      lastUpdate: '2025-11-25 16:30',
      weeklyAvg: 55,
      conversationCount: 38
    },
    {
      id: 6,
      name: '강태현',
      age: 29,
      currentEmotion: '매우 우울',
      emotionLevel: 'high',
      trend: 'down',
      lastUpdate: '2025-11-20 11:20',
      weeklyAvg: 85,
      conversationCount: 15
    },
    {
      id: 7,
      name: '한지우',
      age: 23,
      currentEmotion: '매우 좋음',
      emotionLevel: 'low',
      trend: 'up',
      lastUpdate: '2025-11-26 09:00',
      weeklyAvg: 15,
      conversationCount: 22
    },
    {
      id: 8,
      name: '오성민',
      age: 33,
      currentEmotion: '보통',
      emotionLevel: 'medium',
      trend: 'stable',
      lastUpdate: '2025-11-25 19:45',
      weeklyAvg: 45,
      conversationCount: 41
    }
  ];

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

  const exportData = () => {
    alert('감정 데이터를 Excel로 내보냅니다.');
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
          <button className="action-button" onClick={exportData}>
            <img src={downloadIcon} alt="내보내기" className="button-icon" />
            데이터 내보내기
          </button>
          <button className="action-button primary" onClick={() => window.location.reload()}>
            <img src={refreshCwIcon} alt="새로고침" className="button-icon" />
            새로고침
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
