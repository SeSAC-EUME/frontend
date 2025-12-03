import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';
import '../styles/admin-responsive.css';
import { STORAGE_KEYS } from '../../shared/constants/storage';

// 아이콘 import
import userIcon from '../assets/icons/user.svg';
import lockIcon from '../assets/icons/lock.svg';
import settingsIcon from '../assets/icons/settings.svg';

function Profile() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || '{}'
  );

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: currentUser.adminName || '',
    email: currentUser.adminEmail || '',
    department: currentUser.sigunguName || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    smsNotification: false,
    emergencyAlert: true,
    weeklyReport: true,
    systemUpdate: false
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const saveProfile = () => {
    // 프로필 저장 로직
    const updatedUser = {
      ...currentUser,
      adminName: profileData.name,
      adminEmail: profileData.email
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedUser));
    alert('프로필이 저장되었습니다.');
  };

  const changePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('모든 비밀번호 필드를 입력해주세요.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    // 비밀번호 변경 로직
    alert('비밀번호가 변경되었습니다.');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const saveNotificationSettings = () => {
    // 알림 설정 저장 로직
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
    alert('알림 설정이 저장되었습니다.');
  };

  return (
    <AdminLayout>
      {/* 페이지 헤더 */}
      <div className="page-header">
        <h2>내 프로필</h2>
      </div>

      <div className="profile-container">
        {/* 프로필 사이드바 */}
        <div className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              <img src={userIcon} alt="프로필" style={{ width: '48px', height: '48px' }} />
            </div>
            <div className="profile-name">{profileData.name || '관리자'}</div>
            <div className="profile-role">{profileData.department || '소속 기관'}</div>
          </div>

          <div className="profile-menu">
            <button
              className={`profile-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <img src={userIcon} alt="기본 정보" style={{ width: '20px', height: '20px' }} />
              기본 정보
            </button>
            <button
              className={`profile-menu-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <img src={lockIcon} alt="비밀번호" style={{ width: '20px', height: '20px' }} />
              비밀번호 변경
            </button>
            <button
              className={`profile-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <img src={settingsIcon} alt="설정" style={{ width: '20px', height: '20px' }} />
              알림 설정
            </button>
          </div>
        </div>

        {/* 프로필 컨텐츠 */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3>기본 정보</h3>
                <span className="card-subtitle">개인 정보를 수정할 수 있습니다</span>
              </div>

              <div className="profile-form">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div className="form-group">
                    <label>이름</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>이메일</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>소속 기관</label>
                    <input
                      type="text"
                      name="department"
                      value={profileData.department}
                      disabled
                      className="form-input"
                      style={{ background: '#F1F5F9', cursor: 'not-allowed' }}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="action-button" onClick={() => navigate('/admin/dashboard')}>
                    취소
                  </button>
                  <button className="action-button primary" onClick={saveProfile}>
                    저장하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card">
              <div className="card-header">
                <h3>비밀번호 변경</h3>
                <span className="card-subtitle">보안을 위해 주기적으로 비밀번호를 변경해주세요</span>
              </div>

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>현재 비밀번호</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      placeholder="현재 비밀번호를 입력하세요"
                    />
                  </div>
                  <div className="password-requirements">
                    <div className="requirement-title">비밀번호 요구사항</div>
                    <ul className="requirement-list">
                      <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                        최소 8자 이상
                      </li>
                      <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                        대문자 포함
                      </li>
                      <li className={/[a-z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                        소문자 포함
                      </li>
                      <li className={/[0-9]/.test(passwordData.newPassword) ? 'valid' : ''}>
                        숫자 포함
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>새 비밀번호</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                    />
                  </div>

                  <div className="form-group">
                    <label>새 비밀번호 확인</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      placeholder="새 비밀번호를 다시 입력하세요"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="action-button" onClick={() => {
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}>
                    취소
                  </button>
                  <button className="action-button primary" onClick={changePassword}>
                    비밀번호 변경
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card">
              <div className="card-header">
                <h3>알림 설정</h3>
                <span className="card-subtitle">받고 싶은 알림을 선택하세요</span>
              </div>

              <div className="profile-form">
                <div className="settings-grid">
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">이메일 알림</div>
                      <div className="setting-description">이메일로 중요한 알림을 받습니다</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="emailNotification"
                        checked={notificationSettings.emailNotification}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">SMS 알림</div>
                      <div className="setting-description">SMS로 긴급 알림을 받습니다</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="smsNotification"
                        checked={notificationSettings.smsNotification}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">긴급 상황 알림</div>
                      <div className="setting-description">고위험 이용자의 긴급 상황을 즉시 알림받습니다</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="emergencyAlert"
                        checked={notificationSettings.emergencyAlert}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-title">주간 보고서</div>
                      <div className="setting-description">매주 월요일 주간 보고서를 받습니다</div>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        name="weeklyReport"
                        checked={notificationSettings.weeklyReport}
                        onChange={handleNotificationChange}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="action-button primary" onClick={saveNotificationSettings}>
                    설정 저장
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Profile;
