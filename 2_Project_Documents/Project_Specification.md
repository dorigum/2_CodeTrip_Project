# 프로젝트 상세 명세서 (Project Specification)

## 0. 프로젝트 히스토리 및 개발 개요
본 문서는 프로젝트의 초기 설정부터 현재 `CodeTrip` 시스템으로 발전하기까지의 모든 과정을 기록합니다.

### 0.1 초기 테스트 (2026.04.16)
- **프로젝트명**: projecttest
- **목적**: 리액트 환경 테스트 및 인스타그램 스타일 카드 UI 구현 연습.
- **주요 성과**: ESLint 설정 고도화, JSX 문법 오류 해결, 랜덤 여행지 추천 로직(Ver.1) 구현.

---

## 1. 프로젝트 개요: CodeTrip
- **프로젝트 명**: CodeTrip (Vibe Board + Tour Info)
- **목적**: 프리미엄 디자인이 적용된 현대적인 CRUD 게시판 시스템 및 관광 정보 서비스 구축
- **기술 스택 (Current)**:
    - **Frontend**: React 19, Vite, Axios, Tailwind CSS v4 (@tailwindcss/vite)
    - **Backend**: Node.js (Express), MySQL (AWS EC2 Deployment)
    - **APIs**: 공공데이터포털 관광 정보 오픈 API (PhotoGalleryService1)
    - **Routing**: React Router DOM (v6+)
    - **Linting**: ESLint 9.39.4 (Flat Config)

---

## 2. 시스템 상세 설계

### 2.1 게시판 시스템 (Board System)
- **데이터 구조**: MySQL `boards` 테이블 (id, title, content, author, created_at)
- **비즈니스 로직**:
    - **API 추상화**: `boardApi.js`를 통해 모든 HTTP 요청을 모듈화하여 관리.
    - **통합 폼 핸들링**: `BoardForm` 컴포넌트 하나에서 `isEdit` Props를 기반으로 수정(PUT)과 등록(POST) 로직을 유연하게 처리.
    - **상태 관리**: `useState`와 `useParams`를 활용하여 URL 기반의 게시글 상세 정보 페칭 및 동적 렌더링.

### 2.2 관광 정보 시스템 (Tourist Information)
- **실시간 데이터 페칭**: `useCallback` 기반의 비동기 함수로 한국관광공사 API 호출 최적화.
- **검색 및 필터링**: `searchTerm` 상태를 활용하여 제목(`galTitle`) 및 촬영 장소(`galPhotographyLocation`) 기준의 실시간 클라이언트 사이드 필터링 구현.
- **디자인 시스템**: 'Code Vibe' 컨셉에 맞춰 데이터 노출 영역에 Syntax Highlighting 스타일(Keyword, String, Comment 클래스) 적용.

### 2.3 프론트엔드 인프라 상세
- **Axios 고도화**:
    - `baseURL` 환경변수 처리 (`import.meta.env.VITE_API_URL`).
    - `Interceptor`를 통한 응답 에러 통합 로깅 및 `Promise.reject` 처리.
- **UI/UX**:
    - `animate-pulse`를 활용한 데이터 라이브 상태 표시기(`LIVE_DATA_FEED`).
    - `Aspect-video` 및 `Aspect-square` 비율을 활용한 반응형 이미지 레이아웃.
    - `Glassmorphism` 효과 및 다크/라이트 하이브리드 테마 적용.

---

## 3. 일자별 작업 내역 (누적 기록)

### 3.1 260416: 초기 환경 구축 및 UI 테스트
- **작업 내용**:
    - 테스트용 리액트 프로젝트 생성.
    - InstaTripCard (인스타그램 스타일 카드) UI 및 상태 관리(`isLiked`) 구현.
    - 랜덤 여행지 로직(Ver.1) 및 로딩 애니메이션 구현.
- **트러블슈팅**:
    - ESLint `no-unused-vars` 및 JSX 인식 오류 해결.
    - `App.jsx` 구조 개선 및 JSX 주석 문법(`{/* ... */}`) 수정.

