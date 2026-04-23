# 프로젝트 상세 명세서 — CodeTrip

> 현재 구현 상태 기준의 스냅샷 문서입니다.
> 날짜별 변경 이력은 [CHANGELOG.md](CHANGELOG.md)를 참고하세요.

---

## 0. 프로젝트 히스토리 및 개발 개요
본 문서는 프로젝트의 초기 설정부터 현재 `CodeTrip` 시스템으로 발전하기까지의 모든 과정을 기록합니다.

---

## 1. 프로젝트 개요: CodeTrip
- **프로젝트 명**: CodeTrip (Vibe Board + Tour Info)
- **목적**: 프리미엄 디자인이 적용된 현대적인 CRUD 게시판 시스템 및 관광 정보 서비스 구축
- **현상태**: 전국 여행지 탐색 기능(Explore) 및 상세 페이지(TravelDetail) 통합 완료. 사용자 프로필 수정 및 보안 설정(비밀번호 변경) 시스템 구축 완료. 실시간 지도 API 및 파일 업로드 기능이 포함된 완성도 높은 풀스택 서비스 단계.

### 1.1 기술 스택 (Current)
- **Frontend**: React 19, Vite 8, Axios, Tailwind CSS v4, React Router DOM v7, Zustand
- **Backend**: Node.js (Express), MySQL, **Multer** (파일 업로드 처리)
- **Infrastructure**: Vite Proxy (CORS Bypass), Nginx, 정적 파일 서빙(`/uploads`)
- **APIs**: 
    - 한국관광공사 KorService2 (TourAPI) — 전국 여행지 데이터 및 상세 정보
    - 카카오 맵 API — 여행지 위치 시각화 (`react-kakao-maps-sdk`)
    - 한국관광공사 관광사진정보서비스 (PhotoGalleryService1)
    - Open-Meteo API / Nominatim API
- **Linting**: ESLint 9.39.4

---

## 2. 시스템 상세 설계

### 2.0 프로젝트 핵심 아키텍처 (Core Architecture)

본 프로젝트는 유지보수성과 확장성을 극대화하기 위해 다음과 같은 설계 원칙을 따릅니다.

1. **전역 상태 관리의 최적화 (Zustand)**:
   - `useAuthStore`를 통해 사용자 인증 및 전역 세션 관리.
   - `updateUser` 액션을 통한 실시간 프로필 정보 동기화.
2. **도메인 기반 API 레이어 분리 (Service Layer Pattern)**:
   - `travelInfoApi.js`, `authApi.js` 등 도메인별 모듈화를 통해 비즈니스 로직 격리.
3. **Vite Proxy 기반의 안정적인 통신**:
   - `vite.config.js` 프록시 설정을 통해 공공데이터 및 백엔드 서버(`/api`) 간의 통신 안정성 확보.
4. **중첩 라우팅 기반 레이아웃 구조 (Nested Routing)**:
   - `/`, `/explore`, `/explore/:id`, `/settings` 등 모든 경로에서 사이드바와 헤더를 유지하는 효율적인 라우팅 설계.

### 2.1 레이아웃 및 라우팅 구조
- **App Layout**: `App.jsx` 중심의 레이아웃 셸 구조.
- **주요 라우트**:
    - `/`: `Home.jsx` (랜덤 여행지 추천 및 날씨 위젯)
    - `/explore`: `Explore.jsx` (전국 여행지 리스트 및 지역/테마 필터링)
    - `/explore/:contentId`: `TravelDetail.jsx` (여행지 상세 정보 및 카카오 지도 마커 표시)
    - `/settings`: `Settings.jsx` (사용자 프로필 및 비밀번호 변경)
    - `/login` / `/signup`: 인증 페이지

### 2.1.1 네트워크 및 보안 최적화 (Network & Security)
- **Vite Proxy 설정**: `/B551011` (공공데이터), `/api` (로컬 Express 서버) 프록시 구축.
- **인증키 보안**: `decodeURIComponent`를 통한 키 데이터 안정화.
- **파일 보안**: `Multer` 파일 필터링을 통해 이미지 파일 형식만 업로드 허용.

### 2.5 데이터베이스 설계 (Database Schema)

시스템의 영속성을 보장하기 위해 설계된 MySQL 테이블 구조입니다.

#### users (사용자 계정 테이블)
| 컬럼명 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | PK, Auto Increment | 고유 식별자 |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | 사용자 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | NOT NULL | 해싱된 비밀번호 (bcrypt) |
| `name` | VARCHAR(100) | NOT NULL | 사용자 이름/닉네임 |
| `profile_img` | VARCHAR(255) | | 프로필 이미지 URL (또는 서버 경로) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 계정 생성 일시 |

### 2.6 사용자 인증 시스템 (Authentication)
...
- **Profile Update API**: 닉네임, 프로필 이미지 URL 변경 지원.
- **Password Security**: 현재 비밀번호 대조 후 신규 비밀번호 암호화(bcrypt) 저장.
- **File Upload System**: 서버 내 `uploads` 폴더에 물리적 파일 저장 및 정적 경로 반환.

### 2.10 여행 탐색 및 상세 시스템 (Explore & Detail)
- **데이터 페칭**: `KorService2/areaBasedList2`를 활용한 대용량 데이터 핸들링.
- **스마트 필터**: 17개 시도(areaCode) 및 콘텐츠 타입(contentTypeId)을 조합한 다중 필터링 시스템.
- **이미지 최적화**: 
    - HTTPS 자동 전환 및 `onError` Fallback 시스템 구축.
    - `originimgurl`, `firstimage`, `smallimageurl` 순차적 매핑 로직 적용.
- **지도 연동**: 카카오 지도를 이용한 실시간 위치 표시 및 `window.kakao.maps.load`를 통한 안정적인 초기화.

### 2.9 UI/UX 디자인 시스템
- **Code Vibe Style**: 숫자형 페이지네이션, 모노스페이스 텍스트, 코드 주석 스타일 피드백 UI.
- **Adaptive SideBar**: 사용자 상태에 따른 프로필/로그인 버튼 동적 전환 및 이미지 로딩 예외 처리.

---

*최종 업데이트: 2026.04.23 변경 사항 (프로필 수정, 비밀번호 변경 및 상세 페이지 완벽 복구 완료)*

... (이하 로드맵 등 기존 내용 유지)
