import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import { useTheme } from '../../shared/contexts/ThemeContext';

function Onboarding4() {
  const navigate = useNavigate();
  const { theme: selectedTheme, setTheme } = useTheme();

  const handleBack = () => {
    navigate('/user/onboarding-3');
  };

  const handleThemeChange = newTheme => {
    setTheme(newTheme);
  };

  const handleComplete = async () => {
    try {
      // localStorage에서 OAuth2 사용자 정보 가져오기
      const oauthUser = JSON.parse(localStorage.getItem('oauth_user') || '{}');
      const email = oauthUser.email || localStorage.getItem('eume_email') || '';
      const userName =
        localStorage.getItem('eume_realName') || oauthUser.name || '';
      const nickname = localStorage.getItem('eume_userName') || userName;
      const birthDate = localStorage.getItem('eume_birthDate') || '';
      const gender = localStorage.getItem('eume_gender') || '';
      const phone = localStorage.getItem('eume_phone') || '';

      // API 요청 데이터 구성
      const registerData = {
        email: email,
        userName: userName,
        nickname: nickname,
        loginType: 'SOCIAL',
        providerId: oauthUser.providerId || null,
        groupId: null,
        birthDate: birthDate,
        gender: gender,
        phone: phone,
        profileImage: oauthUser.profileImage || null,
        backgroundTheme: selectedTheme,
      };

      // API 호출 - axios 인스턴스 사용
      const result = await axiosInstance.post(
        API_ENDPOINTS.USER.REGISTER,
        registerData
      );

      // 회원가입 성공 시 사용자 정보 및 토큰 저장
      if (result.token) {
        localStorage.setItem('token', result.token);
      }

      const userData = {
        userId: result.userId,
        loginId: result.loginId,
        name: result.name,
        email: result.email,
        groupId: result.groupId,
        firstLogin: result.firstLogin,
        userType: result.userType,
        profileImage: result.profileImage,
        backgroundTheme: selectedTheme,
      };
      localStorage.setItem('user', JSON.stringify(userData));

      // 테마 및 상태 저장
      localStorage.setItem('eume_theme', selectedTheme);
      localStorage.setItem('eume_visited', 'true');
      localStorage.setItem('eume_onboarding_complete', 'true');

      // 임시 데이터 삭제
      localStorage.removeItem('oauth_user');
      localStorage.removeItem('eume_email');
      localStorage.removeItem('eume_realName');
      localStorage.removeItem('eume_userName');
      localStorage.removeItem('eume_birthDate');
      localStorage.removeItem('eume_gender');
      localStorage.removeItem('eume_phone');

      // 성공 메시지 표시
      alert('회원가입이 완료되었습니다!');

      // 설정 페이지로 이동
      navigate('/user/home');
    } catch (error) {
      console.error('회원가입 오류:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
      alert(errorMessage);
    }
  };

  return (
    <div className={`theme-${selectedTheme} onboarding-page`}>
      <div className="onboarding-container">
        {/* 뒤로가기 버튼 */}
        <button className="back-button" onClick={handleBack}>
          ←
        </button>

        {/* 진행 표시 */}
        <div className="progress-dots">
          <span className="progress-dot completed"></span>
          <span className="progress-dot completed"></span>
          <span className="progress-dot completed"></span>
          <span className="progress-dot active"></span>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="onboarding-content">
          <h1 className="onboarding-title">
            편한 색을
            <br />
            선택해주세요
          </h1>

          <p className="onboarding-description">
            마음에 드는 색상을 골라주세요
            <br />
            나중에 변경할 수 있어요
          </p>

          <div className="theme-selector">
            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                value="ocean"
                checked={selectedTheme === 'ocean'}
                onChange={() => handleThemeChange('ocean')}
              />
              <div className="theme-preview ocean">
                <span className="theme-color"></span>
                <span className="theme-name">바다</span>
                <span className="theme-desc">시원한 파랑</span>
              </div>
            </label>

            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                value="sunset"
                checked={selectedTheme === 'sunset'}
                onChange={() => handleThemeChange('sunset')}
              />
              <div className="theme-preview sunset">
                <span className="theme-color"></span>
                <span className="theme-name">노을</span>
                <span className="theme-desc">따뜻한 주황</span>
              </div>
            </label>

            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                value="forest"
                checked={selectedTheme === 'forest'}
                onChange={() => handleThemeChange('forest')}
              />
              <div className="theme-preview forest">
                <span className="theme-color"></span>
                <span className="theme-name">숲</span>
                <span className="theme-desc">편안한 초록</span>
              </div>
            </label>

            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                value="lavender"
                checked={selectedTheme === 'lavender'}
                onChange={() => handleThemeChange('lavender')}
              />
              <div className="theme-preview lavender">
                <span className="theme-color"></span>
                <span className="theme-name">라벤더</span>
                <span className="theme-desc">은은한 보라</span>
              </div>
            </label>

            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                value="rose"
                checked={selectedTheme === 'rose'}
                onChange={() => handleThemeChange('rose')}
              />
              <div className="theme-preview rose">
                <span className="theme-color"></span>
                <span className="theme-name">장미</span>
                <span className="theme-desc">부드러운 분홍</span>
              </div>
            </label>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="button-container">
          <button
            className="btn btn-primary btn-large btn-full"
            onClick={handleComplete}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding4;
