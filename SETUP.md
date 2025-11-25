# EUME 프로젝트 초기 구성 가이드

## 프로젝트 개요
이음이(EUME)는 서울시의 고립은둔청년을 위한 정서 돌봄 AI 서비스입니다.

## 기술 스택
- **프론트엔드**: React 19 + Vite
- **라우팅**: React Router v6
- **스타일링**: Tailwind CSS
- **HTTP 클라이언트**: Axios
- **코드 품질**: ESLint + Prettier
- **컨테이너화**: Docker

## 디렉토리 구조

```
EUME/
├── src/
│   ├── api/                 # API 통신 관련
│   │   ├── config.js        # API URL 및 엔드포인트 설정
│   │   ├── axios.js         # Axios 인스턴스 및 인터셉터
│   │   └── index.js         # API 모듈 통합 export
│   ├── assets/              # 이미지, 아이콘, 폰트 등
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── hooks/               # 커스텀 React 훅
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── admin/          # 관리자 페이지
│   │   │   └── Dashboard.jsx
│   │   └── user/           # 사용자 페이지
│   │       └── Home.jsx
│   ├── styles/              # 글로벌 스타일
│   ├── utils/               # 유틸리티 함수
│   ├── routes.jsx           # React Router 설정
│   ├── App.css              # 커스텀 스타일
│   ├── index.css            # Tailwind 및 글로벌 스타일
│   └── main.jsx             # 앱 진입점
├── .env                     # 환경 변수 (Git 제외)
├── .env.example             # 환경 변수 예시
├── Dockerfile               # React 앱 Docker 설정
├── docker-compose.yml       # 다중 컨테이너 설정
├── nginx.conf               # Nginx 설정
├── tailwind.config.js       # Tailwind CSS 설정
├── postcss.config.js        # PostCSS 설정
├── .prettierrc              # Prettier 설정
└── eslint.config.js         # ESLint 설정
```

## 설정 완료 항목

### 1. 환경 변수 (.env)
```bash
#VITE_API_URL=http://localhost:8080/
VITE_API_URL=https://4.230.16.73:8443/
VITE_ENV=development
```

### 2. API 주소 관리
- **파일**: `src/api/config.js`
- Spring Boot 백엔드 URL 관리
- API 엔드포인트 상수 정의

### 3. Axios 설정
- **파일**: `src/api/axios.js`
- 요청/응답 인터셉터 구현
- JWT 토큰 자동 추가
- 에러 핸들링 (401, 403, 404, 500)

### 4. React Router 설정
- **파일**: `src/routes.jsx`
- Admin/User 페이지 분리
- 중첩 라우팅 지원

**라우트 구조:**
```
/ → UserHome
/admin/dashboard → AdminDashboard
/user/home → UserHome
```

### 5. Tailwind CSS
- **설정 파일**: `tailwind.config.js`, `postcss.config.js`
- `index.css`에 Tailwind 지시문 추가
- `App.css`에 커스텀 스타일 정의

### 6. ESLint + Prettier
- ESLint 9 flat config 사용
- Prettier 통합 설정
- 코드 스타일 자동 포맷팅

**사용 가능한 스크립트:**
```bash
npm run format        # 코드 포맷팅
npm run format:check  # 포맷 검사
npm run lint          # 린트 검사
npm run lint:fix      # 린트 자동 수정
```

### 7. Docker 설정
- **Dockerfile**: 멀티 스테이지 빌드 (Node.js → Nginx)
- **docker-compose.yml**: 프론트엔드/백엔드/DB 통합 설정
- **nginx.conf**: SPA 라우팅 및 API 프록시 설정

## 시작하기

### 개발 환경 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### Docker 실행
```bash
# 프론트엔드만 실행
docker build -t eume-frontend .
docker run -p 3000:80 eume-frontend

# 전체 스택 실행 (docker-compose.yml 수정 필요)
docker-compose up -d
```

## 다음 단계

### 백엔드 연동
1. Spring Boot 프로젝트 준비
2. `docker-compose.yml`에서 `backend` 서비스 주석 해제
3. 데이터베이스 연결 설정 확인
4. API 엔드포인트 정의 (`src/api/config.js`)

### 컴포넌트 개발
1. `src/components/`에 공통 컴포넌트 추가
2. `src/pages/admin/`에 관리자 페이지 추가
3. `src/pages/user/`에 사용자 페이지 추가

### 커스텀 훅 작성
- `src/hooks/`에 재사용 가능한 로직 추가
- 예: `useAuth.js`, `useFetch.js`, `useLocalStorage.js`

### 유틸리티 함수
- `src/utils/`에 헬퍼 함수 추가
- 예: 날짜 포맷팅, 유효성 검사, 상수 정의

## 참고 사항

### API 사용 예시
```javascript
import { axiosInstance, API_ENDPOINTS } from '@/api';

// GET 요청
const data = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE);

// POST 요청
const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
  username: 'user',
  password: 'password'
});
```

### Tailwind 클래스 사용 예시
```jsx
<div className="container-custom py-8">
  <h1 className="text-3xl font-bold mb-6">제목</h1>
  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    버튼
  </button>
</div>
```

## 문제 해결

### ESLint 에러
```bash
npm run lint:fix
```

### Tailwind 클래스가 적용 안됨
- `tailwind.config.js`의 `content` 경로 확인
- 개발 서버 재시작

### Docker 빌드 실패
- `.dockerignore`에 불필요한 파일 제외 확인
- `node_modules` 삭제 후 재시도

## 추가 정보
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/)
- [React Router 공식 문서](https://reactrouter.com/)
