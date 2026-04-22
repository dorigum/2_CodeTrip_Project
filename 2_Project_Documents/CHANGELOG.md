# CHANGELOG — CodeTrip

> 날짜별 작업 내역, 수정 사항, 트러블슈팅을 기록합니다.
> 현재 구현 상태는 [Project_Specification.md](Project_Specification.md)를 참고하세요.

---

## 260422 — 실시간 날씨 연동 및 아키텍처 리팩토링

### 실시간 위치 기반 서비스 고도화 (추가)

- **Geolocation API 통합**: 브라우저의 위치 정보를 활용하여 사용자의 실시간 위도/경도 자동 감지 구현.
- **역지오코딩(Reverse Geocoding) 연동**: `Nominatim` API를 사용하여 좌표를 실제 주소(예: "종로구, 대한민국")로 변환하여 표시.
- **위치 맞춤형 날씨/추천**: 감지된 위치의 실시간 날씨 정보를 기반으로 여행지 추천 로직이 작동하도록 개선.
- **예외 처리 강화**: 위치 권한 거부 또는 타임아웃 발생 시 서울(Default) 좌표로 자동 전환되는 Fallback 로직 적용.

### 날씨 기반 추천 로직 고도화 (추가)

- **다중 키워드 매핑**: 날씨 코드별 단일 키워드를 배열 형태의 다중 키워드로 확장하여 추천의 다양성 확보.
- **지능형 랜덤 추천**: 매핑된 키워드 중 하나를 랜덤 선택하여 검색하며, 결과가 없을 시 Fallback 로직 작동.

### 메인 페이지 대규모 재설계 및 UI 고도화

- **MainTopImg 섹션 (구 Hero) 고도화**:
    - **명칭 리팩토링**: 프로젝트 컨셉에 맞춰 'Hero' 섹션과 관련된 모든 변수 및 함수명을 `MainTopImg`로 변경하여 코드 직관성 확보.
    - **자동 슬라이더**: `setInterval` 및 `useRef`를 활용하여 5초마다 이미지가 자동 전환되는 파노라마 기능 구현.
    - **배치 로딩(Batch Fetching)**: 20장의 사진을 한 번에 가져와 로컬에서 순환시킴으로써 네트워크 지연 없는 즉각적인 이미지 교체 실현.
    - **정보 통합**: 현재 슬라이드되는 이미지의 제목과 위치 정보를 `// Currently Rendering` 블록과 함께 실시간 표시.
    - **디자인 폴리싱**: 메인 제목 "Code_Trip:" 고정, 슬로건 변경.
    - **버튼 UI 개선**: `EXPLORE_NOW` 버튼에 글래스모피즘(반투명 블러) 효과를 적용하고, 텍스트에 브랜드 포인트 컬러(청록색)를 반영하여 시인성 극대화.
- **레이아웃 최적화**:
    - MainTopImg 섹션의 높이를 슬림하게 조정(`aspect-[21/6]`)하여 하단 컨텐츠 접근성 향상.
    - 날씨 위젯 영역 내에 '날씨 맞춤형 추천 카드'를 배치하여 정보의 연관성 강화.
- **시스템 안정성**: API 응답 실패를 대비한 고화질 백업 이미지 풀(`BACKUP_TOP_IMAGES`) 구축으로 서비스 연속성 확보.

### 공통 컴포넌트 분리 및 아키텍처 통합 (기존)

- **외부 브랜치 머지**: `feature/공통-컴포넌트-분리` 브랜치를 `doyeon` 브랜치로 통합.
- **컴포넌트 모듈화**: `App.jsx`에 집중되어 있던 공통 UI 요소를 독립된 컴포넌트로 분리.
    - `Header.jsx`: 로고, 네비게이션, 검색, 계정 관리 담당.
    - `SideBar.jsx`: 데스크탑 사이드바 및 모바일 바텀 네비게이션 통합 관리. `useLocation` 기반의 활성 탭 하이라이트 로직 적용.
    - `Footer.jsx`: 시스템 상태 및 정책 링크 관리.
- **App.jsx 슬림화**: 레이아웃 베이스 코드만 남기고 모든 공통 요소를 외부 컴포넌트 호출 방식으로 리팩토링하여 유지보수성 향상.

### 실시간 날씨 기반 여행지 추천 기능 구현 (기존)

- **날씨 API 연동**: `Open-Meteo` API를 사용하여 별도의 키 없이 실시간 날씨 정보(온도, 상태 코드) 페칭 구현.
- **날씨 서비스 (`src/api/weatherApi.js`)**: 날씨 코드(0~99)를 서비스 내부 로직으로 분류(Sunny, Cloudy, Rainy, Snowy)하고 관련 키워드와 아이콘 매핑.
- **추천 서비스 (`src/api/travelApi.js`)**: 한국관광공사 사진 갤러리 API(`gallerySearchList1`)를 활용하여 날씨 키워드 기반의 여행지 랜덤 데이터 추출 로직 구현.
- **동적 상호작용 추가**:
    - `RANDOM_PICK` 버튼: 현재 날씨 키워드를 유지한 채 새로운 여행지를 랜덤으로 다시 불러오기 (로딩 애니메이션 포함).
    - 날씨 위젯 새로고침: 아이콘 클릭 시 실시간 날씨와 추천 여행지를 동시에 동기화.
    - 지역 정보 명시: 날씨 정보 상단에 "Seoul, KR" 위치 정보 추가.

