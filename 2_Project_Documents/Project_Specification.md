# 프로젝트 상세 명세서 — CodeTrip

> 현재 구현 상태 기준의 스냅샷 문서입니다.
> 날짜별 변경 이력은 [CHANGELOG.md](CHANGELOG.md)를 참고하세요.

---
## 0. 프로젝트 히스토리 및 개발 개요
이 문서는 프로젝트의 초기 설정부터 현재 `CodeTrip` 시스템으로 발전하기까지의 모든 과정을 기록합니다.

---
## 1. 프로젝트 개요: CodeTrip
- **프로젝트 명**: CodeTrip (Vibe Board + Tour Info)
- **목적**: 프리미엄 디자인이 적용된 여행자 인터페이스의 CRUD 게시판 시스템 및 관광 정보 서비스 구축
- **현상태**: 위시리스트 폴더 관리 서비스 및 폴더 모달 인터페이스 구현 완료. 서버 데이터 인메모리 캐싱을 이용한 성능 최적화 및 429 에러 해결. 메인 페이지 랜덤 뽑기 필터 고도화(순수 관광지만 추출). 전국 여행지 탐색 및 상세 페이지 통합 완료. 프로젝트 소개 Info 페이지 신설 및 사이드바 전체 아이템 hover 애니메이션 고도화 완료. 위시리스트 폴더 여행 일정(시작일·종료일) 등록·표시·편집 기능 완료. 탐색 페이지 지역 필터 코드 통합화 수정(TourAPI areacode 하드코딩). 메인 페이지 지역 기반 추천 관광지·문화시설 한정 필터 적용. **[2026-04-27]** `feature/board` 브랜치 머지 완료: 게시판(CRUD), 마크다운 에디터, 여행지 태그 검색 시스템 통합. 댓글 API를 `travel-comments` 명칭으로 통일. 위시리스트 500 오류(DB 컬럼 누락) 수정. 위시리스트 폴더에 메모/체크리스트(CHECKLIST/MEMO) 기능 구축 완료. 축제 정렬 로직 고도화(엄격한 날짜 검증, 과거 행사 항상 제외) 및 축제 카드 위시리스트 연동 완료. `concurrently` 기반 통합 개발 환경(`dev:all`) 구축 완료.

### 1.1 기술 스택 (Technical Stack)
- **Frontend**: React 19, Vite 8, Axios, Tailwind CSS v4, React Router DOM v7, Zustand
- **Backend**: Node.js (Express), MySQL (Local/AWS EC2)
- **Security**: 
    - **JWT**: 유효기간 24시간(`1d`) 설정, Authorization Header 기반 인증.
    - **Bcrypt**: 비밀번호 해싱에 10-rounds 솔팅 해시 적용.
    - **Multer Filter**: 파일 업로드 시 **5MB 용량 제한** 및 이미지 MIME 타입(`image/*`) 검증.
- **Infrastructure**: Nginx (Reverse Proxy), PM2, Vite Proxy, 서버 데이터 캐싱(In-memory Cache)
- **APIs**: 
    - 한국관광공사 KorService2 (TourAPI 4.0) → 상세 공통, 개요, 소개 정보 → 각각의 엔드포인트로 동작.
    - wishlistApi.js → 폴더 기반 위시리스트 관리 및 데이터 동작 서비스.
    - 카카오맵 API → 여행지 위치 각인화 및 SDK 지연 로딩.
    - Open-Meteo & Nominatim → 실시간 날씨 및 좌표 기반 지역명 변환.
- **Dev Tools**: 
    - `debug_wishlist.cjs` → 위시리스트 DB 상태 즉석 검증과 데이터 구조 확인용 CLI 유틸리티
    - `concurrently` → 프론트엔드(Vite) + 백엔드(Nodemon) 동시 실행 (`npm run dev:all`)

### 1.2 데이터베이스 스키마 (Database Schema)
- **users**: 이메일, 닉네임, 비밀번호, 이름, 프로필 이미지 경로.
- **wishlist_folders**: 사용자 커스텀 폴더 (이름, 여행 시작일 `start_date DATE NULL`·종료일 `end_date DATE NULL`, 생성/수정일).
- **wishlists**: 여행지 데이터 정보 (`folder_id` 외래키에 의한 분류 관리, `UNIQUE KEY`로 중복 찜 방지, `title VARCHAR(255)`, `image_url TEXT` 포함).
- **wishlist_notes**: 폴더별 메모 및 체크리스트 (`folder_id`, `content`, `is_completed`, `type` ENUM('MEMO','CHECKLIST')). *(2026-04-27 신규)*
- **travel_comments**: 여행지별 독립 댓글 (`content_id` 인덱스). *(구 `comments` → 2026-04-27 명칭 통일)*
- **travel_comment_likes**: 여행지 댓글 좋아요 관리(**댓글당 1회를 위한** 로직 적용). *(구 `comment_likes` → 2026-04-27 명칭 통일)*
- **board_posts**: 게시판 게시글 (`user_id`, `title`, `content` TEXT, `tags` JSON, `views`, `created_at`, `updated_at`). *(2026-04-27 신규)*
- **board_post_tags**: 게시글 태그 신규화 데이터 (`post_id`, `tag` VARCHAR). *(2026-04-27 신규)*
- **board_comments**: 게시판 댓글 (`post_id`, `user_id`, `content`, `created_at`). *(2026-04-27 신규)*
- **board_comment_likes**: 게시판 댓글 좋아요 (`comment_id`, `user_id`, `UNIQUE KEY`). *(2026-04-27 신규)*

### 1.3 개발 환경 설정 및 프로젝트 구조
프로젝트 구동을 위해 다음 환경 변수를 설정해야 하며, 전체 파일 구조는 다음과 같습니다.

