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
- **현상태**: 위시리스트 폴더 관리 시스템 및 전용 모달 인터페이스 구현 완료. 서버 사이드 인메모리 캐싱을 통한 성능 최적화 및 429 에러 해결. 메인 페이지 랜덤 뽑기 필터링 고도화(순수 관광지만 추출). 전국 여행지 탐색 및 상세 페이지 통합 완료.

### 1.1 기술 스택 (Current)
- **Frontend**: React 19, Vite 8, Axios, Tailwind CSS v4, React Router DOM v7, Zustand
- **Backend**: Node.js (Express), MySQL (Local/AWS EC2), **Multer** (이미지 처리), **JWT** (인증)
- **Infrastructure**: Nginx (Reverse Proxy), PM2, Vite Proxy, 서버 사이드 캐싱(In-memory Cache)
- **APIs**: 
    - 한국관광공사 KorService2 (TourAPI 4.0) — **관광지(12)**, 문화시설(14), 축제(15) 등 상세 데이터
    - wishlistApi.js — **폴더 기반 위시리스트 관리** 및 아이템 이동 시스템
    - 카카오 맵 API — 여행지 위치 시각화 및 SDK 동적 로딩
    - Open-Meteo & Nominatim — 실시간 날씨 및 좌표 기반 지역명 변환

### 1.2 개발 환경 설정 (Environment Variables)
프로젝트 구동을 위해 다음 환경 변수가 설정되어야 합니다.

```text
2_Code_Trip/
├── server/                       # Express Backend
├── src/
│   ├── api/
│   │   ├── weatherApi.js         # 실시간 날씨, 역지오코딩 ({ name, state } 반환)
│   │   ├── travelApi.js          # 관광공사 API 연동 (서버 캐시 활용)
│   │   ├── commentApi.js         # 여행지 댓글 API
│   │   ├── wishlistApi.js        # 폴더 및 위시리스트 관리
│   ├── store/
│   │   ├── useAuthStore.js       # 사용자 인증 스토어
│   │   ├── useExploreStore.js    # 여행 탐색/필터 상태 스토어
│   │   └── useWishlistStore.js   # 위시리스트 및 폴더 관리 스토어
│   ├── components/               
│   │   ├── WishlistModal.jsx     # 폴더 선택 및 생성 모달
```

---
## 2. 주요 기능 및 아키텍처

### 2.1 위시리스트 폴더 시스템 (Folder-based Wishlist)
- **폴더 선택 모달**: 하트 버튼 클릭 시 저장할 폴더를 선택하거나 즉석에서 새 폴더를 생성할 수 있는 원스톱 워크플로우.
- **분류 관리**: '미분류' 기본 저장소와 사용자 정의 폴더 간의 자유로운 아이템 이동(`moveItem`) 지원.
- **데이터 무결성**: MySQL 외래 키 제약 조건을 활용한 폴더 삭제 시 아이템 자동 미분류 처리.

### 2.2 고성능 데이터 캐싱 및 필터링
- **Server-side Caching**: 서버 기동 시 관광공사 API 6만 건 데이터를 메모리에 적재하여 외부 API 호출 최소화 및 응답 속도 ms 단위 단축.
- **정밀 필터링**: 메인 페이지 랜덤 뽑기 시 숙박/음식점 등을 배제하고 **순수 관광지(`contentTypeId: 12`)**만 무작위 추출하여 여행 서비스로서의 정체성 강화.

### 2.3 지능형 어댑티브 UX
- **Geolocation & Nominatim**: 사용자 좌표를 한국어 시/도/구 단위 지역명으로 변환하여 가장 가까운 명소 실시간 추천.
- **Weather-based Random Pick**: 현재 날씨 상태(Sunny, Rainy 등)에 최적화된 키워드를 추출하여 여행지를 추천하는 슬롯머신 UI.

---

*최종 업데이트: 2026-04-25 (위시리스트 폴더 시스템 완결 및 시스템 긴급 복구 완료)*
