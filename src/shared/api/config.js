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
    CONTENTS: (chatListId, page = 0, size = 20) =>
      `${JAVA_URL}api/eume-chats/${chatListId}/contents?page=${page}&size=${size}`,
  },

  // ========== 다중 채팅 API ==========
  USER_CHAT: {
    LIST: (page = 0, size = 20) =>
      `${JAVA_URL}api/user-chats?page=${page}&size=${size}`,
    CREATE: `${JAVA_URL}api/user-chats`,
    CONTENTS: (chatListId, page = 0, size = 20) =>
      `${JAVA_URL}api/user-chats/${chatListId}/contents?page=${page}&size=${size}`,
  },

  // ========== 관리자 API ==========
  ADMIN: {
    LOGIN: `${JAVA_URL}api/admin/login`,
    LOGOUT: `${JAVA_URL}api/admin/logout`,
    REGISTER: `${JAVA_URL}api/admin/register`,
    ORGS: `${JAVA_URL}api/admin/orgs`,  // 무인증 API
    USERS: (page = 0, size = 1000) =>
      `${JAVA_URL}api/admin/users?page=${page}&size=${size}`,
    USERS_ALL: `${JAVA_URL}api/admin/users?size=1000`,  // 전체 목록 (최대 1000명)
    USER_DETAIL: (userId) => `${JAVA_URL}api/admin/users/${userId}`,
    USER_STATUS: (userId) => `${JAVA_URL}api/admin/users/${userId}/status`,
    USER_EMOTIONS: (userId) => `${JAVA_URL}api/admin/users/${userId}/emotions`,
    USERS_EXPORT: `${JAVA_URL}api/admin/users/export`,
    // 감정 모니터링 최적화 API
    EMOTIONS_STATISTICS: (startDate, endDate) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const query = params.toString();
      return `${JAVA_URL}api/admin/emotions/statistics${query ? `?${query}` : ''}`;
    },
    USERS_EMOTIONS_LATEST: (page = 0, size = 20, startDate, endDate, emotionLevel = 'all') => {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (emotionLevel && emotionLevel !== 'all') params.append('emotionLevel', emotionLevel);
      return `${JAVA_URL}api/admin/users/emotions/latest?${params.toString()}`;
    },
    REPORTS_SUMMARY: (fromDate, toDate) =>
      `${JAVA_URL}api/admin/reports/summary?fromDate=${fromDate}&toDate=${toDate}`,
    REPORTS_EXPORT: (fromDate, toDate) =>
      `${JAVA_URL}api/admin/reports/export?fromDate=${fromDate}&toDate=${toDate}`,
  },
};

// API 설정 옵션
export const API_CONFIG = {
  timeout: 60000, // 60초
  headers: {
    'Content-Type': 'application/json',
  },
};
