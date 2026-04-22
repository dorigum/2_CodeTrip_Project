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
- **현상태**: 현대적인 디자인(Glassmorphism, Code Vibe 컨셉)의 여행 정보 서비스 및 게시판 시스템 구축 중. 실시간 날씨 연동 완료.

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

### 2.1 레이아웃 및 라우팅 구조 (동일)
*(중략)*

### 2.2 실시간 날씨 및 위치 기반 추천 시스템
- **Location Service**: 브라우저 Geolocation API를 통해 사용자 좌표를 획득하고, `Nominatim` 서비스를 통해 실제 지역명으로 변환.
- **Weather Service**: 획득된 좌표를 `weatherApi.js`로 전달하여 현지 실시간 날씨 정보 획득.
- **Random Recommendation**: 현지 날씨 키워드에 최적화된 여행지 데이터를 관광공사 API에서 랜덤으로 추출하여 메인 Hero 섹션에 노출.

### 2.3 관광 정보 시스템 (Tourist Information)
- **실시간 데이터 페칭**: `useCallback` 기반의 비동기 함수로 한국관광공사 API 호출 최적화.
- **검색 및 필터링**: `searchTerm` 상태를 활용하여 제목 및 촬영 장소 기준의 실시간 클라이언트 사이드 필터링 구현.

---

## 3. 시스템 아키텍처 (동일)
*(중략 - 기존 아키텍처 내용 유지)*

---

## 8. 폴더 구조 (2026-04-22 기준)

```text
2_Code_Trip/
├── server/                       # Express Backend
├── src/
│   ├── api/
│   │   ├── weatherApi.js         # 실시간 날씨 데이터 통신 (신규)
│   │   ├── travelApi.js          # 관광공사 API 연동 모듈 (신규)
│   │   ├── axiosInstance.js
│   │   ├── boardApi.js
│   │   └── mockData.js
│   ├── components/               # 공통 컴포넌트 (Layout 삭제됨)
│   │   └── TravelPic.jsx         # 여행지 탐색 리스트 (이름 변경됨)
│   ├── pages/
│   │   ├── Home.jsx              # 메인 홈 페이지 (분리됨)
│   ├── App.jsx                   # 공통 레이아웃 (사이드바, 헤더, 푸터)
│   ├── main.jsx                  # 중첩 라우팅 설정
│   └── index.css
├── .env
└── 2_Project_Documents/
    ├── Project_Specification.md  # 현재 명세서
    ├── CHANGELOG.md              # 날짜별 변경 이력
```

---

## 9. 향후 계획

### 현시점 주요 과제
- **로그인 페이지 구현**: `AuthContext`를 통한 전역 사용자 상태 관리.
- **마이페이지 구현**: 북마크(즐겨찾기) 리스트 연동.
- **지도 API 연동**: 여행지 상세 페이지에 위치 마커 표시.

---

*최종 업데이트: 2026-04-22*
