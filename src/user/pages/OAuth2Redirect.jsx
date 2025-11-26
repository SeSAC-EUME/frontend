import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/user.css';

function OAuth2Redirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    handleOAuth2Redirect();
  }, []);

  const handleOAuth2Redirect = async () => {
    try {
      // URL 파라미터에서 사용자 정보 추출
      const userId = searchParams.get('userId');
      const email = searchParams.get('email');
      const name = searchParams.get('name');
      const profileImage = searchParams.get('profileImage');
      const providerId = searchParams.get('providerId');
      const token = searchParams.get('token');
      const isNewUser = searchParams.get('isNewUser') === 'true';
      const errorParam = searchParams.get('error');

      // 에러 체크
      if (errorParam) {
        setError('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
        setTimeout(() => {
          navigate('/user/login');
        }, 2000);
        return;
      }

      // 필수 파라미터 체크
      if (!userId || !email) {
        setError('사용자 정보를 가져올 수 없습니다.');
        setTimeout(() => {
          navigate('/user/login');
        }, 2000);
        return;
      }

      // 토큰 저장
      if (token) {
        localStorage.setItem('token', token);
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

      // 신규 사용자인 경우 온보딩으로, 기존 사용자는 홈으로
      if (isNewUser) {
        // 신규 사용자 - 온보딩 1단계로 이동
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

        navigate('/user/home');
      }
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
