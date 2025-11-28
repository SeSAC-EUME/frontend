import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';
import logo from '../../shared/assets/logo.svg';
import lockIcon from '../assets/icons/lock.svg';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosRaw from '../../shared/api/axiosRaw';
import { STORAGE_KEYS } from '../../shared/constants/storage';

function Login() {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    sigunguId: '', // 소속기관 ID
    username: '',
    password: '',
    rememberMe: false,
  });
  const [registerData, setRegisterData] = useState({
    sigunguId: '',
    adminLoginId: '',
    adminName: '',
    adminEmail: '',
    adminPw: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 기관 목록 상태
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgsError, setOrgsError] = useState('');

  // 기존 세션 확인 및 기관 목록 로드
  useEffect(() => {
    checkExistingSession();
    loadOrganizations();
  }, []);

  const checkExistingSession = () => {
    const currentUser = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    const sessionExpiry = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_EXPIRY);

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
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_EXPIRY);
  };

  // 기관 목록 로드 (무인증 API)
  const loadOrganizations = async () => {
    setOrgsLoading(true);
    setOrgsError('');

    try {
      const response = await axiosRaw.get(API_ENDPOINTS.ADMIN.ORGS);
      setOrgs(response.data); // [{ id: 1, name: "서울시 강남구" }, ...]
    } catch (error) {
      console.error('기관 목록 로드 실패:', error);
      setOrgsError('기관 목록을 불러올 수 없습니다.');
    } finally {
      setOrgsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // 입력 시 에러 메시지 제거
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.sigunguId) {
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
      // axiosRaw 사용 (상태코드 분기 필요)
      const response = await axiosRaw.post(API_ENDPOINTS.ADMIN.LOGIN, {
        sigunguId: parseInt(formData.sigunguId), // 숫자로 변환
        adminLoginId: formData.username,
        adminPw: formData.password,
      });

      if (response.status === 200) {
        const result = response.data;

        // 사용자 정보 저장 (토큰은 쿠키로 자동 설정됨)
        const userData = {
          id: result.id,
          adminName: result.adminName,
          adminEmail: result.adminEmail,
          lastLoginDate: result.lastLoginDate,
          sigunguId: formData.sigunguId,
        };

        // 세션 저장
        saveSession(userData, formData.rememberMe);

        // 대시보드로 리다이렉트
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('로그인 오류:', error);

      if (error.response?.status === 401) {
        setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setErrorMessage(
          error.response?.data?.message || '로그인 중 오류가 발생했습니다.'
        );
      }
      setIsLoading(false);
    }
  };

  const saveSession = (userData, rememberMe) => {
    // 사용자 정보 저장
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(userData));

    // 세션 만료 시간 설정 (기본 2시간, rememberMe 시 7일)
    const expiryTime =
      Date.now() +
      (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION_EXPIRY, expiryTime.toString());

    // 로그인 기록
    const loginHistory = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.ADMIN_LOGIN_HISTORY) || '[]'
    );
    loginHistory.push({
      adminName: userData.adminName,
      time: new Date().toISOString(),
    });
    // 최근 10개만 유지
    if (loginHistory.length > 10) {
      loginHistory.shift();
    }
    localStorage.setItem(
      STORAGE_KEYS.ADMIN_LOGIN_HISTORY,
      JSON.stringify(loginHistory)
    );
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('비밀번호 찾기 기능은 준비 중입니다.');
  };

  // 회원가입 입력 핸들러
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorMessage) {
      setErrorMessage('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // 회원가입 제출
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!registerData.sigunguId) {
      setErrorMessage('소속 기관을 선택해주세요.');
      return;
    }

    if (!registerData.adminLoginId.trim()) {
      setErrorMessage('아이디를 입력해주세요.');
      return;
    }

    if (registerData.adminLoginId.length < 4) {
      setErrorMessage('아이디는 4자 이상이어야 합니다.');
      return;
    }

    if (!registerData.adminName.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    if (!registerData.adminEmail.trim()) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.adminEmail)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    if (!registerData.adminPw) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    if (registerData.adminPw.length < 8) {
      setErrorMessage('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (registerData.adminPw !== registerData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosRaw.post(API_ENDPOINTS.ADMIN.REGISTER, {
        sigunguId: parseInt(registerData.sigunguId),
        adminLoginId: registerData.adminLoginId,
        adminName: registerData.adminName,
        adminEmail: registerData.adminEmail,
        adminPw: registerData.adminPw,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('회원가입이 완료되었습니다. 로그인해주세요.');
        setRegisterData({
          sigunguId: '',
          adminLoginId: '',
          adminName: '',
          adminEmail: '',
          adminPw: '',
          confirmPassword: '',
        });
        // 2초 후 로그인 모드로 전환
        setTimeout(() => {
          setIsRegisterMode(false);
          setSuccessMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      if (error.response?.status === 409) {
        setErrorMessage('이미 존재하는 아이디입니다.');
      } else {
        setErrorMessage(
          error.response?.data?.message || '회원가입 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 모드 전환
  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* 로고 및 타이틀 */}
        <div className="login-header">
          <img src={logo} alt="이음이 로고" className="admin-logo" />
          <h1>{isRegisterMode ? '관리자 회원가입' : '이음이 관리 시스템'}</h1>
          <p className="subtitle">
            서울시 고립은둔청년 정서 돌봄 AI 복지 에이전트
          </p>
        </div>

        {/* 로그인/회원가입 폼 */}
        <div className="login-form-wrapper">
          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="error-message show">{errorMessage}</div>
          )}
          {/* 성공 메시지 */}
          {successMessage && (
            <div className="success-message show" style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>{successMessage}</div>
          )}

          {!isRegisterMode ? (
          <form className="login-form" onSubmit={handleSubmit}>
            {/* 소속기관 선택 */}
            <div className="form-group">
              <label htmlFor="sigunguId">소속 기관</label>
              {orgsLoading ? (
                <div className="loading-text">기관 목록 로딩 중...</div>
              ) : orgsError ? (
                <div className="error-group">
                  <p className="error-text">{orgsError}</p>
                  <button
                    type="button"
                    className="retry-button"
                    onClick={loadOrganizations}
                  >
                    재시도
                  </button>
                </div>
              ) : (
                <select
                  id="sigunguId"
                  name="sigunguId"
                  value={formData.sigunguId}
                  onChange={handleChange}
                  required
                >
                  <option value="">소속 기관을 선택하세요</option>
                  {orgs.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}
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
              <a
                href="#"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                비밀번호 찾기
              </a>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="login-button"
              disabled={isLoading || orgsLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>

            {/* 회원가입 전환 */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>계정이 없으신가요? </span>
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667EEA',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                회원가입
              </button>
            </div>

            {/* 개발용 로그인 버튼 */}
            <button
              type="button"
              className="login-button"
              style={{
                marginTop: '16px',
                backgroundColor: '#6c757d',
                border: '1px solid #6c757d',
              }}
              onClick={() => {
                // 개발용 더미 데이터 저장
                const devUserData = {
                  id: 1,
                  adminName: '개발자',
                  adminEmail: 'dev@admin.com',
                  lastLoginDate: new Date().toISOString(),
                  sigunguId: 1,
                };
                localStorage.setItem(
                  STORAGE_KEYS.ADMIN_USER,
                  JSON.stringify(devUserData)
                );
                const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
                localStorage.setItem(
                  STORAGE_KEYS.ADMIN_SESSION_EXPIRY,
                  expiryTime.toString()
                );
                navigate('/admin/dashboard');
              }}
            >
              개발 로그인
            </button>

            {/* 보안 안내 */}
            <div className="security-notice">
              <img src={lockIcon} alt="보안" className="security-icon" />
              <span>보안 연결 (SSL) | 개인정보는 암호화되어 전송됩니다</span>
            </div>
          </form>
          ) : (
          /* 회원가입 폼 */
          <form className="login-form" onSubmit={handleRegisterSubmit}>
            {/* 소속기관 선택 */}
            <div className="form-group">
              <label htmlFor="reg-sigunguId">소속 기관</label>
              {orgsLoading ? (
                <div className="loading-text">기관 목록 로딩 중...</div>
              ) : orgsError ? (
                <div className="error-group">
                  <p className="error-text">{orgsError}</p>
                  <button
                    type="button"
                    className="retry-button"
                    onClick={loadOrganizations}
                  >
                    재시도
                  </button>
                </div>
              ) : (
                <select
                  id="reg-sigunguId"
                  name="sigunguId"
                  value={registerData.sigunguId}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="">소속 기관을 선택하세요</option>
                  {orgs.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 아이디 입력 */}
            <div className="form-group">
              <label htmlFor="adminLoginId">아이디</label>
              <input
                type="text"
                id="adminLoginId"
                name="adminLoginId"
                value={registerData.adminLoginId}
                onChange={handleRegisterChange}
                placeholder="아이디를 입력하세요 (4자 이상)"
                autoComplete="username"
                required
              />
            </div>

            {/* 이름 입력 */}
            <div className="form-group">
              <label htmlFor="adminName">이름</label>
              <input
                type="text"
                id="adminName"
                name="adminName"
                value={registerData.adminName}
                onChange={handleRegisterChange}
                placeholder="이름을 입력하세요"
                autoComplete="name"
                required
              />
            </div>

            {/* 이메일 입력 */}
            <div className="form-group">
              <label htmlFor="adminEmail">이메일</label>
              <input
                type="email"
                id="adminEmail"
                name="adminEmail"
                value={registerData.adminEmail}
                onChange={handleRegisterChange}
                placeholder="이메일을 입력하세요"
                autoComplete="email"
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="form-group">
              <label htmlFor="adminPw">비밀번호</label>
              <input
                type="password"
                id="adminPw"
                name="adminPw"
                value={registerData.adminPw}
                onChange={handleRegisterChange}
                placeholder="비밀번호를 입력하세요 (8자 이상)"
                autoComplete="new-password"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                required
              />
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="login-button"
              disabled={isLoading || orgsLoading}
              style={{
                backgroundColor: '#10B981',
                border: '1px solid #10B981',
              }}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>

            {/* 로그인 전환 */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ color: '#6B7280', fontSize: '14px' }}>이미 계정이 있으신가요? </span>
              <button
                type="button"
                onClick={toggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667EEA',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                로그인
              </button>
            </div>

            {/* 보안 안내 */}
            <div className="security-notice">
              <img src={lockIcon} alt="보안" className="security-icon" />
              <span>보안 연결 (SSL) | 개인정보는 암호화되어 전송됩니다</span>
            </div>
          </form>
          )}
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
