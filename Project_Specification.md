# Project Specification: Vibe Board (React + Vite + MySQL)

## 1. 개요 (Overview)
- **프로젝트 명**: Vibe Board (CodeTrip Project)
- **목적**: 프리미엄 디자인이 적용된 현대적인 CRUD 게시판 시스템 및 관광 정보 서비스 구축
- **기술 스택**:
    - Frontend: React 19, Vite, Axios, Tailwind CSS v4
    - Backend: Node.js (Express), MySQL (AWS EC2 Deployment)
    - APIs: 공공데이터포털 관광 정보 오픈 API (PhotoGalleryService1)

## 2. 데이터 스키마 (Data Schema)
MySQL `boards` 테이블 구조:

| 필드명 | 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | 글 번호 |
| `title` | VARCHAR(255) | NOT NULL | 제목 |
| `content` | TEXT | NOT NULL | 내용 |
| `author` | VARCHAR(100) | NOT NULL | 작성자 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 작성일 |

## 3. 기능 요구사항 (Functional Requirements)
- **게시판 CRUD**: 전체 조회, 상세 조회, 글 등록, 수정, 삭제 기능 제공.
- **관광 정보 연동**: 공공데이터포털 API를 통한 실시간 관광지 사진 및 정보 로드.
- **프리미엄 디자인**: Tailwind CSS v4 기반의 다크 모드, HSL 컬러 팔레트, 글래스모피즘(Glassmorphism) 적용.
- **반응형 레이아웃**: 데스크탑 및 모바일 환경 최적화.

## 4. API 명세 (API Specification)
### 4.1 Internal API (Express)
- `GET /api/boards`: 게시글 목록 조회
- `GET /api/boards/:id`: 게시글 상세 조회
- `POST /api/boards`: 게시글 등록
- `PUT /api/boards/:id`: 게시글 수정
- `DELETE /api/boards/:id`: 게시글 삭제

### 4.2 External API (Public Data)
- **Service**: 한국관광공사_관광사진정보서비스 (PhotoGalleryService1)
- **Endpoint**: `galleryList1`, `gallerySearchList1` 등

---

## 5. 프로젝트 구현 현황 (2026-04-20 업데이트)

### 6.1 프론트엔드 아키텍처 고도화
- **Tailwind CSS v4 마이그레이션**: 
    - 최신 `@tailwindcss/vite` 플러그인 도입으로 빌드 속도 및 DX 향상.
    - 기존 `@tailwind` 지시어에서 CSS 표준인 `@import "tailwindcss";` 방식으로 전환.
    - `postcss.config.js` 설정을 `@tailwindcss/postcss`로 업데이트하여 호환성 확보.
- **Vite 설정 최적화**: 5180 포트 고정 및 서버 프록시 설정 점검.

### 6.2 관광 데이터 연동 및 UI 구현
- **API 연동**: `axiosInstance`를 활용하여 관광 사진 정보 API 연동 완료.
- **디자인 시스템**: 'Solar Compiler' 테마 적용. HSL 컬러 시스템과 Tailwind v4의 유틸리티 클래스를 조합하여 고급스러운 카드 레이아웃 구현.
- **인터랙션**: `useCallback` 등을 활용한 데이터 로칭 최적화 및 스켈레톤 UI UI 적용 준비.

### 6.3 인프라 및 배포 (AWS EC2)
- **배포 방식**: Nginx 리버스 프록시와 PM2를 활용한 Native 설치 방식 채택.
- **보안**: `.env` 파일을 통해 API Key 및 DB 접속 정보를 분리 관리하며, `.gitignore`를 통해 Git 추적 방지.

---

## 6. 프로젝트 설계 구조 및 기술적 배경

### 6.1 3-Tier 아키텍처 및 리버스 프록시
- **Nginx**: 80포트로 진입하는 모든 요청을 관리하며, 정적 파일 서빙 및 `/api` 경로에 대한 백엔드 프록시 수행.
- **Express & MySQL**: 비즈니스 로직과 데이터 저장소를 분리하여 계층별 독립성 확보.

### 6.2 Native 방식 채택 사유
- **리소스 최적화**: EC2 t2.micro 환경에서 Docker 오버헤드 없이 시스템 자원을 최대한 활용.
- **인프라 이해**: 리눅스 환경에서의 서비스 데몬 관리(PM2)와 웹 서버 설정(Nginx)의 핵심 원리 실습.

---
*2026-04-20: 프로젝트 상세 명세서 내용 수정 및 한글 깨짐 복구 완료*
