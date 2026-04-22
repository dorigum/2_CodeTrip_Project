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
- **현상태**: 현대적인 디자인(Glassmorphism, Code Vibe 컨셉)의 여행 정보 서비스 및 게시판 시스템 구축 중. 메인 페이지 Bento Grid 레이아웃 최적화 및 슬롯머신 스타일의 랜덤 뽑기 기능 고도화 완료.

### 1.1 기술 스택 (Current)
- **Frontend**: React 19, Vite 8, Axios, Tailwind CSS v4, React Router DOM v7
- **Backend**: Node.js (Express), MySQL (AWS EC2 배포)
- **Infrastructure**: Nginx (Reverse Proxy), PM2
- **APIs**: 
    - 한국관광공사 관광사진정보서비스 (PhotoGalleryService1) — 메인 슬라이더 이미지, 날씨 기반 추천, 축제 목록
    - 한국관광공사 KorService1 (TourAPI) — 지역 코드 기반 인기 관광지 조회 (`areaBasedList1`), 축제 검색 (`searchFestival1`)
    - Open-Meteo API (실시간 날씨 정보)
    - Nominatim API (무료 역지오코딩 — 좌표 → 한국어 시/도명 변환)
- **Linting**: ESLint 9.39.4

---

## 2. 시스템 상세 설계

### 2.1 레이아웃 및 라우팅 구조
- **App Layout**: `App.jsx`를 최상위 레이아웃 베이스로 사용하며, 독립된 공통 컴포넌트들을 조합하여 구조를 형성함.
    - **Header**: 최상단 고정 헤더.
    - **SideBar**: 데스크탑 좌측 사이드 네비게이션 및 모바일 하단 네비게이션 통합.
    - **Footer**: 하단 정보 영역.
- **Nested Routing**: `react-router-dom`의 `<Outlet />`을 활용하여 페이지 전환 시 공통 요소를 재렌더링하지 않고 컨텐츠만 교체.
    - `/`: `Home.jsx` (MainTopImg 슬라이더 및 날씨 기반 다중 키워드 랜덤 추천)
    - `/explore`: `TravelPic.jsx` (여행지 탐색 및 필터링)

### 2.2 실시간 날씨 및 위치 기반 추천 시스템
- **Location Service**: 브라우저 Geolocation API를 통해 사용자 좌표를 획득하고, `Nominatim` 서비스를 통해 실제 지역명(`{ name, state }`)으로 변환.
  - `name`: 표시용 문자열 (예: `성남시, KR`)
  - `state`: 도/시명 (예: `경기도`) — KTO 지역 코드 매핑에 사용
  - `User-Agent: CodeTrip/1.0` 헤더 포함 (Nominatim 이용 정책 준수)
  - `addr.state → addr.province → addr.region` 순서 다중 폴백으로 응답 포맷 차이 대응
- **Weather Service**: 획득된 좌표를 `weatherApi.js`로 전달하여 현지 실시간 날씨 정보 획득. 상태 코드에 따라 최적화된 **다중 키워드 배열** 매핑.
- **Random Recommendation (Random Pick 카드)**: 매핑된 키워드 중 하나를 랜덤 선택하여 관광공사 API 검색. 결과가 없을 경우 대체 키워드로 재시도하는 안정성 확보.
- **City-Based Recommendation (Near Me 카드)**:
    - 획득된 `state`(도/시명)를 KTO `areaCode`로 매핑하여 해당 지역 인기 관광지 조회.
    - `AREA_CODES` 테이블: 전국 17개 시도 정식명 + 약식명 (경기, 강원, 충북 등) 모두 등록.
    - `resolveAreaCode(province)`: 완전 일치 → 부분 문자열 포함 2단계 매칭으로 Nominatim 응답 형식 차이 흡수.
    - 위치 권한 거부 또는 매핑 실패 시 빈 결과로 명시적 처리 (서울 강제 폴백 없음).
    - 최대 5곳 선조회 후 `>` 버튼으로 API 재호출 없이 클라이언트 순환.
- **MainTopImg Auto-Slider**:
    - **배치 로딩**: `galleryList1` API를 사용하여 무작위 페이지에서 20장의 이미지를 선페칭(Pre-fetching).
    - **동적 순환**: 로컬 인덱스를 5초마다 업데이트하여 네트워크 대기 없는 부드러운 이미지 전환 구현.
    - **Fallback**: API 장애 시 자체 이미지 자산(`BACKUP_TOP_IMAGES`)으로 자동 전환.

### 2.3 관광 정보 시스템 (Tourist Information)
- **실시간 데이터 페칭**: `useCallback` 기반의 비동기 함수로 한국관광공사 API 호출 최적화.
- **검색 및 필터링**: `searchTerm` 상태를 활용하여 제목 및 촬영 장소 기준의 실시간 클라이언트 사이드 필터링 구현.

### 2.4 메인 페이지 Bento Grid 카드 구성

홈 화면 하단의 Bento Grid는 `lg:col-span-2` (좌측 2카드) + `lg:col-span-1` (우측 1카드) 구조.

| 카드 | 라벨 | 데이터 소스 | 인터랙션 |
|---|---|---|---|
| **Near Me** | 내 주변 / Near Me | `areaBasedList1` — 사용자 도/시 단위 인기 관광지 | `>` 버튼으로 최대 5곳 클라이언트 순환 |
| **Random Pick** | 즉흥 여행 / Random Pick | `gallerySearchList1` — 날씨 키워드 기반 랜덤 이미지 | 🎲 casino 버튼으로 슬롯머신 스핀. 스핀 중 "여행지 뽑는 중..." 오버레이 표시 |
| **지역 행사 & 테마** | — | `searchFestival1` + 계절 테마 사진 | hover 시 썸네일 확대. `VIEW_ALL` → `/explore` |

