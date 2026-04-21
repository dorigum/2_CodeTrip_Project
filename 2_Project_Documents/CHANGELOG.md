# CHANGELOG — CodeTrip

> 날짜별 작업 내역, 수정 사항, 트러블슈팅을 기록합니다.
> 현재 구현 상태는 [Project_Specification.md](Project_Specification.md)를 참고하세요.

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
