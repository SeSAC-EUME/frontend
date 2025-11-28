커밋: 59cec49 (005: 백엔드 연동 2단계 - 사용자 페이지 API 연동)

- 문제: 커밋 로그에 "기존 채팅 내역 로드 기능 추가"가 있지만, 실제로는 기존 대화가 화면에 반영되지 않습니다. `src/user/pages/Home.jsx:117-126`의 `loadExistingChat`는 응답을 콘솔에만 찍고 상태(`messagesByRoom`, `chatHistory`)를 갱신하지 않아 UI는 여전히 목업 메시지/히스토리만 보여줍니다. 백엔드 응답 구조에 맞춰 메시지 배열과 최근 대화 리스트를 상태에 반영하는 로직이 필요합니다.
- 문제: 테마 변경 시 ThemeContext가 갱신되지 않습니다. `src/user/pages/Settings.jsx:154-204`에서 `useTheme`로 `currentTheme`만 가져오고 `setTheme` 호출이 없어, 바디 클래스/로컬스토리지/백엔드만 업데이트되고 컨텍스트 값은 그대로입니다. 그 결과 상위 래퍼(`theme-${currentTheme}`)와 다른 화면에서 컨텍스트 기반 테마가 즉시 반영되지 않습니다. `useTheme`에서 `setTheme`를 받아 `applyTheme` (및 초기 로드) 시 함께 호출해주세요.
- 추가 제안: 로그아웃 시 OAuth 온보딩 임시 키(`eume_email`, `eume_realName`, `eume_birthDate`, `eume_gender`, `eume_phone`)가 남습니다. `src/user/pages/Settings.jsx:237-255`에서 `STORAGE_KEYS`에 있는 OAuth 관련 키도 모두 지워 차후 로그인 사용자가 이전 임시 데이터를 보지 않도록 해주세요(`Onboarding3.jsx`에서 해당 키를 사용 중).
