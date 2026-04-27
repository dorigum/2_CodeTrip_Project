# 변경 사항 (CHANGELOG)

## 2026.04.23
1. **축제 데이터 정렬 및 페이지네이션 개선**
    - 서버 사이드 정렬(date_asc, date_desc) 및 페이지네이션 로직 구현 (`/api/travel/festivals`).
    - `Festivals.jsx`에서 클라이언트 사이드 정렬 로직을 제거하고 서버 API를 활용하도록 변경.
    - 데이터 로딩 성능 최적화 및 UI 안정성 가드(`isMounted`) 추가.
2. **상세 페이지 429 에러 방지 로직 도입**
    - `travelInfoApi.js`에서 모든 상세 정보 호출을 서버 프록시(`/api/travel/proxy`) 경유로 변경.
    - 서버 측 프록시 캐시(2시간) 및 회로 차단기(429 발생 시 30초 차단) 구현.
3. **위시리스트 폴더 날짜 처리 오류 수정**
    - 프론트엔드(`MyPage.jsx`): `parseLocalDate`를 사용하여 타임존 영향을 받지 않는 날짜 파싱 구현.
    - 백엔드(`server/index.js`): MySQL 연결 설정에 `dateStrings: true` 추가 및 `DATE_FORMAT`을 사용하여 날짜를 문자열로 고정 전송.
    - 날짜 지정 시 하루씩 앞당겨지던 타임존 오프셋 오류 완벽 해결.

## 2026.04.27
1. **원격 브랜치(feature/explore_sort) 병합 및 동기화**
    - `origin/feature/explore_sort` 브랜치의 최신 정렬 및 탐색 로직을 로컬 `doyeon` 브랜치로 풀+머지 완료.
    - `server/index.js`, `src/pages/Festivals.jsx`, `src/api/travelInfoApi.js` 등 주요 파일의 충돌을 원격 코드 위주로 정밀 해결.
2. **API 호출 최적화 및 안정화**
    - 로컬에서 중복으로 발생하던 축제 정보 API 호출을 서버 시작 시 1회 캐싱하는 원격 브랜치 방식으로 100% 복구.
    - 429 에러 방지를 위한 서버 프록시 경유 구조를 유지하면서 원격의 정렬 기능을 통합.
3. **위시리스트 폴더 날짜 정정 시스템 강화**
    - 폴더 생성 및 수정 시 날짜가 하루씩 밀리는 현상을 방지하기 위해 프론트엔드-백엔드 간 날짜 데이터 교환 형식을 문자열(YYYY-MM-DD)로 통일.
    - `MyPage.jsx` 내의 모든 날짜 표시 유틸리티(`formatDate`, `formatScheduleShort` 등)를 타임존 안전 로직으로 갱신.
