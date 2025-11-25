import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';

function Health() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmotion, setSelectedEmotion] = useState('good');
  const [emotionNote, setEmotionNote] = useState('');
  const [checklist, setChecklist] = useState({
    checkMeal: false,
    checkMedicine: false,
    checkExercise: false,
    checkSleep: false,
    checkSocial: false
  });
  const [healthRecords, setHealthRecords] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    temperature: '',
    weight: ''
  });
  const [medicineList, setMedicineList] = useState([
    { id: 1, name: '혈압약', time: 'morning', desc: '식후 30분', checked: false },
    { id: 2, name: '당뇨약', time: 'lunch', desc: '식전', checked: false },
    { id: 3, name: '영양제', time: 'evening', desc: '식후', checked: false }
  ]);

  useEffect(() => {
    loadTodayData();
  }, [currentDate]);

  const loadTodayData = () => {
    const dateKey = currentDate.toISOString().split('T')[0];
    const stored = localStorage.getItem('eume_health_data');
    if (stored) {
      try {
        const healthData = JSON.parse(stored);
        const todayData = healthData[dateKey];
        if (todayData) {
          if (todayData.emotion) setSelectedEmotion(todayData.emotion);
          if (todayData.note) setEmotionNote(todayData.note);
          if (todayData.checklist) setChecklist(todayData.checklist);
          if (todayData.records) {
            // 혈압 데이터 변환
            const records = { ...todayData.records };
            if (todayData.records.bloodPressure) {
              records.bloodPressureSystolic = todayData.records.bloodPressure.systolic || '';
              records.bloodPressureDiastolic = todayData.records.bloodPressure.diastolic || '';
            }
            setHealthRecords(records);
          }
          if (todayData.medicines) {
            setMedicineList(todayData.medicines);
          }
        } else {
          // 새로운 날짜면 초기화
          resetTodayData();
        }
      } catch (e) {
        console.error('건강 데이터 로드 오류:', e);
      }
    }
  };

  const resetTodayData = () => {
    setSelectedEmotion('good');
    setEmotionNote('');
    setChecklist({
      checkMeal: false,
      checkMedicine: false,
      checkExercise: false,
      checkSleep: false,
      checkSocial: false
    });
    setHealthRecords({
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      bloodSugar: '',
      temperature: '',
      weight: ''
    });
    setMedicineList([
      { id: 1, name: '혈압약', time: 'morning', desc: '식후 30분', checked: false },
      { id: 2, name: '당뇨약', time: 'lunch', desc: '식전', checked: false },
      { id: 3, name: '영양제', time: 'evening', desc: '식후', checked: false }
    ]);
  };

  const saveHealthData = () => {
    const dateKey = currentDate.toISOString().split('T')[0];
    const stored = localStorage.getItem('eume_health_data');
    let healthData = {};

    if (stored) {
      try {
        healthData = JSON.parse(stored);
      } catch (e) {
        console.error('건강 데이터 파싱 오류:', e);
      }
    }

    healthData[dateKey] = {
      emotion: selectedEmotion,
      note: emotionNote,
      checklist,
      records: {
        bloodPressure: {
          systolic: healthRecords.bloodPressureSystolic,
          diastolic: healthRecords.bloodPressureDiastolic
        },
        bloodSugar: healthRecords.bloodSugar,
        temperature: healthRecords.temperature,
        weight: healthRecords.weight
      },
      medicines: medicineList,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('eume_health_data', JSON.stringify(healthData));
      showSaveSuccess();
    } catch (e) {
      console.error('건강 데이터 저장 오류:', e);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const showSaveSuccess = () => {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 저장 성공 토스트 메시지
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = '건강 기록이 저장되었습니다!';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formatDate = () => {
    const options = { month: 'long', day: 'numeric', weekday: 'short' };
    return currentDate.toLocaleDateString('ko-KR', options);
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const handleChecklistChange = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleRecordChange = (key, value) => {
    setHealthRecords(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMedicineCheck = (id) => {
    setMedicineList(prev =>
      prev.map(med =>
        med.id === id ? { ...med, checked: !med.checked } : med
      )
    );
  };

  const openCalendar = () => {
    alert('달력 기능은 준비 중입니다.');
  };

  const addMedicine = () => {
    alert('약 추가 기능은 준비 중입니다.');
  };

  const getMedicineTimeClass = (time) => {
    const timeMap = {
      'morning': 'morning',
      'lunch': 'lunch',
      'evening': 'evening'
    };
    return timeMap[time] || 'morning';
  };

  const getMedicineTimeText = (time) => {
    const timeMap = {
      'morning': '아침',
      'lunch': '점심',
      'evening': '저녁'
    };
    return timeMap[time] || '아침';
  };

  return (
    <div className="app-container">
      <header className="health-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span>←</span>
        </button>
        <h1 className="page-title">내 건강</h1>
        <button className="calendar-button" onClick={openCalendar}>
          <span>📅</span>
        </button>
      </header>

      <div className="date-selector">
        <button className="date-nav prev" onClick={() => changeDate(-1)}>◀</button>
        <div className="current-date">
          <span className="date-text">{formatDate()}</span>
          <span className="date-label">{isToday() ? '오늘' : ''}</span>
        </div>
        <button className="date-nav next" onClick={() => changeDate(1)}>▶</button>
      </div>

      <main className="health-content">
        <section className="emotion-today">
          <h2 className="section-title">
            <span className="title-icon">😊</span>
            오늘의 기분
          </h2>
          <div className="emotion-selector">
            {[
              { value: 'very-good', emoji: '😄', text: '아주 좋음' },
              { value: 'good', emoji: '😊', text: '좋음' },
              { value: 'normal', emoji: '😐', text: '보통' },
              { value: 'bad', emoji: '😔', text: '안 좋음' },
              { value: 'very-bad', emoji: '😢', text: '매우 안 좋음' }
            ].map(emotion => (
              <button
                key={emotion.value}
                className={`emotion-option ${selectedEmotion === emotion.value ? 'selected' : ''}`}
                onClick={() => setSelectedEmotion(emotion.value)}
                data-emotion={emotion.value}
              >
                <span className="emotion-face">{emotion.emoji}</span>
                <span className="emotion-text">{emotion.text}</span>
              </button>
            ))}
          </div>
          <div className="emotion-note">
            <textarea
              className="note-input"
              id="emotionNote"
              placeholder="오늘 기분이 어떠신지 적어보세요..."
              rows="2"
              value={emotionNote}
              onChange={(e) => setEmotionNote(e.target.value)}
            />
          </div>
        </section>

        <section className="health-checklist">
          <h2 className="section-title">
            <span className="title-icon">✅</span>
            오늘의 건강 체크
          </h2>
          <div className="checklist-items">
            {[
              { id: 'checkMeal', icon: '🍚', title: '식사', desc: '세 끼 모두 드셨나요?' },
              { id: 'checkMedicine', icon: '💊', title: '약 복용', desc: '약을 잊지 않고 드셨나요?' },
              { id: 'checkExercise', icon: '🚶', title: '운동', desc: '30분 이상 움직이셨나요?' },
              { id: 'checkSleep', icon: '😴', title: '수면', desc: '잘 주무셨나요?' },
              { id: 'checkSocial', icon: '👥', title: '소통', desc: '누군가와 대화하셨나요?' }
            ].map(item => (
              <label key={item.id} className="checklist-item">
                <input
                  type="checkbox"
                  className="check-input"
                  id={item.id}
                  checked={checklist[item.id]}
                  onChange={() => handleChecklistChange(item.id)}
                />
                <span className="check-box"></span>
                <div className="check-content">
                  <span className="check-icon">{item.icon}</span>
                  <div className="check-text">
                    <span className="check-title">{item.title}</span>
                    <span className="check-desc">{item.desc}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="health-records">
          <h2 className="section-title">
            <span className="title-icon">📊</span>
            건강 수치 기록
          </h2>
          <div className="record-cards">
            <div className="record-card">
              <div className="record-header">
                <span className="record-icon">❤️</span>
                <span className="record-title">혈압</span>
              </div>
              <div className="record-inputs">
                <input
                  type="number"
                  className="record-input"
                  id="bloodPressureSystolic"
                  placeholder="수축기"
                  min="0"
                  max="300"
                  value={healthRecords.bloodPressureSystolic}
                  onChange={(e) => handleRecordChange('bloodPressureSystolic', e.target.value)}
                />
                <span className="record-divider">/</span>
                <input
                  type="number"
                  className="record-input"
                  id="bloodPressureDiastolic"
                  placeholder="이완기"
                  min="0"
                  max="200"
                  value={healthRecords.bloodPressureDiastolic}
                  onChange={(e) => handleRecordChange('bloodPressureDiastolic', e.target.value)}
                />
              </div>
              <span className="record-unit">mmHg</span>
            </div>

            <div className="record-card">
              <div className="record-header">
                <span className="record-icon">🩸</span>
                <span className="record-title">혈당</span>
              </div>
              <div className="record-inputs">
                <input
                  type="number"
                  className="record-input"
                  id="bloodSugar"
                  placeholder="혈당 수치"
                  min="0"
                  max="500"
                  value={healthRecords.bloodSugar}
                  onChange={(e) => handleRecordChange('bloodSugar', e.target.value)}
                />
              </div>
              <span className="record-unit">mg/dL</span>
            </div>

            <div className="record-card">
              <div className="record-header">
                <span className="record-icon">🌡️</span>
                <span className="record-title">체온</span>
              </div>
              <div className="record-inputs">
                <input
                  type="number"
                  className="record-input"
                  id="temperature"
                  placeholder="36.5"
                  step="0.1"
                  min="35"
                  max="42"
                  value={healthRecords.temperature}
                  onChange={(e) => handleRecordChange('temperature', e.target.value)}
                />
              </div>
              <span className="record-unit">°C</span>
            </div>

            <div className="record-card">
              <div className="record-header">
                <span className="record-icon">⚖️</span>
                <span className="record-title">체중</span>
              </div>
              <div className="record-inputs">
                <input
                  type="number"
                  className="record-input"
                  id="weight"
                  placeholder="체중"
                  step="0.1"
                  min="0"
                  max="200"
                  value={healthRecords.weight}
                  onChange={(e) => handleRecordChange('weight', e.target.value)}
                />
              </div>
              <span className="record-unit">kg</span>
            </div>
          </div>
        </section>

        <section className="medicine-section">
          <h2 className="section-title">
            <span className="title-icon">💊</span>
            복약 관리
            <button className="section-action" onClick={addMedicine}>+ 추가</button>
          </h2>
          <div className="medicine-list" id="medicineList">
            {medicineList.map(medicine => (
              <div key={medicine.id} className="medicine-item">
                <div className={`medicine-time ${getMedicineTimeClass(medicine.time)}`}>
                  {getMedicineTimeText(medicine.time)}
                </div>
                <div className="medicine-info">
                  <h4 className="medicine-name">{medicine.name}</h4>
                  <p className="medicine-desc">{medicine.desc}</p>
                </div>
                <label className="medicine-check">
                  <input
                    type="checkbox"
                    checked={medicine.checked}
                    onChange={() => handleMedicineCheck(medicine.id)}
                  />
                  <span className="check-mark">✓</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="weekly-summary">
          <h2 className="section-title">
            <span className="title-icon">📈</span>
            이번 주 건강 요약
          </h2>
          <div className="summary-chart">
            <div className="chart-days">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                <div key={day} className={`chart-day ${index === 6 ? 'today' : ''}`}>
                  <span className="day-label">{day}</span>
                  <div className="day-bar">
                    <div
                      className={`bar-fill ${index === 4 ? 'bad' : index % 2 === 0 ? 'normal' : 'good'}`}
                      style={{ height: `${[80, 90, 60, 85, 40, 70, 75][index]}%` }}
                    ></div>
                  </div>
                  <span className="day-emoji">
                    {index === 4 ? '😔' : index % 2 === 0 ? '😐' : '😊'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">평균 기분</span>
              <span className="stat-value">좋음</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">복약 완료율</span>
              <span className="stat-value">85%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">운동 일수</span>
              <span className="stat-value">5일</span>
            </div>
          </div>
        </section>

        <div className="save-container">
          <button className="btn btn-primary btn-large btn-full" onClick={saveHealthData}>
            오늘의 건강 기록 저장
          </button>
        </div>
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
        <button className="nav-item" onClick={() => navigate('/user/welfare')}>
          <svg className="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="nav-label">정보</span>
        </button>
        <button className="nav-item active">
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

export default Health;