```text
2_Code_Trip/
├── server/                       # Express Backend
│   ├── .env                      # 서버 환경 변수(DB_PASS, JWT_SECRET 등)
│   ├── index.js                  # 메인 서버 로직 및 API 엔드포인트
│   └── debug_wishlist.cjs        # DB 디버그 스크립트
├── src/
│   ├── api/
│   │   ├── authApi.js            # 로그인/회원가입/정보수정 API
│   │   ├── axiosInstance.js      # 공통 Axios 설정 (인터셉터, 토큰 처리)
│   │   ├── boardApi.js           # 게시판 CRUD API (게시글·댓글·좋아요) [2026-04-27 통합]
│   │   ├── travelCommentApi.js   # 여행지 댓글/좋아요 API [2026-04-27 명칭 통일, 구 commentApi.js]
│   │   ├── travelApi.js          # 관광공사 API 동작 (서버 캐시 활용)
│   │   ├── travelInfoApi.js      # 상세 여행지 정보 API
│   │   ├── weatherApi.js         # 실시간 날씨, 지역명 코덱({ name, state } 반환)
│   │   └── wishlistApi.js        # 폴더 및 위시리스트 관리 API
│   ├── constants/
│   │   ├── themes.js             # DEFAULT_THEMES 상수 (탐색 테마 목록) [2026-04-27 통합]
│   │   └── regions.js            # REGIONS 상수 (TourAPI areacode 기반) [2026-04-27 통합]
│   ├── store/
│   │   ├── useAuthStore.js       # 사용자 인증 스토어
│   │   ├── useBoardWriteStore.js # 게시글 작성 상태 스토어 [2026-04-27 통합]
│   │   ├── useExploreStore.js    # 여행 탐색/필터 상태 스토어
│   │   ├── useRegionStore.js     # 지역 선택 상태 스토어 [2026-04-27 통합]
│   │   └── useWishlistStore.js   # 위시리스트 데이터(폴더) 통합 동기화 스토어
│   ├── pages/
│   │   ├── Home.jsx              # 메인 페이지 (슬라이더, 슬롯머신)
│   │   ├── Explore.jsx           # 여행지 탐색 (필터링, 무한스크롤)
│   │   ├── Festivals.jsx         # 전국 축제 및 행사 탐색 리스트
│   │   ├── Board.jsx             # 게시판 목록 페이지 [2026-04-27 통합]
│   │   ├── BoardDetail.jsx       # 게시글 상세 (마크다운 렌더러, 댓글, 좋아요) [2026-04-27 통합]
│   │   ├── BoardWrite.jsx        # 게시글 작성/수정 (마크다운 에디터) [2026-04-27 통합]
│   │   ├── TravelTagSearch.jsx   # 여행지 태그 검색 연동 [2026-04-27 통합]
│   │   ├── TravelDetail.jsx      # 여행지 상세 (지도, 댓글, 날씨)
│   │   ├── MyPage.jsx            # 위시리스트 관리(폴더 분류, 메모/체크리스트)
│   │   ├── Info.jsx              # 서비스 소개 페이지 (기능 탭, 데이터 출처)
│   │   ├── Login.jsx / SignUp.jsx # 인증 페이지
│   │   ├── ForgotPassword.jsx    # 비밀번호 재설정
│   │   └── Settings.jsx          # 프로필 설정 및 보안 설정
│   └── components/               
│       ├── MarkdownEditor.jsx    # react-markdown 기반 마크다운 에디터 [2026-04-27 통합]
│       ├── WishlistModal.jsx     # 폴더 선택 및 생성 모달 (터미널 테마)
│       └── Layout/               # Header, Footer, SideBar
└── 2_Project_Documents/
    ├── CHANGELOG.md              # 날짜별 변경 이력
    ├── Project_Specification.md  # 프로젝트 상세 명세서
    └── Architecture_Analysis.md  # 전체 아키텍처 분석 문서 (2026-04-26 신설)
```

---
## 2. 주요 기능 및 아키텍처

### 2.0 프로젝트 핵심 설계 철학 (Core Architecture)
이 프로젝트는 유지보수성과 확장성을 극대화하기 위해 다음과 같은 설계 원칙을 따릅니다.

1. **전역 상태 관리의 최적화(Zustand)**:
   - 복잡한 `Context API` 대신 가볍고 빠른 `Zustand`를 도입하여 보일러플레이트를 최소화함.
   - `useAuthStore`에 의해 로그인 상태, 사용자 정보 관리.
   - `useWishlistStore`에 의해 전역의 하트(찜 상태 실시간 동기화).

2. **도메인 기반 API 레이어 분리 (Service Layer Pattern)**:
   - 모든 API 통신은 `src/api` 하의 도메인별 파일로 분리되어 컴포넌트 로직과 비즈니스 로직의 엄격한 분리가 됨.

3. **중첩 라우팅 기반 레이아웃 구조 (Nested Routing)**:
   - `App.jsx`를 레이아웃 컨트롤러로 활용하고 `react-router-dom`의 `<Outlet />`을 이용하여 페이지 전환 최적화.

### 2.1 위시리스트 통합 관리 시스템 (Integrated Wishlist & Folder)
- **Zustand 기반 중앙 동기화**: `syncWithServer` 단일 엔드포인트에 의해 데이터 목록과 폴더 상태를 한 번에 동기화하여 UI 전역의 통합된 동기화.
- **성능 최적화**: 위시리스트 포함 여부(`wishlistIds`)를 `Set` 객체를 이용하여 대규모 데이터에서도 즉각적인 UI 렌더링 제공.
- **연속적 데이터 매핑**: 공공데이터와 전체 DB 간의 데이터 필드명(`contentid` vs `content_id`)을 스토어 계층에서 통일하여 처리.
- **폴더 선택 모달**: 하트 버튼 클릭 시 저장할 폴더를 선택하거나 즉석에서 새 폴더를 생성할 수 있는 시스템 워크플로우.
- **분류 관리**: '미분류' 기본 컨테이너에서 사용자 정의 폴더 간의 자유로운 데이터 이동(`moveItem`) 지원.

### 2.2 인증 및 보안 (Authentication)
- **JWT 기반 인증**: 로그인 시 서버로부터 토큰을 발급받아 `localStorage`에 저장하여 세션 유지.
- **Remember Me**: 로그인 유지 기능에 의해 브라우저 재시작 후에도 로그인 상태 복구.
- **보안 설정**: 비밀번호 변경 시 현재 비밀번호 확인 절차 필수화, `bcrypt` 단방향 해싱 적용.

