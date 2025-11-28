/**
 * Axios Raw 인스턴스
 * - 인터셉터 없이 원본 응답 반환
 * - 상태코드 분기가 필요한 API에서만 사용
 *
 * 대상 API:
 * - POST /api/admin/login (200/401)
 * - POST /api/admin/register (201/400/409)
 * - POST /api/eume-chats (201/409)
 * - POST /api/users/me/deactivate (200/409)
 *
 * 사용 예시:
 * const response = await axiosRaw.post(API_ENDPOINTS.ADMIN.LOGIN, data);
 * if (response.status === 200) { ... }
 */
import axios from 'axios';
import { JAVA_URL, API_CONFIG } from './config';

const axiosRaw = axios.create({
  baseURL: JAVA_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: true,
});

export default axiosRaw;
