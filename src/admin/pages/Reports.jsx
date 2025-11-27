import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/admin-responsive.css';

// 아이콘 import
import downloadIcon from '../assets/icons/download.svg';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';
import fileTextIcon from '../assets/icons/file-text.svg';

function Reports() {
  const navigate = useNavigate();
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // 샘플 데이터 - 보고서 목록
  const reports = [
    {
      id: 1,
      type: 'monthly',
      title: '2025년 11월 월간 종합 보고서',
      description: '11월 한 달간의 전체 이용자 활동, 감정 분석, 대화 통계를 포함한 종합 보고서',
      period: '2025-11-01 ~ 2025-11-30',
      generatedDate: '2025-11-26',
      status: 'draft',
      fileSize: '2.4 MB',
      pages: 24,
      stats: {
        users: 8,
        conversations: 271,
        avgEmotion: '보통',
        alerts: 2
      }
    },
    {
      id: 2,
      type: 'weekly',
      title: '2025년 11월 4주차 주간 보고서',
      description: '11월 4주차(11/18-11/24) 이용자 활동 및 감정 변화 추이 분석',
      period: '2025-11-18 ~ 2025-11-24',
      generatedDate: '2025-11-25',
      status: 'completed',
      fileSize: '1.8 MB',
      pages: 16,
      stats: {
        users: 8,
        conversations: 68,
        avgEmotion: '보통',
        alerts: 1
      }
    },
    {
      id: 3,
      type: 'monthly',
      title: '2025년 10월 월간 종합 보고서',
      description: '10월 한 달간의 전체 이용자 활동, 감정 분석, 대화 통계를 포함한 종합 보고서',
      period: '2025-10-01 ~ 2025-10-31',
      generatedDate: '2025-11-01',
      status: 'completed',
      fileSize: '2.6 MB',
      pages: 26,
      stats: {
        users: 7,
        conversations: 245,
        avgEmotion: '보통',
        alerts: 3
      }
    },
    {
      id: 4,
      type: 'custom',
      title: '고위험군 이용자 집중 분석 보고서',
      description: '위험도 높음으로 분류된 이용자들의 감정 패턴 및 대화 특성 분석',
      period: '2025-10-01 ~ 2025-11-25',
      generatedDate: '2025-11-25',
      status: 'completed',
      fileSize: '3.2 MB',
      pages: 18,
      stats: {
        users: 2,
        conversations: 60,
        avgEmotion: '우울',
        alerts: 5
      }
    },
    {
      id: 5,
      type: 'weekly',
      title: '2025년 11월 3주차 주간 보고서',
      description: '11월 3주차(11/11-11/17) 이용자 활동 및 감정 변화 추이 분석',
      period: '2025-11-11 ~ 2025-11-17',
      generatedDate: '2025-11-18',
      status: 'completed',
      fileSize: '1.7 MB',
      pages: 15,
      stats: {
        users: 8,
        conversations: 62,
        avgEmotion: '보통',
        alerts: 0
      }
    },
    {
      id: 6,
      type: 'custom',
      title: '신규 가입 이용자 온보딩 분석',
      description: '최근 3개월 신규 가입 이용자의 초기 적응 과정 및 참여도 분석',
      period: '2025-08-01 ~ 2025-11-01',
      generatedDate: '2025-11-05',
      status: 'completed',
      fileSize: '2.1 MB',
      pages: 20,
      stats: {
        users: 5,
        conversations: 98,
        avgEmotion: '보통',
        alerts: 1
      }
    }
  ];

  const getReportTypeLabel = (type) => {
    const typeMap = {
      'monthly': '월간',
      'weekly': '주간',
      'custom': '맞춤형'
    };
    return typeMap[type] || type;
  };

  const getReportTypeBadgeColor = (type) => {
    const colorMap = {
      'monthly': '#2563EB',
      'weekly': '#10B981',
      'custom': '#F59E0B'
    };
    return colorMap[type] || '#64748B';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'completed': '완료',
      'draft': '작성중'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return '#10B981';
    if (status === 'draft') return '#F59E0B';
    return '#64748B';
  };

  const downloadReport = (reportId) => {
    alert(`보고서 ID ${reportId}를 다운로드합니다.`);
  };

  const viewReportDetail = (reportId) => {
    alert(`보고서 ID ${reportId}의 상세 내용을 표시합니다.`);
  };

  const generateNewReport = () => {
    alert('새 보고서 생성 기능은 추후 구현됩니다.');
  };

  // 필터링된 보고서
  const filteredReports = reports.filter(report => {
    if (selectedReportType !== 'all' && report.type !== selectedReportType) return false;
    return true;
  });

  return (
    <AdminLayout>
      {/* 페이지 헤더 */}
      <div className="page-header">
        <h2>보고서</h2>
        <div className="page-actions">
          <button className="action-button" onClick={generateNewReport}>
            <img src={fileTextIcon} alt="생성" className="button-icon" />
            새 보고서 생성
          </button>
          <button className="action-button primary" onClick={() => window.location.reload()}>
            <img src={refreshCwIcon} alt="새로고침" className="button-icon" />
            새로고침
          </button>
        </div>
      </div>

      {/* 보고서 통계 요약 */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0E7FF' }}>
            <img src={fileTextIcon} alt="전체 보고서" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{reports.length}</span>
            <span className="stat-label">전체 보고서</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DBEAFE' }}>
            <img src={fileTextIcon} alt="월간 보고서" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{reports.filter(r => r.type === 'monthly').length}</span>
            <span className="stat-label">월간 보고서</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#D1FAE5' }}>
            <img src={fileTextIcon} alt="주간 보고서" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{reports.filter(r => r.type === 'weekly').length}</span>
            <span className="stat-label">주간 보고서</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7' }}>
            <img src={fileTextIcon} alt="맞춤형 보고서" style={{ width: '28px', height: '28px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{reports.filter(r => r.type === 'custom').length}</span>
            <span className="stat-label">맞춤형 보고서</span>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="search-filter-section" style={{ marginBottom: '24px' }}>
        <div className="filter-group">
          <select
            className="filter-select"
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
          >
            <option value="all">전체 보고서</option>
            <option value="monthly">월간 보고서</option>
            <option value="weekly">주간 보고서</option>
            <option value="custom">맞춤형 보고서</option>
          </select>

          <select
            className="filter-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="month">최근 1개월</option>
            <option value="quarter">최근 3개월</option>
            <option value="year">최근 1년</option>
            <option value="all">전체 기간</option>
          </select>
        </div>
      </div>

      {/* 보고서 목록 */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>보고서 목록</h3>
            <span className="card-subtitle">{filteredReports.length}개의 보고서</span>
          </div>
        </div>

        <div className="reports-grid">
          {filteredReports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getReportTypeBadgeColor(report.type) + '20',
                      color: getReportTypeBadgeColor(report.type),
                      border: `1px solid ${getReportTypeBadgeColor(report.type)}`
                    }}
                  >
                    {getReportTypeLabel(report.type)}
                  </span>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(report.status) + '20',
                      color: getStatusColor(report.status),
                      border: `1px solid ${getStatusColor(report.status)}`
                    }}
                  >
                    {getStatusLabel(report.status)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  생성일: {report.generatedDate}
                </div>
              </div>

              <div className="report-card-body">
                <h4 className="report-title">{report.title}</h4>
                <p className="report-description">{report.description}</p>

                <div className="report-meta">
                  <div className="report-meta-item">
                    <span className="meta-label">기간</span>
                    <span className="meta-value">{report.period}</span>
                  </div>
                  <div className="report-meta-item">
                    <span className="meta-label">페이지</span>
                    <span className="meta-value">{report.pages}페이지</span>
                  </div>
                  <div className="report-meta-item">
                    <span className="meta-label">크기</span>
                    <span className="meta-value">{report.fileSize}</span>
                  </div>
                </div>

                <div className="report-stats">
                  <div className="report-stat-item">
                    <div className="stat-number">{report.stats.users}</div>
                    <div className="stat-text">이용자</div>
                  </div>
                  <div className="report-stat-item">
                    <div className="stat-number">{report.stats.conversations}</div>
                    <div className="stat-text">대화</div>
                  </div>
                  <div className="report-stat-item">
                    <div className="stat-number">{report.stats.avgEmotion}</div>
                    <div className="stat-text">평균 감정</div>
                  </div>
                  <div className="report-stat-item">
                    <div className="stat-number">{report.stats.alerts}</div>
                    <div className="stat-text">알림</div>
                  </div>
                </div>
              </div>

              <div className="report-card-footer">
                <button
                  className="action-button"
                  onClick={() => viewReportDetail(report.id)}
                >
                  미리보기
                </button>
                <button
                  className="action-button primary"
                  onClick={() => downloadReport(report.id)}
                  disabled={report.status === 'draft'}
                >
                  <img src={downloadIcon} alt="다운로드" style={{ width: '16px', height: '16px' }} />
                  다운로드
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748B'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              보고서가 없습니다
            </div>
            <div style={{ fontSize: '14px' }}>
              새 보고서를 생성하거나 다른 필터를 선택해보세요
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Reports;
