/**
 * Blob 다운로드 전용 Axios 인스턴스
 * - responseType: 'blob' 기본 설정
 * - 인터셉터 없이 전체 response 반환 (Content-Type 보존)
 * - 파일 다운로드용 긴 타임아웃
 *
 * 사용처: Excel 내보내기, PDF/리포트 다운로드
 */
import axios from 'axios';
import { JAVA_URL } from './config';

const axiosBlob = axios.create({
  baseURL: JAVA_URL,
  timeout: 60000, // 60초 (파일 다운로드용)
  withCredentials: true, // HttpOnly 쿠키 인증
  responseType: 'blob',
});

// 요청 인터셉터 (최소화)
axiosBlob.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 응답 인터셉터 - 전체 response 반환 (Content-Type 보존)
axiosBlob.interceptors.response.use(
  (response) => response, // response.data가 아닌 전체 response 반환
  (error) => {
    // 401 에러 시 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath === '/user/login' || currentPath === '/admin/login';

      if (!isOnLoginPage) {
        const isAdmin = currentPath.startsWith('/admin');
        window.location.href = isAdmin ? '/admin/login' : '/user/login';
      }
    }

    console.error('Blob download error:', error);
    return Promise.reject(error);
  }
);

/**
 * Blob 다운로드 헬퍼 함수
 * @param {Blob} blob - 다운로드할 Blob 데이터
 * @param {string} filename - 저장할 파일명
 * @param {string} [mimeType] - MIME 타입 (선택, 없으면 response에서 추출)
 */
export const downloadBlob = (blob, filename, mimeType) => {
  const url = window.URL.createObjectURL(
    mimeType ? new Blob([blob], { type: mimeType }) : blob
  );
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Content-Disposition 헤더에서 파일명 추출
 * @param {string} contentDisposition - Content-Disposition 헤더 값
 * @param {string} defaultFilename - 기본 파일명
 * @returns {string} 추출된 파일명
 */
export const extractFilename = (contentDisposition, defaultFilename) => {
  if (!contentDisposition) return defaultFilename;

  // filename*=UTF-8''encoded_filename 형식
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1]);
  }

  // filename="filename" 형식
  const match = contentDisposition.match(/filename="?([^";\n]+)"?/i);
  if (match) {
    return match[1];
  }

  return defaultFilename;
};

export default axiosBlob;
