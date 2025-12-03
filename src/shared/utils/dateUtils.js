/**
 * 날짜/시간 유틸리티
 * API에서 반환하는 UTC 시간을 한국 시간(KST, UTC+9)으로 변환
 */

/**
 * UTC 날짜 문자열을 한국 시간 Date 객체로 변환
 * @param {string} dateString - API에서 반환된 날짜 문자열
 * @returns {Date} 한국 시간으로 변환된 Date 객체
 */
export const toKoreanTime = (dateString) => {
  if (!dateString) return new Date();

  const date = new Date(dateString);

  // 이미 타임존 정보가 있는 경우 (Z 또는 +/-로 끝나는 경우)
  if (dateString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)) {
    return date;
  }

  // 타임존 정보가 없는 경우 UTC로 간주하고 9시간 추가
  date.setHours(date.getHours() + 9);
  return date;
};

/**
 * 날짜를 한국 시간 문자열로 포맷팅 (시:분)
 * @param {string} dateString - API에서 반환된 날짜 문자열
 * @returns {string} "오전/오후 HH:MM" 형식의 문자열
 */
export const formatKoreanTime = (dateString) => {
  if (!dateString) return '';
  const date = toKoreanTime(dateString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 날짜를 한국 시간 문자열로 포맷팅 (년-월-일)
 * @param {string} dateString - API에서 반환된 날짜 문자열
 * @returns {string} "YYYY. M. D." 형식의 문자열
 */
export const formatKoreanDate = (dateString) => {
  if (!dateString) return '-';
  const date = toKoreanTime(dateString);
  return date.toLocaleDateString('ko-KR');
};

/**
 * 날짜를 한국 시간 문자열로 포맷팅 (년-월-일 시:분)
 * @param {string} dateString - API에서 반환된 날짜 문자열
 * @returns {string} "YYYY. M. D. 오전/오후 HH:MM" 형식의 문자열
 */
export const formatKoreanDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = toKoreanTime(dateString);
  return date.toLocaleString('ko-KR');
};

/**
 * 상대 시간 포맷 (예: "방금 전", "1시간 전", "어제")
 * @param {string} dateString - API에서 반환된 날짜 문자열
 * @returns {string} 상대 시간 문자열
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = toKoreanTime(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR');
};

/**
 * 채팅 제목용 날짜 포맷 (예: "12월 3일 14:30 대화")
 * @param {string} dateString - API에서 반환된 날짜 문자열
 * @returns {string} 날짜 제목 문자열
 */
export const formatDateTitle = (dateString) => {
  if (!dateString) return '새 채팅';
  const date = toKoreanTime(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}월 ${day}일 ${hours}:${minutes} 대화`;
};
