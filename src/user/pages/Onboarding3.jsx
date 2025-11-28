import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/user.css';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { STORAGE_KEYS } from '../../shared/constants/storage';

function Onboarding3() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    birthDate: '',
    gender: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const { theme } = useTheme();

  useEffect(() => {
    // 기존 저장된 데이터 로드 (STORAGE_KEYS 사용)
    const savedEmail = localStorage.getItem(STORAGE_KEYS.OAUTH_EMAIL) || '';
    const savedUserName = localStorage.getItem(STORAGE_KEYS.OAUTH_REALNAME) || '';
    const savedBirthDate = localStorage.getItem(STORAGE_KEYS.OAUTH_BIRTHDATE) || '';
    const savedGender = localStorage.getItem(STORAGE_KEYS.OAUTH_GENDER) || '';
    const savedPhone = localStorage.getItem(STORAGE_KEYS.OAUTH_PHONE) || '';

    setFormData((prev) => ({
      ...prev,
      email: savedEmail,
      userName: savedUserName,
      birthDate: savedBirthDate,
      gender: savedGender,
      phone: savedPhone,
    }));
  }, []);

  const handleBack = () => {
    navigate('/user/onboarding-2');
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 이름 검증
    if (!formData.userName.trim()) {
      newErrors.userName = '이름을 입력해주세요';
    }

    // 이메일 검증
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 생년월일 검증
    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 입력해주세요';
    }

    // 성별 검증
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }

    // 전화번호 검증
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    setErrors(newErrors);

    // 에러가 있으면 alert 표시
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      alert(firstError);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      // 데이터 저장 (STORAGE_KEYS 사용)
      localStorage.setItem(STORAGE_KEYS.OAUTH_EMAIL, formData.email);
      localStorage.setItem(STORAGE_KEYS.OAUTH_REALNAME, formData.userName);
      localStorage.setItem(STORAGE_KEYS.OAUTH_BIRTHDATE, formData.birthDate);
      localStorage.setItem(STORAGE_KEYS.OAUTH_GENDER, formData.gender);
      localStorage.setItem(STORAGE_KEYS.OAUTH_PHONE, formData.phone);

      navigate('/user/onboarding-4');
    }
  };

  const formatPhoneNumber = (value) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '');

    // 자동으로 하이픈 추가
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    handleChange('phone', formatted);
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.userName &&
      formData.birthDate &&
      formData.gender &&
      formData.phone
    );
  };

  return (
    <div className={`theme-${theme} onboarding-page`}>
      <div className="onboarding-container">
          {/* 뒤로가기 버튼 */}
          <button className="back-button" onClick={handleBack}>
            ←
          </button>

          {/* 진행 표시 */}
          <div className="progress-dots">
            <span className="progress-dot completed"></span>
            <span className="progress-dot completed"></span>
            <span className="progress-dot active"></span>
            <span className="progress-dot"></span>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="onboarding-content" style={{ paddingTop: '1rem' }}>
            <h1 className="onboarding-title">
              정보를<br />
              입력해주세요
            </h1>

            <p className="onboarding-description">
              안전한 서비스 이용을 위해<br />
              필요한 정보를 알려주세요
            </p>

            <div className="input-container" style={{ gap: '1.25rem', marginTop: '1.5rem' }}>
              {/* 이름 */}
              <div className="input-group">
                <label className="input-label">이름</label>
                <input
                  type="text"
                  className={`input input-large ${errors.userName ? 'input-error' : ''}`}
                  placeholder="홍길동"
                  maxLength="20"
                  value={formData.userName}
                  onChange={(e) => handleChange('userName', e.target.value)}
                />
                {errors.userName && <p className="input-error-text">{errors.userName}</p>}
              </div>

              {/* 이메일 */}
              <div className="input-group">
                <label className="input-label">이메일</label>
                <input
                  type="email"
                  className={`input input-large ${errors.email ? 'input-error' : ''}`}
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && <p className="input-error-text">{errors.email}</p>}
              </div>

              {/* 생년월일 */}
              <div className="input-group">
                <label className="input-label">생년월일</label>
                <input
                  type="date"
                  className={`input input-large ${errors.birthDate ? 'input-error' : ''}`}
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.birthDate && <p className="input-error-text">{errors.birthDate}</p>}
              </div>

              {/* 성별 */}
              <div className="input-group">
                <label className="input-label">성별</label>
                <div className="gender-options">
                  <button
                    type="button"
                    className={`gender-option ${formData.gender === 'M' ? 'selected' : ''}`}
                    onClick={() => handleChange('gender', 'M')}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    className={`gender-option ${formData.gender === 'F' ? 'selected' : ''}`}
                    onClick={() => handleChange('gender', 'F')}
                  >
                    여성
                  </button>
                </div>
                {errors.gender && <p className="input-error-text">{errors.gender}</p>}
              </div>

              {/* 전화번호 */}
              <div className="input-group">
                <label className="input-label">전화번호</label>
                <input
                  type="tel"
                  className={`input input-large ${errors.phone ? 'input-error' : ''}`}
                  placeholder="010-1234-5678"
                  maxLength="13"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
                {errors.phone && <p className="input-error-text">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="button-container">
            <button
              className="btn btn-primary btn-large btn-full"
              onClick={handleNext}
            >
              다음
            </button>
          </div>
        </div>
      </div>
  );
}

export default Onboarding3;
