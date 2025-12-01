# React 프론트엔드 Dockerfile
# Multi-stage build: Node.js로 빌드 후 nginx로 정적 파일 서빙

# 1단계: 빌드
FROM node:20-alpine AS builder

WORKDIR /app

# 빌드 시 환경변수 (Vite는 빌드 시점에 주입)
ARG VITE_API_URL=/
ENV VITE_API_URL=$VITE_API_URL

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# 2단계: nginx로 정적 파일 서빙
FROM nginx:alpine

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 라우팅을 위한 nginx 설정
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
