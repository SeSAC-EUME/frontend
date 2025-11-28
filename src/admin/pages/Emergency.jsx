import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/admin-responsive.css';

function Emergency() {
  const [currentFilter, setCurrentFilter] = useState('all');
  const [emergencies, setEmergencies] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [realtimeStats, setRealtimeStats] = useState({
    activeUsers: 45,
    ongoingChats: 12,
    criticalAlerts: 3,
    responseTime: 1.2
  });

  // 데이터 초기화 (인증은 AdminLayout에서 처리)
  useEffect(() => {
    initializeData();
    startRealtimeUpdates();
  }, []);

  const initializeData = () => {
    setEmergencies(generateEmergencies());
    setActiveUsers(generateActiveUsers());
  };

  // 긴급상황 데이터 생성
  const generateEmergencies = () => {
    const users = [
      { id: 1, name: '김영희', age: 78, address: '서울시 강남구' },
      { id: 2, name: '박철수', age: 82, address: '서울시 마포구' },
      { id: 3, name: '이순자', age: 75, address: '서울시 종로구' },
      { id: 4, name: '최영수', age: 80, address: '서울시 송파구' },
      { id: 5, name: '정미란', age: 76, address: '서울시 서초구' },
      { id: 6, name: '강동원', age: 84, address: '서울시 영등포구' }
    ];

    const types = ['낙상', '응급', '외로움', '건강', '약물', '우울', '통증', '호흡곤란'];
    const emergenciesData = [];

    for (let i = 0; i < 5; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const level = i < 2 ? 'critical' : (i < 4 ? 'high' : 'medium');
      const status = i < 2 ? 'new' : (i < 4 ? 'in-progress' : 'resolved');
      const type = types[Math.floor(Math.random() * types.length)];

      const now = new Date();
      const minutesAgo = Math.floor(Math.random() * 180);
      const time = new Date(now - minutesAgo * 60000);

      emergenciesData.push({
        id: i + 1,
        user: user,
        level: level,
        status: status,
        type: type,
        description: generateEmergencyDescription(type, user.name),
        time: time.toISOString(),
        tags: generateTags(type, level)
      });
    }

    return emergenciesData.sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  // 긴급상황 설명 생성
  const generateEmergencyDescription = (type, userName) => {
    const descriptions = {
      '낙상': `${userName}님이 낙상 사고를 보고했습니다. 즉각적인 확인이 필요합니다.`,
      '응급': `${userName}님에게 응급 상황이 발생했습니다. 즉시 대응이 필요합니다.`,
      '외로움': `${userName}님이 극심한 외로움을 호소하고 있습니다.`,
      '건강': `${userName}님의 건강 상태가 좋지 않다고 보고되었습니다.`,
      '약물': `${userName}님이 약물 복용에 어려움을 겪고 있습니다.`,
      '우울': `${userName}님이 우울감을 강하게 호소하고 있습니다.`,
      '통증': `${userName}님이 심한 통증을 호소하고 있습니다.`,
      '호흡곤란': `${userName}님이 호흡 곤란을 호소하고 있습니다.`
    };
    return descriptions[type] || `${userName}님에게 긴급 상황이 발생했습니다.`;
  };

  // 태그 생성
  const generateTags = (type, level) => {
    const tags = [type];
    if (level === 'critical') {
      tags.push('119 필요');
    } else if (level === 'high') {
      tags.push('보호자 연락');
    }
    tags.push('모니터링 필요');
    return tags;
  };

  // 활성 사용자 생성
  const generateActiveUsers = () => {
    const users = [
      { id: 1, name: '김영희', activity: '채팅 중' },
      { id: 2, name: '박철수', activity: '복지정보 열람' },
      { id: 3, name: '이순자', activity: '건강기록 작성' },
      { id: 4, name: '최영수', activity: '채팅 중' },
      { id: 5, name: '정미란', activity: '메인 화면' },
      { id: 6, name: '강동원', activity: '설정 변경' },
      { id: 7, name: '한미숙', activity: '채팅 중' },
      { id: 8, name: '오병호', activity: '복지정보 열람' }
    ];

    return users.map((user) => ({
      ...user,
      lastActive: new Date(Date.now() - Math.random() * 300000).toISOString()
    }));
  };

  // 실시간 업데이트 시작
  const startRealtimeUpdates = () => {
    const statsInterval = setInterval(() => {
      setRealtimeStats(prev => ({
        activeUsers: Math.max(20, prev.activeUsers + Math.floor(Math.random() * 11) - 5),
        ongoingChats: Math.max(0, prev.ongoingChats + Math.floor(Math.random() * 7) - 3),
        criticalAlerts: emergencies.filter(e => e.level === 'critical' && e.status !== 'resolved').length,
        responseTime: Math.max(0.5, Math.min(3.0, prev.responseTime + (Math.random() - 0.5)))
      }));
    }, 5000);

    const usersInterval = setInterval(() => {
      setActiveUsers(prev => prev.map(user => {
        if (Math.random() > 0.7) {
          const activities = ['채팅 중', '복지정보 열람', '건강기록 작성', '메인 화면', '설정 변경'];
          return {
            ...user,
            activity: activities[Math.floor(Math.random() * activities.length)],
            lastActive: new Date().toISOString()
          };
        }
        return user;
      }));
    }, 10000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(usersInterval);
    };
  };

  // 필터링된 긴급상황
  const getFilteredEmergencies = () => {
    if (currentFilter === 'all') {
      return emergencies;
    }
    return emergencies.filter(e => e.level === currentFilter || e.status === currentFilter);
  };

  const filteredEmergencies = getFilteredEmergencies();

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleEmergency = (emergencyId) => {
    const emergency = emergencies.find(e => e.id === emergencyId);
    if (emergency && window.confirm(`${emergency.user.name}님에게 연락하시겠습니까?`)) {
      alert('연락 중...');
      setEmergencies(prev => prev.map(e =>
        e.id === emergencyId ? { ...e, status: 'in-progress' } : e
      ));
    }
  };

  const viewEmergencyDetail = (emergencyId) => {
    alert('긴급 상황 상세 정보를 표시합니다.\n이 기능은 추후 구현됩니다.');
  };

  const resolveEmergency = (emergencyId) => {
    const emergency = emergencies.find(e => e.id === emergencyId);
    if (emergency && window.confirm('이 긴급 상황을 해결 완료 처리하시겠습니까?')) {
      setEmergencies(prev => prev.map(e =>
        e.id === emergencyId ? { ...e, status: 'resolved' } : e
      ));
      alert('해결 완료 처리되었습니다.');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'new': '신규',
      'in-progress': '처리중',
      'resolved': '해결완료'
    };
    return statusMap[status] || status;
  };

  const getLevelIcon = (level) => {
    const iconMap = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': 'ℹ️',
      'resolved': '✅'
    };
    return iconMap[level] || '📢';
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

  return (
    <AdminLayout>
        {/* 페이지 헤더 */}
        <div className="page-header">
          <div>
            <h2>긴급 상황 모니터링</h2>
            <div className="realtime-status">
              <div className="realtime-indicator"></div>
              실시간 모니터링 중
            </div>
          </div>
          <div className="page-actions">
            <button className="action-button" onClick={() => window.location.reload()}>
              <img src="/admin-ui/assets/icons/refresh-cw.svg" alt="새로고침" className="button-icon" />
              새로고침
            </button>
          </div>
        </div>

        {/* 실시간 통계 */}
        <div className="realtime-stats">
          <div className="realtime-stat-card" data-stat="active-users">
            <div className="realtime-stat-header">
              <div className="realtime-stat-label">활성 사용자</div>
              <div className="realtime-stat-badge">LIVE</div>
            </div>
            <div className="realtime-stat-value">{realtimeStats.activeUsers}</div>
            <div className="realtime-stat-change up">+5 ▲</div>
          </div>

          <div className="realtime-stat-card" data-stat="ongoing-chats">
            <div className="realtime-stat-header">
              <div className="realtime-stat-label">진행 중인 대화</div>
              <div className="realtime-stat-badge">LIVE</div>
            </div>
            <div className="realtime-stat-value">{realtimeStats.ongoingChats}</div>
            <div className="realtime-stat-change up">+2 ▲</div>
          </div>

          <div className="realtime-stat-card" data-stat="critical-alerts">
            <div className="realtime-stat-header">
              <div className="realtime-stat-label">긴급 알림</div>
              <div className="realtime-stat-badge">LIVE</div>
            </div>
            <div className="realtime-stat-value">{realtimeStats.criticalAlerts}</div>
            <div className="realtime-stat-change down">-1 ▼</div>
          </div>

          <div className="realtime-stat-card" data-stat="response-time">
            <div className="realtime-stat-header">
              <div className="realtime-stat-label">평균 응답 시간</div>
              <div className="realtime-stat-badge">LIVE</div>
            </div>
            <div className="realtime-stat-value">{realtimeStats.responseTime.toFixed(1)}</div>
            <div className="realtime-stat-change down">-0.3 ▼ (초)</div>
          </div>
        </div>

        {/* 필터 */}
        <div className="emergency-filters">
          <button
            className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            전체
          </button>
          <button
            className={`filter-btn ${currentFilter === 'critical' ? 'active' : ''}`}
            onClick={() => handleFilterChange('critical')}
          >
            긴급
          </button>
          <button
            className={`filter-btn ${currentFilter === 'high' ? 'active' : ''}`}
            onClick={() => handleFilterChange('high')}
          >
            높음
          </button>
          <button
            className={`filter-btn ${currentFilter === 'medium' ? 'active' : ''}`}
            onClick={() => handleFilterChange('medium')}
          >
            보통
          </button>
          <button
            className={`filter-btn ${currentFilter === 'resolved' ? 'active' : ''}`}
            onClick={() => handleFilterChange('resolved')}
          >
            해결완료
          </button>
        </div>

        {/* 긴급 알림 목록 */}
        <div className="emergency-alerts">
          {filteredEmergencies.length === 0 ? (
            <div className="empty-emergency">
              <div className="empty-emergency-title">긴급 상황이 없습니다</div>
              <div className="empty-emergency-description">모든 이용자가 안전한 상태입니다</div>
            </div>
          ) : (
            filteredEmergencies.map(emergency => (
              <div key={emergency.id} className={`emergency-card ${emergency.level} ${emergency.status}`}>
                <div className="emergency-header">
                  <div className="emergency-level">
                    <div className="emergency-icon">{getLevelIcon(emergency.level)}</div>
                    <div className="emergency-level-info">
                      <div className="emergency-level-label">{emergency.type}</div>
                      <div className="emergency-time">{formatDateTime(emergency.time)}</div>
                    </div>
                  </div>
                  <div className={`emergency-status-badge ${emergency.status}`}>{getStatusText(emergency.status)}</div>
                </div>

                <div className="emergency-body">
                  <div className="emergency-user">
                    <div className="emergency-user-avatar">{emergency.user.name[0]}</div>
                    <div className="emergency-user-info">
                      <div className="emergency-user-name">{emergency.user.name}</div>
                      <div className="emergency-user-meta">{emergency.user.age}세 · {emergency.user.address}</div>
                    </div>
                  </div>

                  <div className="emergency-description">{emergency.description}</div>

                  <div className="emergency-tags">
                    {emergency.tags.map((tag, idx) => (
                      <span key={idx} className="emergency-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="emergency-footer">
                  {emergency.status !== 'resolved' ? (
                    <>
                      <button className="emergency-action-btn primary" onClick={() => handleEmergency(emergency.id)}>
                        <img src="/admin-ui/assets/icons/phone.svg" alt="연락" style={{ filter: 'brightness(0) invert(1)' }} />
                        연락하기
                      </button>
                      <button className="emergency-action-btn" onClick={() => viewEmergencyDetail(emergency.id)}>
                        <img src="/admin-ui/assets/icons/user.svg" alt="상세" />
                        상세보기
                      </button>
                      <button className="emergency-action-btn" onClick={() => resolveEmergency(emergency.id)}>
                        <img src="/admin-ui/assets/icons/circle-check.svg" alt="완료" />
                        해결완료
                      </button>
                    </>
                  ) : (
                    <button className="emergency-action-btn" onClick={() => viewEmergencyDetail(emergency.id)}>
                      <img src="/admin-ui/assets/icons/user.svg" alt="상세" />
                      상세보기
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 활성 사용자 패널 */}
        <div className="active-users-panel">
          <div className="analysis-header">
            <div>
              <div className="analysis-title">활성 사용자</div>
              <div className="analysis-subtitle">현재 서비스를 이용 중인 사용자</div>
            </div>
          </div>
          <div className="active-users-list">
            {activeUsers.map(user => (
              <div key={user.id} className="active-user-item">
                <div className="active-user-avatar">{user.name[0]}</div>
                <div className="active-user-info">
                  <div className="active-user-name">{user.name}</div>
                  <div className="active-user-activity">{user.activity}</div>
                </div>
                <div className="active-user-time">{formatDateTime(user.lastActive)}</div>
              </div>
            ))}
          </div>
        </div>
    </AdminLayout>
  );
}

export default Emergency;