### 2.3 여행지 검색 및 필터링(Explore System)
- **복합 필터**: 지역(Province)과 테마(ContentType)의 조합된 멀티 조건 검색 지원.
- **무한 스크롤 & 페이지네이션**: 대용량 데이터를 효율적으로 렌더링하기 위한 스크롤 위치 기억 및 커스텀 페이지네이션.
- **고성능 데이터 캐싱**: 서버 기동 시 관광공사 API 데이터를 메모리에 상주하여 응답 속도 ms 단위 축소.

### 2.4 상세 정보 각인화(Detail View)
- **Node_Header**: 여행지 상세 페이지 상단의 핵심 각인 정보 영역 (고화질 이미지 + 인터랙티브한 기능).
- **카카오맵 동작**: 위도/경도 기반 실시간 지도 마커 표시 및 카카오맵 길찾기 딥링크 연결.
- **데이터 예외 처리**: API 응답 누락 및 "no_data_found" 주석 등에 의한 UI에 한 각인화 설정된 정보.

### 2.5 커뮤니티 기능 (Community)
- **댓글(Comment) 시스템**: 각 여행지 코드(`#NODE_`)에 독립적인 댓글방 운영.
- **좋아요 인터랙션**: 댓글 좋아요 및 여행지 찜하기 기능에 마이크로 애니메이션(Bubbling Hearts) 적용.

### 2.6 지역형 어댑티브 UX
- **Geolocation & Nominatim**: 사용자 좌표를 한국의 시군구 단위의 지역명으로 변환하여 가장 가까운 명소 실시간 추천.
- **Weather-based Random Pick**: 현재 날씨 상태(Sunny, Rainy 등)에 최적화된 여행지를 추출하여 여행지를 추천하는 슬롯머신 UI.

### 2.7 위시리스트 시스템 고도화 및 UI/UX 완성도 향상(2026-04-25 추가)
- **디자인 시스템(Design System) 수립**:
    - **Color Palette**: `syntax-keyword` (코딩감의 인식 컬러), `text-tertiary` (데이터 레이블), `bg-slate-50` (프리미엄 배경).
    - **Typography**: 
        - `font-mono`: 텍스트 문구, 기술적 레이블, 영어 텍스트에 적용하여 'Code Vibe' 감성.
        - `font-body`: 주소 텍스트 및 상세 주소에 적용하여 가시성을 유지하면서 정보 표시.
- **프리미엄 터미널 테마 UI 개편**: 
    - `WishlistModal.jsx`를 프로젝트 고유의 '밝은 프리미엄 테마'로 전면 리디자인. 
    - 상단 호환성 이미지와 `save_to_folder.sh` 레이블을 적용.
- **상세 페이지(`TravelDetail.jsx`) 동작 강화**:
    - 상세 페이지에서 위시리스트 추가 시 폴더 선택 모달이 트리거되도록 사용자 경험(UX) 개선.
    - 위시리스트 추가 시 데이터 객체(`common`) 전체를 전달하는 방식으로 데이터 무결성 에러 원천 차단.
- **폴더 메타데이터 각인화**:
    - 마이페이지 사이드바에 선택된 폴더의 생성일(`CREATED_AT`) 및 최근 수정일(`LAST_UPDATED`)을 보여주는 메타데이터 섹션 구축.
    - 날짜 표시 형식을 `YYYY.MM.DD`로 통일하여 레트로 텍스트 감성 부여.
- **필터 헤더 및 레이블 디자인 수정**:
    - `Explore.jsx`와 `TravelPic.jsx`의 필터 구성을 한 줄의 기술적 디자인으로 통일.
    - 'Region', 'Theme' 등 핵심 레이블에 `syntax-keyword` 색상을 적용하여 각인적 인식력 복원.

### 2.8 전국 축제 및 행사 시스템 고도화(2026-04-25 추가)
- **전용 리스트 페이지(`Festivals.jsx`)**: 전국 위치의 축제 데이터를 탐색할 수 있는 리스트 UI. 각 카드 상단에 **축제 기간(`MM.DD - MM.DD`) 각인화** 및 달력 아이콘 적용 완료.
- **데이터 보정 메커니즘(Hydration)**: 목록 API에서 날짜 데이터가 누락된 경우, 개별 상세 정보를 실시간으로 조회하여 채워넣는 클라이언트 데이터 보정 로직에 의해 데이터 신뢰성 확보. *(2026-04-27 성능 개선을 위해 서버 측 필터로 대체 후 제거)*
- **다중 정렬 시스템**: 사용자의 선택에 따라 'DEFAULT_NODES', 'DATE_ASCENDING', 'DATE_DESCENDING'으로 데이터를 배열하는 기능 구현.
- **고성능 서버 데이터 캐싱**: `/api/travel/festivals` 엔드포인트에 의해 서버 메모리에 상주한 축제 데이터를 즉시 반환하며, `searchFestival2` API를 활용한 상세 정보를 포함함.
- **상세 페이지(`TravelDetail.jsx`) 동작**: 축제 정보 조회 시 `system.env` 섹션에 축제 시작일과 종료일을 자동 추출하는 어댑티브 UI 구현.
- **인터랙티브 사이드바 동작**: `Explore` 하단에 `Festivals` 메뉴를 신설하고, 마우스 호버 시 **폭죽(Firework) CSS 파티클 애니메이션** 적용.

### 2.9 하이브리드 지역 및 축제 데이터 시스템(2026-04-25 고도화)

- **이중 검증 메커니즘**: 관광공사 API의 지역 코드(`areacode`) 필터링과 주소(`addr1`) 텍스트 기반 필터링을 결합하여 데이터 누락 시에도 정확한 지역 정보 반환.
- **부산 고정 오류 해결**: 경기도 성남시 사용자의 실제 위치와 다른 지역(부산)이 출력되던 고질적인 필터 오류 완벽 수정.
- **안정적인 API 폴백**: `searchFestival2` 호출 실패 시 `festivalList2`로 자동 전환하여 데이터 가용성을 유지하는 안정화 로직 적용.
- **데이터 필드 규격화**: API의 데이터 필드명 `eventstartdate`, `eventStartDate` 등 대소문자 구분 없이 안전하게 매핑하는 헬퍼 계층 구축.

