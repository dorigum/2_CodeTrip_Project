# 🚀 CodeTrip: Premium Travel Curation for Developers

> **"Your travel, compiled into a perfect experience."**  
> CodeTrip은 개발자 감성의 프리미엄 디자인(Code Vibe)과 공공데이터 기반의 고성능 여행 정보 서비스를 결합한 현대적인 여행 큐레이션 플랫폼입니다.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-blue)](https://zustand-demo.pmnd.rs/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

## 🛠 Core Identity: "Code Vibe"
CodeTrip은 단순히 정보를 나열하는 게시판이 아닙니다. 우리는 개발자가 매일 마주하는 **IDE와 터미널의 미학**을 서비스 전반에 녹여냈습니다.
- **Terminal UI**: 폴더 관리 모달, 사이드바 메타데이터 섹션 등 기술적 감성이 묻어나는 인터페이스.
- **Syntax Highlight Colors**: `syntax-keyword`와 `font-mono`를 활용한 코드 스타일의 포인트 디자인.
- **Adaptive UX**: 사용자의 현재 좌표와 실시간 날씨를 분석하여 가장 적합한 여행 노드를 추천합니다.

---

## ✨ Key Features

### 📂 Integrated Wishlist & Folder System
단순한 '찜'을 넘어, 나만의 여행 테마별로 폴더를 생성하고 관리하세요.
- **Terminal Style Modal**: `save_to_folder.sh` 컨셉의 프리미엄 폴더 선택 인터페이스.
- **Real-time Sync**: Zustand 기반 전역 상태 관리로 어느 페이지에서든 즉각적인 하트(찜) 동기화.
- **Travel Schedule**: 폴더 생성·편집 시 여행 시작일·종료일을 설정하고, 폴더 목록 및 메타데이터 패널에서 일정을 한눈에 확인.
- **Folder Notes & Checklist**: 폴더별로 여행 준비물 체크리스트와 자유 메모를 작성할 수 있는 기능 추가. (2026.04.27 추가)
- **TRAVEL_STATS Widget**: MyPage 사이드바에 전체 위시리스트 수·폴더 수·미분류 수·최다 아이템 폴더를 요약 표시하는 통계 위젯. 추가 API 없이 Zustand 상태를 `useMemo`로 파생 계산.
- **Timezone Integrity**: 로컬 타임존 오프셋을 보정한 문자열 기반 날짜 처리로 데이터 정합성 유지.

### 📝 Markdown-Powered Community (Board)
- **Markdown Editor**: 개발자에게 익숙한 GFM(GitHub Flavored Markdown) 기반의 게시글 작성 에디터.
- **Community Interaction**: 게시글/댓글 좋아요(유저당 1회, `board_post_likes`·`board_comment_likes`), 태그 기반 여행지 검색 연동.
- **User Activity Dashboard**: 내가 작성한 글·댓글, 좋아요한 게시글(`LIKED POSTS` 탭)을 한눈에 관리하는 활동 로그 제공. (2026.04.27~28 추가)
- **Recently Viewed**: `MyActivity` 페이지 상단에 `recently_viewed.log` 섹션 고정 배치. 여행지 상세 방문 시 자동 저장(최대 10개). 탭 전환 무관하게 항상 표시. `localStorage` 기반, 추가 API 호출 없음.
- **Real-time Notifications**: 내 게시글에 댓글 작성 시 서버 사이드 알림 자동 생성. 헤더 알림 벨에서 읽음 처리·개별/일괄 삭제·게시글 바로가기 지원.

### 🎰 Smart Recommendation (Slot Machine)
날씨와 위치 데이터를 기반으로 한 지능형 랜덤 추천 엔진입니다.
- **Weather interpretation (WMO)**: Open-Meteo의 100여 개 코드를 맑음, 구름조금, 흐림, 안개 등으로 세밀하게 분석하여 추천 키워드 추출.
- **Pure Node Filtering**: 숙박/식당을 배제하고 순수 관광지(Type 12) 노드만 정밀 추출.
- **Personalized Spontaneous Recommendation**: 로그인 사용자는 저장된 관심지역 + 해당 지역 실시간 날씨를 결합한 맞춤 추천 API(`/api/travel/spontaneous`) 우선 호출. 관심지역 미설정 회원은 기본 지역으로 폴백, 비회원은 날씨 키워드 기반 전국 랜덤 미리보기 유지.
- **JMA Weather Model**: 일본기상청(JMA) 고해상도 모델 + `cloudcover`·`precipitation` 보정으로 "맑음 오판" 최소화. 15분 단위 실시간 갱신.

### 🎡 Nationwide Festival Explorer
대한민국 곳곳에서 열리는 활기찬 축제 데이터를 탐색하고 날짜순으로 정렬하세요.
- **Smart Hydration**: 목록에서 날짜가 누락된 경우 상세 정보를 실시간 조회하여 보정.
- **Server-side Sorting**: 대량의 데이터를 서버 캐시 기반으로 '날짜순', '최신순' 즉각 정렬 및 페이지네이션.

### 🗺️ Region Filter with Correct Code Mapping
- **Hardcoded REGIONS**: TourAPI의 areacode 체계와 100% 일치하도록 18개 광역시도 코드를 정밀 매핑.
- **Content Type Filter**: 관광지(12)·문화시설(14) 중심의 고품질 데이터 필터링.
- **Favorite Region Auto-Filter**: 로그인 시 Explore 진입 시점에 사용자가 Settings에서 저장한 관심지역을 자동 조회하여 필터 선적용. `MY_REGIONS.SH` 버튼으로 즉시 재적용, `RESET_ALL.SH` 버튼으로 전국 초기화 지원.
- **Recent Search Dropdown**: 헤더 검색창 포커스 시 최근 검색어(최대 5개) 드롭다운 표시. 개별 삭제 및 전체 삭제 지원. `localStorage` 기반 클라이언트 사이드 저장.

### 🔐 Session Security
- **JWT & Auto Logout**: 401 Unauthorized 감지 시 자동 토큰 초기화 및 로그인 리다이렉트.
- **Secure Profile**: Multer 기반 이미지 업로드(5MB 서버 제한) 및 Bcrypt 암호화 통신.
- **Client-side Image Compression**: 프로필 사진 업로드 전 Canvas API로 1MB 초과 이미지 자동 압축. JPEG quality 0.85부터 단계적 조정, 최대 해상도 1920px 유지.

### ⚡ High-Performance Architecture
- **Server-side Caching**: 6만 건 이상의 데이터를 서버 메모리에 적재하여 ms 단위의 고속 응답.
- **Proxy Circuit Breaker**: 외부 API 호출 시 429 에러 방지를 위한 프록시 캐싱 및 자동 차단 시스템 가동. (2026.04.27 추가)

### 🧭 Navigation & Hybrid Sidebar
- **Dynamic Submenu**: 사이드바 접힘 시 '플로팅 메뉴(Popover)', 펼침 시 '아코디언' 방식을 지능적으로 전환.
- **Transportation Hub**: KTX, SRT, 고속버스 예매 사이트(`TRANSPORT_BOOKING.EXE`) 연동. (2026.04.27 추가)

### 🗺️ Travel Detail & Kakao Maps
여행지 상세 페이지에서 풍부한 콘텐츠와 인터랙티브 지도 경험을 제공합니다.
- **Kakao Maps SDK**: 여행지 좌표 기반 인터랙티브 지도 표시 및 카카오맵 앱 길찾기 연동.
- **Image Gallery**: TourAPI 다중 이미지 갤러리 및 개요·상세 소개 정보 통합 제공.
- **Travel Comments**: 여행지별 독립 후기 댓글창 — 작성, 좋아요, 수정/삭제 지원.
- **Tag Cross Navigation**: 게시판 게시글의 여행지 태그(`TravelTagSearch`) 클릭 시 해당 여행지 상세 페이지로 즉시 이동.

### 🔑 Account Management
- **Profile Settings**: 닉네임·프로필 이미지 수정이 가능한 Settings 페이지 제공.
- **Favorite Regions**: Settings에서 최대 3개 관심지역 설정. Explore 자동 필터 및 메인 즉흥 추천에 연동.
- **Password Reset**: 등록된 이메일 기반 비밀번호 재설정 플로우(`ForgotPassword` 페이지) 지원.
- **SignUp / Login**: JWT 토큰 기반 인증으로 보호되는 회원가입 및 로그인 플로우.

---

## 📂 Project Structure

```text
2_Code_Trip/
├── server/               # Express Backend (Caching, JWT, Proxy, MySQL)
│   ├── index.js          # Server bootstrap & route mounting
│   ├── config/           # Env, DB pool, upload storage
│   ├── db/               # Schema initialization
│   ├── middleware/       # JWT auth helpers
│   ├── routes/           # Domain API routes
│   ├── services/         # TourAPI client & travel cache
│   └── uploads/          # Profile & Board Image Storage
├── src/
│   ├── api/              # Domain Services (Axios, Proxy)
│   ├── store/            # Global State (Zustand)
│   ├── components/       # Layouts, Modals, Markdown Editor
│   └── pages/            # Home, Explore, TravelDetail, Festivals,
│                         # Board, BoardDetail, BoardWrite, TravelTagSearch,
│                         # MyPage, MyActivity, Settings, Info,
│                         # Login, SignUp, ForgotPassword
├── Dockerfile.frontend   # 프론트엔드 Docker 이미지 (Multi-stage Build)
├── docker-compose.yml    # 컨테이너 오케스트레이션 (DB + Backend + Frontend)
├── nginx.conf            # Nginx 리버스 프록시 설정
└── 2_Project_Documents/  # Documentation (Architecture, Spec, Changelog)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)
- Korea Tourism Organization API Key

### Installation
1. Repository 클론: `git clone ...`
2. 종속성 설치: `npm install && cd server && npm install`
3. 원스톱 실행: `npm run dev:all` (Frontend + Backend 동시 구동)

---

## 📜 Documentation
- [Project Specification (상세 명세서)](2_Project_Documents/Project_Specification.md)
- [Changelog (수정 로그)](2_Project_Documents/CHANGELOG.md)

---

## 📑 Page Routes

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Home | 날씨 기반 추천, 지역 기반 추천, 슬롯머신 랜덤 뽑기, 축제 트렌딩 |
| `/explore` | Explore | 지역·테마 필터, 키워드 검색, 페이지네이션, 위시리스트 토글 |
| `/explore/:contentId` | TravelDetail | 여행지 상세정보, 카카오맵, 이미지 갤러리, 여행지 댓글 |
| `/festivals` | Festivals | 전국 축제 목록, 날짜순/최신순 정렬, 페이지네이션 |
| `/board` | Board | 게시판 목록, 키워드 검색 |
| `/board/write` | BoardWrite | GFM 마크다운 에디터, 여행지 태그 첨부, 저장/편집 |
| `/board/:id` | BoardDetail | 게시글 상세, 댓글, 태그 링크, 수정/삭제 |
| `/board/tag-search` | TravelTagSearch | 게시글 태그 기반 여행지 검색 |
| `/mypage` | MyPage | 위시리스트 폴더, 여행 일정, 노트/체크리스트 |
| `/my-activity` | MyActivity | 최근 본 여행지 고정 섹션 + 내 게시글·댓글·좋아요한 게시글 탭 대시보드 |
| `/settings` | Settings | 프로필 수정, 비밀번호 변경, 관심지역 설정 |
| `/info` | Info | 서비스 소개, 활용 데이터소스, 교통 예매 허브 |
| `/login` | Login | 로그인 |
| `/signup` | SignUp | 회원가입 |
| `/forgot-password` | ForgotPassword | 이메일 기반 비밀번호 재설정 |

---

## 🔐 Environment Variables Reference
프로젝트 구동을 위해 필요한 `.env` 파일의 구조입니다.

### 🔸 Server Directory (`/server/.env`)
```text
PORT=8080
JWT_SECRET=YOUR_SECRET_KEY
DB_HOST=127.0.0.1
DB_USER=YOUR_USER
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=codetrip
TRAVEL_INFO_API_KEY=YOUR_TOUR_API_KEY
```

### 🔹 Frontend Root Directory (`/.env`)
```text
VITE_API_URL=http://localhost:8080/api
VITE_KAKAO_MAP_API_KEY=YOUR_KAKAO_MAP_KEY
VITE_TRAVEL_INFO_API_KEY=YOUR_TOUR_API_KEY
```

---

## 🐳 Docker Deployment

`docker-compose.yml`로 MySQL, Express 백엔드, Nginx + React SPA 를 단일 명령으로 실행할 수 있습니다.

### 컨테이너 구성

| 서비스 | 기반 이미지 | 역할 |
|--------|------------|------|
| `db` | MySQL 8.0 | 데이터베이스 (볼륨 영속성) |
| `backend` | `server/Dockerfile` | Express API 서버 |
| `frontend` | `Dockerfile.frontend` | Nginx + React SPA (Multi-stage Build) |

### 실행 방법
```bash
# 전체 스택 빌드 및 실행
docker-compose up -d --build
```

### Nginx 프록시 구성 (`nginx.conf`)

| 경로 | 프록시 대상 | 용도 |
|------|------------|------|
| `/api/` | `http://backend:8080` | Express API |
| `/uploads/` | `http://backend:8080` | 프로필·게시판 이미지 |
| `/B551011/` | `https://apis.data.go.kr/B551011/` | 공공데이터 CORS 우회 |

- **gzip 압축**: CSS, JS, JSON, SVG 응답 자동 압축 적용.
- **SPA 라우팅**: `try_files $uri /index.html` 로 React Router 클라이언트 라우팅 지원.
- **프록시 타임아웃**: 120초 (서버 캐시 초기화 시간 확보).

---
*Last Updated: 2026-04-30 | "Keep coding, Keep traveling."*
