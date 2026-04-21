# Project Specification: CodeTrip (Vibe Board + Tour Info)

## 1. 개요 (Overview)
- **프로젝트 명**: CodeTrip (Vibe Board Project)
- **목적**: 프리미엄 디자인이 적용된 현대적인 CRUD 게시판 시스템 및 관광 정보 서비스 구축
- **기술 스택**:
    - Frontend: React 19, Vite, Axios, Tailwind CSS v4
    - Backend: Node.js (Express), MySQL (AWS EC2 Deployment)
    - APIs: 공공데이터포털 관광 정보 오픈 API (PhotoGalleryService1)

---

## 2. 게시판 시스템 (Board System)

### 2.1 데이터 스키마 (Data Schema)
MySQL `boards` 테이블 구조:

| 필드명 | 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | 글 번호 |
| `title` | VARCHAR(255) | NOT NULL | 제목 |
| `content` | TEXT | NOT NULL | 내용 |
| `author` | VARCHAR(100) | NOT NULL | 작성자 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | 작성일 |

### 2.2 게시판 API (Internal API)
- `GET /api/boards`: 게시글 목록 조회
- `GET /api/boards/:id`: 게시글 상세 조회
- `POST /api/boards`: 게시글 등록
- `PUT /api/boards/:id`: 게시글 수정
- `DELETE /api/boards/:id`: 게시글 삭제

---

## 3. 관광 정보 시스템 (Tourist Information)

### 3.1 외부 API 연동
- **서비스명**: 한국관광공사_관광사진정보서비스 (PhotoGalleryService1)
- **기능**: 공공데이터포털 API를 통한 실시간 관광지 사진 및 정보 로드
- **주요 Endpoint**: `galleryList1`, `gallerySearchList1`

### 3.2 구현 특징
- **데이터 연동**: `axiosInstance`를 활용한 안정적인 API 통신.
- **UI/UX**: 'Solar Compiler' 테마 기반의 카드 레이아웃으로 관광 정보 시각화.

---

## 4. 인프라 및 디자인 가이드 (Common Infrastructure)

### 4.1 아키텍처 및 배포
- **3-Tier 아키텍처**: Nginx(프록시) - Express(비즈니스 로직) - MySQL(데이터)
- **Native 배포**: EC2 t2.micro 환경에서 Docker 없이 PM2와 Nginx를 활용하여 리소스 최적화.

### 4.2 디자인 시스템 (Vibe Coding)
- **UI Framework**: Tailwind CSS v4 (@tailwindcss/vite).
- **디자인 컨셉**: 다크 모드, HSL 컬러 시스템, 글래스모피즘(Glassmorphism) 적용.
- **반응형**: 데스크탑 및 모바일 최적화 레이아웃.

---

## 5. 프로젝트 업데이트 및 구현 이력

### 5.1 2026-04-20 업데이트
- **프론트엔드 고도화**: Tailwind CSS v4 마이그레이션 및 Vite 설정 최적화 (5180 포트).
- **보안 강화**: `.env`를 통한 API Key 및 DB 정보 분리 관리.

### 5.2 2026-04-21 업데이트
- **폴더 구조 변경**: 로컬 프로젝트 폴더명을 `2_Tour_Info`에서 `2_Code_Trip`으로 변경 추진.
- **원격 저장소 정리**: `2_CodeTrip_Project` 저장소와 동기화 및 불필요한 파일 점검 완료.
- **문서 구조화**: 게시판과 관광 정보 서비스의 명세 분리 및 재작성.

---
*최종 업데이트: 2026-04-21*