### 2.10 서비스 소개 페이지 및 사이드바 인터랙션 고도화(2026-04-26 추가)

- **서비스 소개 페이지(`Info.jsx`) 신설**: 한국관광공사 사용가이드 페이지를 참고하여 CodeTrip의 기능 및 데이터 출처를 한눈에 소개하는 내용 페이지 구축. 총 6개의 섹션으로 구성.
    - **Hero**: 브랜드 소개 문구 + CTA 버튼 (어두운 배경, radial-gradient 조명 효과)
    - **Stats Bar**: 60,000+ 여행지 / 16개 시도 / 8가지 테마 / 실시간 동작 핵심 수치
    - **주요 기능 소개**: Home·Explore·상세·Festivals·Wishlist를 탭 전환 UI(`activeId` 상태 관리)로 상세 소개
    - **이용 방법 3단계**: 탐색 → 찜하기 → 축제 확인 가이드 카드
    - **이용 데이터 출처**: 한국관광공사 API · 카카오 지도 · 날씨 API 안내
    - **CTA**: 탐색 시작 및 회원가입 유도 (어두운 배경 컨벤션)
- **라우트 등록**: `/info` 경로를 `main.jsx`에 추가하여 내비게이션 연결 완료.
- **사이드바 메뉴별 고유 컬러 글로우 애니메이션 전면 교체** (`SideBar.jsx`, `App.css`): 기존 단순 Tailwind transform 호버를 각 메뉴 고유 CSS `@keyframes` 애니메이션과 반원형 광원(halo) 오버레이로 전면 교체하여 프리미엄 인터랙션 수립.

    | 메뉴 | 애니메이션명 | 컬러 | 효과 |
    |------|----------|------|------|
    | Home | `home-glow` | 오렌지 `#f97316` | 바운스 + 원형 광원 |
    | Explore | `explore-spin` | 블루 `#3b82f6` | 나침반 180° 회전 + 원형 광원 |
    | Festivals | `fest-glow` | 핑크·앰버 교차 | 색상 교차 글로우 (폭죽 파티클 유지) |
    | Wishlist | `heart-glow` | 레드 `#ef4444` | 심장박동 pulse 글로우 (하트 버블 유지) |
    | UserInfo Edit | `account-shake` | 에메랄드 `#10b981` | 좌우 쉐이크 + 원형 광원 |
    | Info | `bulb-flicker` | 앰버 `#fbbf24` | 전구 깜빡임 + 원형 광원 |

- **폭죽 파티클 경량화**: Festivals 호버 시 파티클 크기를 `4px` → `2px`, `box-shadow` `8px` → `4px`로 축소하고 이동 범위를 줄여 폭죽이면서도 깔끔한 효과로 개선.
- **푸터(`Footer.jsx`) 링크 개편**: `Privacy` → `Public_Wifi`(공공 와이파이 정보 사이트, 새 탭 오픈), `Terms` → `Info`(내부 라우트, React Router `<Link>`)로 교체.
- **아키텍처 분석 문서(`Architecture_Analysis.md`) 신설**: 전체 기술 스택·파일 구조·라우트·백엔드 API 엔드포인트·DB 스키마·Zustand 상태 관리 디자인 시스템을 종합 정리한 참조 문서 신규 작성.
- **푸터(`Footer.jsx`) SAFESTAY 링크 개편**: `Security` 링크를 `Safestay`로 변경, 한국관광공사 안전여행 포털(`safestay.visitkorea.or.kr`) 연결, 새 탭 오픈 보안 속성 적용.
- **사이드바 Info 서브메뉴 도입** (`SideBar.jsx`): Info 버튼 클릭 시 서브메뉴 토글. 서브메뉴 내 항목: Public_Wifi(외부), Safestay(외부), About_CodeTrip(내부 `/info`) 3개. `open_in_new` 아이콘 표시, 내부 링크는 현재 경로 일치 시 강조. `max-h` 슬라이드 애니메이션과 아코디언 아이콘 180° 회전으로 상태 각인화.

### 2.11 위시리스트 폴더 여행 일정 시스템 및 버그 수정 (2026-04-26 추가)

#### 폴더 여행 일정 관리 기능
- **DB 스키마 확장**: `wishlist_folders` 테이블에 `start_date DATE NULL`, `end_date DATE NULL` 컬럼 추가. 서버 기동 시 `ALTER TABLE`(예외 무시)으로 기존 DB에 자동 적용.
- **폴더 생성 모달 (`mkdir_new_folder.sh`)**: 시작일·종료일 날짜 입력(`<input type="date">`) UI 추가. 종료일 최솟값을 시작일로 제한. 날짜 선택 즉시 미리보기 문자열 (예: `04.25(토요일) ~ 04.26(일요일) : 1박 2일`) 표시.
- **사이드바 폴더 목록**: 각 폴더 이름 하단에 `formatScheduleShort` 함수로 약식 일정 문자열 표시. 선택 상태에서는 흰색 계열 텍스트로 가시성 유지.
- **FOLDER_METADATA 패널**: `TRAVEL_DATE:` 항목 추가. `formatScheduleFull`로 월·일·요일·박수를 개행 포함 형식으로 표시.
- **위시리스트 목록 헤더**: 선택된 폴더의 제목(`h3`) 아래 여행 일정을 약식으로 모노 폰트로 추가 표시. 전체·미분류 선택 시에는 표시되지 않음.

#### 날짜 헬퍼 함수 (`MyPage.jsx` 상단)
| 함수 | 역할 |
|------|------|
| `parseLocalDate(str)` | ISO 문자열(`YYYY-MM-DDT...Z`) 또는 `YYYY-MM-DD` → UTC 오프셋 없는 로컬 `Date` |
| `formatScheduleShort(startStr, endStr)` | 사이드바의 약식 일정 문자열 반환 (당일치기 포함) |
| `formatScheduleFull(startStr, endStr)` | 메타데이터 패널의 전체 일정 문자열(개행 포함) |

