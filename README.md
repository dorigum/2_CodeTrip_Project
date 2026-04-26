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
- **Travel Schedule**: 폴더 생성·편집 시 여행 시작일·종료일을 설정하고, 폴더 목록 및 메타데이터 패널에서 일정을 한눈에 확인. (`mkdir_new_folder.sh` / `edit_folder.sh` 인터페이스)
- **Folder Edit**: 이미 생성된 폴더의 이름과 여행 일정을 사후에 수정할 수 있는 편집 모달 제공. (`PUT /api/wishlist/folders/:id`)
- **Metadata Insight**: 각 폴더의 생성일, 최근 수정일, 여행 일정(`TRAVEL_DATE`)을 기술적인 레이아웃으로 확인.

### 🎰 Smart Recommendation (Slot Machine)
날씨와 위치 데이터를 기반으로 한 지능형 랜덤 추천 엔진입니다.
- **Weather-based Logic**: Sunny, Rainy 등 기상 상태에 최적화된 키워드 자동 추출.
- **Pure Node Filtering**: 숙박/식당을 배제하고 **순수 관광지(Type 12)** 노드만 정밀 추출.

### 🎡 Nationwide Festival Explorer
대한민국 곳곳에서 열리는 활기찬 축제 데이터를 탐색하고 날짜순으로 정렬하세요.
- **Smart Hydration**: 목록 API에서 날짜가 누락된 경우, 상세 정보를 실시간으로 조회하여 채워넣는 클라이언트 사이드 보정 기술 적용.
- **Dynamic Sorting**: '날짜 빠른순', '날짜 늦은순' 등 사용자 맞춤형 다중 정렬 시스템 제공.

### 🗺️ Region Filter with Correct Code Mapping
탐색 페이지의 지역 필터가 실제 TourAPI의 `areacode` 체계와 정확히 일치하도록 구현되어 있습니다.
- **Hardcoded REGIONS**: `ldongCode2`(행정동 10자리 코드) 대신 `areaBasedList2` 기준 18개 광역시도 코드(`'1'`~`'39'`)를 하드코딩하여 필터링 무결과 버그를 원천 차단.
- **Content Type Filter**: 메인 페이지 지역 기반 추천(`/api/travel/near`)에서 관광지(`12`)·문화시설(`14`)만 반환하여 추천 품질 향상.

### 🔐 Session Security
JWT 기반 인증과 세션 만료 감지 시스템이 통합되어 있습니다.
- **Auto Logout**: `axiosInstance` 응답 인터셉터에서 401 응답 감지 시 토큰 초기화 → 알림 → `/login` 리다이렉트 자동 수행.
- **Profile & Password**: Multer 기반 프로필 이미지 업로드(5MB 제한), `bcrypt` 비밀번호 변경, 이메일+이름 인증 기반 비밀번호 재설정.

### ⚡ High-Performance Architecture
대용량 공공데이터(TourAPI)를 다루는 기술적 자부심입니다.
- **Server-side Caching**: 6만 건 이상의 API 데이터를 서버 메모리에 적재하여 응답 속도를 ms 단위로 단축하고 **429 Too Many Requests** 에러를 완벽 차단.
- **$O(1)$ Lookup**: 위시리스트 포함 여부를 `Set` 자료구조로 관리하여 대규모 데이터에서도 지연 없는 UI 피드백 제공.

### 🧭 Navigation & Interactive Sidebar
프리미엄 인터랙션이 적용된 사이드바와 모바일 하단 네비게이션입니다.
- **Color Glow Animations**: 사이드바 각 메뉴마다 고유한 CSS `@keyframes` 글로우 애니메이션 적용 (Home 오렌지 바운스, Explore 파란색 나침반 회전, Festivals 핑크↔앰버 교차, Wishlist 레드 심장박동, Settings 에메랄드 쉐이크, Info 앰버 전구 깜빡임).
- **Info Submenu**: Info 버튼 클릭 시 슬라이드 서브메뉴 토글. 공공 와이파이(`wififree.kr`), 안전여행(`safestay.visitkorea.or.kr`), 프로젝트 소개(`/info`) 3종 제공.
- **Mobile Bottom Nav**: 화면 축소 시 하단 고정 네비게이션으로 자동 전환.

---

## 📂 Project Structure

```text
2_Code_Trip/
├── server/               # Express Backend (Caching, JWT, Multer)
│   ├── index.js          # Core API Logic
│   └── debug_wishlist.cjs # DB Validation CLI Utility
├── src/
│   ├── api/              # Domain-specific Service Layer
│   ├── store/            # Zustand Global State (Auth, Explore, Wishlist)
│   ├── components/       # Premium UI Components (Layout, Modals)
│   └── pages/            # Home, Explore, Festivals, TravelDetail,
│                         # MyPage, Info, Login, SignUp,
│                         # ForgotPassword, Settings
└── 2_Project_Documents/  # Documentation (Specification, Changelog, Architecture)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+)
- Korea Tourism Organization API Key

### Installation
1. Repository 클론
   ```bash
   git clone https://github.com/your-repo/2_Code_Trip.git
   ```
2. 종속성 설치
   ```bash
   npm install && cd server && npm install
   ```
3. 환경 변수 설정 (`server/.env`)
   ```text
   DB_HOST=127.0.0.1
   DB_USER=your_user
   DB_PASS=your_password
   JWT_SECRET=your_secret
   ```
4. 실행
   ```bash
   # Backend
   node index.js
   # Frontend
   npm run dev
   ```

---

## 📜 Documentation
더 자세한 기술 설계 및 변경 이력은 다음 문서에서 확인하실 수 있습니다.
- [Project Specification (상세 명세서)](2_Project_Documents/Project_Specification.md)
- [Changelog (수정 로그)](2_Project_Documents/CHANGELOG.md)

---

## 🔐 Environment Variables Reference
프로젝트 구동을 위해 필요한 `.env` 파일의 구조입니다. (보안을 위해 실제 키 값은 제외되었습니다.)

### 🔹 Root Directory (`/.env`)
Vite 프론트엔드 환경 설정을 위한 변수들입니다.
```text
VITE_API_URL=http://localhost:8080/api
VITE_KAKAO_MAP_API_KEY=YOUR_KAKAO_MAP_API_KEY
VITE_TRAVEL_INFO_API_KEY=YOUR_TOUR_API_KEY
VITE_GALLERY_API_KEY=YOUR_GALLERY_API_KEY
VITE_API_BASE_URL=https://apis.data.go.kr/B551011
VITE_TRAVEL_INFO_API_URL=KorService2
```

### 🔸 Server Directory (`/server/.env`)
Express 백엔드 및 데이터베이스 연결을 위한 변수들입니다.
```text
PORT=8080
JWT_SECRET=YOUR_JWT_SECRET_KEY
DB_HOST=127.0.0.1
DB_USER=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=codetrip
TRAVEL_INFO_API_KEY=YOUR_TOUR_API_KEY
```

---
*Last Updated: 2026-04-26 | "Keep coding, Keep traveling."*
