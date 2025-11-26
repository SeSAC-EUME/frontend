import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';
import logo from '../../shared/assets/logo.png';
import lockIcon from '../assets/icons/lock.svg';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organization: '',
    username: '',
    password: '',
    rememberMe: false
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 기존 세션 확인
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    const currentUser = localStorage.getItem('eume_admin_user');
    const sessionExpiry = localStorage.getItem('eume_admin_session_expiry');

    if (currentUser && sessionExpiry) {
      const now = Date.now();
      if (now < parseInt(sessionExpiry)) {
        // 세션이 유효하면 대시보드로 리다이렉트
        navigate('/admin/dashboard');
      } else {
        // 세션 만료
        clearSession();
      }
    }
  };

  const clearSession = () => {
    localStorage.removeItem('eume_admin_user');
    localStorage.removeItem('eume_admin_session_expiry');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 입력 시 에러 메시지 제거
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.organization) {
      setErrorMessage('소속 기관을 선택해주세요.');
      return;
    }

    if (!formData.username.trim()) {
      setErrorMessage('아이디를 입력해주세요.');
      return;
    }

    if (!formData.password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    // 로그인 처리
    setIsLoading(true);

    try {
      // API 호출 - API_ENDPOINTS 사용
      const result = await axiosInstance.post(API_ENDPOINTS.ADMIN.LOGIN, {
        loginId: formData.username,
        password: formData.password,
        loginType: 'LOCAL'
      });

      // 로그인 성공 시 사용자 정보 및 토큰 저장
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      // 사용자 정보 저장
      const userData = {
        userId: result.userId,
        loginId: result.loginId,
        name: result.name,
        email: result.email,
        groupId: result.groupId,
        firstLogin: result.firstLogin,
        userType: result.userType,
        profileImage: result.profileImage,
        backgroundTheme: result.backgroundTheme,
        organization: formData.organization
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // 세션 저장 (관리자 전용)
      saveSession(userData, formData.rememberMe);

      // 대시보드로 리다이렉트
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('로그인 오류:', error);
      const errorMessage = error.response?.data?.message || error.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
      setErrorMessage(errorMessage);
      setIsLoading(false);
    }
  };

  const saveSession = (userData, rememberMe) => {
    // 사용자 정보 저장
    localStorage.setItem('eume_admin_user', JSON.stringify(userData));

    // 세션 만료 시간 설정 (기본 2시간)
    const expiryTime = Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000);
    localStorage.setItem('eume_admin_session_expiry', expiryTime.toString());

    // 로그인 기록
    const loginHistory = JSON.parse(localStorage.getItem('eume_admin_login_history') || '[]');
    loginHistory.push({
      username: userData.username,
      time: userData.loginTime,
      organization: userData.organization
    });
    // 최근 10개만 유지
    if (loginHistory.length > 10) {
      loginHistory.shift();
    }
    localStorage.setItem('eume_admin_login_history', JSON.stringify(loginHistory));
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('비밀번호 찾기 기능은 준비 중입니다.');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* 로고 및 타이틀 */}
        <div className="login-header">
          <img src={logo} alt="이음이 로고" className="admin-logo" />
          <h1>이음이 관리 시스템</h1>
          <p className="subtitle">서울시 고립은둔청년 정서 돌봄 AI 복지 에이전트</p>
        </div>

        {/* 로그인 폼 */}
        <div className="login-form-wrapper">
          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="error-message show">
              {errorMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* 기관 선택 */}
            <div className="form-group">
              <label htmlFor="organization">소속 기관</label>
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
              >
                <option value="">기관을 선택하세요</option>
                <option value="seoul-city">서울시청</option>
                <option value="welfare-center">서울시 청년복지관</option>
                <option value="health-center">서울시 보건소</option>
                <option value="social-service">서울시 사회복지과</option>
              </select>
            </div>

            {/* 아이디 입력 */}
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
              />
            </div>

            {/* 로그인 옵션 */}
            <div className="login-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>로그인 상태 유지</span>
              </label>
              <a href="#" className="forgot-password" onClick={handleForgotPassword}>
                비밀번호 찾기
              </a>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>

            {/* 보안 안내 */}
            <div className="security-notice">
              <img src={lockIcon} alt="보안" className="security-icon" />
              <span>보안 연결 (SSL) | 개인정보는 암호화되어 전송됩니다</span>
            </div>
          </form>
        </div>

        {/* 하단 정보 */}
        <div className="login-footer">
          <p>© 2025 해커톤 이음이. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">이용약관</a>
            <span>|</span>
            <a href="#">개인정보처리방침</a>
            <span>|</span>
            <a href="#">관리자 매뉴얼</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
