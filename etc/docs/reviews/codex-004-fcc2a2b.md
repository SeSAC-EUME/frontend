커밋: fcc2a2b (005: Emergency/Profile 페이지 정리)

- 문제: Emergency.jsx의 실시간 업데이트 타이머가 언마운트 시 정리되지 않습니다. `useEffect`(src/admin/pages/Emergency.jsx:17-21)에서 `startRealtimeUpdates()` 호출 후 반환된 클린업 함수를 반환하지 않아 페이지 이동 시 interval이 계속 살아 있습니다. `useEffect`에서 `return startRealtimeUpdates();` 형태로 정리해 주세요.
- 문제: Profile.jsx에서 STORAGE_KEYS.ADMIN_USER를 읽지만 저장은 리터럴 키를 씁니다. `saveProfile`(src/admin/pages/Profile.jsx:68-77)에서 `localStorage.setItem(STORAGE_KEYS.ADMIN_USER, ...)`로 바꿔 상수 변경 시 동기화를 보장하는 편이 안전합니다.
