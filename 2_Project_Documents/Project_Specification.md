
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
- **Backend**: Node.js (Express), MySQL (AWS EC2 배포), **Multer** (이미지 처리)
- **Infrastructure**: Nginx (Reverse Proxy), PM2, Vite Proxy (CORS 및 백엔드 통신용), 정적 파일 서빙(`/uploads`)
- **APIs**: 
    - 한국관광공사 KorService2 (TourAPI 4.0) — 전국 여행지 데이터 및 상세 정보
    - commentApi.js — 여행지 댓글 및 사용자 피드백 관리
    - 카카오 맵 API — 여행지 위치 시각화 (`react-kakao-maps-sdk`)
    - 한국관광공사 관광사진정보서비스 (PhotoGalleryService1) — 메인 슬라이더 이미지, 날씨 기반 추천, 축제 목록
    - Open-Meteo API (실시간 날씨 정보)
    - Nominatim API (무료 역지오코딩 — 좌표 → 한국어 시/도명 변환)
- **Linting**: ESLint 9.39.4

### 1.2 개발 환경 설정 (Environment Variables)
프로젝트 구동을 위해 다음 환경 변수가 설정되어야 합니다.

```text
2_Code_Trip/
├── server/                       # Express Backend
├── src/
│   ├── api/
│   │   ├── weatherApi.js         # 실시간 날씨, 역지오코딩 ({ name, state } 반환)
│   │   ├── travelApi.js          # 관광공사 API 연동
│   │   ├── commentApi.js         # 여행지 댓글 API
│   │   ├── travelInfoApi.js      # 전국 여행지 상세 정보
│   │   ├── axiosInstance.js
│   │   ├── boardApi.js
│   │   └── mockData.js
│   ├── store/
│   │   ├── useAuthStore.js       # 사용자 인증 스토어
│   │   └── useExploreStore.js    # 여행 탐색/필터 상태 스토어
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

### Frontend (`.env`)
- `VITE_GALLERY_API_KEY`: 한국관광공사 API 인증키 (Encoding/Decoding 확인 필요)
### Backend (`server/.env`)
- `DB_HOST`: 데이터베이스 호스트 주소 (로컬: `127.0.0.1`)
- `DB_USER`: 데이터베이스 사용자명
- `DB_PASSWORD`: 데이터베이스 비밀번호
- `DB_NAME`: 사용할 데이터베이스명 (`codetrip`)
- `JWT_SECRET`: JWT 서명용 비밀 키 (암호화 알고리즘에 사용)
- `PORT`: Express 서버 포트 (기본값: `8080`)


---
## 2. 시스템 상세 설계

### 2.0 프로젝트 핵심 아키텍처 (Core Architecture)

본 프로젝트는 유지보수성과 확장성을 극대화하기 위해 다음과 같은 설계 원칙을 따릅니다.

1. **전역 상태 관리의 최적화 (Zustand)**:
   - 복잡한 `Context API` 대신 가볍고 빠른 `Zustand`를 도입하여 보일러플레이트를 최소화함.
   - `useAuthStore`를 통해 로그인 상태, 유저 정보, 세션 유지(updateUser) 로직을 캡슐화하여 관리함.

2. **도메인 기반 API 레이어 분리 (Service Layer Pattern)**:
   - 모든 API 통신은 `src/api` 내의 도메인별 파일(`authApi`, `travelInfoApi`, `weatherApi` 등)로 분리되어 컴포넌트 로직과 비즈니스 로직을 엄격히 분리함.
   - `axiosInstance.js`를 통해 공통 설정(BaseURL, Timeout 등)을 관리하여 통신 일관성 확보.

3. **중첩 라우팅 기반 레이아웃 구조 (Nested Routing)**:
   - `App.jsx`를 레이아웃 컨트롤러로 활용하고 `react-router-dom`의 `<Outlet />`을 사용하여 페이지 전환 시 헤더, 사이드바, 푸터가 재렌더링되지 않도록 최적화.

4. **사용자 경험 중심의 어댑티브 UX (Adaptive UX)**:
   - Geolocation 및 역지오코딩을 결합하여 사용자의 위치에 따라 동적으로 콘텐츠가 개인화되는 지능형 추천 시스템 및 상세 위치 자동 감지 연동 구축.
   - 반투명 블러 디자인(Glassmorphism) 및 코드 바이브 테마 적용.

### 2.1 레이아웃 및 라우팅 구조
- **App Layout**: `App.jsx`를 최상위 레이아웃 베이스로 사용하며, 독립된 공통 컴포넌트들을 조합하여 구조를 형성함.
    - **Header**: 최상단 고정 헤더.
    - **SideBar**: 데스크탑 좌측 사이드 네비게이션 및 모바일 하단 네비게이션 통합.
    - **Footer**: 하단 정보 영역.
- **Nested Routing**: `react-router-dom`의 `<Outlet />`을 활용하여 페이지 전환 시 공통 요소를 재렌더링하지 않고 컨텐츠만 교체.
    - `/`: `Home.jsx` (인텔리전트 추천 시스템 탑재, MainTopImg 슬라이더 및 날씨 기반 다중 키워드 랜덤 추천)
    - `/explore`: `Explore.jsx` (전국 여행지 필터링 리스트)
    - `/explore/:contentId`: `TravelDetail.jsx` (여행지 상세 정보 및 지도)
    - `/settings`: `Settings.jsx` (프로필 및 보안 관리)
    - `/login` / `/signup`: 사용자 인증

### 2.1.1 네트워크 및 보안 최적화 (Network & Security)
- **Vite Proxy (CORS 해결)**:
  - 한국관광공사 API의 CORS 제한을 우회하기 위해 `vite.config.js`에서 프록시 서버 설정.
  - 클라이언트에서 `/kto-tour-api`로 요청 시 서버 측에서 `https://apis.data.go.kr/B551011/KorService1` (또는 `/B551011` 공공데이터) 및 `/api` (백엔드)로 통신 대행 적용.
