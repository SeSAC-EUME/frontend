# React 프론트엔드 Dockerfile
# Vite preview 서버 사용 (테스트용)

FROM node:20-alpine

WORKDIR /app

# 빌드 시 환경변수 (Vite는 빌드 시점에 주입)
# 같은 도메인에서 /api/로 요청하므로 슬래시만 설정
ARG VITE_API_URL=/
ENV VITE_API_URL=$VITE_API_URL

# package.json과 package-lock.json 복사
COPY package*.json ./

# 모든 의존성 설치 (devDependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# 포트 노출
EXPOSE 3000

# Vite preview 서버 실행 (포트 3000)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
 