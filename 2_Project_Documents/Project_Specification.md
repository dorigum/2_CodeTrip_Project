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
- **현상태**: 전국 여행지 탐색 기능(Explore) 및 상세 페이지(TravelDetail) 통합 완료. 사용자 프로필 수정 및 보안 설정(비밀번호 변경) 시스템 구축 완료. 메인 페이지 UI 고도화 및 추천 시스템 안정화. 실시간 지도 API 및 파일 업로드 기능이 포함된 고성능 풀스택 서비스 단계.

### 1.1 기술 스택 (Current)
- **Frontend**: React 19, Vite 8, Axios, Tailwind CSS v4, React Router DOM v7, Zustand
- **Backend**: Node.js (Express), MySQL, **Multer** (이미지 처리)
- **Infrastructure**: Vite Proxy (CORS 및 백엔드 통신용), 정적 파일 서빙(`/uploads`)
- **APIs**: 
    - 한국관광공사 KorService2 (TourAPI 4.0) — 전국 여행지 데이터 및 상세 정보
    - 카카오 맵 API — 여행지 위치 시각화 (`react-kakao-maps-sdk`)
    - 한국관광공사 관광사진정보서비스 (PhotoGalleryService1)
    - Open-Meteo API / Nominatim API
- **Linting**: ESLint 9.39.4

---

## 2. 시스템 상세 설계

### 2.0 프로젝트 핵심 아키텍처 (Core Architecture)
1. **전역 상태 관리 (Zustand)**: `useAuthStore`를 통해 사용자 인증 및 실시간 정보 업데이트(updateUser) 관리.
2. **서비스 레이어 패턴**: `travelInfoApi.js`, `authApi.js` 등으로 비즈니스 로직 모듈화.
3. **인프라 최적화**: Vite Proxy 설정을 통한 이종 서버 간의 안전한 데이터 통신 환경 구축.
4. **사용자 경험(UX) 최적화**: 
   - Geolocation 기반 지능형 추천 시스템.
   - 반투명 블러 디자인(Glassmorphism) 및 코드 바이브 테마 적용.

### 2.1 레이아웃 및 라우팅 구조
- **App Layout**: `App.jsx` 중심의 일관된 셸 구조 유지.
- **주요 라우트**:
    - `/`: `Home.jsx` (히어로 슬라이더, 날씨 기반 추천, 지역 행사)
    - `/explore`: `Explore.jsx` (전국 여행지 필터링 리스트)
    - `/explore/:contentId`: `TravelDetail.jsx` (상세 정보 및 지도)
    - `/settings`: `Settings.jsx` (프로필 및 보안 관리)
    - `/login` / `/signup`: 사용자 인증

### 2.1.1 네트워크 및 보안 최적화
- **Vite Proxy**: `/B551011` (공공데이터) 및 `/api` (백엔드) 통신 대행.
- **Multer Filter**: 업로드 파일 형식을 이미지로 제한하고 파일 용량(5MB) 관리.

### 2.10 여행 탐색 및 상세 시스템 (Explore & Detail)
- **데이터 페칭**: `KorService2` 기반의 대용량 관광 데이터 핸들링.
- **이미지 정규화**: `originimgurl`, `firstimage` 등 다중 필드 매핑 및 HTTPS 보안 적용.
- **지도 시스템**: 수동 SDK 로딩 기법을 통한 카카오 맵 초기화 안정성 확보.

### 2.11 사용자 관리 시스템 (Account Management)
- **Profile Update**: 닉네임 변경 및 다중 방식(업로드/URL) 이미지 교체 지원.
- **Security**: 현재 비밀번호 검증 기반의 비밀번호 마이그레이션 시스템 구축.

---

*최종 업데이트: 2026.04.23 (사용자 정보 관리 및 전반적인 서비스 안정화 완료)*

... (이하 로드맵 등 기존 기록 보존)