**카드 공통 디자인 패턴**:
- 배경: `bg-surface-container-lowest`, 패딩: `p-8`, 모서리: `rounded-xl`, 테두리: `border border-outline-variant/10`
- 헤더: 라벨(작은 대문자) + 제목 + 우측 아이콘 버튼
- 코드 블록: `// Comment` 스타일의 현재 상태 설명 텍스트
- 이미지: `h-40` 고정 높이, `object-cover`, hover 시 `scale-105`
- 로딩: `absolute inset-0` 반투명 스피너 오버레이

**세 번째 카드 특이 구조**:
- `flex-1 flex flex-col gap-3` 아이템 컨테이너 — 카드 전체 높이를 3개 아이템이 균등 분배
- 각 아이템: `w-28` 세로 이미지(전체 높이 자동 맞춤) + 텍스트 영역 + chevron

### 2.6 사용자 인증 시스템 (Authentication)
- **전역 상태 관리 (`AuthContext.jsx`)**:
    - `isLoggedIn`, `user` 정보를 `Context API`로 관리하여 컴포넌트 트리 어디서든 접근 가능.
    - 로그인/로그아웃 함수 및 로컬 스토리지를 활용한 세션 유지 로직 포함.
- **로그인 페이지 (`Login.jsx`)**: 
    - 이메일/비밀번호 기반 인증 UI.
    - 브랜드 아이덴티티가 반영된 다크 모드 스타일 및 입력 필드 디자인.
- **회원가입 페이지 (`SignUp.jsx`)**: 
    - 사용자 기본 정보 입력 및 계정 생성 UI 구현.

### 2.7 UI/UX 디자인 시스템
- **Glassmorphism**: 헤더, 버튼(`EXPLORE_NOW`), 정보 카드 등에 반투명 블러 효과(`backdrop-blur`)를 적용하여 현대적인 비주얼 구현.
- **Point Color**: 주요 액션 버튼(EXPLORE_NOW)에 청록색(Primary) 텍스트를 적용하여 브랜드 아이덴티티 및 가독성 확보.
- **Code Vibe Style**: 데이터 표시 영역에 주석(`// Currently Rendering`) 스타일과 모노스페이스 폰트를 혼용하여 브랜드 정체성 강조.
- **Responsive Aspect Ratio**: MainTopImg 섹션에 `aspect-[21/6]` 비율을 적용하여 슬림하고 세련된 레이아웃 유지.
- **Spin Overlay**: Random Pick 카드의 슬롯머신 작동 중 이미지 위 반투명 오버레이 + `"여행지 뽑는 중..."` `animate-pulse` 텍스트로 진행 상태 시각화.

---

## 8. 폴더 구조 (2026-04-22 기준)

```text
2_Code_Trip/
├── server/                       # Express Backend
├── src/
│   ├── api/
│   │   ├── weatherApi.js         # 실시간 날씨, 역지오코딩 ({ name, state } 반환)
│   │   ├── travelApi.js          # 관광공사 API 연동
│   │   │                         #  - getWeatherRecommendations : 날씨 키워드 기반 이미지
│   │   │                         #  - getCityBasedPlaces        : 도/시 단위 인기 관광지 (areaBasedList1)
│   │   │                         #  - getFestivalList           : 30일 이내 행사 목록
│   │   │                         #  - getThemePhotos            : 계절 테마 사진
│   │   │                         #  - AREA_CODES + resolveAreaCode : 지역 코드 매핑
│   │   ├── axiosInstance.js
│   │   ├── boardApi.js
│   │   └── mockData.js
│   ├── components/               # 공통 컴포넌트
│   │   ├── Layout/               # 레이아웃 관련 (Header, Footer, SideBar)
│   │   └── TravelPic.jsx         # 여행지 탐색 리스트
│   ├── pages/
│   │   ├── Home.jsx              # 메인 페이지
│   │   │                         #  - MainTopImg 자동 슬라이더
│   │   │                         #  - Near Me 카드 (도시 기반 추천)
│   │   │                         #  - Random Pick 슬롯머신 카드
│   │   │                         #  - 지역 행사 & 테마 카드
│   ├── App.jsx                   # 레이아웃 베이스
│   ├── main.jsx                  # 라우팅 설정
│   └── index.css
├── vite.config.js                # /kto-tour-api 프록시 설정
├── .env
└── 2_Project_Documents/
    ├── Project_Specification.md  # 현재 명세서 (이 파일)
    ├── CHANGELOG.md              # 작업 이력
```

---

## 9. 향후 계획

### 현시점 주요 과제
- **로그인 페이지 구현**: `AuthContext`를 통한 전역 사용자 상태 관리.
- **마이페이지 구현**: 북마크(즐겨찾기) 리스트 연동.
- **지도 API 연동**: 여행지 상세 페이지에 위치 마커 표시.

| 구현 기능           | 상태  |
| --------------- | --- |
| 로그인/회원가입 페이지 구현 | ✅완료 |
| 마이페이지(위시리스트) 구현  | ✅완료 |
| 지도 API 연동       | ⛔예정 |



---

*최종 업데이트: 2026-04-22 (Near Me 카드 신규 구현, Bento Grid 카드 레이아웃 전면 재설계, 버그 수정)*
