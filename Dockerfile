# React 애플리케이션 배포용 Dockerfile

# 1. Node.js 기반 이미지로 빌드 스테이지 정의
FROM node:22-alpine AS build

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json과 yarn.lock 복사
COPY package.json ./

# 4. 기존 esbuild 제거 및 캐시 클리어

# 5. 의존성 설치
RUN npm install

# 8. React 소스코드 복사
COPY . .

# 9. 빌드 실행
RUN npm run build

# 10. Nginx를 통해 정적 파일 제공
FROM nginx:latest

# 11. React 빌드 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# 12. Nginx 포트
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