- **Axios Instance**:
  - `axiosInstance.js`를 통해 베이스 URL 및 공통 헤더를 관리하여 코드 중복 제거 및 유지보수 용이성 확보.
- **Multer Filter**: 업로드 파일 형식을 이미지로 제한하고 파일 용량(5MB) 관리.

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

### 2.5 데이터베이스 설계 (Database Schema)

시스템의 영속성을 보장하기 위해 설계된 MySQL 테이블 구조입니다.

#### users (사용자 계정 테이블)
| 컬럼명 | 타입 | 제약 조건 | 설명 |
|---|---|---|---|
| `id` | INT | PK, Auto Increment | 고유 식별자 |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | 사용자 이메일 (로그인 ID) |
| `password` | VARCHAR(255) | NOT NULL | 해싱된 비밀번호 (bcrypt) |
| `name` | VARCHAR(100) | NOT NULL | 사용자 이름/닉네임 |
| `profile_img` | VARCHAR(255) | | 프로필 이미지 URL. VARCHAR(255)로 최적화. |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 계정 생성 일시 |

### 2.6 사용자 인증 시스템 (Authentication)
사용자의 위시리스트(하트 정보) 관리를 위한 기술적 검토 및 향후 방향성입니다.

- **방식 A: Local Storage (로컬 저장)**
    - 장점: 빠른 구현, 서버 비용 전무, 비로그인 상태 유지 가능.
    - 단점: 브라우저/기기간 데이터 동기화 불가, 캐시 삭제 시 데이터 소실 위험.
- **방식 B: Database (서버 저장 - 권장)**
    - **채택 이유**: Code Trip의 "영속성(Persistence) 있는 스마트 가이드" 컨셉에 부합. 기기 상관없는 데이터 유지 및 향후 개인화 추천 엔진의 기초 데이터로 활용 가능.
    - **기술 스택**: 프로젝트 내 구축된 Express 서버 및 MySQL 연동 활용.

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
- **전역 상태 관리 (`useAuthStore.js` - Zustand)**:
    - `isLoggedIn`, `user` 정보를 Zustand 스토어로 관리.
    - 로그인/로그아웃 액션 및 로컬 스토리지를 활용한 세션 유지 로직이 스토어 내부에 캡슐화됨.
