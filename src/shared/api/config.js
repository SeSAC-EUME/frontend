/**
 * API 설정 파일
 * Spring Boot 백엔드 연결을 위한 환경별 API URL 관리
 */

// 환경 변수에서 API URL 가져오기
// 개발: / (Vite 프록시), 프로덕션: / (Nginx 프록시)
export const JAVA_URL = import.meta.env.VITE_API_URL || '/';

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // ========== 사용자 API ==========
  USER: {
    ME: `${JAVA_URL}api/users/me`,
    LOGOUT: `${JAVA_URL}api/users/logout`,
    WITHDRAW: `${JAVA_URL}api/users/me/withdraw`,
    DEACTIVATE: `${JAVA_URL}api/users/me/deactivate`,
    // 주의: REGISTER 없음 (OAuth2 자동 가입)
  },

  // ========== Eume AI 채팅 API ==========
  EUME_CHAT: {
    CREATE: `${JAVA_URL}api/eume-chats`,
    ME: `${JAVA_URL}api/eume-chats/me`,
    CONTENTS: (chatListId) => `${JAVA_URL}api/eume-chats/${chatListId}/contents`,
  },

  // ========== 다중 채팅 API ==========
  USER_CHAT: {
    LIST: `${JAVA_URL}api/user-chats`,
    CREATE: `${JAVA_URL}api/user-chats`,
    CONTENTS: (chatListId) => `${JAVA_URL}api/user-chats/${chatListId}/contents`,
  },

  // ========== 관리자 API ==========
  ADMIN: {
    LOGIN: `${JAVA_URL}api/admin/login`,
    LOGOUT: `${JAVA_URL}api/admin/logout`,
    REGISTER: `${JAVA_URL}api/admin/register`,
    ORGS: `${JAVA_URL}api/admin/orgs`,  // 무인증 API
    USERS: `${JAVA_URL}api/admin/users`,
    USER_DETAIL: (userId) => `${JAVA_URL}api/admin/users/${userId}`,
    USER_STATUS: (userId) => `${JAVA_URL}api/admin/users/${userId}/status`,
    USER_EMOTIONS: (userId) => `${JAVA_URL}api/admin/users/${userId}/emotions`,
    USERS_EXPORT: `${JAVA_URL}api/admin/users/export`,
    REPORTS_SUMMARY: `${JAVA_URL}api/admin/reports/summary`,
    REPORTS_EXPORT: `${JAVA_URL}api/admin/reports/export`,
  },
};

// API 설정 옵션
export const API_CONFIG = {
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
};
