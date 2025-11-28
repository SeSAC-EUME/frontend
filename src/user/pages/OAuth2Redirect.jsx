import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/user.css';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import { STORAGE_KEYS } from '../../shared/constants/storage';
import { toFrontendTheme } from '../../shared/utils/themeMapper';

function OAuth2Redirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    handleOAuth2Redirect();
  }, []);

  const handleOAuth2Redirect = async () => {
    try {
      console.log('=== OAuth2 리다이렉트 시작 ===');
      console.log('현재 URL:', window.location.href);

      // URL 파라미터에서 에러 체크
      const errorParam = searchParams.get('error');
      if (errorParam) {
        console.log('에러 파라미터 감지:', errorParam);
        setError('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
        setTimeout(() => {
          navigate('/user/login');
        }, 2000);
        return;
      }

      // 백엔드에서 사용자 정보 가져오기 (쿠키 기반 인증)
      console.log('백엔드에서 사용자 정보 조회 시작...');
      const userData = await axiosInstance.get(API_ENDPOINTS.USER.ME);
      console.log('백엔드에서 받은 사용자 정보:', userData);

      // 백엔드 응답 구조에 맞게 매핑
      const userId = userData.id;
      const email = userData.email;
      const name = userData.userName || userData.name;
      const nickname = userData.nickname;
      const profileImage = userData.profileImage;
      const providerId = userData.providerId;
      const isNewUser = userData.isNewUser || false;
      // 백엔드 테마 → 프론트엔드 테마 변환
      const theme = toFrontendTheme(userData.backgroundTheme);

      // 필수 파라미터 체크
      if (!email) {
        console.log('필수 파라미터 누락:', { email });
        setError('사용자 정보를 가져올 수 없습니다.');
        setTimeout(() => {
          navigate('/user/login');
        }, 2000);
        return;
      }

      // 신규 사용자인 경우 온보딩으로, 기존 사용자는 홈으로
      if (isNewUser) {
        // OAuth 사용자 정보 임시 저장 (온보딩에서 사용)
        const oauthUser = {
          userId,
          email,
          name,
          profileImage,
          providerId,
        };
        localStorage.setItem(
          STORAGE_KEYS.OAUTH_USER,
          JSON.stringify(oauthUser)
        );
        console.log('OAuth 사용자 정보 저장:', oauthUser);

        // 신규 사용자 - 온보딩 1단계로 이동
        console.log('신규 사용자 -> /user/onboarding-1로 이동');
        navigate('/user/onboarding-1');
      } else {
        // 기존 사용자 - 사용자 정보 저장 후 홈으로 이동
        const userInfo = {
          id: userId,
          email,
          userName: name,
          nickname,
          profileImage,
          backgroundTheme: theme,
        };
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
        localStorage.setItem(STORAGE_KEYS.USER_THEME, theme);
        localStorage.setItem(STORAGE_KEYS.USER_VISITED, 'true');
        console.log('기존 사용자 정보 저장:', userInfo);

        navigate('/user/home');
      }
      console.log('=== OAuth2 리다이렉트 처리 완료 ===');
    } catch (error) {
      console.error('OAuth2 리다이렉트 처리 오류:', error);
      setError('로그인 처리 중 오류가 발생했습니다.');
      setTimeout(() => {
        navigate('/user/login');
      }, 2000);
    }
  };

  return (
    <div className="theme-ocean">
      <div className="app-container">
        <div className="login-container">
          <div className="login-logo-section">
            <h1 className="login-app-title">이음이</h1>
            {error ? (
              <p className="login-error" style={{ marginTop: '20px' }}>
                {error}
              </p>
            ) : (
              <p className="login-app-subtitle" style={{ marginTop: '20px' }}>
                로그인 처리 중입니다...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OAuth2Redirect;
