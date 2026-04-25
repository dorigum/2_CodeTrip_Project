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
- **Dev Tools**: 
    - `debug_wishlist.cjs` — 위시리스트 DB 상태 즉석 검증 및 테이블 구조 확인용 CLI 유틸리티

### 1.2 개발 환경 설정 (Environment Variables)
프로젝트 구동을 위해 다음 환경 변수가 설정되어야 합니다.

```text
2_Code_Trip/
├── server/                       # Express Backend
│   ├── debug_wishlist.cjs        # DB 디버깅 스크립트
├── src/
│   ├── api/
│   │   ├── weatherApi.js         # 실시간 날씨, 역지오코딩 ({ name, state } 반환)
│   │   ├── travelApi.js          # 관광공사 API 연동 (서버 캐시 활용)
│   │   ├── commentApi.js         # 여행지 댓글 API
│   │   ├── wishlistApi.js        # 폴더 및 위시리스트 관리
│   ├── store/
│   │   ├── useAuthStore.js       # 사용자 인증 스토어
│   │   ├── useExploreStore.js    # 여행 탐색/필터 상태 스토어
│   │   └── useWishlistStore.js   # 위시리스트(아이템+폴더) 통합 동기화 스토어
│   ├── components/               
│   │   ├── WishlistModal.jsx     # 폴더 선택 및 생성 모달
```

---
## 2. 주요 기능 및 아키텍처

### 2.1 위시리스트 통합 관리 시스템 (Integrated Wishlist & Folder)
- **Zustand 기반 중앙 동기화**: `syncWithServer` 단일 엔드포인트를 통해 아이템 목록과 폴더 상태를 한 번에 동기화하여 UI 전역의 정합성 유지.
- **성능 최적화**: 위시리스트 등록 여부 판별 시 `Set` 객체를 활용하여 대량의 데이터에서도 즉각적인 UI 피드백 제공.
- **유연한 데이터 매핑**: 공공데이터와 자체 DB 간의 상이한 필드명(`contentid` vs `content_id`)을 스토어 계층에서 정규화하여 처리.
- **폴더 선택 모달**: 하트 버튼 클릭 시 저장할 폴더를 선택하거나 즉석에서 새 폴더를 생성할 수 있는 원스톱 워크플로우.
- **분류 관리**: '미분류' 기본 저장소와 사용자 정의 폴더 간의 자유로운 아이템 이동(`moveItem`) 지원.

### 2.2 고성능 데이터 캐싱 및 필터링
- **Server-side Caching**: 서버 기동 시 관광공사 API 6만 건 데이터를 메모리에 적재하여 외부 API 호출 최소화 및 응답 속도 ms 단위 단축.
- **정밀 필터링**: 메인 페이지 랜덤 뽑기 시 숙박/음식점 등을 배제하고 **순수 관광지(`contentTypeId: 12`)**만 무작위 추출하여 여행 서비스로서의 정체성 강화.

### 2.3 지능형 어댑티브 UX
- **Geolocation & Nominatim**: 사용자 좌표를 한국어 시/도/구 단위 지역명으로 변환하여 가장 가까운 명소 실시간 추천.
- **Weather-based Random Pick**: 현재 날씨 상태(Sunny, Rainy 등)에 최적화된 키워드를 추출하여 여행지를 추천하는 슬롯머신 UI.

### 2.4 위시리스트 시스템 고도화 및 UI/UX 정밀화 (2026.04.25 추가)
- **프리미엄 터미널 테마 UI 개편**: 
    - `WishlistModal.jsx`를 프로젝트 고유의 '밝은 터미널 테마'로 전면 재설계. 
    - 상단 신호등 아이콘 헤더 및 `save_to_folder.sh` 라벨링 적용.
    - 한글 텍스트에 `font-body`를 적용하여 반듯한 가독성 확보 (영문 시스템 문구는 `font-mono` 유지).
- **상세 페이지(`TravelDetail.jsx`) 연동 강화**:
    - 상세 페이지에서 위시리스트 추가 시 폴더 선택 모달이 트리거되도록 사용자 경험(UX) 개선.
    - 위시리스트 토글 시 데이터 객체(`common`) 전체를 전달하는 방식으로 데이터 일관성 에러 원천 차단.
- **폴더 메타데이터 시각화**:
    - 마이페이지 사이드바에 선택된 폴더의 생성일(`CREATED_AT`) 및 최근 수정일(`LAST_UPDATED`)을 보여주는 메타데이터 섹션 구축.
    - 날짜 표시 형식을 `YYYY.MM.DD`로 표준화하여 정갈한 시스템 감성 부여.
- **필터 헤더 및 라벨 디자인 확정**:
    - `Explore.jsx`와 `TravelPic.jsx`의 필터 구성을 한 줄의 기술적 디자인으로 통일.
    - 'Region', 'Theme' 등 핵심 라벨에 `syntax-keyword` 색상을 적용하여 시각적 포인트 복원.

---

*최종 업데이트: 2026-04-25 (위시리스트 폴더 시스템 고도화 및 UI/UX 디자인 최종 정밀 조정 완료)*
