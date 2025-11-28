/**
 * 전역 토스트 메시지 유틸리티
 * axios 인터셉터나 어디서든 호출 가능
 */

/**
 * 토스트 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {'info' | 'success' | 'warning' | 'error'} type - 토스트 타입
 * @param {number} duration - 표시 시간 (ms)
 */
export const showToast = (message, type = 'info', duration = 2500) => {
  // 기존 토스트 제거
  const existingToast = document.querySelector('.global-toast');
  if (existingToast) {
    existingToast.remove();
  }

  // 새 토스트 생성
  const toast = document.createElement('div');
  toast.className = `global-toast toast-${type}`;
  toast.textContent = message;

  // 스타일 적용
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: '10000',
    opacity: '0',
    transition: 'opacity 0.3s ease',
    backgroundColor: getBackgroundColor(type),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  });

  document.body.appendChild(toast);

  // 페이드 인
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // 자동 제거
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, duration);
};

/**
 * 토스트 타입별 배경색
 */
const getBackgroundColor = (type) => {
  const colors = {
    info: '#3B82F6',    // 파랑
    success: '#10B981', // 초록
    warning: '#F59E0B', // 노랑
    error: '#EF4444',   // 빨강
  };
  return colors[type] || colors.info;
};

/**
 * 편의 함수들
 */
export const showInfo = (message) => showToast(message, 'info');
export const showSuccess = (message) => showToast(message, 'success');
export const showWarning = (message) => showToast(message, 'warning');
export const showError = (message) => showToast(message, 'error');

export default showToast;
