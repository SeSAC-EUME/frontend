/**
 * API 설정 파일
 * Spring Boot 백엔드 연결을 위한 환경별 API URL 관리
 */

// 환경 변수에서 API URL 가져오기
export const JAVA_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/';

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 관리자 엔드포인트
  ADMIN: {
    LOGIN: `${JAVA_URL}admin/login`,
    REGISTER: `${JAVA_URL}admin/register`,
    CHANGE_PASSWORD: `${JAVA_URL}admin/change-password`,
  },
  // 사용자 엔드포인트
  USER: {
    // LOGIN: `${JAVA_URL}user/login`,
    LOGOUT: `${JAVA_URL}user/logout`,
    REGISTER: `${JAVA_URL}user/register`,
    UPDATE: `${JAVA_URL}user/update`,
    WITHDRAW: `${JAVA_URL}user/withdraw`,
  },
  // 추가 엔드포인트는 여기에 정의
};

// API 설정 옵션
export const API_CONFIG = {
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
};