- **회원가입/로그인 API (REST)**:
    - **Security**: `bcrypt`를 통한 비밀번호 단방향 해싱 저장.
    - **Session**: `JWT`를 활용한 토큰 기반 인증 및 1일 만료 세션 적용.
    - **API Endpoint**: `POST /api/signup`, `POST /api/login`.

### 2.7 데이터 저장 및 위시리스트 아키텍처 제안
사용자의 위시리스트(하트 정보) 관리를 위한 기술적 검토 및 향후 방향성입니다.

- **방식 A: Local Storage (로컬 저장)**
    - 장점: 빠른 구현, 서버 비용 전무, 비로그인 상태 유지 가능.
    - 단점: 브라우저/기기간 데이터 동기화 불가, 캐시 삭제 시 데이터 소실 위험.
- **방식 B: Database (서버 저장 - 권장)**
    - **채택 이유**: Code Trip의 "영속성(Persistence) 있는 스마트 가이드" 컨셉에 부합. 기기 상관없는 데이터 유지 및 향후 개인화 추천 엔진의 기초 데이터로 활용 가능.
    - **기술 스택**: 프로젝트 내 구축된 Express 서버 및 MySQL 연동 활용.

### 2.8 향후 구현 로드맵 (Next Steps)
1. **위시리스트 테이블 설계**: MySQL 내 `wishlist` 테이블(User_ID, Node_ID, Title, Image_URL 등) 생성.
2. **API 엔드포인트 구축**: Express 기반의 CRUD API(POST/GET/DELETE) 개발.
3. **인터랙션 연동**: Explore 페이지 하트 클릭 시 실시간 API 호출 및 MyPage 동기화.

### 2.9 UI/UX 디자인 시스템
- **Glassmorphism**: 헤더, 버튼(`EXPLORE_NOW`), 정보 카드 등에 반투명 블러 효과(`backdrop-blur`)를 적용하여 현대적인 비주얼 구현.
- **Point Color**: 주요 액션 버튼(EXPLORE_NOW)에 청록색(Primary) 텍스트를 적용하여 브랜드 아이덴티티 및 가독성 확보.
- **Code Vibe Style**: 데이터 표시 영역에 주석(`// Currently Rendering`) 스타일과 모노스페이스 폰트를 혼용하여 브랜드 정체성 강조.
- **Responsive Aspect Ratio**: MainTopImg 섹션에 `aspect-[21/6]` 비율을 적용하여 슬림하고 세련된 레이아웃 유지.
- **Spin Overlay**: Random Pick 카드의 슬롯머신 작동 중 이미지 위 반투명 오버레이 + `"여행지 뽑는 중..."` `animate-pulse` 텍스트로 진행 상태 시각화.
- **Adaptive SideBar**:
  - 메뉴가 펼쳐진 상태에서만 로고 홈 링크 활성화 로직 적용.
  - 사용자 프로필 로딩 실패 시 자동 Fallback 처리.
- **Interactive Home UI**: 
  - **슬롯머신 시스템**: 주사위 버튼 클릭 시 고속 애니메이션(80ms 간격) 후 최종 결과 노출. `hasPicked` 상태를 활용하여 결과 노출 전까지 텍스트 동기화를 차단하고, 초기 로딩 시의 데이터 번쩍거림(Flickering) 현상을 완벽히 해결함.
  - **동적 추천 로직**: 지역 기반 명소(Near Me) 카드에 셔플 알고리즘을 적용하여 매 새로고침 시마다 무작위로 새로운 장소를 추천하도록 설계.
  - **가이드 오버레이**: 사용자가 직접 동작을 수행하기 전까지 슬롯머신 카드에 블러 효과 및 안내 문구("주사위를 눌러서 여행지를 뽑아보세요!")를 오버레이하여 직관성을 높임.
  - 모든 추천 카드에 캡슐형 상세 보기(`View_Detail`) 버튼 연동.

