/**
 * localStorage 키 상수
 * 일관된 키 사용을 위해 상수로 정의
 */

export const STORAGE_KEYS = {
  // ========== 사용자 ==========
  USER_INFO: 'eume_user', // 사용자 기본 정보 (JSON)
  USER_THEME: 'eume_theme', // 선택한 테마
  USER_VISITED: 'eume_visited', // 방문 여부
  USER_ONBOARDING: 'eume_onboarding_complete', // 온보딩 완료 여부

  // OAuth2 임시 데이터
  OAUTH_USER: 'oauth_user', // OAuth2 사용자 정보 (임시)
  OAUTH_EMAIL: 'eume_email',
  OAUTH_REALNAME: 'eume_realName',
  OAUTH_USERNAME: 'eume_userName',
  OAUTH_BIRTHDATE: 'eume_birthDate',
  OAUTH_GENDER: 'eume_gender',
  OAUTH_PHONE: 'eume_phone',

  // ========== 채팅 ==========
  EUME_CHAT_ID: 'eume_chat_id', // Eume AI 채팅방 ID

  // ========== 관리자 ==========
  ADMIN_USER: 'eume_admin_user', // 관리자 정보 (JSON)
  ADMIN_SESSION_EXPIRY: 'eume_admin_session_expiry', // 세션 만료 시간
  ADMIN_LOGIN_HISTORY: 'eume_admin_login_history', // 로그인 기록
};

/**
 * 사용자 데이터 전체 삭제 (로그아웃/탈퇴 시 사용)
 * 테마는 유지
 */
export const clearAllUserData = () => {
  const keysToRemove = [
    STORAGE_KEYS.USER_INFO,
    STORAGE_KEYS.USER_VISITED,
    STORAGE_KEYS.USER_ONBOARDING,
    STORAGE_KEYS.OAUTH_USER,
    STORAGE_KEYS.OAUTH_EMAIL,
    STORAGE_KEYS.OAUTH_REALNAME,
    STORAGE_KEYS.OAUTH_USERNAME,
    STORAGE_KEYS.OAUTH_BIRTHDATE,
    STORAGE_KEYS.OAUTH_GENDER,
    STORAGE_KEYS.OAUTH_PHONE,
    STORAGE_KEYS.EUME_CHAT_ID,
  ];

  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

/**
 * 삭제 대상 키 (더 이상 사용하지 않음)
 * - 'accessToken': axios.js에서 사용했으나 쿠키로 대체
 * - 'token': 쿠키로 대체
 * - 'eume_user_token': 쿠키로 대체
 * - 'user': eume_user로 통일
 */