#### 폴더 편집 기능
- **`PUT /api/wishlist/folders/:id`** 엔드포인트 신설: `name`, `start_date`, `end_date` 업데이트. `WHERE user_id = ?` 소유권 검증.
- **`wishlistApi.js`**: `updateFolder(folderId, name, startDate, endDate)` 추가.
- **`useWishlistStore.js`**: `updateFolder` 액션 추가, 완료 후 `syncWithServer()`.
- **`MyPage.jsx`**: 사이드바 폴더에 `edit` 아이콘 추가(hover 표시). 편집 모달(`edit_folder.sh`) → 현재 이름·날짜가 미리채워짐, MySQL ISO 날짜를 `.slice(0, 10)` 변환으로 `<input type="date">` 값에 정확히 바인딩. `SAVE_CHANGES`로 반영.

#### 버그 수정

**NaN 날짜 표시 (Bug Fix)**
- **원인**: `mysql2`가 `DATE` 컬럼을 `"2026-04-25T00:00:00.000Z"` ISO 문자열로 직렬화. 기존 `split('-')` 시 세 번째 요소가 `"25T00:00:00.000Z"` → `Number()` 변환 시 `NaN`.
- **수정**: `parseLocalDate`에 `String(str).slice(0, 10)` 전처리 추가.

**탐색 페이지 지역 필터링 무결성 (Bug Fix)**
- **원인**: `ldongCode2` API는 행정동 코드(`lDongRegnCd`, 10자리)를 반환하지만 서버 캐시 데이터(`areaBasedList2`)는 광역시도 코드(`areacode`, 1~2자리)를 사용함. 코드 체계 불일치로 필터 매칭 실패. 또한 `ldongCode2` 응답 필드명(`lDongRegnCd`)을 `item.code`로 접근하여 모든 코드가 `''`가 되는 2중 문제 발생.
- **수정**: `useExploreStore.js`에서 `getRegions` import 제거. `regions` 초기값을 TourAPI `areacode` 기준 18개 지역 목록(`REGIONS` 상수)으로 하드코딩. `fetchRegions`를 no-op으로 변경.

#### 메인 페이지 지역 기반 추천 필터 강화
- **`/api/travel/near`** 엔드포인트에 콘텐츠 타입 조건 추가: 관광지(`'12'`)·문화시설(`'14'`)만 반환. 숙박·식당·레저 등 비관광 콘텐츠 배제.

### 2.12 게시판(Board) 시스템 통합 (2026-04-27 추가 — feature/board 머지)

#### 시스템 개요
`feature/board` 브랜치를 로컬에 머지하여 커뮤니티 게시판 기능을 전면 통합. 마크다운 기반 게시글 작성, 태그 시스템, 댓글·좋아요 상호작용을 지원하는 완결된 게시판 시스템 구축.

