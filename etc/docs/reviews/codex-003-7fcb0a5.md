커밋: 7fcb0a5 (005: 컴포넌트 STORAGE_KEYS 통일 및 로그아웃 API 연동)

- 문제: 스플래시 온보딩 분기 오류. `src/user/pages/Splash.jsx:12-30`에서 `if (!onboardingComplete && !hasVisited)`로 체크하여 방문 여부가 true이기만 하면 온보딩 완료 여부와 무관하게 홈으로 보냅니다. 온보딩을 시작했다가 완료하지 않은 사용자는 홈으로 이동해버려 상태가 꼬입니다. `if (!onboardingComplete) { navigate('/user/onboarding-1'); }`처럼 온보딩 완료 플래그만으로 분기하거나, 방문 여부가 true라도 완료되지 않으면 온보딩으로 보내도록 수정해주세요.
- 문제: 로그아웃 시 임시 온보딩/설정 데이터가 남음. `src/user/components/Sidebar.jsx:45-59`에서 USER_INFO 등은 삭제하지만 `eume_email`, `eume_realName`, `eume_birthDate`, `eume_gender`, `eume_phone`, `eume_settings` 등 온보딩과 설정에서 사용하는 키를 제거하지 않습니다. 이후 로그인 사용자가 이전 임시 데이터를 보게 됩니다. `STORAGE_KEYS`에 정의된 OAuth 관련 키와 설정 키까지 모두 삭제하도록 정리해주세요.
