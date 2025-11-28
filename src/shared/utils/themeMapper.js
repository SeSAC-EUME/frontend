/**
 * 테마 매핑 유틸리티
 * 프론트엔드 테마 ↔ 백엔드 테마 변환
 *
 * 프론트엔드: ocean, sunset, forest, lavender, rose
 * 백엔드: DEFAULT, DARK, LIGHT
 */

const FRONTEND_TO_BACKEND = {
  ocean: 'DEFAULT',
  sunset: 'DARK',
  forest: 'LIGHT',
  lavender: 'DEFAULT', // 매핑 없음, 기본값 사용
  rose: 'DEFAULT', // 매핑 없음, 기본값 사용
};

const BACKEND_TO_FRONTEND = {
  DEFAULT: 'ocean',
  DARK: 'sunset',
  LIGHT: 'forest',
};

/**
 * 프론트엔드 테마를 백엔드 테마로 변환
 * @param {string} frontendTheme - 프론트엔드 테마 (ocean, sunset, forest, lavender, rose)
 * @returns {string} 백엔드 테마 (DEFAULT, DARK, LIGHT)
 */
export const toBackendTheme = (frontendTheme) => {
  return FRONTEND_TO_BACKEND[frontendTheme] || 'DEFAULT';
};

/**
 * 백엔드 테마를 프론트엔드 테마로 변환
 * @param {string} backendTheme - 백엔드 테마 (DEFAULT, DARK, LIGHT)
 * @returns {string} 프론트엔드 테마 (ocean, sunset, forest)
 */
export const toFrontendTheme = (backendTheme) => {
  return BACKEND_TO_FRONTEND[backendTheme] || 'ocean';
};

// 프론트엔드 지원 테마 목록
export const FRONTEND_THEMES = ['ocean', 'sunset', 'forest', 'lavender', 'rose'];

// 백엔드 지원 테마 목록
export const BACKEND_THEMES = ['DEFAULT', 'DARK', 'LIGHT'];