#### 백엔드(server/index.js)
- **DB 테이블 신규**: `board_posts`, `board_post_tags`, `board_comments`, `board_comment_likes` → 서버 기동 시 `CREATE TABLE IF NOT EXISTS`로 자동 생성.
- **게시판 API 엔드포인트 전체 추가**:

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/board/posts` | 목록 조회 (태그 필터, 검색어, 정렬, 페이지네이션) | 불필요 |
| POST | `/api/board/posts` | 게시글 생성 | 필요 |
| GET | `/api/board/posts/:id` | 상세 조회 (조회수 자동 증가) | 불필요 |
| PUT | `/api/board/posts/:id` | 게시글 수정 (작성자 본인만) | 필요 |
| DELETE | `/api/board/posts/:id` | 게시글 삭제 (작성자 본인만) | 필요 |
| GET | `/api/board/posts/:id/comments` | 댓글 목록 | 불필요 |
| POST | `/api/board/posts/:id/comments` | 댓글 생성 | 필요 |
| PUT | `/api/board/comments/:id` | 댓글 수정 (작성자 본인만) | 필요 |
| DELETE | `/api/board/comments/:id` | 댓글 삭제 (작성자 본인만) | 필요 |
| POST | `/api/board/comments/:id/like` | 댓글 좋아요 토글 | 필요 |

#### 프론트엔드
- **`src/pages/Board.jsx`**: 게시글 목록 페이지. 태그 필터 + 키워드 검색 + 정렬 + 페이지네이션 지원.
- **`src/pages/BoardDetail.jsx`**: 게시글 상세 페이지. `react-markdown` + `remark-gfm`으로 마크다운 렌더링. 댓글 작성/수정/삭제, 댓글 좋아요 기능 포함.
- **`src/pages/BoardWrite.jsx`**: 게시글 작성/수정 페이지. 마크다운 에디터(`MarkdownEditor.jsx`) 내재. 제목, 태그, 본문 입력.
- **`src/pages/TravelTagSearch.jsx`**: 여행지 태그 기반 검색 결과를 게시글 작성 화면으로 연동하는 페이지.
- **`src/components/MarkdownEditor.jsx`**: `react-markdown` 기반 에디터 컴포넌트. `.markdown-body` CSS 클래스로 렌더러 스타일 적용.
- **`src/api/boardApi.js`**: 각 API 엔드포인트에 1:1 대응하는 클라이언트 API 모듈.
- **`src/store/useBoardWriteStore.js`**: 게시글 작성 시 상태(제목, 태그, 본문, 여행지 태그)를 Zustand로 관리.

#### 라우트(`src/main.jsx`)
```
/board            → Board.jsx
/board/write      → BoardWrite.jsx
/board/tag-search → TravelTagSearch.jsx
/board/:id        → BoardDetail.jsx
```

#### 사이드바 동작 (`src/components/Layout/SideBar.jsx`)
- `article` 아이콘의 `Board` 메뉴 추가. 경로 `/board`, 애니메이션 `group-hover:-translate-y-0.5`.

#### 패키지 추가
- `react-markdown`, `remark-gfm` → 마크다운 렌더링용.
- `concurrently` → 프론트+백엔드 동시 실행용 (devDependencies).

#### 댓글 API 명칭 통일
- 여행지 댓글 API: `commentApi.js` → `travelCommentApi.js`, 경로 `/api/comments` → `/api/travel-comments`.
- DB 테이블: `comments` → `travel_comments`, `comment_likes` → `travel_comment_likes`.

#### 위시리스트 DB 컬럼 누락 수정
- **문제**: 기존 `wishlists` 테이블에 `title`, `image_url` 컬럼 부재로 `GET /api/wishlist/details` 500 오류 발생.
- **해결**: `initDB()` 내 `ALTER TABLE wishlists ADD COLUMN title/image_url` + `ALTER TABLE wishlist_folders ADD COLUMN start_date/end_date` → try/catch로 컬럼 중복 무시.

### 2.13 위시리스트 폴더별 메모 및 체크리스트 시스템(2026-04-27 추가)

#### 기능 개요
위시리스트 폴더별로 독립적인 여행 준비물 리스트(Checklist) 및 자유 메모(Memo)를 기록할 수 있는 관리 시스템.

#### 주요 구성 요소
- **데이터베이스 (MySQL)**: `wishlist_notes` 테이블 신규 구축. `folder_id`에 의한 1:N 관계 성립 및 `ON DELETE CASCADE` 제약 조건 적용.
- **사이드바 통합 UI**: 마이페이지 좌측 하단에 위치하며, 폴더 선택 시 해당 폴더의 노트를 자동으로 로드 및 필터링.
- **인터랙션 모드**:
    - **CHECKLIST**: 체크박스 기반 할일 관리. 완료 시 각주 취소선 적용 및 서버 상태 동기화.
    - **MEMO**: 여행 관련 아이디어, 맛집 리스트 등 자유 텍스트 기록.
- **디자인 시스템**: 'Code Vibe' 테마를 계승하는 터미널 감성의 입력창과 슬라이드 애니메이션 적용.

#### API 엔드포인트
- `GET /api/wishlist/folders/:folderId/notes`
- `POST /api/wishlist/folders/:folderId/notes`
- `PUT /api/wishlist/notes/:id/toggle`
- `DELETE /api/wishlist/notes/:id`

### 2.14 축제 시스템 고도화 — 정렬 로직, 과거 행사 필터, 위시리스트 연동 (2026-04-27 추가)

#### 서버 사이드 정렬/필터 로직 개선 (`server/index.js`)

기존 축제 정렬 시스템에 다음 세 가지 문제가 있었으며, 이를 통합 수정:

1. **과거 행사 오름차순 최상단 노출 문제**: 과거 축제(2025년 등)가 날짜 오름차순 시 첫 번째로 노출.
2. **과거 행사 필터가 date 정렬 모드에서만 적용 문제**: `default` 정렬 시에도 종료된 행사 노출.
3. **날짜 유효성 검사 취약 문제**: `|| '99999999'` 방식이 빈 문자열이 아닌 비정상 값에 취약.

**핵심 수정 내용**:
- `/^\d{8}$/` 정규식으로 엄격한 날짜 유효성 검사
- 과거 행사 제외 필터를 정렬 조건문 **외부(앞)**에 배치하여 모든 정렬 모드에 항상 적용
- `eventenddate >= todayStr` 우선, 없으면 `eventstartdate >= todayStr`로 진행/예정 행사만 포함
- `YYYYMMDD` 형식 문자열에 `localeCompare` 적용으로 정확한 날짜 정렬 보장

#### 축제 카드 위시리스트 하트 버튼 연동 (`Festivals.jsx`)

- 각 축제 카드 우상단에 위시리스트 하트 버튼 오버레이 추가
- Explore 페이지와 동일한 UX: 미찜 상태 클릭 → `WishlistModal` 트리거, 이미 찜한 상태 클릭 → 즉시 제거
- 비로그인 클릭 시 로그인 요청 alert 출력
- `useWishlistStore`, `useAuthStore`, `WishlistModal` 컴포넌트 통합

#### Hydration 로직 제거 (성능 개선)
- 기존: 목록 API 응답 후 누락된 날짜를 `getDetailIntro` 개별 호출로 보완
- 변경: 서버 측 필터에서 날짜 유효성을 이미 보장하므로 클라이언트 보정 불필요 → 제거
- 효과: API 호출 수 감소 및 리스트 로딩 성능 향상

#### 개발 환경 개선 (concurrently)
- `npm run dev:all` 명령으로 Vite(프론트) + Nodemon(백) 동시 실행 환경 구축
- `ECONNREFUSED` 원인: `npm run dev`(Vite만 실행) 상태에서 백엔드 미구동 시 위시리스트 초기화 API(`/api/wishlist/details`)가 즉시 호출되어 TCP 연결 거부 발생

---
## 3. 성능 최적화 및 전략 (Performance Optimization)

### 3.1 429 에러(Too Many Requests) 방어 및 캐싱 시스템
공공데이터 API의 호출 제한 정책에 대한 대책을 수립하여 사용자 경험을 극대화하기 위해 다음과 같은 설계와 캐싱 전략을 운영 중입니다.

#### [Phase 1] 서버 데이터 메모리 캐싱 (현재 적용 완료)
*   **메커니즘**: 서버 부팅 시 외부 API로부터 약 6만 건의 데이터를 단 1회 호출하여 서버 메모리에 상주.
*   **장점**: 클라이언트의 직접적인 외부 API 호출을 차단하여 429 에러 발생 가능성을 0%로 감소. 응답 속도가 ms 단위로 축소됨.
*   **적용 범위**: 메인 슬라이더 사진, 지역 기반 추천(Near Me), 랜덤 여행지 뽑기, 전국 축제 리스트 등.

#### [Phase 2] 클라이언트 데이터 데이터 보정 (Hydration)
*   **개념**: 목록 데이터에서 부족한 필드(예: 행사 날짜)를 사용자 화면 렌더링 시점에 개별 API를 통해 실시간으로 보충하는 방식.
*   **효과**: 서버 부하를 최소화하면서도 사용자에게는 누락 없는 정보를 제공.
*   **현황**: 2026-04-27 기준 서버 측 날짜 유효성 필터로 대체되어 축제 페이지에서는 제거됨.

---
## 4. 구현 현황

| 구현 기능 | 상태 |
| --------------- | --- |
| 로그인/회원가입 페이지 구현 | ✅ 완료 |
| 마이페이지(위시리스트) 구현 | ✅ 완료 |
| 지역 API 동작 | ✅ 완료 |
| 상세 페이지 확장 및 댓글 시스템(API 복구 포함) | ✅ 완료 |
| Zustand 기반 검색 상태 관리 | ✅ 완료 |
| 메인 슬롯머신 상세 동작 안정 | ✅ 완료 |
| 모바일 하단 내비게이션 복구 | ✅ 완료 |
| 사이드바 전적 애니메이션 및 축제 메뉴 추가 | ✅ 완료 |
| 로그인 'Remember Me' 기능 | ✅ 완료 |
| 비밀번호 재설정 시스템 | ✅ 완료 |
| 페이지 접근 권한 보안 설정 | ✅ 완료 |
| 탐색 페이지 하트 인터랙션 및 더블클릭 | ✅ 완료 |
| 실제 DB 기반 위시리스트 CRUD | ✅ 완료 |
| 서버 데이터 메모리 캐싱 도입 | ✅ 완료 |
| 상세 및 마이페이지 하트 동작 | ✅ 완료 |
| Node_Header 브랜드 명칭 변경 | ✅ 완료 |
| 탐색/상세/마이페이지 하트 UI 깜빡임 현상 수정 | ✅ 완료 |
| 위시리스트 로그아웃 동기화 및 초기화 최적화 | ✅ 완료 |
| 서버 댓글(Comment) 시스템 복구 및 에러 핸들링 | ✅ 완료 |
| 위시리스트 추가/삭제 알림(Alert) 시스템 | ✅ 완료 |
| 사용자 맞춤형 위시리스트 폴더(Folder) 관리 기능 | ✅ 완료 |
| 위시리스트 다중 정렬 (최신순, 이름순 A-Z/Z-A) | ✅ 완료 |
| 전국 축제 및 행사 전용 페이지 구축 | ✅ 완료 |
| 축제 데이터 실시간 보정(Hydration) 시스템 | ✅ 완료 (2026-04-27 제거) |
| 행사 날짜별 다중 정렬 기능 (오름/내림차순) | ✅ 완료 |
| 하이브리드 지역 필터링 (부산 고정 오류 수정) | ✅ 완료 |
| 사이드바 폭죽(Firework) CSS 파티클 애니메이션 | ✅ 완료 |
| 댓글 좋아요 중복 방지 로직 및 DB 동작 | ✅ 완료 |
| 이미지 업로드 5MB 용량 제한 및 필터 | ✅ 완료 |
| Info 서비스 소개 페이지 신설 | ✅ 완료 |
| 사이드바 각 메뉴 고유 컬러 글로우 애니메이션 고도화 | ✅ 완료 |
| 전체 아키텍처 분석 문서(`Architecture_Analysis.md`) 신설 | ✅ 완료 |
| 사용자 정보 수정 및 프로필 이미지 업로드 시스템 | ✅ 완료 |
| 비밀번호 찾기 및 재설정(ForgotPassword) API | ✅ 완료 |
| 위시리스트 폴더 여행 일정(시작일·종료일) 등록 및 표시 | ✅ 완료 |
| 위시리스트 목록 헤더 여행 일정 표시 | ✅ 완료 |
| 위시리스트 폴더 이름·날짜 편집 기능 (`PUT /api/wishlist/folders/:id`) | ✅ 완료 |
| 탐색 페이지 지역 필터 코드 통합화 수정 (areacode 하드코딩) | ✅ 완료 |
| 메인 페이지 지역 추천 관광지·문화시설 한정 필터 | ✅ 완료 |
| 푸터 SAFESTAY 링크 연결 (한국관광공사 안전여행 포털) | ✅ 완료 |
| 사이드바 Info 서브메뉴 (Public_Wifi · Safestay · About_CodeTrip) | ✅ 완료 |
| 사이드바 Explore 아이콘 애니메이션 색상 블루(`#3b82f6`)로 변경 | ✅ 완료 |
| 댓글 API 명칭 통일 (`travel-comments` / `travel_comment_likes`) | ✅ 완료 |
| `feature/board` 브랜치 머지 → 게시판 시스템(CRUD·댓글·태그·좋아요) 통합 | ✅ 완료 |
| 마크다운 에디터(`MarkdownEditor.jsx`) 및 `react-markdown` 동작 | ✅ 완료 |
| 게시판 DB 테이블 4개 신규 생성 (`board_posts`, `board_post_tags`, `board_comments`, `board_comment_likes`) | ✅ 완료 |
| 위시리스트 `title`/`image_url` 컬럼 누락 자동 복구 (`ALTER TABLE`) | ✅ 완료 |
| 위시리스트 폴더별 메모 및 체크리스트(CHECKLIST/MEMO) 기능 | ✅ 완료 |
| 축제 과거 행사 자동 제외 필터 (정렬 방식 무관 항상 적용) | ✅ 완료 |
| 축제 날짜 유효성 검사 고도화 (`/^\d{8}$/` 정규식) | ✅ 완료 |
| 축제 카드 위시리스트 하트 버튼 연동 (`Festivals.jsx`) | ✅ 완료 |
| `concurrently` 기반 통합 개발 서버 환경 (`npm run dev:all`) | ✅ 완료 |
| 시맨틱 검색 기능 고도화 | 🔄 추진중 |

