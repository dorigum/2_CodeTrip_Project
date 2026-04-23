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
- **현상태**: 전국 여행지 탐색 기능(Explore) 및 상세 페이지(TravelDetail) 통합 완료. 사용자 프로필 수정 및 보안 설정 시스템 구축 완료. 메인 페이지 UI 고도화 및 추천 시스템 안정화. 실시간 지도 API 및 파일 업로드 기능이 포함된 고성능 풀스택 서비스 단계.

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
   - Geolocation 기반 지능형 추천 시스템 및 상세 위치 자동 감지 연동.
   - 반투명 블러 디자인(Glassmorphism) 및 코드 바이브 테마 적용.

### 2.1 레이아웃 및 라우팅 구조
- **App Layout**: `App.jsx` 중심의 일관된 셸 구조 유지.
- **주요 라우트**:
    - `/`: `Home.jsx` (인텔리전트 추천 시스템 탑재)
    - `/explore`: `Explore.jsx` (전국 여행지 필터링 리스트)
    - `/explore/:contentId`: `TravelDetail.jsx` (여행지 상세 정보 및 지도)
    - `/settings`: `Settings.jsx` (프로필 및 보안 관리)
    - `/login` / `/signup`: 사용자 인증

### 2.9 UI/UX 디자인 시스템
- **Adaptive SideBar**:
  - 메뉴가 펼쳐진 상태에서만 로고 홈 링크 활성화 로직 적용.
  - 사용자 프로필 로딩 실패 시 자동 Fallback 처리.
- **Interactive Home UI**: 
  - **슬롯머신 시스템**: 주사위 버튼 클릭 시 고속 애니메이션(80ms 간격) 후 최종 결과 노출. `hasPicked` 상태를 활용하여 결과 노출 전까지 텍스트 동기화를 차단하고, 초기 로딩 시의 데이터 번쩍거림(Flickering) 현상을 완벽히 해결함.
  - **동적 추천 로직**: 지역 기반 명소(Near Me) 카드에 셔플 알고리즘을 적용하여 매 새로고침 시마다 무작위로 새로운 장소를 추천하도록 설계.
  - **가이드 오버레이**: 사용자가 직접 동작을 수행하기 전까지 슬롯머신 카드에 블러 효과 및 안내 문구("주사위를 눌러서 여행지를 뽑아보세요!")를 오버레이하여 직관성을 높임.
  - 모든 추천 카드에 캡슐형 상세 보기(`View_Detail`) 버튼 연동.

### 2.11 사용자 관리 및 보안 (Account & Security)
- **Profile System**: 닉네임 수정 및 다중(파일/URL) 이미지 업로드 환경 구축.
- **Credential Security**: `bcrypt` 암호화 및 JWT 토큰 기반의 수정 권한 제어.
- **Database Schema**: `users.profile_img` 컬럼을 `VARCHAR(255)`로 최적화하여 관리 효율성 확보.

---

*최종 업데이트: 2026.04.23 (사용자 관리 및 메인/상세 시스템 최종 완결)*

... (이하 기존 메모 및 로드맵 보존)