### 아키텍처 리팩토링 — 레이아웃 및 페이지 분리

- **불필요 파일 정리**: 사용되지 않던 `src/components/Layout` 디렉토리 및 내부 파일 삭제.
- **페이지 분리**: 
    - `App.jsx` → **레이아웃 전용 컴포넌트**로 전환 (사이드바, 헤더, 푸터 고정).
    - `src/pages/Home.jsx` → 메인 홈 화면 로직 및 UI 완전 분리.
- **중첩 라우팅 (`Nested Routes`) 적용**:
    - `main.jsx`에서 `App`을 부모 라우트로, `Home`과 `TravelPic`을 자식 라우트로 설정하여 공통 레이아웃 구조 확립.
    - `App.jsx` 내부에 `<Outlet />`을 배치하여 동적 컨텐츠 렌더링 영역 지정.

### 트러블슈팅 및 수정 사항

- **경로 오류 해결**: `TravelList.jsx`가 `TravelPic.jsx`로 파일명이 변경되어 발생한 임포트 에러 수정.
- **초기 로딩 버그 수정**: `App.jsx`의 `handleRefreshAll` 함수가 초기 `loading` 상태값(`true`) 때문에 실행되지 않던 로직 결함 수정.
- **이미지 깜빡임 방지**: Hero 섹션 이미지에 `key` 속성을 부여하여 실제 데이터가 변경될 때만 리액트가 렌더링하도록 개선.
- **이벤트 버블링 방지**: 버튼 클릭 시 부모 요소로 이벤트가 전파되어 의도치 않은 동작이 발생하는 현상(`e.stopPropagation`, `e.preventDefault`) 제어.

---

## 260421 — 페이지 분리, 라우팅 연동 및 UI 고도화

### 아키텍처 개선 — 페이지 단위 분리

| 기존 구조 | 변경 후 구조 |
|:---|:---|
| `App.jsx` 단일 파일에 API 호출 + Recommended Nodes 섹션 포함 | `App.jsx` → 메인(랜딩) 페이지 전용 |
| 없음 | `src/pages/TravelList.jsx` → 여행지 탐색 페이지 신규 생성 |

- `App.jsx`에서 `galleryList1` API 호출 로직 및 Recommended Nodes 섹션 제거
- `axios`, `useState`, `useEffect`, `useCallback` 관련 코드 App.jsx에서 완전 분리
- API 연동 및 목록 렌더링 로직을 `TravelList.jsx`로 완전 이관

### React Router DOM 라우팅 설정

- **설치 상태**: `react-router-dom v7.14.1` (기존 설치 확인)
- **`main.jsx` 업데이트**: `BrowserRouter` + `Routes` 래핑 적용

```jsx
// main.jsx
<BrowserRouter>
  <Routes>
    <Route path="/"        element={<App />} />
    <Route path="/explore" element={<TravelList />} />
  </Routes>
</BrowserRouter>
```

- `App.jsx` 사이드바 네비게이션: `<a>` → `<Link to="...">` 전환
- `TravelList.jsx` 네비게이션: 동일하게 `<Link>` 컴포넌트 적용
- **이동 경로 정리**:
  - 메인 사이드바 `// explore` 클릭 → `/explore` 이동
  - 여행지 페이지 `// home` 또는 로고 클릭 → `/` 이동
  - 메인 Hero 섹션 `INITIATE_V1` 버튼 → `/explore` 이동

### App.jsx — 메인 페이지 전면 재설계

- 제공된 HTML 디자인 파일(`home.html`) 기반으로 JSX 전환
- **구성 섹션**:
  1. 좌측 사이드바 (데스크탑): 네비게이션 링크 (home / explore / bookmarks / settings)
  2. 상단 Top Nav: 검색창 (시각적 요소, 미연동) + 알림/계정 아이콘
  3. Hero Section: 배경 이미지 + 그라디언트 오버레이 + `INITIATE_V1` → `/explore` 링크
  4. Bento Grid:
     - **날씨 위젯**: 온도 표시 + Recommendation Logic 카드 + `Explore Destinations` 링크
     - **Trending Themes**: 4개 테마 카드 (Cyberpunk Tokyo / Nordic Minimalist / High Sierra Mono / Brutalist Berlin)
  5. 하단 Footer + 모바일 Bottom Navigation
- **주요 변경**: `Re-compile Recommendations` 버튼 → `Explore Destinations` (`/explore` Link)로 대체
- Tailwind 시멘틱 컬러 토큰(`bg-surface-container-low`, `text-primary` 등) 전면 적용

