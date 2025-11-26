import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/admin-responsive.css';

// 아이콘 import
import downloadIcon from '../assets/icons/download.svg';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';
import messageCircleIcon from '../assets/icons/message-circle.svg';
import usersIcon from '../assets/icons/users.svg';
import searchIcon from '../assets/icons/users.svg';

function Conversation() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedUser, setSelectedUser] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 샘플 데이터 - 대화 통계
  const conversationStats = {
    총대화: 271,
    평균대화길이: 12.5,
    활성이용자: 8,
    오늘대화: 23
  };

  // 샘플 데이터 - 최근 대화 목록
  const conversations = [
    {
      id: 1,
      userId: 1,
      userName: '김민수',
      userAge: 24,
      date: '2025-11-26 09:30',
      messageCount: 18,
      duration: '15분',
      mainTopic: '취업 고민',
      sentiment: '부정',
      keywords: ['취업', '불안', '스트레스'],
      summary: '최근 취업 준비로 인한 스트레스와 불안감 호소. 면접 실패 경험에 대한 좌절감 표현.'
    },
    {
      id: 2,
      userId: 2,
      userName: '박지원',
      userAge: 28,
      date: '2025-11-25 14:20',
      messageCount: 12,
      duration: '10분',
      mainTopic: '일상 대화',
      sentiment: '중립',
      keywords: ['일상', '날씨', '운동'],
      summary: '오늘 하루 일과에 대한 이야기. 운동을 시작해보고 싶다는 의사 표현.'
    },
    {
      id: 3,
      userId: 3,
      userName: '이서연',
      userAge: 22,
      date: '2025-11-26 10:15',
      messageCount: 8,
      duration: '8분',
      mainTopic: '취미 활동',
      sentiment: '긍정',
      keywords: ['그림', '취미', '행복'],
      summary: '최근 시작한 그림 그리기에 대한 긍정적인 경험 공유. 새로운 취미로 기분이 좋아졌다고 표현.'
    },
    {
      id: 4,
      userId: 4,
      userName: '최준호',
      userAge: 31,
      date: '2025-11-26 08:45',
      messageCount: 15,
      duration: '12분',
      mainTopic: '대인관계',
      sentiment: '중립',
      keywords: ['친구', '모임', '고민'],
      summary: '친구들과의 모임에 참석할지 고민 중. 사람 만나는 것에 대한 부담감과 기대감이 공존.'
    },
    {
      id: 5,
      userId: 5,
      userName: '정수빈',
      userAge: 26,
      date: '2025-11-25 16:30',
      messageCount: 10,
      duration: '9분',
      mainTopic: '가족 관계',
      sentiment: '중립',
      keywords: ['가족', '부모님', '대화'],
      summary: '부모님과의 대화가 어렵다는 고민. 세대 차이로 인한 의사소통 문제.'
    },
    {
      id: 6,
      userId: 6,
      userName: '강태현',
      userAge: 29,
      date: '2025-11-20 11:20',
      messageCount: 5,
      duration: '5분',
      mainTopic: '무기력',
      sentiment: '부정',
      keywords: ['무기력', '우울', '의욕'],
      summary: '아침에 일어나기 힘들고 아무것도 하기 싫다는 무기력감 호소. 계속되는 우울감.'
    },
    {
      id: 7,
      userId: 7,
      userName: '한지우',
      userAge: 23,
      date: '2025-11-26 09:00',
      messageCount: 14,
      duration: '11분',
      mainTopic: '진로 상담',
      sentiment: '긍정',
      keywords: ['진로', '목표', '계획'],
      summary: '앞으로의 진로에 대한 긍정적인 계획 수립. 단계별 목표 설정에 대한 의지 표현.'
    },
    {
      id: 8,
      userId: 8,
      userName: '오성민',
      userAge: 33,
      date: '2025-11-25 19:45',
      messageCount: 16,
      duration: '13분',
      mainTopic: '건강 관리',
      sentiment: '중립',
      keywords: ['건강', '수면', '생활습관'],
      summary: '불규칙한 생활 패턴으로 인한 건강 우려. 수면 문제와 식습관 개선 의지.'
    }
  ];

  const getSentimentColor = (sentiment) => {
    if (sentiment === '긍정') return '#10B981';
    if (sentiment === '부정') return '#EF4444';
    return '#FCD34D';
  };

  const getSentimentBadge = (sentiment) => {
    return (
      <span
        className="status-badge"
        style={{
          backgroundColor: getSentimentColor(sentiment) + '20',
          color: getSentimentColor(sentiment),
          border: `1px solid ${getSentimentColor(sentiment)}`
        }}
      >
        {sentiment}
      </span>
    );
  };

  const viewConversationDetail = (conversationId) => {
    alert(`대화 ID ${conversationId}의 상세 내용을 표시합니다.`);
  };

  const exportData = () => {
    alert('대화 데이터를 Excel로 내보냅니다.');
  };

  // 필터링된 대화
  const filteredConversations = conversations.filter(conv => {
    if (selectedUser !== 'all' && conv.userId.toString() !== selectedUser) return false;
    if (searchQuery && !conv.userName.includes(searchQuery) && !conv.mainTopic.includes(searchQuery)) return false;
    return true;
  });

  return (
    <AdminLayout>
      {/* 페이지 헤더 */}
      <div className="page-header">
        <h2>대화 분석</h2>
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

      {/* 대화 통계 카드 */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0E7FF' }}>
            <img src={messageCircleIcon} alt="총 대화" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{conversationStats.총대화}</span>
            <span className="stat-label">총 대화 수</span>
            <span className="stat-change positive">+23 오늘</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#D1FAE5' }}>
            <img src={usersIcon} alt="활성 이용자" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{conversationStats.활성이용자}</span>
            <span className="stat-label">활성 이용자</span>
            <span className="stat-change positive">대화 참여</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <img src={messageCircleIcon} alt="평균 대화" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{conversationStats.평균대화길이}</span>
            <span className="stat-label">평균 메시지 수</span>
            <span className="stat-change">대화당</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DBEAFE' }}>
            <img src={messageCircleIcon} alt="오늘 대화" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{conversationStats.오늘대화}</span>
            <span className="stat-label">오늘 대화</span>
            <span className="stat-change positive">진행 중</span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="search-filter-section" style={{ marginBottom: '24px' }}>
        <div className="search-bar">
          <div className="search-input-wrapper">
            <img src={searchIcon} alt="검색" className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="이용자명 또는 주제로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="day">오늘</option>
            <option value="week">최근 7일</option>
            <option value="month">최근 30일</option>
            <option value="all">전체</option>
          </select>

          <select
            className="filter-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="all">전체 이용자</option>
            {conversations.map(conv => (
              <option key={conv.userId} value={conv.userId}>
                {conv.userName}
              </option>
            )).filter((option, index, self) =>
              index === self.findIndex((t) => t.key === option.key)
            )}
          </select>
        </div>
      </div>

      {/* 대화 목록 */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>최근 대화 목록</h3>
            <span className="card-subtitle">{filteredConversations.length}개의 대화</span>
          </div>
        </div>

        <div className="conversation-list">
          {filteredConversations.map(conv => (
            <div key={conv.id} className="conversation-item">
              <div className="conversation-header">
                <div className="conversation-user">
                  <div className="user-avatar-small" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#E0E7FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#667EEA'
                  }}>
                    {conv.userName[0]}
                  </div>
                  <div className="user-info-small">
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{conv.userName}</div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>{conv.userAge}세</div>
                  </div>
                </div>
                <div className="conversation-meta">
                  <div style={{ fontSize: '13px', color: '#64748B' }}>{conv.date}</div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>
                    {conv.messageCount}개 메시지 · {conv.duration}
                  </div>
                </div>
              </div>

              <div className="conversation-content">
                <div className="conversation-topic">
                  <span style={{ fontWeight: '600', color: '#334155' }}>주제:</span>
                  <span style={{ marginLeft: '8px', color: '#64748B' }}>{conv.mainTopic}</span>
                  {getSentimentBadge(conv.sentiment)}
                </div>

                <div className="conversation-summary">
                  {conv.summary}
                </div>

                <div className="conversation-keywords">
                  {conv.keywords.map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="conversation-actions">
                <button
                  className="action-button"
                  onClick={() => viewConversationDetail(conv.id)}
                >
                  상세 보기
                </button>
                <button
                  className="action-button"
                  onClick={() => navigate(`/admin/users?id=${conv.userId}`)}
                >
                  이용자 정보
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredConversations.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748B'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              검색 결과가 없습니다
            </div>
            <div style={{ fontSize: '14px' }}>
              다른 검색어나 필터를 시도해보세요
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Conversation;
