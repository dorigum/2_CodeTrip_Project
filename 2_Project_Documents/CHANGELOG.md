# CHANGELOG - CodeTrip

> 페이지별 업데이트 내역, 기능 추가, 버그 수정 내역이 기록됩니다.
> 상세 기능 명세는 [Project_Specification.md](Project_Specification.md)를 참고하세요.

---

## 2026-04-27 - 위시리스트 폴더별 메모 및 체크리스트 기능 구현

### 1. 폴더별 상세 메모/체크리스트 기능 구현 (`Folder_Notes`)
- **기능 강화**: 위시리스트 폴더별로 여행 준비물 리스트(Checklist)와 자유 메모(Memo)를 작성할 수 있는 기능 추가.
- **UI 구현**: 마이페이지 좌측 사이드바 하단에 메모 섹션 배치. 체크리스트 완료/미완료 상태 전환, 항목 삭제, 추가 기능 실시간 적용.

### 2. 백엔드 인프라 확장 및 API 최적화
- **DB 스키마 확장**: `wishlist_notes` 테이블 추가.
- **404 에러 대응**: `axiosInstance`의 중복 경로(`/api/api/...`) 문제 해결.

---

## 2026-04-27 - 축제 데이터 필터/정렬 로직 고도화 및 개발 환경 개선

### 1. 축제 데이터 검색 필터 및 정렬 기능 강화
- **종료된 행사 필터링**: `eventenddate < today` 로직으로 과거 축제 데이터 자동 제외.
- **다이내믹 데이터 보정**: 시작일이 누락된 항목을 오늘 날짜 기준으로 자동 보정하여 정렬 깨짐 방지.

### 2. 개발 편의성 도구 도입 (`concurrently`)
- `npm run dev:all` 명령어를 통해 프론트엔드/백엔드 서버를 동시에 구동하는 환경 구축.

---

## 2026-04-27 - feature/board 브랜치 병합, 게시판 시스템 통합, 위시리스트 500 에러 해결

### 1. 축제 API 404 에러 원인 파악 및 해결 (`server/index.js`)
**현상**: `/api/travel/festivals` 요청 시 404 에러 발생 및 로컬 서버 다운.
**원인**: `server/index.js`에서 위시리스트 관련 코드를 추가하면서 기존의 축제 데이터 로딩 코드가 실수로 삭제되었거나 위치가 꼬여서 라우트를 찾지 못함.
**해결**: `server/index.js`를 오늘 작업 전 상태로 롤백하고, 위시리스트 코드를 안전한 위치에 다시 삽입하여 기능 복구.

---

### 2. 댓글 API 네이밍 규칙 통합 (여행지 댓글/게시판 댓글 분리)
**배경**: 게시판 기능의 댓글과 여행지 상세 페이지의 댓글이 중복되는 문제 발생.
**조치**: 여행지 상세 페이지 관련 테이블 및 API 경로명을 `travel_comments` / `travel_comment_likes`로 명시적으로 통일.
- **`src/api/travelCommentApi.js`**:
  - API URL 전체를 `/api/comments`에서 `/api/travel-comments`로 변경.
  - `deleteComment`를 `deleteTravelComment`로 함수명 변경.
- **`server/index.js`**: 여행지 댓글 관련 모든 엔드포인트 경로를 `/api/travel-comments`로 변경. DB 테이블 참조명도 변경.

---

### 3. `origin/feature/board` 브랜치 병합 및 게시판 시스템 통합
**배경**: 게시판 기능(CRUD, 댓글, 좋아요)이 포함된 `feature/board` 브랜치를 로컬 `doyeon` 브랜치에 병합.
**작업 내용**:
- `src/pages/Board.jsx` (게시판 목록)
- `src/pages/BoardDetail.jsx` (글 상세 조회/댓글/좋아요)
- `src/pages/BoardWrite.jsx` (글 쓰기/수정)
- `src/pages/TravelTagSearch.jsx` (여행지 태그 검색 연동)
- `src/components/MarkdownEditor.jsx` (마크다운 에디터 컴포넌트)
- `src/api/boardApi.js` (게시판 API)

---

## 2026.04.27 - 원격 브랜치(feature/explore_sort) 병합 및 동기화

### 1. 원격 브랜치 병합 및 충돌 해결
- `origin/feature/explore_sort` 브랜치의 최신 정렬 및 탐색 로직을 로컬 `doyeon` 브랜치로 통합.
- `server/index.js`, `src/pages/Festivals.jsx`, `src/api/travelInfoApi.js`의 충돌을 원격 코드 위주로 정밀 해결.

### 2. API 호출 최적화 및 안정화
- **축제 데이터 캐싱**: 로컬에서 수시로 발생하던 축제 API 호출을 서버 시작 시 1회 캐싱하는 방식으로 복구하여 성능 최적화.
- **429 에러 방지**: 상세 페이지 호출을 서버 프록시 경유로 유지하면서 원격의 정렬 기능 통합.

### 3. 위시리스트 시스템 개선 및 오류 수정
- **날짜 정합성 오류 해결**: 폴더 날짜가 하루씩 밀리던 타임존 오프셋 문제를 문자열 기반 데이터 처리로 완벽 해결.
- **위시리스트 UX 복구**: 여행지 탐색, 상세, 축제 페이지에서 위시리스트 추가/삭제 시 피드백 알림(`alert`) 복구 및 기능 추가.