---
## 9. 향후 개발 계획

### 구현된 기능/수정 사항 메모
1. **여행지 상세 페이지 및 지도 API 동작 (확장)**
	- 기능: 여행지의 상세 설명, 개장 시간, 이용 요금 등을 표시.
	- 지도 동작: 카카오맵 클릭으로 길찾기 동작 완료.
	
2. **시맨틱 검색 기능 완성화**
	- 헤더의 검색창을 가장 순수한 각인 요소에서 실제 기능으로 업그레이드합니다.
	
3. **나만의 여행 코스 빌더 (Solar Compiler 컨셉)**
	- 위시리스트에 담긴 장소들을 조합하여 하나의 "여행 코스"를 만드는 기능입니다.
	
4. **사용자 맞춤형 '환경 설정' 페이지 (Settings) (완료)**
	- 2026.04.26 구현 완료 (프로필 설정, 이미지 업로드, 비밀번호 변경).
	
5. **실제 데이터베이스 기반 위시리스트 CRUD (완료)**
	- 2026.04.24 구현 완료.
	
6. **사용자 프로필을 클릭하면 마이페이지로 이동**
	
7. **웹 페이지 로고 최적화하기(크롬 탭 상단 아이콘에 보여지는 이미지)**

8. **화면 크기를 줄이었을 때 모바일 환경에 맞는 메뉴 바를 하단에 생성하도록 추가**

