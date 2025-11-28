import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { API_ENDPOINTS } from '../../shared/api/config';
import axiosInstance from '../../shared/api/axios';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { toBackendTheme } from '../../shared/utils/themeMapper';
import { STORAGE_KEYS } from '../../shared/constants/storage';

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
      const oauthUser = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.OAUTH_USER) || '{}'
      );
      const userName =
        localStorage.getItem(STORAGE_KEYS.OAUTH_REALNAME) || oauthUser.name || '';
      const nickname =
        localStorage.getItem(STORAGE_KEYS.OAUTH_USERNAME) || userName;
      const email =
        localStorage.getItem(STORAGE_KEYS.OAUTH_EMAIL) || oauthUser.email || '';
      const birthDate = localStorage.getItem(STORAGE_KEYS.OAUTH_BIRTHDATE) || '';
      const gender = localStorage.getItem(STORAGE_KEYS.OAUTH_GENDER) || '';
      const phone = localStorage.getItem(STORAGE_KEYS.OAUTH_PHONE) || '';

      // 프로필 업데이트 데이터 구성 (모든 수집 정보 포함)
      const profileData = {
        userName: userName,
        nickName: nickname,
        email: email,
        birthDate: birthDate || null,
        gender: gender ? gender.toUpperCase() : null,
        phone: phone ? phone.replace(/-/g, '') : null,
        backgroundTheme: toBackendTheme(selectedTheme),
      };

      // API 호출 - PUT /api/users/me (프로필 업데이트)
      // OAuth2 로그인 시 자동 회원가입이 완료되므로 프로필만 업데이트
      const result = await axiosInstance.put(
        API_ENDPOINTS.USER.ME,
        profileData
      );

      // 사용자 정보 저장 (토큰은 쿠키로 자동 관리됨)
      const userData = {
        id: result.id,
        email: result.email,
        nickname: result.nickname,
        userName: result.userName,
        backgroundTheme: selectedTheme, // 프론트엔드 테마 저장
        profileImage: result.profileImage,
      };
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));

      // 테마 및 상태 저장
      localStorage.setItem(STORAGE_KEYS.USER_THEME, selectedTheme);
      localStorage.setItem(STORAGE_KEYS.USER_VISITED, 'true');
      localStorage.setItem(STORAGE_KEYS.USER_ONBOARDING, 'true');

      // OAuth2 임시 데이터 삭제
      localStorage.removeItem(STORAGE_KEYS.OAUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.OAUTH_EMAIL);
      localStorage.removeItem(STORAGE_KEYS.OAUTH_REALNAME);
      localStorage.removeItem(STORAGE_KEYS.OAUTH_USERNAME);
      localStorage.removeItem(STORAGE_KEYS.OAUTH_BIRTHDATE);
      localStorage.removeItem(STORAGE_KEYS.OAUTH_GENDER);
      localStorage.removeItem(STORAGE_KEYS.OAUTH_PHONE);

      // 홈으로 이동
      navigate('/user/home');
    } catch (error) {
      console.error('프로필 설정 오류:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        '프로필 설정 중 오류가 발생했습니다. 다시 시도해주세요.';
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