### TravelList.jsx — 여행지 탐색 페이지 신규 구현

- **파일 경로**: `src/pages/TravelList.jsx`
- **레이아웃**: `grid-cols-12` 3단 구성

```
[상단 고정 헤더 — Code Trip 로고 + 수평 네비 + 검색창]
┌────────────┬───────────────────────────┬──────────────┐
│ 좌측 사이드바 │       메인 카드 그리드        │  우측 사이드바  │
│ filters.config│  col-span-7 (2열 카드)    │  col-span-3  │
│ col-span-2  │                          │  (xl 이상)    │
└────────────┴───────────────────────────┴──────────────┘
[다크 푸터]
```

**좌측 사이드바 (`filters.config`)**:
- Region 리스트: East Asia / Korea, South / Western Europe / North America
- Theme 체크박스: #heritage / #minimalist / #high_tech / #nature_debug
- `RUN_FILTER.SH` 버튼 (UI 구현, 필터 로직 확장 예정)

**메인 카드 그리드**:
- `galleryList1` API 연동 (`VITE_GALLERY_API_KEY` 환경변수 사용)
- 2열 카드 그리드 (`grid-cols-1 md:grid-cols-2`)
- 카드 구성: 이미지(h-64) + 제목(`galTitle`) + 촬영지(`galPhotographyLocation`) + 코드 블록(created/photographer/id) + `상세보기` 버튼
- 검색창 실시간 필터링: `galTitle` 및 `galPhotographyLocation` 기준
- 빈 결과 처리: `search_off` 아이콘 + 메시지 출력

**우측 사이드바 (xl 이상 표시)**:
- 터미널 위젯 (`trip_metadata.log`): 날씨/명소 정보 표시 (정적 목 데이터)
- 주변 인기 명소 리스트: 광안대교 야경 / 경주 대릉원 / 한라산 국립공원 (정적)

### 환경변수 및 보안 개선

- `.env`에 `VITE_GALLERY_API_KEY` 추가
- `BoardList.jsx`에 하드코딩되어 있던 공공데이터 API 키를 환경변수로 이관

### tailwind.config.js 업데이트

```js
borderRadius: {
  DEFAULT: "0.125rem",
  lg: "0.25rem",
  xl: "0.5rem",
  full: "0.75rem",
}
```

---

## 260421 — 리팩토링 및 문서 구조화

- **아키텍처 정리**: 폴더명을 `2_Code_Trip`으로 변경하고, `features` 단위의 컴포넌트 분리(BoardList, BoardForm) 완료.
- **사이드바 토글 기능 구현**:
    - `useState` 기반의 `isCollapsed` 상태를 통한 동적 레이아웃 제어 (64rem ↔ 20rem).
    - `cubic-bezier` 트랜지션 및 CSS 유틸리티를 활용한 부드러운 텍스트 숨김/노출 애니메이션 적용.
    - 접힘 상태 시 툴팁(`title`) 지원으로 사용성 보완.
- **문서 고도화**: 실제 구현된 코드(Axios Interceptor, Dynamic Routing, Filtering)를 기반으로 명세서 상세 업데이트.
- **검색 엔진 최적화(준비)**: 검색창 UI 및 대소문자 구분 없는 필터링 로직 안정성 확보.

---

## 260420 — 프로젝트 고도화 및 상세 페이지 개발

- **동적 라우팅 구현**: `useParams`를 활용한 게시판 수정 페이지(BoardForm) 연동.
- **API 통신 안정화**: 공공데이터 API 연동 시 `params` 구조화 및 예외 처리 로직 강화.
- **상세 데이터 렌더링**: 게시글 상세 보기 및 수정 시 기존 데이터를 폼에 바인딩하는 `fetchPost` 로직 구현.
- **스타일 마이그레이션**: Tailwind CSS v4의 `@theme` 및 `@plugin` 시스템 적용.
- **Express 백엔드 구축**: `server` 디렉토리에 Express 기반 API 서버 구축 완료.
- **DB 연동**: `mysql2/promise` 라이브러리로 EC2 내 MySQL 연결.
- **환경 변수 분리**: 서버용 `.env`(DB 접속 정보)와 프론트엔드 `.env`(`VITE_API_URL`) 분리.
- **RESTful API**: 게시판 CRUD 5가지 엔드포인트 구현 완료.

---

## 260416 — 초기 환경 구축 및 UI 테스트

- 테스트용 리액트 프로젝트(`projecttest`) 생성.
- InstaTripCard (인스타그램 스타일 카드) UI 및 상태 관리(`isLiked`) 구현.
- 랜덤 여행지 로직(Ver.1) 및 로딩 애니메이션 구현.
- **트러블슈팅**:
    - ESLint `no-unused-vars` 및 JSX 인식 오류 해결.
    - `App.jsx` 구조 개선 및 JSX 주석 문법(`{/* ... */}`) 수정.