### 3.2 260420: 프로젝트 고도화 및 상세 페이지 개발
- **기술적 성과**:
    - **동적 라우팅 구현**: `useParams`를 활용한 게시판 수정 페이지(BoardForm) 연동.
    - **API 통신 안정화**: 공공데이터 API 연동 시 `params` 구조화 및 예외 처리 로직 강화.
    - **상세 데이터 렌더링**: 게시글 상세 보기 및 수정 시 기존 데이터를 폼에 바인딩하는 `fetchPost` 로직 구현.
    - **스타일 마이그레이션**: Tailwind CSS v4의 `@theme` 및 `@plugin` 시스템 적용.

### 3.3 260421: 리팩토링 및 문서 구조화
- **작업 내용**:
    - **아키텍처 정리**: 폴더명을 `2_Code_Trip`으로 변경하고, `features` 단위의 컴포넌트 분리(BoardList, BoardForm) 완료.
    - **사이드바 토글 기능 구현**: 
        - `useState` 기반의 `isCollapsed` 상태를 통한 동적 레이아웃 제어 (64rem ↔ 20rem).
        - `cubic-bezier` 트랜지션 및 CSS 유틸리티를 활용한 부드러운 텍스트 숨김/노출 애니메이션 적용.
        - 접힘 상태 시 툴팁(`title`) 지원으로 사용성 보완.
    - **문서 고도화**: 실제 구현된 코드(Axios Interceptor, Dynamic Routing, Filtering)를 기반으로 명세서 상세 업데이트.
    - **검색 엔진 최적화(준비)**: 검색창 UI 및 대소문자 구분 없는 필터링 로직 안정성 확보.

### 3.4 260421: 페이지 분리, 라우팅 연동 및 UI 고도화

#### 3.4.1 아키텍처 개선 — 페이지 단위 분리

| 기존 구조 | 변경 후 구조 |
| :--- | :--- |
| `App.jsx` 단일 파일에 API 호출 + Recommended Nodes 섹션 포함 | `App.jsx` → 메인(랜딩) 페이지 전용 |
| 없음 | `src/pages/TravelList.jsx` → 여행지 탐색 페이지 신규 생성 |

- `App.jsx`에서 `galleryList1` API 호출 로직 및 Recommended Nodes 섹션 제거
- `axios`, `useState`, `useEffect`, `useCallback` 관련 코드 App.jsx에서 완전 분리
- API 연동 및 목록 렌더링 로직을 `TravelList.jsx`로 완전 이관

---

#### 3.4.2 React Router DOM 라우팅 설정

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
  - 메인 페이지 사이드바 `// explore` 클릭 → `/explore` 이동
  - 여행지 페이지 `// home` 또는 로고 클릭 → `/` 이동
  - 메인 Hero 섹션 `INITIATE_V1` 버튼 → `/explore` 이동

---

#### 3.4.3 App.jsx — 메인 페이지 전면 재설계

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

---

#### 3.4.4 TravelList.jsx — 여행지 탐색 페이지 신규 구현

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
- Region 리스트: East Asia / Korea, South / Western Europe / North America (클릭 시 활성화)
- Theme 체크박스: #heritage / #minimalist / #high_tech / #nature_debug
- `RUN_FILTER.SH` 버튼 (UI 구현, 필터 로직 확장 예정)

**메인 카드 그리드**:
- `galleryList1` API 연동 (`VITE_GALLERY_API_KEY` 환경변수 사용)
- 2열 카드 그리드 (`grid-cols-1 md:grid-cols-2`)
- 카드 구성: 이미지(h-64) + 제목(`galTitle`) + 촬영지(`galPhotographyLocation`) + 코드 블록(created/photographer/id) + `상세보기` 버튼
- 검색창 실시간 필터링: `galTitle` 및 `galPhotographyLocation` 기준
- 빈 결과 처리: `search_off` 아이콘 + 메시지 출력

**우측 사이드바 (xl 이상 표시)**:
- 터미널 위젯 (`trip_metadata.log`): 다크 배경, 날씨/명소 정보 표시 (정적 목 데이터)
- 주변 인기 명소 리스트: 광안대교 야경 / 경주 대릉원 / 한라산 국립공원 (정적)

**다크 푸터**:
- `bg-inverse-surface` 색상 토큰 활용
- `// STATUS: 200 OK | Built with Syntactic Voyager v1.0.4` 스타일

---

#### 3.4.5 환경변수 및 보안 개선