- **카드 공통 디자인 패턴**:
	- 배경: `bg-surface-container-lowest`, 패딩: `p-8`, 모서리: `rounded-xl`, 테두리: `border border-outline-variant/10`
	- 헤더: 라벨(작은 대문자) + 제목 + 우측 아이콘 버튼
	- 코드 블록: `// Comment` 스타일의 현재 상태 설명 텍스트
	- 이미지: `h-40` 고정 높이, `object-cover`, hover 시 `scale-105`
	- 로딩: `absolute inset-0` 반투명 스피너 오버레이

### 2.10 여행 탐색 및 상세 시스템 (Explore & Detail)
- **데이터 페칭**: `KorService2` 기반의 대용량 관광 데이터 핸들링.
- **이미지 정규화**: `originimgurl`, `firstimage` 등 다중 필드 매핑 및 HTTPS 보안 적용.
- **지도 시스템**: 수동 SDK 로딩 기법을 통한 카카오 맵 초기화 안정성 확보.

### 2.11 사용자 관리 및 보안 (Account & Security)
- **Profile System**: 닉네임 수정 및 다중(파일/URL) 이미지 업로드 환경 구축.
- **Credential Security**: `bcrypt` 암호화 및 JWT 토큰 기반의 수정 권한 제어.
- **Database Schema**: `users.profile_img` 컬럼을 `VARCHAR(255)`로 최적화하여 관리 효율성 확보.


*최종 업데이트: 2026.04.23 (사용자 관리 및 메인/상세 시스템 최종 완결)*

---
## 9. 향후 개발 계획

### 현시점 개발 현황
- **로그인 페이지 구현**: `AuthContext`를 통한 전역 사용자 상태 관리
- **마이페이지 구현**: 북마크(즐겨찾기) 리스트 연동
- **지도 API 연동**: 여행지 상세 페이지에 위치 마커 표시

| 구현 기능           | 상태  |
| --------------- | --- |
| 로그인/회원가입 페이지 구현 | ✅완료 |
| 마이페이지(위시리스트) 구현 | ✅완료 |
| 지도 API 연동       | ✅완료 |
| 상세 페이지 확장 및 댓글 시스템 | ✅완료 |
| Zustand 기반 탐색 상태 관리 | ✅완료 |
| 메인 슬롯머신 상세 연동 수정 | ✅완료 |
| 모바일 하단 네비게이션 복구 | ✅완료 |
| 사이드바 동적 애니메이션 구현 | ✅완료 |
| 로그인 'Remember Me' 기능 | ✅완료 |
| 비밀번호 재설정 시스템 | ✅완료 |
| 페이지 접근 권한 보안 설정 | ✅완료 |
| 탐색 페이지 하트 인터랙션 및 더블클릭 | ✅완료 |
| 실제 DB 기반 위시리스트 CRUD | 💬진행 중 |
| 스마트 검색 엔진 고도화 | 💬진행 중 |
| 사용자 정보 수정 로직 보완 | 💬진행 중 |

### 구현할 기능/수정 사항 메모
1. **여행지 상세 페이지 및 지도 API 연동 (강력 추천)**
	- 현재는 목록만 볼 수 있는데, 특정 여행지를 클릭했을 때 상세 정보를 보여주는 기능입니다.
	- 기능: 여행지에 대한 상세 설명, 개장 시간, 이용 요금 등을 표시.
	- 지도 연동: 카카오맵 또는 구글맵 API를 사용하여 여행지 위치를 마커로 표시
	- 가치: 실제 여행 계획을 세울 때 가장 필수적인 정보와 시각적 위치 확인을 제공합니다.
	
