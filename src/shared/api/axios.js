/**
 * Axios 인스턴스 설정
 * - withCredentials: true (HttpOnly 쿠키 인증)
 * - 응답 인터셉터: response.data 반환 (기존 호출부 호환)
 * - 상태코드 분기 필요 시 axiosRaw 사용
 */
import axios from 'axios';
import { JAVA_URL, API_CONFIG } from './config';

const axiosInstance = axios.create({
  baseURL: JAVA_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: true, // HttpOnly 쿠키 인증
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 쿠키 기반 인증이므로 Authorization 헤더 불필요
    // 필요 시 여기에 요청 로깅 추가
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 기존 호출부 호환을 위해 response.data 반환
    return response.data;
  },
  (error) => {
    // 401 에러 시 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      const isAdmin = window.location.pathname.startsWith('/admin');
      window.location.href = isAdmin ? '/admin/login' : '/user/login';
    }

    // 에러 로깅
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('No response from server:', error.request);
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
