import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';

// 아이콘 import
import downloadIcon from '../assets/icons/download.svg';
import refreshCwIcon from '../assets/icons/refresh-cw.svg';
import usersIcon from '../assets/icons/users.svg';
import circleCheckIcon from '../assets/icons/circle-check.svg';
import triangleAlertIcon from '../assets/icons/triangle-alert.svg';
import smileIcon from '../assets/icons/smile.svg';
import messageCircleIcon from '../assets/icons/message-circle.svg';
import phoneIcon from '../assets/icons/phone.svg';
import chartBarIcon from '../assets/icons/chart-bar.svg';

// 기본 통계 데이터 (API 폴백용)
const defaultStats = {
  totalUsers: 1234,
  activeUsers: 892,
  emergencyAlerts: 3,
  avgSatisfaction: 4.5,
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // 대시보드 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.REPORTS_SUMMARY);
      setStats({
        totalUsers: response.totalUsers || defaultStats.totalUsers,
        activeUsers: response.activeUsers || defaultStats.activeUsers,
        emergencyAlerts: response.emergencyAlerts || defaultStats.emergencyAlerts,
        avgSatisfaction: response.avgSatisfaction || defaultStats.avgSatisfaction,
      });
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
      // API 실패 시 기본값 사용
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.REPORTS_EXPORT, {
        responseType: 'blob',
      });

      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('보고서 다운로드 오류:', error);
      alert('보고서 다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  const refreshDashboard = () => {
    loadDashboardData();
  };

  const viewUserDetail = (userId) => {
    navigate(`/admin/users?id=${userId}`);
  };

  return (
    <AdminLayout>
        {/* 페이지 헤더 */}
        <div className="page-header">
          <h2>대시보드</h2>
          <div className="page-actions">
            <button className="action-button" onClick={downloadReport} disabled={isDownloading}>
              <img src={downloadIcon} alt="다운로드" className="button-icon" />
              {isDownloading ? '다운로드 중...' : '보고서 다운로드'}
            </button>
            <button className="action-button primary" onClick={refreshDashboard} disabled={isLoading}>
              <img src={refreshCwIcon} alt="새로고침" className="button-icon" />
              {isLoading ? '로딩 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 대시보드 콘텐츠 */}
        <div className="dashboard-content">
          {/* 통계 카드들 */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <img src={usersIcon} alt="전체 이용자" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalUsers.toLocaleString()}</span>
                <span className="stat-label">전체 이용자</span>
                <span className="stat-change positive">+12% 이번 달</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">
                <img src={circleCheckIcon} alt="활성 이용자" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.activeUsers.toLocaleString()}</span>
                <span className="stat-label">활성 이용자</span>
                <span className="stat-change positive">+5% 오늘</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon emergency">
                <img src={triangleAlertIcon} alt="긴급 알림" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.emergencyAlerts}</span>
                <span className="stat-label">긴급 알림</span>
                <span className="stat-change negative">요청 대기 중</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon satisfaction">
                <img src={smileIcon} alt="평균 만족도" style={{ width: '28px', height: '28px' }} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.avgSatisfaction}</span>
                <span className="stat-label">평균 만족도</span>
                <span className="stat-change positive">+0.2 이번 주</span>
              </div>
            </div>
          </div>

          {/* 긴급 알림 */}
          <div className="emergency-alerts">
            <div className="emergency-header">
              <img src={triangleAlertIcon} alt="긴급" style={{ width: '24px', height: '24px', stroke: '#DC2626' }} />
              <h3>긴급 알림</h3>
            </div>
            <div className="alert-item">
              <div className="alert-info">
                <div className="alert-user">김영희 님 (78세)</div>
                <div className="alert-message">우울 감정 지수 급상승 - 즉시 확인 필요</div>
              </div>
              <button className="alert-action" onClick={() => viewUserDetail(1)}>확인하기</button>
            </div>
            <div className="alert-item">
              <div className="alert-info">
                <div className="alert-user">박철수 님 (82세)</div>
                <div className="alert-message">3일간 미접속 - 안부 확인 권장</div>
              </div>
              <button className="alert-action" onClick={() => viewUserDetail(2)}>확인하기</button>
            </div>
            <div className="alert-item">
              <div className="alert-info">
                <div className="alert-user">이순자 님 (75세)</div>
                <div className="alert-message">긴급 연락 요청 - 전화 연락 필요</div>
              </div>
              <button className="alert-action" onClick={() => viewUserDetail(3)}>확인하기</button>
            </div>
          </div>

          {/* 차트 영역 */}
          <div className="charts-row">
            <div className="chart-card emotion-chart">
              <div className="chart-header">
                <h3 className="chart-title">감정 분포</h3>
                <select className="chart-filter">
                  <option>최근 7일</option>
                  <option>최근 30일</option>
                  <option>최근 3개월</option>
                </select>
              </div>
              <div className="chart-body"></div>
            </div>

            <div className="chart-card activity-chart">
              <div className="chart-header">
                <h3 className="chart-title">주간 대화 활동</h3>
                <select className="chart-filter">
                  <option>이번 주</option>
                  <option>지난 주</option>
                  <option>최근 30일</option>
                </select>
              </div>
              <div className="chart-body"></div>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="recent-activities">
            <h3 style={{ marginBottom: '20px' }}>최근 활동</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">
                  <img src={circleCheckIcon} alt="완료" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">김영희 님이 복지 서비스 신청을 완료했습니다</div>
                  <div className="activity-description">청년 식사 지원 서비스 신청</div>
                </div>
                <div className="activity-time">5분 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon info">
                  <img src={messageCircleIcon} alt="대화" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">박철수 님이 이음이와 대화를 나눴습니다</div>
                  <div className="activity-description">총 15개 메시지 교환, 감정: 보통</div>
                </div>
                <div className="activity-time">12분 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon warning">
                  <img src={triangleAlertIcon} alt="경고" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">이순자 님의 감정 상태가 변경되었습니다</div>
                  <div className="activity-description">좋음 → 보통으로 변경</div>
                </div>
                <div className="activity-time">1시간 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon success">
                  <img src={phoneIcon} alt="전화" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">김관리 님이 최영수 님에게 연락했습니다</div>
                  <div className="activity-description">안부 확인 전화 완료</div>
                </div>
                <div className="activity-time">2시간 전</div>
              </div>

              <div className="activity-item">
                <div className="activity-icon info">
                  <img src={chartBarIcon} alt="보고서" style={{ width: '20px', height: '20px' }} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">주간 보고서가 생성되었습니다</div>
                  <div className="activity-description">2025년 11월 1주차 보고서</div>
                </div>
                <div className="activity-time">3시간 전</div>
              </div>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}

export default Dashboard;
