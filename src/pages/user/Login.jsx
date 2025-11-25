import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/user.css';
import logo from '../../assets/shared/logo.svg';
import { API_ENDPOINTS } from '../../api/config';
import axiosInstance from '../../api/axios';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      setError('아이디와 비밀번호를 입력해주세요');
      return;
    }

    try {
      // API 호출 - axios 인스턴스 사용
      const result = await axiosInstance.post('user/login', {
        userId: username,
        userPw: password,
        loginType: 'local'
      });

      // 로그인 성공 시 토큰 및 사용자 정보 저장
      if (result.token) {
        localStorage.setItem('accessToken', result.token);
      }
      localStorage.setItem('eume_user', JSON.stringify(result.user || { username }));
      localStorage.setItem('eume_visited', 'true');

      navigate('/user/home');
    } catch (error) {
      console.error('로그인 오류:', error);
      const errorMessage = error.response?.data?.message || error.message || '아이디 또는 비밀번호가 올바르지 않습니다';
      setError(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: 구글 소셜 로그인 구현
    // Firebase Authentication 또는 OAuth 2.0 사용
    alert('구글 소셜 로그인은 준비 중입니다.\n\n테스트 계정:\n아이디: test\n비밀번호: test123');
  };

  const handleSignup = () => {
    // 회원가입 시 온보딩 페이지로 이동
    navigate('/user/onboarding-1');
  };

  return (
    <div className="theme-ocean">
      <div className="app-container">
        <div className="login-container">
          {/* 로고 및 타이틀 */}
          <div className="login-logo-section">
            {/*<img*/}
            {/*  src={logo}*/}
            {/*  alt="이음이 로고"*/}
            {/*  className="login-logo"*/}
            {/*/>*/}
            <h1 className="login-app-title">
              이음이
            </h1>
            <p className="login-app-subtitle">
              마음을 잇는 AI 친구
            </p>
          </div>

          {/* 로그인 폼 */}
          <div className="login-form-card">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="login-form-group">
                <label className="login-form-label">
                  아이디
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="아이디를 입력하세요"
                  className="login-input"
                />
              </div>

              <div className="login-form-group">
                <label className="login-form-label">
                  비밀번호
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  className="login-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-large btn-full"
              >
                로그인
              </button>
            </form>

            {/* 회원가입 버튼 */}
            <button
              onClick={handleSignup}
              className="btn btn-secondary btn-large btn-full"
            >
              회원가입
            </button>
          </div>

          {/* 구분선 */}
          <div className="login-divider">
            <div className="login-divider-line"></div>
            <span className="login-divider-text">
              또는
            </span>
            <div className="login-divider-line"></div>
          </div>

          {/* 구글 소셜 로그인 */}
          <button
            onClick={handleGoogleLogin}
            className="login-google-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </button>

          {/* 안내 텍스트 */}
          <div className="login-footer">
            <p className="login-footer-text">
              해커톤 청년 정서 돌봄 서비스
            </p>
            <p className="login-footer-copyright">
              © 2025 해커톤 이음이. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
