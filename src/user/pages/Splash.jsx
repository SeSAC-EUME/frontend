import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import logo from '../../shared/assets/logo.png';
import { STORAGE_KEYS } from '../../shared/constants/storage';

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // 로그인 상태 확인 (쿠키 기반 인증, localStorage는 캐시)
      const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      const hasVisited = localStorage.getItem(STORAGE_KEYS.USER_VISITED);
      const onboardingComplete = localStorage.getItem(STORAGE_KEYS.USER_ONBOARDING);

      // 로그인 안 된 경우 -> 로그인 페이지
      if (!userInfo) {
        navigate('/user/login');
        return;
      }

      // 로그인 됨 + 온보딩 미완료 -> 온보딩 페이지
      if (!onboardingComplete && !hasVisited) {
        navigate('/user/onboarding-1');
        return;
      }

      // 로그인 됨 + 온보딩 완료 -> 홈 페이지
      navigate('/user/home');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="theme-ocean">
      <div className="splash-container">
        <div className="splash-content">
          <div className="logo-container">
            <img src={logo} alt="서비스 로고" className="splash-logo" />
            <h1 className="app-title">이음이</h1>
            <p className="app-subtitle">마음을 잇는 AI 친구</p>
          </div>

          <div className="loading-container">
            <div className="loading-text">연결하는 중</div>
            <div className="loading-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>

          <div className="footer-logo">
            <p className="footer-text">해커톤 청년 정서 돌봄 서비스</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Splash;
