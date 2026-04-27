# server/Dockerfile

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# 업로드 파일 저장 디렉토리
RUN mkdir -p uploads

EXPOSE 8080
CMD ["node", "index.js"]