# Code Trip — 프로젝트 구조 및 기능 분석

> 작성일: 2026-04-26  
> 브랜치: doyeon

---

## 개요

**한국 여행 정보 플랫폼** — 한국관광공사 API를 활용하여 전국 여행지, 축제, 날씨 기반 추천을 제공하는 풀스택 웹 앱입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **State** | Zustand 5 |
| **Routing** | React Router DOM v7 |
| **Backend** | Express.js (단일 파일 서버) |
| **DB** | MySQL (mysql2/promise) |
| **인증** | JWT + bcrypt |
| **외부 API** | 한국관광공사 KTO API, Kakao Maps API, 날씨 API |
| **파일 업로드** | multer (프로필 이미지) |

---

## 프로젝트 구조

```
2_Code_Trip/
├── src/
│   ├── main.jsx              ← 라우터 진입점
│   ├── App.jsx               ← 레이아웃 (사이드바 + 헤더 + 푸터 + Outlet)
│   ├── pages/
│   │   ├── Home.jsx          ← 메인 페이지
│   │   ├── Explore.jsx       ← 여행지 탐색
│   │   ├── TravelDetail.jsx  ← 여행지 상세
│   │   ├── Festivals.jsx     ← 축제 목록
│   │   ├── MyPage.jsx        ← 위시리스트 관리
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── Settings.jsx
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── SideBar.jsx      ← 사이드바 + 모바일 하단 Nav
│   │   │   └── Footer.jsx
│   │   └── WishlistModal.jsx    ← 폴더 선택 모달
│   ├── api/
│   │   ├── axiosInstance.js     ← 공통 Axios 설정
│   │   ├── travelApi.js         ← 서버 캐시 경유 KTO 데이터
│   │   ├── travelInfoApi.js     ← KTO 상세 정보 직접 호출
│   │   ├── weatherApi.js        ← 날씨 + 위치 정보
│   │   ├── authApi.js
│   │   ├── commentApi.js
│   │   ├── wishlistApi.js
│   │   └── boardApi.js
│   └── store/
│       ├── useAuthStore.js      ← 인증 상태 (localStorage 기반)
│       ├── useExploreStore.js   ← 필터/페이지/검색 상태
│       └── useWishlistStore.js  ← 위시리스트 중앙 관리
└── server/
    └── index.js                 ← Express 단일 파일 서버
```

---

## 라우팅 구조

```
/                    → Home
/explore             → Explore (여행지 탐색)
/explore/:contentId  → TravelDetail (여행지 상세)
/festivals           → Festivals (축제 목록)
/mypage              → MyPage (위시리스트) [로그인 필요]
/settings            → Settings (프로필 설정) [로그인 필요]
/login
/signup
/forgot-password
```

---

## 페이지별 기능 상세

### Home (`src/pages/Home.jsx`)

- **Hero 배너**: 5초마다 자동 슬라이드 (KTO 이미지 캐시 활용)
- **날씨 위젯**: Geolocation으로 현재 위치 날씨 실시간 표시
- **지역 기반 추천 카드**: 현재 위치 기반 인근 여행지 (화살표로 셔플)
- **슬롯머신**: 버튼 클릭 시 날씨 키워드 기반 랜덤 여행지 뽑기 (15장 스핀 애니메이션)
- **축제 트렌딩 카드**: 최근 축제 3개 미리보기

### Explore (`src/pages/Explore.jsx`)

- **지역 필터**: 전국 + 16개 시도 멀티셀렉트
- **테마 필터**: 관광지 / 문화시설 / 축제 / 여행코스 / 레포츠 / 숙박 / 쇼핑 / 음식점 (8종)
- **키워드 검색**: Header에서 검색 후 스토어 상태로 전달
- **페이지네이션**: 10개씩, 직접 페이지 번호 입력 지원
- **찜 기능**: 하트 버튼 클릭 → 폴더 선택 모달 → 저장 / 이미지 더블클릭으로도 찜 가능
- **스크롤 복원**: 상세 페이지 이동 후 돌아올 때 스크롤 위치 복원 (`useExploreStore.js` 모듈 레벨 변수)

### TravelDetail (`src/pages/TravelDetail.jsx`)

- **헤더 이미지 + 타입 배지 + 위시리스트 하트 버튼**
- **상세 설명**: KTO API `overview` 필드 HTML 직접 렌더링
- **이미지 갤러리**: KTO 추가 이미지 2열 그리드
- **정보 패널** (`system.env`): 전화번호, 주소, 개방시간, 휴무일, 주차, 입장료, 홈페이지, 축제 기간
- **카카오 지도**: `react-kakao-maps-sdk` 임베드, 클릭 시 카카오맵 앱으로 연결
- **코멘트 시스템**: 작성 / 수정 / 삭제 / 좋아요 (낙관적 업데이트 적용)

### Festivals (`src/pages/Festivals.jsx`)

- 8개씩 그리드 페이지네이션
- 정렬: 기본 / 날짜 오름차순 / 내림차순
- **날짜 하이드레이션**: 날짜 정보가 누락된 항목은 `getDetailIntro` API 추가 호출로 보완

### MyPage (`src/pages/MyPage.jsx`)

- **폴더 시스템**: 생성 / 삭제, 폴더별 아이템 카운트
- **필터**: 전체 / 미분류 / 폴더별
- **정렬**: 최신순 / 이름 A-Z / Z-A
- **아이템 이동**: 인라인 폴더 선택 오버레이
- **동기화 상태**: Sync_Active 표시기 (실시간 서버 동기화 시각화)

---

## 백엔드 (`server/index.js`)

### 서버 사이드 캐싱 전략