2. **스마트 검색 엔진 활성화**
	- 헤더의 검색창을 단순한 시각 요소에서 실제 기능으로 업그레이드합니다.
	- 기능: 검색어 입력 시 Home, Explore, Wishlist 어디서든 관련 여행지를 실시간으로 검색하여 결과 페이지로 이동
	- 고도화: "제주도 맛집", "강원도 서핑"과 같은 키워드 기반의 태그 검색 지원
	
3. **나만의 여행 코스 빌더 (Solar Compiler 컨셉)**
	- 위시리스트에 담은 장소들을 조합하여 하나의 "여행 코스"를 만드는 기능입니다.
	- 기능: 위시리스트에서 3~4곳을 선택하여 "코스 생성" 버튼을 누르면 이동 동선을 짜줌
	- 컨셉: 개발자가 코드를 빌드(Build)하고 배포(Deploy)하는 것처럼, 여행 코스를 "Trip_Build"하여 친구에게 공유하는 기능
	
4. **사용자 맞춤형 '환경 설정' 페이지 (Settings)**
	- 사용자의 취향을 반영할 수 있는 공간입니다.
	- 기능: 프로필 사진 수정, 닉네임 변경, 비밀번호 초기화
	- 테마: 다크 모드/라이트 모드 전환 기능을 추가하여 "Code Vibe"에 맞는 다크 테마 강화
	
5. **실제 데이터베이스 기반의 위시리스트 CRUD (진행 중)**
	- 지난번에 논의했던 대로, 목(Mock) 데이터가 아닌 실제 서버와 통신하는 기능을 완성하는 것입니다.
	- 기능: 하트 클릭 시 DB 저장 -> 새로고침해도 유지 -> 마이페이지에서 즉시 반영
	- 현재: 위시리스트가 마이페이지에 코드로 고정된(Mock) 데이터임(260422 작업 내역)
	- 목표: Explore 페이지에서 하트를 누르면 내 계정(MySQL)에 저장되고, 마이페이지를 열면 DB에서 내가 찜한 여행지만 불러오기
	
6. **사용자 프로필을 눌렀을 때 마이페이지로 이동**
	- 마이페이지를 어떻게 구성할 지 고민해보기
	- Settings -> UserInfo Edit로 명칭 변경
	- 사용자 정보 수정 페이지가 로그아웃 되어도 머물러있는 이슈 수정하기
	
7. **웹 페이지 로고 수정하기(크롬 상단 탭에서 보여지는 이미지)**

8. **웹 화면 크기를 줄였을 때(모바일 웹 환경일 때) 메뉴 탭이 하단에 생성되도록 추가**

9. **메인 페이지 두 번째 카드(슬롯머신) 상세 페이지 연동 이슈 해결**
	- 문제: 두 번째 카드에서 `VIEW_DETAIL` 클릭 시 `destination_not_found` 오류 발생 (ID 체계 불일치).
	- 원인: `PhotoGalleryService1`의 `galContentId`와 `KorService2`의 `contentid` 간의 호환성 문제.
	- 해결: 데이터 소스를 `searchKeywordPlaces` (관광지 정보 API)로 통일하고 필드명을 첫 번째 카드와 동일하게 (`contentid`, `title`, `firstimage`) 정규화함.
	- 기대 효과: 슬롯머신으로 뽑힌 여행지에서도 상세 정보를 정상적으로 열람 가능. (429 에러 해제 후 검증 예정)
	
10. **(회원인 경우)마이페이지에서 본인이 작성한 여행 게시글이나 댓글을 조회할 수 있는 기능**
11. **관리자/사용자로 분리해서 관리자가 특정 글을 직접 삭제할 수 있는 권한 부여**
12. **푸터 오른쪽 하단 메뉴에 Info 페이지 추가하기([한국관광공사 사이트 참고](https://korean.visitkorea.or.kr/common/info_guide.do))**
![[Pasted image 20260423174039.png]]

13. **여행지 정보 페이지에서 상단으로 바로 이동할 수 있는 top 버튼 추가하기**