/**
 * Axios 인스턴스 설정
 * - withCredentials: true (HttpOnly 쿠키 인증)
 * - 응답 인터셉터: response.data 반환 (기존 호출부 호환)
 * - 상태코드 분기 필요 시 axiosRaw 사용
 */
import axios from 'axios';
import { JAVA_URL, API_CONFIG } from './config';
import { showError } from '../utils/toast';

const axiosInstance = axios.create({
  baseURL: JAVA_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: true, // HttpOnly 쿠키 인증
});

// 개발 모드 확인
const isDev = import.meta.env.DEV;

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 쿠키 기반 인증이므로 Authorization 헤더 불필요
    // 개발 모드에서 요청 로깅
    if (isDev) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 개발 모드에서 응답 로깅
    if (isDev) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    // 기존 호출부 호환을 위해 response.data 반환
    return response.data;
  },
  (error) => {
    // 401 에러 시 로그인 페이지로 리다이렉트
    // 단, 이미 로그인 페이지에 있거나 인증 확인 중이면 리다이렉트 하지 않음
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath === '/user/login' || currentPath === '/admin/login';
      const isOnOAuthRedirect = currentPath === '/oauth2/redirect';

      if (!isOnLoginPage && !isOnOAuthRedirect) {
        const isAdmin = currentPath.startsWith('/admin');
        window.location.href = isAdmin ? '/admin/login' : '/user/login';
      }
    }

    // 에러 로깅 및 사용자 알림
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);

      // 서버 에러 (5xx) 시 토스트 표시
      if (error.response.status >= 500) {
        showError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } else if (error.request) {
      // 네트워크 에러 (응답 없음)
      console.error('No response from server:', error.request);
      showError('네트워크 연결을 확인해주세요.');
    } else {
      // 요청 설정 에러
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