서버 시작 시 KTO API에서 **60,000개** 여행지 데이터를 한 번에 가져와 메모리에 캐시합니다.  
이후 모든 필터 / 검색 / 지역 요청은 캐시에서 처리합니다.

```
allTravelItems  ← 전체 여행지 (60,000개)
mainTopImages   ← 홈 슬라이더용 상위 100개 (이미지 있는 항목)
festivalItems   ← 축제 데이터 (날짜 정보 포함 병합)
```

### API 엔드포인트

| Method | Endpoint | 기능 |
|--------|----------|------|
| POST | `/api/signup` | 회원가입 (bcrypt 해시) |
| POST | `/api/login` | 로그인 + JWT 발급 (1일 만료) |
| GET | `/api/travel/top-images` | 홈 슬라이더 이미지 (캐시 100개) |
| GET | `/api/travel/near` | 지역 코드 기반 인근 여행지 30개 |
| GET | `/api/travel/festivals` | 축제 목록 (페이지네이션 + 정렬) |
| GET | `/api/travel/random` | 관광지(12) 무작위 30개 |
| GET | `/api/travel` | 전체 탐색 (지역 / 테마 / 키워드 필터 + 페이지네이션) |
| GET | `/api/comments/:contentId` | 코멘트 목록 조회 |
| POST | `/api/comments` | 코멘트 작성 [인증 필요] |
| POST | `/api/comments/:id/like` | 코멘트 좋아요 (중복 방지) [인증 필요] |
| GET | `/api/wishlist/details` | 위시리스트 + 캐시 데이터 병합 반환 [인증 필요] |
| POST | `/api/wishlist/toggle` | 위시리스트 추가 / 삭제 토글 [인증 필요] |
| GET | `/api/wishlist/folders` | 폴더 목록 조회 [인증 필요] |
| POST | `/api/wishlist/folders` | 폴더 생성 [인증 필요] |
| DELETE | `/api/wishlist/folders/:id` | 폴더 삭제 (아이템은 미분류로 이동) [인증 필요] |
| PUT | `/api/wishlist/move` | 아이템 폴더 이동 [인증 필요] |

### DB 테이블

| 테이블 | 역할 |
|--------|------|
| `users` | 회원 정보 (email, password bcrypt hash, name, profile_img) |
| `comments` | 여행지별 코멘트 (content_id 인덱스) |
| `comment_likes` | 코멘트 좋아요 (user_id + comment_id unique 제약) |
| `wishlists` | 위시리스트 항목 (user_id + content_id unique 제약) |
| `wishlist_folders` | 위시리스트 폴더 (users 외래키, CASCADE 삭제) |

> 테이블은 서버 시작 시 `CREATE TABLE IF NOT EXISTS`로 자동 생성됩니다.

---

## 상태 관리 (Zustand)

### `useAuthStore`
- JWT 토큰 + 유저 정보를 `localStorage`에 영속화
- `login` / `logout` / `setUser` / `updateUser` 액션 제공
- 로그아웃 시 `trip_user`, `trip_token` 키 모두 제거

### `useExploreStore`
- 필터(지역 / 테마 / 키워드) / 현재 페이지 / 목록 / 로딩 상태 중앙 관리
- `selectedRegions` (UI 선택) vs `appliedRegions` (실제 적용) 분리 — 필터 미리 고르고 한 번에 적용
- 스크롤 위치는 스토어 외부 모듈 레벨 변수(`exploreScrollY`)로 관리 (리렌더 최소화)

### `useWishlistStore`
- `wishlistItems` (상세 데이터) + `wishlistIds` (Set) + `folders` 통합 관리
- `syncWithServer()` 단일 함수로 서버 상태를 항상 진실 소스(source of truth)로 유지
- `initWishlist()`: 이미 초기화된 경우 재호출 방지 (`initialized` 플래그)

---

## 디자인 시스템

- **테마**: "Code Terminal" — 터미널 / IDE 감성의 폰트, 명령어식 레이블  
  (`COMMIT_COMMENT.SH`, `RUN_FILTER.SH`, `LOGOUT_SYSTEM`, `mkdir_new_folder.sh` 등)
- **반응형**: 데스크탑 사이드바 (접기/펼치기 토글) + 모바일 하단 탭 네비게이션
- **아이콘**: Google Material Symbols
- **애니메이션**: 하트 버블, 슬롯머신 스핀, 축제 아이콘 폭죽 스파크

---

## 주요 기술적 포인트

1. **서버 사이드 캐싱**: KTO API 요청 횟수를 최소화하기 위해 서버 시작 시 대용량 데이터를 메모리 캐시. 클라이언트는 자체 서버만 호출.

2. **날짜 하이드레이션**: 축제 날짜 누락 데이터를 클라이언트에서 추가 API로 보완 (`Festivals.jsx`).

3. **낙관적 업데이트**: 코멘트 좋아요 UI 즉시 반영 후 서버 응답 결과로 동기화, 실패 시 롤백 (`TravelDetail.jsx`).

4. **스크롤 복원**: Explore 페이지에서 상세 진입 후 돌아올 때 `useLayoutEffect`로 스크롤 위치 복원.

5. **지역 추론**: areaCode 코드 매핑 + addr1 텍스트 보조 매핑으로 Geolocation 기반 지역 필터링 정확도 향상 (`server/index.js` `/api/travel/near`).

6. **찜 이중 진입**: 카드 하트 버튼 클릭 + 이미지 더블클릭 두 가지 경로 지원, 첫 찜 시 폴더 선택 모달 표시.

7. **인증 보호**: 보호 경로(`/mypage`, `/settings`)는 사이드바 클릭 시 로그인 유도, 페이지 진입 시 `navigate('/login')` 리다이렉트.
