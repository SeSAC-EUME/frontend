/**
 * Axios 인스턴스 설정
 * API 요청을 위한 기본 설정 및 인터셉터
 */
import axios from 'axios';
import { JAVA_URL, API_CONFIG } from './config';

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: JAVA_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  config => {
    // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 에러 처리
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 인증 실패 - 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          break;
        case 403:
          // 권한 없음
          console.error('접근 권한이 없습니다.');
          break;
        case 404:
          console.error('요청한 리소스를 찾을 수 없습니다.');
          break;
        case 500:
          console.error('서버 오류가 발생했습니다.');
          break;
        default:
          console.error('에러가 발생했습니다:', error.response.data);
      }
    } else if (error.request) {
      console.error('서버로부터 응답이 없습니다.');
    } else {
      console.error('요청 설정 중 오류가 발생했습니다.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
