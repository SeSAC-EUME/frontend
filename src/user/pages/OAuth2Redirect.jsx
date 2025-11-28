import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/user.css';
import { JAVA_URL } from '../../shared/api/config';

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
      console.log('쿠키:', document.cookie);

      // 쿠키에서 토큰 추출
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };
      const token = getCookie('sh_access_token') || searchParams.get('token');
      console.log('추출된 토큰:', token ? '존재함' : '없음');

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

      // 백엔드에서 사용자 정보 가져오기
      console.log('백엔드에서 사용자 정보 조회 시작...');
      const response = await fetch(`${JAVA_URL}api/users/me`, {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('응답 상태:', response.status);

      if (!response.ok) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      const userData = await response.json();
      console.log('백엔드에서 받은 사용자 정보:', userData);

      // 백엔드 응답 구조에 맞게 매핑
      const userId = userData.id || userData.userId || userData.user_id || userData.email; // email을 userId로 사용
      const email = userData.email;
      const name = userData.userName || userData.name;
      const profileImage = userData.profileImage;
      const providerId = userData.providerId;
      const isNewUser = userData.isNewUser || false; // 기본값 false

      // 필수 파라미터 체크 (이메일만 있으면 됨)
      if (!email) {
        console.log('필수 파라미터 누락:', { email });
        setError('사용자 정보를 가져올 수 없습니다.');
        setTimeout(() => {
          navigate('/user/login');
        }, 2000);
        return;
      }

      // 토큰 저장
      if (token) {
        console.log('토큰 localStorage에 저장');
        localStorage.setItem('eume_user_token', token);
      } else {
        console.log('⚠️ 토큰이 없습니다!');
      }

      // OAuth 사용자 정보 임시 저장
      const oauthUser = {
        userId,
        email,
        name,
        profileImage,
        providerId
      };
      localStorage.setItem('oauth_user', JSON.stringify(oauthUser));
      console.log('OAuth 사용자 정보 저장:', oauthUser);

      // 신규 사용자인 경우 온보딩으로, 기존 사용자는 홈으로
      if (isNewUser) {
        // 신규 사용자 - 온보딩 1단계로 이동
        console.log('신규 사용자 -> /user/onboarding-1로 이동');
        navigate('/user/onboarding-1');
      } else {
        // 기존 사용자 - 사용자 정보 저장 후 설정 페이지로 이동
        const userData = {
          userId,
          loginId: email,
          name,
          email,
          profileImage,
          userType: 'USER'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('eume_visited', 'true');
        console.log('기존 사용자 정보 저장:', userData);
        console.log('localStorage 저장 완료, /user/home으로 이동');

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