- `.env`에 `VITE_GALLERY_API_KEY` 추가
- 기존 `BoardList.jsx`에 하드코딩되어 있던 공공데이터 API 키를 환경변수로 이관
- `axiosInstance.js`의 `baseURL`은 기존 `VITE_API_URL` 유지

```
# .env
VITE_API_URL=/api
VITE_GALLERY_API_KEY=<공공데이터포털 인증키>
```

---

#### 3.4.6 tailwind.config.js 업데이트

- `borderRadius` 토큰 추가 (HTML 디자인 기준과 동일하게 적용):

```js
borderRadius: {
  DEFAULT: "0.125rem",
  lg: "0.25rem",
  xl: "0.5rem",
  full: "0.75rem",
}
```

---

#### 3.4.7 최종 폴더 구조 (2026-04-21 기준)

```text
2_Code_Trip/
├── server/                       # Express Backend (기존 유지)
├── src/
│   ├── api/
│   │   ├── axiosInstance.js      # Axios 설정 (baseURL, Interceptor)
│   │   ├── boardApi.js           # 게시판 CRUD API 함수
│   │   └── mockData.js           # 테스트용 Mock 데이터
│   ├── components/
│   │   └── Layout/Layout.jsx     # 공용 레이아웃 (기존, 미사용 상태)
│   ├── features/
│   │   └── Board/
│   │       ├── BoardList.jsx     # 게시판 목록 컴포넌트
│   │       └── BoardForm.jsx     # 게시판 등록/수정 폼
│   ├── pages/
│   │   └── TravelList.jsx        # 여행지 탐색 페이지 (신규)
│   ├── App.jsx                   # 메인(랜딩) 페이지
│   ├── App.css                   # 전역 스타일 (syntax 클래스, glassmorphism 등)
│   ├── main.jsx                  # BrowserRouter + Routes 설정
│   └── index.css                 # Tailwind 베이스 스타일
├── .env                          # 환경변수 (VITE_API_URL, VITE_GALLERY_API_KEY)
├── tailwind.config.js            # 커스텀 컬러 토큰 + borderRadius
├── vite.config.js
└── 2_Project_Documents/
    └── Project_Specification.md  # 본 명세서
```

---

*최종 업데이트: 2026-04-21*



---
### 구현 기능
- **==지역별/여행 테마별 여행지 + 기간별 지역 축제 소개==**
	- 여행지 상세 페이지(게시판 형식) + 여행 후기를 남길 수 있는 댓글 기능
	- `react-router-dom`을 사용하여 각 여행지의 상세 정보를 보여주는 개별 페이지 구현
	- 설명은 코드 주석처럼
	- 여행지 상세 페이지에 지도 API 추가
		- **Kakao Maps API** 또는 **Google Maps API**를 연동하여 여행지의 위치를 마커로 표시
	- 지역별(제주, 부산, 서울), 카테고리별(맛집, 명소, 숙소) **다중 필터**
	
- **==나의 여행 리스트(장바구니 형식으로) - 즐겨찾기 기능==**
	- **LocalStorage**를 활용해 브라우저를 새로고침해도 내가 즐겨찾기한 여행지가 유지되도록 구현
	
- **==날씨를 기준으로 여행지 랜덤 추첨==**
	- 지역 전체로 랜덤 추첨
	- 지역으로 필터링된 여행지 추천+주변에 가볼 만한 곳


---
## 향후 계획
- UI 디자인 통일하기
- 사이드바 추가하기
- 날씨 / 지도 API 가져오기
- 날씨 기반 여행지 랜덤 뿌리기
- 데이터를 어떻게 관리할 지 고민해보기
	- 사용자 입력 정보들(게시판, 댓글, 회원 정보 등)은 MySQL로 관리(도커 사용 X)
	- 관광 정보들은 Open API로 받아오기
		- 1. Node.js로 API 호출 → MySQL 저장 스크립트
- 대략적인 프로젝트 일정 짜기


---
- HTTPS, 로드밸런서 사용(EC2)
- 도메인 만들어서 배포





---
- 즐겨찾기 기능 구현 방법
	- LocalStorage
	- 회원 관리
		- 회원에게만 제공될 수 있는 서비스 고민
- 커뮤니티 기능 추가