9. **메인 페이지 두 번째 카드(슬롯머신) 상세 페이지 이동 이슈 해결**

10. **비밀번호 분실 기능 (Forgot Password) 시스템 구현 (완료)**
	- 2026.04.26 구현 완료 (이메일+이름 본인 인증 기반).

11. **탐색 페이지(Explore) 인터랙티브 하트 및 애니메이션 고도화**
	
12. **(원한다면)마이페이지에서 본인이 작성한 여행 게시글이나 댓글을 조회할 수 있는 기능**

13. **관리자/사용자로 분리해서 관리자가 특정 글을 직접 삭제할 수 있는 권한 부여**

14. **푸터 오른쪽 하단 메뉴에 Info 페이지 추가하기 (완료)**
	- 2026.04.26 구현 완료.

15. **여행지 정보 페이지에서 상단으로 바로 이동할 수 있는 top 버튼 추가하기**

16. **행사 축제 페이지 정렬 기능 오류 수정 및 로직 수정 (완료)**
	- 2026-04-27 서버 날짜 정렬 로직 및 날짜 유효성 검사 고도화 완료.
	- 과거 행사 항상 제외 필터 (정렬 방식 무관) 완료.

17. **행사 및 축제 카드 위시리스트 찜 기능 추가 (완료)**
	- 일반 여행지뿐만 아니라 축제 데이터(contentTypeId: 15)도 사용자 위시리스트 폴더에 저장할 수 있도록 확장. 2026-04-27 완료.

18. **위시리스트에서 체크리스트, 메모, 입력 기능 추가하기 (완료)**
	- 2026-04-27 wishlist_notes 테이블 및 API 4개 엔드포인트 구현 완료.

19. **교통 수단(KTX, SRT) 정보 제공 및 외부 페이지 연동 기능**

---
**추가 아이디어 제안 및 문답 기록**

현재 CodeTrip 프로젝트는 '개발자스러운 프리미엄 디자인(Code Vibe)'과 '실시간 데이터(날씨/위치) 기반 추천'이라는 매우 선명하고 매력적인 정체성을 가지고 있습니다.

지금의 구조에서 프로젝트의 완성도를 더 높여드릴 수 있는 5가지 확장 기능을 추천드립니다.

1. **Trip_Build: 최적 경로 최적화(컴파일러 컨셉)**
   - 사용자가 찜한 3~4개의 장소를 '빌드(Build)'하면, 카카오맵 API를 이용하여 최적화된 이동 경로를 생성해주는 기능.
2. **Travel_Log: 마크다운 기반 여행 리뷰 (Dev-Friendly Review)**
   - 마크다운 에디터를 통해 개발자 로그 형식으로 여행 일기를 작성하고 공유하는 시스템.
3. **Live_Signal: 실시간 혼잡도 및 날씨 연동 정보**
   - 현재 여행지의 실시간 기상 데이터를 연동하여 '현재 가장 가기 좋은 곳' 상호를 각인화.
4. **Social_Snippet: 여행지 카드 공유 기능**
   - 여행지 정보를 이쁜 코드 애니메이션 카드 이미지 형태로 캡처하여 SNS에 공유.
5. **Navigation_Link: 클릭으로 길찾기 동작 (완료)**
   - 카카오맵, 네이버맵 등으로 즉시 연결하는 딥링크 시스템.

---
**질문: 위 5가지 기능을 웹 페이지에서 구현할 수 있나요?**
답변: 네, 이 웹 페이지에서 매우 잘 이루어질 수 있습니다! 주요 지도 서비스들이 제공하는 'URL Scheme'이나 '딥 링크 API'를 이용하면 버튼 클릭 한 번으로 사용자의 스마트폰 지도앱이 실행되거나 길찾기 화면으로 연결할 수 있습니다.
- 카카오맵: `https://map.kakao.com/link/to/장소이름,위도,경도`

---
**질문: 그럼 다시 마크다운 에디터도 웹 페이지에서 구현할 수 있나요?**
답변: 네, 마크다운 에디터는 이미 프로젝트의 'Code Vibe' 컨셉과 가장 잘 어울리는 기능 중 하나입니다. `react-simplemde-editor` 같은 라이브러리를 이용하면 1~2시간 안에 완성형 에디터를 구축할 수 있으며, 사용자가 개발자 로그 형식으로 여행기를 작성하고 코드 주석 형태로 렌더링하여 우리만의 독특한 여행 리뷰 시스템이 완성됩니다.

```console
   1 // USER_LOG.md
   2 # 경주의 덕수이 수학여행 방문기
   3 - 날짜: 2026.04.23
   4 - 상태: [SUCCESS] 매우 맑음
   5
   6 본문 내용... 여기서 마크다운으로 자유롭게 작성!
```

---
*최종 업데이트: 2026-04-27 (feature/board 머지 후 게시판 시스템 통합, 댓글 API travel-comments 명칭 통일, react-markdown 설치, 위시리스트 500 오류 DB 컬럼 자동 적용, 게시판 DB 테이블 4개 신규, 위시리스트 폴더별 메모/체크리스트 기능 추가, 축제 정렬 로직 고도화 및 과거 행사 필터, 축제 카드 위시리스트 연동, concurrently 개발 환경 구축, axiosInstance baseURL 중복 경로 404 수정)*
