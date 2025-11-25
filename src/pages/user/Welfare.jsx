import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';

function Welfare() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentViews, setRecentViews] = useState([]);

  // 복지 정보 데이터
  const welfareData = {
    'meal-service': {
      id: 'meal-service',
      title: '독거노인 도시락 서비스',
      description: '주 5일 영양 도시락 무료 배달',
      icon: '🍱',
      category: 'meal'
    },
    'health-visit': {
      id: 'health-visit',
      title: '방문 건강 관리',
      description: '월 2회 간호사 방문 서비스',
      icon: '🏥',
      category: 'health'
    },
    'basic-pension': {
      id: 'basic-pension',
      title: '기초연금',
      description: '만 65세 이상 소득 하위 70%',
      icon: '👴',
      category: 'economy'
    },
    'senior-university': {
      id: 'senior-university',
      title: '노인 대학',
      description: '평생교육 프로그램',
      icon: '🎓',
      category: 'education'
    }
  };

  useEffect(() => {
    loadRecentViews();
  }, []);

  const loadRecentViews = () => {
    const stored = localStorage.getItem('eume_recent_welfare');
    if (stored) {
      try {
        setRecentViews(JSON.parse(stored));
      } catch (e) {
        console.error('최근 본 복지 정보 로드 실패:', e);
      }
    }
  };

  const addToRecentViews = (welfareInfo) => {
    if (!welfareInfo) return;

    // 중복 제거
    const filtered = recentViews.filter(item => item.id !== welfareInfo.id);

    // 최신 항목을 앞에 추가
    const updated = [welfareInfo, ...filtered];

    // 최대 10개만 유지
    const limited = updated.slice(0, 10);

    // 저장
    try {
      localStorage.setItem('eume_recent_welfare', JSON.stringify(limited));
      setRecentViews(limited);
    } catch (e) {
      console.error('최근 본 복지 정보 저장 실패:', e);
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // 실제 검색 로직은 여기에 추가 가능
    if (e.target.value.trim().length > 0) {
      console.log('검색:', e.target.value);
    }
  };

  const viewDetail = (welfareId) => {
    const welfareInfo = welfareData[welfareId];
    if (welfareInfo) {
      addToRecentViews(welfareInfo);
    }
    // 상세 페이지로 이동하는 대신 알림 표시
    alert(`${welfareId} 상세 페이지는 준비 중입니다.`);
  };

  const viewCategory = (category) => {
    alert(`${category} 카테고리 페이지는 준비 중입니다.`);
  };

  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  };

  return (
    <div className="app-container">
      <header className="welfare-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span>←</span>
        </button>
        <h1 className="page-title">복지 정보</h1>
        <button className="search-button" onClick={openSearch}>
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </header>

      {searchOpen && (
        <div className="search-bar" id="searchBar">
          <input
            type="text"
            className="search-input"
            id="searchInput"
            placeholder="복지 정보 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            autoFocus
          />
          <button className="search-close" onClick={closeSearch}>✕</button>
        </div>
      )}

      <main className="welfare-content">
        <section className="recommendation-section">
          <h2 className="section-title">
            <span className="title-icon">⭐</span>
            맞춤 추천
          </h2>
          <div className="recommendation-cards">
            <div className="recommendation-card featured">
              <div className="card-badge">추천</div>
              <div className="card-icon">🍱</div>
              <h3 className="card-title">독거노인 도시락 서비스</h3>
              <p className="card-description">
                주 5일 영양 도시락 무료 배달
              </p>
              <div className="card-tags">
                <span className="tag">무료</span>
                <span className="tag">식사지원</span>
              </div>
              <button className="card-button" onClick={() => viewDetail('meal-service')}>
                자세히 보기 →
              </button>
            </div>

            <div className="recommendation-card">
              <div className="card-icon">🏥</div>
              <h3 className="card-title">방문 건강 관리</h3>
              <p className="card-description">
                월 2회 간호사 방문 서비스
              </p>
              <button className="card-button" onClick={() => viewDetail('health-visit')}>
                자세히 보기 →
              </button>
            </div>
          </div>
        </section>

        <section className="category-section">
          <h2 className="section-title">카테고리별 찾기</h2>
          <div className="category-grid">
            <button className="category-item" onClick={() => viewCategory('health')}>
              <div className="category-icon health">🏥</div>
              <span className="category-name">건강/의료</span>
              <span className="category-count">12개</span>
            </button>

            <button className="category-item" onClick={() => viewCategory('housing')}>
              <div className="category-icon housing">🏠</div>
              <span className="category-name">주거/생활</span>
              <span className="category-count">8개</span>
            </button>

            <button className="category-item" onClick={() => viewCategory('economy')}>
              <div className="category-icon economy">💰</div>
              <span className="category-name">경제지원</span>
              <span className="category-count">15개</span>
            </button>

            <button className="category-item" onClick={() => viewCategory('culture')}>
              <div className="category-icon culture">🎭</div>
              <span className="category-name">문화/여가</span>
              <span className="category-count">10개</span>
            </button>

            <button className="category-item" onClick={() => viewCategory('education')}>
              <div className="category-icon education">📚</div>
              <span className="category-name">교육/상담</span>
              <span className="category-count">7개</span>
            </button>

            <button className="category-item" onClick={() => viewCategory('emergency')}>
              <div className="category-icon emergency">🚨</div>
              <span className="category-name">긴급지원</span>
              <span className="category-count">5개</span>
            </button>
          </div>
        </section>

        <section className="recent-section">
          <h2 className="section-title">최근 본 정보</h2>
          <div className="recent-list" id="recentList">
            {recentViews.length === 0 ? (
              <div className="recent-item">
                <div className="recent-icon">👴</div>
                <div className="recent-info">
                  <h4 className="recent-title">기초연금</h4>
                  <p className="recent-desc">만 65세 이상 소득 하위 70%</p>
                </div>
                <button className="recent-action" onClick={() => viewDetail('basic-pension')}>
                  보기
                </button>
              </div>
            ) : (
              recentViews.slice(0, 5).map((item, index) => (
                <div key={index} className="recent-item">
                  <div className="recent-icon">{item.icon}</div>
                  <div className="recent-info">
                    <h4 className="recent-title">{item.title}</h4>
                    <p className="recent-desc">{item.description}</p>
                  </div>
                  <button className="recent-action" onClick={() => viewDetail(item.id)}>
                    보기
                  </button>
                </div>
              ))
            )}
            {recentViews.length === 0 && (
              <div className="recent-item">
                <div className="recent-icon">🎓</div>
                <div className="recent-info">
                  <h4 className="recent-title">노인 대학</h4>
                  <p className="recent-desc">평생교육 프로그램</p>
                </div>
                <button className="recent-action" onClick={() => viewDetail('senior-university')}>
                  보기
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="popular-section">
          <h2 className="section-title">인기 복지 TOP 5</h2>
          <div className="popular-list">
            <div className="popular-item">
              <span className="popular-rank">1</span>
              <div className="popular-info">
                <h4 className="popular-title">노인 일자리 사업</h4>
                <p className="popular-desc">공공형/사회서비스형</p>
              </div>
              <span className="popular-badge">HOT</span>
            </div>

            <div className="popular-item">
              <span className="popular-rank">2</span>
              <div className="popular-info">
                <h4 className="popular-title">치매 검진</h4>
                <p className="popular-desc">무료 조기 검진</p>
              </div>
            </div>

            <div className="popular-item">
              <span className="popular-rank">3</span>
              <div className="popular-info">
                <h4 className="popular-title">돌봄 서비스</h4>
                <p className="popular-desc">가사/간병 지원</p>
              </div>
            </div>

            <div className="popular-item">
              <span className="popular-rank">4</span>
              <div className="popular-info">
                <h4 className="popular-title">문화 바우처</h4>
                <p className="popular-desc">연 10만원 지원</p>
              </div>
            </div>

            <div className="popular-item">
              <span className="popular-rank">5</span>
              <div className="popular-info">
                <h4 className="popular-title">에너지 바우처</h4>
                <p className="popular-desc">난방비 지원</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="nav-bottom">
        <button className="nav-item" onClick={() => navigate('/user/home')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span className="nav-label">홈</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/chat')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
          </svg>
          <span className="nav-label">대화</span>
        </button>
        <button className="nav-item active">
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="nav-label">정보</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/health')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span className="nav-label">건강</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/user/settings')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="nav-label">설정</span>
        </button>
      </nav>
    </div>
  );
}

export default Welfare;
