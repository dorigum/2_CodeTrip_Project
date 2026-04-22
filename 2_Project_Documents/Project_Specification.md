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
- **현상태**: 현대적인 디자인(Glassmorphism, Code Vibe 컨셉)의 여행 정보 서비스 및 게시판 시스템 구축 중. 메인 페이지 대규모 개편 완료(자동 슬라이더 및 날씨 추천 카드 분리).

### 1.1 기술 스택 (Current)
- **Frontend**: React 19, Vite 8, Axios, Tailwind CSS v4, React Router DOM v7
- **Backend**: Node.js (Express), MySQL (AWS EC2 배포)
- **Infrastructure**: Nginx (Reverse Proxy), PM2
- **APIs**: 
    - 한국관광공사 관광사진정보서비스 (PhotoGalleryService1)
    - Open-Meteo API (실시간 날씨 정보)
    - Nominatim API (무료 역지오코딩/지역명 변환)
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
- **Location Service**: 브라우저 Geolocation API를 통해 사용자 좌표를 획득하고, `Nominatim` 서비스를 통해 실제 지역명으로 변환.
- **Weather Service**: 획득된 좌표를 `weatherApi.js`로 전달하여 현지 실시간 날씨 정보 획득. 상태 코드에 따라 최적화된 **다중 키워드 배열** 매핑.
- **Random Recommendation**: 매핑된 키워드 중 하나를 랜덤 선택하여 관광공사 API 검색. 결과가 없을 경우 대체 키워드로 재시도하는 안정성 확보.
- **MainTopImg Auto-Slider**:
    - **배치 로딩**: `galleryList1` API를 사용하여 무작위 페이지에서 20장의 이미지를 선페칭(Pre-fetching).
    - **동적 순환**: 로컬 인덱스를 5초마다 업데이트하여 네트워크 대기 없는 부드러운 이미지 전환 구현.
    - **Fallback**: API 장애 시 자체 이미지 자산(`BACKUP_TOP_IMAGES`)으로 자동 전환.

### 2.3 관광 정보 시스템 (Tourist Information)
- **실시간 데이터 페칭**: `useCallback` 기반의 비동기 함수로 한국관광공사 API 호출 최적화.
- **검색 및 필터링**: `searchTerm` 상태를 활용하여 제목 및 촬영 장소 기준의 실시간 클라이언트 사이드 필터링 구현.

### 2.4 UI/UX 디자인 시스템
- **Glassmorphism**: 헤더, 버튼(`EXPLORE_NOW`), 정보 카드 등에 반투명 블러 효과(`backdrop-blur`)를 적용하여 현대적인 비주얼 구현.
- **Point Color**: 주요 액션 버튼(EXPLORE_NOW)에 청록색(Primary) 텍스트를 적용하여 브랜드 아이덴티티 및 가독성 확보.
- **Code Vibe Style**: 데이터 표시 영역에 주석(`// Currently Rendering`) 스타일과 모노스페이스 폰트를 혼용하여 브랜드 정체성 강조.
- **Responsive Aspect Ratio**: MainTopImg 섹션에 `aspect-[21/6]` 비율을 적용하여 슬림하고 세련된 레이아웃 유지.

---

## 8. 폴더 구조 (2026-04-22 기준)

```text
2_Code_Trip/
├── server/                       # Express Backend
├── src/
│   ├── api/
│   │   ├── weatherApi.js         # 실시간 날씨 및 지오코딩
│   │   ├── travelApi.js          # 관광공사 API 연동 (배치 로딩 및 재시도 로직)
│   │   ├── axiosInstance.js
│   │   ├── boardApi.js
│   │   └── mockData.js
│   ├── components/               # 공통 컴포넌트
│   │   ├── Layout/               # 레이아웃 관련 (Header, Footer, SideBar)
│   │   └── TravelPic.jsx         # 여행지 탐색 리스트
│   ├── pages/
│   │   ├── Home.jsx              # 메인 페이지 (MainTopImg 슬라이더 로직 포함)
│   ├── App.jsx                   # 레이아웃 베이스
│   ├── main.jsx                  # 라우팅 설정
│   └── index.css
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

---

*최종 업데이트: 2026-04-22*
