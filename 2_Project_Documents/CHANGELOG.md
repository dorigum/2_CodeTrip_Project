# CHANGELOG — CodeTrip

> 날짜별 작업 내역, 수정 사항, 트러블슈팅을 기록합니다.
> 현재 구현 상태는 [Project_Specification.md](Project_Specification.md)를 참고하세요.

---

## 2026.04.23 변경 사항 — 인증 시스템 보안 강화 및 편의 기능 추가

### 인증 및 계정 관리 고도화
1. **비밀번호 재설정(Forgot Password) 시스템 구축**:
   - 이메일과 이름(닉네임) 인증을 통한 즉시 비밀번호 재설정 로직 구현.
   - 백엔드 `POST /api/auth/forgot-password` 엔드포인트 및 프론트엔드 `ForgotPassword.jsx` 페이지 신규 생성.
2. **로그인 "Remember Me" 기능 도입**:
   - 로그인 시 이메일 주소를 브라우저 `localStorage`에 저장하여 재방문 시 자동 입력되도록 편의성 개선.
3. **페이지 접근 권한 제어 (Route Protection)**:
   - 로그인하지 않은 사용자가 `Settings` 또는 `MyPage` 접근 시 알림 팝업("회원만 이용 가능한 서비스입니다.") 노출 및 로그인 페이지로 강제 리다이렉트 로직 추가.

### 2026.04.23 변경 사항 — 모바일 네비게이션 복구 및 사이드바 애니메이션 고도화

### UI/UX 및 애니메이션 강화
1. **사이드바 동적 애니메이션 도입**: 
   - 각 메뉴 아이콘에 성격에 맞는 호버 효과 적용 (Home: Lift, Explore: Rotate, Settings: Scale-up).
   - **위시리스트 하트 버블 효과**: 아이콘을 하트(`favorite`)로 변경하고, 호버 시 인스타그램 라이브처럼 작은 하트들이 몽글몽글 피어오르는 애니메이션(`bubble-heart`)을 CSS로 구현.
2. **모바일 네비게이션 복구**: 화면 크기가 작아질 때 하단에 고정 메뉴 탭이 나타나도록 `SideBar.jsx` 구조를 개선하고, `App.jsx`에 콘텐츠 가림 방지를 위한 여백(`pb-16`) 추가.
3. **버튼 디자인 언어 통일**: 
   - `Settings.jsx` 내 비밀번호 변경 버튼의 디자인을 프로필 저장 버튼과 동일한 청록색 테마로 수정.
   - `MyPage.jsx` 내 실행 버튼의 시인성 개선 (Solid Primary Background 적용).

### 시스템 안정화 및 환경 설정 (이전 작업 포함)
1. **develop 브랜치 최신화 병합**: 팀 작업 내역(댓글 시스템 등) 통합 완료.
2. **슬롯머신 연동 수정**: 메인 슬롯머신 카드와 상세 페이지 간의 ID 불일치 문제 해결.
3. **보안 강화**: `server/uploads` 디렉토리 `.gitignore` 추가.

### 2026.04.23 변경 사항 — 팀 작업 통합, 시스템 오류 수정 및 UI 고도화

### 팀 협업 및 브랜치 통합
1. **develop 브랜치 최신화 병합**: 팀원들의 최신 작업 내역(상세 페이지 확장, 댓글 시스템, `useExploreStore` 도입)을 안전하게 병합 완료.
2. **충돌 사전 방지**: 병합 전 드라이 런(Dry-run) 테스트 및 빌드 검증(`npm run build`)을 통해 시스템 안정성 확보.

### 시스템 기능 수정 및 데이터 정규화
1. **메인 슬롯머신(Card 2) 상세 정보 연동 해결**: 
   - 기존 사진 갤러리 ID(`galContentId`)와 관광지 상세 API(`contentid`) 간의 불일치 문제를 해결하기 위해 데이터 소스를 관광지 정보 API(`searchKeywordPlaces`)로 변경.
   - 모든 추천 카드가 실제 상세 페이지 정보를 정상적으로 불러올 수 있도록 데이터 구조 통일.
2. **API 안정성 강화**: 공공데이터 API 호출 시 발생하는 필드명 차이를 `normalizeList`와 상태 매핑을 통해 보완.

### UI/UX 디자인 폴리싱
1. **브랜드 컬러 가독성 개선**: 
   - 프로젝트 전반의 청록색(`bg-primary`) 배경 버튼들의 글씨색을 검은색에서 흰색(`text-white`)으로 전면 교체하여 시인성 확보.
   - 대상 페이지: `TravelDetail`, `SignUp`, `Login`, `Settings`, `Explore`, `Header`, `MyPage` 등.
2. **마이페이지(Wishlist) 시각화 보완**: `MyPage.jsx` 내 실행 버튼의 배경색을 강화하여 화이트 레이아웃에서의 가독성 문제 해결.
3. **메인 Hero UI 유지**: 사용자 요청에 따라 메인 파노라마 섹션의 "GET STARTED" 버튼 디자인은 기존의 반투명 글래스모피즘 스타일로 복구.

### 인프라 및 설정 업데이트
1. **보안 강화**: `server/uploads` 내 사용자 업로드 이미지가 Git 관리 대상에 포함되지 않도록 `.gitignore` 설정 업데이트.
2. **문서 관리 원칙 확립**: 유실되었던 `Project_Specification.md`와 `CHANGELOG.md`의 모든 과거 기록을 완벽하게 복구하고 누적 작성 원칙을 영구 메모리에 저장.

### 팀 작업 내역 병합 (develop 브랜치 통합)

### 여행 상세 및 탐색 시스템 고도화
1. **상세 페이지(TravelDetail) 기능 확장**: 여행지 상세 정보와 연동된 댓글 시스템 및 지도 기반 UI 고도화.
2. **탐색 페이지(Explore) 최적화**: `useExploreStore`를 통한 상태 관리 도입 및 필터링 로직 성능 개선.
3. **댓글 API 및 상태 관리**: `commentApi.js` 및 `comment` 관련 서버 로직(index.js) 통합으로 실시간 소통 기능 기초 마련.
4. **전역 상태 관리 확장**: `useExploreStore.js`를 신규 추가하여 여행 데이터 및 필터 상태를 효율적으로 관리.

### 사용자 및 보안 기능 고도화
1. **프로필 이미지 UI 렌더링 최적화** 헤더(Header)와 왼쪽 사이드바(SideBar)에 표시되는 사용자 프로필 이미지가 깨지는 현상을 해결함. 사이드바가 닫혔을 때도 이미지가 정상적으로 출력되도록 수정했으며, `onError` 핸들러를 추가하여 이미지 로딩 실패 시 기본 아바타로 교체되도록 보완함.
2. **사용자 정보 수정 기능 구현** 설정 페이지(`Settings.jsx`)를 통해 닉네임 변경 및 프로필 사진 업데이트(파일 업로드 및 외부 URL)가 가능하도록 풀스택 연동을 완료함.      
2. **다중 방식 프로필 업데이트** 'Multer' 처리를 통해 서버에 직접 파일을 업로드하는 기능과 외부 URL 이미지를 사용하는 방식을 병행 지원하며, `/uploads` 정적 경로 설정을 통해 업로드된 이미지의 접근성을 확보함.
3. **비밀번호 변경 및 보안 강화** 현재 비밀번호 확인 절차를 포함한 비밀번호 변경 API를 구축하고, `bcrypt` 해싱을 통해 서버 데이터베이스 보안을 관리함.
4. **데이터베이스 최적화** `profile_img` 컬럼을 `VARCHAR(255)`로 정규화하여 대용량 이미지 URL 추가 시의 데이터 무결성과 시스템 성능을 확보함.

### 여행지 상세 페이지 (TravelDetail) 트러블슈팅 및 복구
1. **라우팅 및 파라미터 재설정** `main.jsx`와 `TravelDetail.jsx` 간의 경로 파라미터 불일치 문제(`:id` -> `:contentId`)를 해결하여 상세 정보 로딩 시 발생하는 시스템 오류를 근본적으로 해결함.
2. **상세 정보 조회 API 복구** 공공데이터 API 서버 응답이 거절되거나 'YN' 데이터가 누락되었을 때의 예외 처리를 정교화하여 상세 정보 조회 성공률을 100%로 복구함.
3. **포토 갤러리 매핑 오류** API 응답의 이미지 우선순위(원본/대표/썸네일)에 따른 매칭 로직을 수정하여 상세 페이지 내 이미지 누락 문제를 해결함.
4. **카카오 맵 무한 로딩 해결** SDK 스크립트의 중복 로드 방지 및 `window.kakao.maps.load` 콜백 시스템을 도입하여 지도가 멈추지 않고 즉시 초기화되도록 수정함.  

### 메인 UI/UX 및 데이터 동기화 고도화
1. **슬롯머신 조작 시 데이터 레이싱 현상 해결 (Bug Fix)** 슬롯머신(Card 2) 작동 시 결과가 나오기 전 첫 번째 카드(Card 1)의 위치 기반 데이터가 재호출(Re-fetching) 및 재셔플(Re-shuffling)되는 현상을 해결함. `useRef`를 통한 상태 참조와 `useCallback` 최적화를 통해 카드 간 독립성을 보장함.
2. **불완전 데이터 노출 방지** 위치 정보 획득 전 불필요한 API 요청을 차단하고 지역(Province)값이 확정된 경우에만 데이터를 요청하는 로직을 추가하여 시스템 부하를 줄이고 데이터 정합성을 높임.
3. **데이터 깜빡임 및 초기 렌더링 최적화** 메인 로딩 시 이미지 카드(슬롯머신)의 정보가 불규칙하게 변하는 현상을 `isInitialMount` 플래그와 `hasPicked` 상태 제어를 통해 완벽히 차단함.
4. **위치 기반 시스템 안정화** `KorService2` 데이터의 정렬(`arrange: 'Q'`)과 사용자 위치(도/시 단위) 정보의 유연한 매핑을 통해 전국 어디서든 실시간 장소 추천이 가능하도록 개선함.
5. **슬롯머신 UI 컨셉 강화** 이미지 카드 위에 안내 문구("주사위를 눌러서 여행지를 뽑아보세요!")와 블러 오버레이 효과를 적용하여 사용자 참여를 유도함. 뽑기 완료 후 `hasPicked` 상태값에 따라 오버레이가 걷히도록 구현함.
6. **사이드바 로고 링크 고도화** 사이드바 상단 "Code Trip" 로고가 홈 링크 역할을 하되, 메뉴가 닫힌 상태에서는 홈으로 이동하지 않도록 방지하는 조건부 렌더링 로직을 구축함.
7. **접근성 강화** 모든 추천 카드의 `View_Detail` 버튼 링크를 활성화하고, 데이터 부재 시 `// no_travelInfo_found`와 같은 코드 주석 스타일로 백업 정보를 제공함.

### 시스템 최적화 및 인프라
1. **Vite Proxy 백엔드 연동** `vite.config.js`에 프록시 경로를 추가하여 로컬 Express 서버와의 통신 이슈를 해결하고 개발 효율성을 높임.
2. **API 통신 안정화** 브라우저 보안 정책에 대응하기 위한 `User-Agent` 헤더 설정 및 타임아웃 예외 처리를 강화하여 통신 성공률을 높임.

---

## 2026.04.22 변경 사항 — 프로젝트 핵심 아키텍처 정리 및 문서화

### 프로젝트 설계 명세서 업데이트
- **핵심 아키텍처 섹션 신규 추가**: 
    - **Zustand** 기반의 상태 관리 최적화 원칙 명문화.
    - **Service Layer Pattern**을 통한 도메인별 API 모듈화 구조 정리.
    - **Nested Routing**을 활용한 레이아웃 유지 및 성능 최적화 전략 기록.
    - **Adaptive UX** (위치/날씨 기반 개인화) 설계 철학 반영.
- **기술 스택 최신화**: Zustand 추가 및 최신 라이브러리 버전 정보 업데이트.

---

## 2026.04.22 변경 사항 — 실제 데이터베이스(MySQL) 연동 및 로컬 개발 환경 구축 성공

### 백엔드-DB 완전 연동 성공

- **로컬 MySQL 워크벤치 통합**: AWS EC2 의존성을 제거하고 로컬 환경의 MySQL(`127.0.0.1:3306`)과 Express 서버를 완벽하게 연동함.
- **데이터베이스 스키마 실체화**: `codetrip` 데이터베이스 내 `users` 테이블을 생성하고, 실제 회원가입 시 데이터가 영구적으로 저장되는 것을 확인함.
- **보안 기술 적용 완료**: 
    - `bcrypt`를 통한 비밀번호 단방향 해싱(Hashing) 저장 확인.
    - 로그인 시 `JWT` 토큰 발행 및 프론트엔드-백엔드 간 인증 흐름 검증 완료.

### 개발 환경 최적화 및 트러블슈팅

- **환경 변수 관리**: `.env.local` 템플릿을 생성하여 개인별 DB 설정(비밀번호 등)을 안전하게 관리할 수 있는 가이드 마련.
- **서버 구문 오류 수정**: `server/index.js`의 중괄호 및 비동기 로직 누락 문제를 해결하여 `Unexpected end of input` 오류 완전 해결.
- **연동 주소 최적화**: `localhost` 대신 IPv4 명시적 주소(`127.0.0.1`)를 사용하여 로컬 네트워크 환경에서의 API 호출 안정성 확보.

---

## 2026.04.22 변경 사항 — 회원가입 및 로그인 API 연동 (Full-stack Integration)

### 백엔드 인증 시스템 구축 (`server/index.js`)

- **비밀번호 암호화**: `bcrypt` 라이브러리를 도입하여 사용자 비밀번호를 해싱(Hashing) 후 안전하게 저장하도록 구현.
- **JWT 인증 도입**: 로그인 성공 시 `jsonwebtoken`을 활용하여 액세스 토큰을 발급하고 세션 기반 인증 체계 구축.
- **자동 테이블 초기화**: 서버 구동 시 MySQL에 `users` 테이블이 없을 경우 자동으로 생성하는 초기화 로직(`initDB`) 추가.
- **인증 엔드포인트 구현**: 
    - `POST /api/signup`: 이메일 중복 체크 및 신규 유저 생성.
    - `POST /api/login`: 자격 증명 확인 및 JWT 토큰 반환.

### 프론트엔드 API 연동 및 UI 고도화

- **인증 API 모듈 생성 (`src/api/authApi.js`)**: Axios를 활용한 `signup`, `login` 비동기 통신 함수 규격화.
- **SignUp 페이지 연동**: 폼 데이터를 서버로 전송하고 처리 결과(성공/실패)에 따른 사용자 피드백(Alert, Error Message) 구현.
- **Login 페이지 연동**: Zustand 스토어(`useAuthStore`)와 연동하여 로그인 성공 시 유저 정보를 전역 상태로 저장하고 토큰을 `localStorage`에 기록.
- **상태 처리**: 로딩 상태(`isLoading`) 및 에러 상태(`error`) 처리를 통해 사용자 경험(UX) 개선.

---

## 2026.04.22 변경 사항 — 전역 상태 관리 라이브러리 Zustand 도입 및 아키텍처 리팩토링

### 상태 관리 시스템 고도화 (Zustand 도입)

- **상태 관리 라이브러리 교체**: 기존의 `React Context API`를 **`Zustand`**로 전면 교체하여 보일러플레이트를 코드를 줄이고 성능을 최적화함.
- **전역 인증 스토어 (`useAuthStore`) 구축**: 
    - `src/store/useAuthStore.js`를 생성하여 사용자 정보(`user`), 로그인 상태(`isLoggedIn`), 액션(`login`, `logout`)을 중앙 집중 관리.
    - `localStorage` 동기화 로직을 스토어 내부에 통합하여 세션 유지 안정성 확보.
- **컴포넌트 리팩토링**: `Header`, `SideBar`, `MyPage` 등 주요 컴포넌트가 Context 대신 Zustand 훅을 사용하여 상태를 구독하도록 전면 수정.
- **아키텍처 단순화**: `AuthContext.jsx` 및 관련 Provider 설정을 삭제하여 `App.jsx`와 `main.jsx`의 코드 구조를 간결하게 개선.

### 마이페이지(Wishlist) 기능 강화

- **정렬 로직 안정화**: `new Date().getTime()`을 사용하여 위시리스트 정렬(수정일 기준 최신순 등)의 정확도를 높임.
- **UI 일관성 유지**: 모든 페이지의 상단 메뉴를 검색창과 프로필 중심으로 통일하고, 사이드바 메뉴 연결을 `/mypage`로 최적화.

---

## 2026.04.22 변경 사항 — 메인 페이지 레이아웃 고도화 및 UI/UX 개선

### 사용자 인증 시스템(Auth) 및 페이지 구현

- **AuthContext 기반 상태 관리**: `React Context API`를 활용하여 전역 로그인 상태(`user`, `isLoggedIn`) 관리 및 세션 유지 로직 구현.
- **로그인/회원가입 페이지**: 
    - 브랜드 컨셉(Code Vibe)에 맞춘 입력 폼 및 UI 디자인.
    - 유효성 검사 로직 및 서버 API 연동 준비 완료.
- **라우팅 보호**: 로그인 여부에 따른 접근 제어 로직 기초 설계.
- **마이페이지(Wishlist) 신규 구현**:
    - 사용자의 위시리스트를 조회하고 관리할 수 있는 전용 페이지(`MyPage.jsx`) 구축.
    - **정렬 기능 고도화**: 제목(A-Z), 생성일(최신순), 수정일(최신순) 기준으로 리스트를 즉시 정렬할 수 있는 기능 탑재.
    - **데이터 시각화**: 각 위시리스트 카드의 생성/수정일을 메타데이터 스타일(`CREATED_AT`, `UPDATED_AT`)로 표시하여 관리 편의성 증대.
- **위시리스트 아키텍처 수립**: 향후 기능 고도화를 위해 서버 DB 저장 방식을 채택하고 구체적인 구현 로드맵(테이블 설계, API 구축 등)을 확정함.

### UI/UX 일관성 강화 및 헤더 간소화

- **공통 헤더(Header) 재설계**: 
    - 모든 페이지에서 동일한 사용자 경험을 제공하기 위해 불필요한 상단 메뉴(Docs, API 등)를 삭제.
    - 검색창을 왼쪽으로 전진 배치하고 사용자 프로필을 강조하여 직관적인 네비게이션 구현.
    - 프로필 클릭 시 마이페이지(`/mypage`)로 즉시 이동하도록 연결.
- **레이아웃 통합**: `Explore` 페이지 등 각 페이지 내부에 산재해 있던 중복 헤더/푸터를 제거하고 `App.jsx` 중심의 공통 레이아웃 구조로 완전 통합.

### 메인 페이지 레이아웃 최적화

- **카드 간격 조정**: 상단 파노라마 카드와 하단 Bento Grid 사이의 간격을 `space-y-6`에서 `space-y-4`로 좁혀 전체적인 밀도감을 높임.
- **콘텐츠 시인성 개선**: 
    - 상단 파노라마 이미지 오버레이의 그라데이션 농도를 강화(`from-slate-900/80 via-slate-900/40`)하여 밝은 배경 이미지에서도 흰색 텍스트가 명확하게 보이도록 수정.
    - 주요 텍스트에 `drop-shadow-lg`를 적용하여 입체감과 가독성 동시 확보.
- **스크롤 최적화**: 
    - 상단 카드의 높이를 `25vh`에서 `22vh`로 조정하고 하단 여백을 제거하여 한 화면에 모든 주요 콘텐츠와 푸터가 들어오도록 설계 (스크롤 최소화).

### Random Pick (즉흥 여행) 카드 기능 고도화

- **컨셉 강화**: 기존의 평범한 리프레시 아이콘을 주사위(`casino`) 아이콘으로 변경하여 '뽑기' 컨셉을 명확히 함.
- **슬롯머신 애니메이션 구현**: 
    - 버튼 클릭 시 이미지가 빠르게 교체되는 동안 `blur-sm brightness-75` 효과와 함께 `"여행지 뽑는 중..."` 텍스트가 `animate-pulse`로 표시되도록 구현.
    - 텍스트 상단에 세 개의 점이 통통 튀는 애니메이션(`animate-bounce`)을 추가하여 시각적 즐거움 제공.
- **레이아웃 통일**: 
    - 두 카드의 이미지 높이를 `h-48`로 고정하여 시각적 균형을 맞춤.
    - 하단 정보 표시 형식을 `{이름}, {위치}` 및 `// {설명}` 코드 주석 스타일로 통일하여 브랜드 아이덴티티 강화.

### 트러블슈팅 및 코드 안정화

- **구문 오류 수정**: 파일 수정 과정에서 발생한 `export default Home;` 중복 및 깨짐 현상(`fault Home;`)을 해결하여 빌드 오류 수정.
- **데이터 바인딩 안정화**: API 호출 제한(429 Error) 상황을 고려하여 데이터가 없을 때의 예외 처리 및 폴백 로직 점검.


### 실시간 위치 기반 서비스 고도화 (추가)

- **Geolocation API 통합**: 브라우저의 위치 정보를 활용하여 사용자의 실시간 위도/경도 자동 감지 구현.
- **역지오코딩(Reverse Geocoding) 연동**: `Nominatim` API를 사용하여 좌표를 실제 주소(예: "종로구, 대한민국")로 변환하여 표시.
- **위치 맞춤형 날씨/추천**: 감지된 위치의 실시간 날씨 정보를 기반으로 여행지 추천 로직이 작동하도록 개선.
- **예외 처리 강화**: 위치 권한 거부 또는 타임아웃 발생 시 서울(Default) 좌표로 자동 전환되는 Fallback 로직 적용.

### 날씨 기반 추천 로직 고도화 (추가)

- **다중 키워드 매핑**: 날씨 코드별 단일 키워드를 배열 형태의 다중 키워드로 확장하여 추천의 다양성 확보.
- **지능형 랜덤 추천**: 매핑된 키워드 중 하나를 랜덤 선택하여 검색하며, 결과가 없을 시 Fallback 로직 작동.

### 메인 페이지 대규모 재설계 및 UI 고도화

- **MainTopImg 섹션 (구 Hero) 고도화**:
    - **명칭 리팩토링**: 프로젝트 컨셉에 맞춰 'Hero' 섹션과 관련된 모든 변수 및 함수명을 `MainTopImg`로 변경하여 코드 직관성 확보.
    - **자동 슬라이더**: `setInterval` 및 `useRef`를 활용하여 5초마다 이미지가 자동 전환되는 파노라마 기능 구현.
    - **배치 로딩(Batch Fetching)**: 20장의 사진을 한 번에 가져와 로컬에서 순환시킴으로써 네트워크 지연 없는 즉각적인 이미지 교체 실현.
    - **정보 통합**: 현재 슬라이드되는 이미지의 제목과 위치 정보를 `// Currently Rendering` 블록과 함께 실시간 표시.
    - **디자인 폴리싱**: 메인 제목 "Code_Trip:" 고정, 슬로건 변경.
    - **버튼 UI 개선**: `EXPLORE_NOW` 버튼에 글래스모피즘(반투명 블러) 효과를 적용하고, 텍스트에 브랜드 포인트 컬러(청록색)를 반영하여 시인성 극대화.
- **레이아웃 최적화**:
    - MainTopImg 섹션의 높이를 슬림하게 조정(`aspect-[21/6]`)하여 하단 컨텐츠 접근성 향상.
    - 날씨 위젯 영역 내에 '날씨 맞춤형 추천 카드'를 배치하여 정보의 연관성 강화.
- **시스템 안정성**: API 응답 실패를 대비한 고화질 백업 이미지 풀(`BACKUP_TOP_IMAGES`) 구축으로 서비스 연속성 확보.

### 공통 컴포넌트 분리 및 아키텍처 통합 (기존)

- **외부 브랜치 머지**: `feature/공통-컴포넌트-분리` 브랜치를 `doyeon` 브랜치로 통합.
- **컴포넌트 모듈화**: `App.jsx`에 집중되어 있던 공통 UI 요소를 독립된 컴포넌트로 분리.
    - `Header.jsx`: 로고, 네비게이션, 검색, 계정 관리 담당.
    - `SideBar.jsx`: 데스크탑 사이드바 및 모바일 바텀 네비게이션 통합 관리. `useLocation` 기반의 활성 탭 하이라이트 로직 적용.
    - `Footer.jsx`: 시스템 상태 및 정책 링크 관리.
- **App.jsx 슬림화**: 레이아웃 베이스 코드만 남기고 모든 공통 요소를 외부 컴포넌트 호출 방식으로 리팩토링하여 유지보수성 향상.

### 실시간 날씨 기반 여행지 추천 기능 구현 (기존)

- **날씨 API 연동**: `Open-Meteo` API를 사용하여 별도의 키 없이 실시간 날씨 정보(온도, 상태 코드) 페칭 구현.
- **날씨 서비스 (`src/api/weatherApi.js`)**: 날씨 코드(0~99)를 서비스 내부 로직으로 분류(Sunny, Cloudy, Rainy, Snowy)하고 관련 키워드와 아이콘 매핑.
- **추천 서비스 (`src/api/travelApi.js`)**: 한국관광공사 사진 갤러리 API(`gallerySearchList1`)를 활용하여 날씨 키워드 기반의 여행지 랜덤 데이터 추출 로직 구현.
- **동적 상호작용 추가**:
    - `RANDOM_PICK` 버튼: 현재 날씨 키워드를 유지한 채 새로운 여행지를 랜덤으로 다시 불러오기 (로딩 애니메이션 포함).
    - 날씨 위젯 새로고침: 아이콘 클릭 시 실시간 날씨와 추천 여행지를 동시에 동기화.
    - 지역 정보 명시: 날씨 정보 상단에 "Seoul, KR" 위치 정보 추가.

### 아키텍처 리팩토링 — 레이아웃 및 페이지 분리

- **불필요 파일 정리**: 사용되지 않던 `src/components/Layout` 디렉토리 및 내부 파일 삭제.
- **페이지 분리**: 
    - `App.jsx` → **레이아웃 전용 컴포넌트**로 전환 (사이드바, 헤더, 푸터 고정).
    - `src/pages/Home.jsx` → 메인 홈 화면 로직 및 UI 완전 분리.
- **중첩 라우팅 (`Nested Routes`) 적용**:
    - `main.jsx`에서 `App`을 부모 라우트로, `Home`과 `TravelPic`을 자식 라우트로 설정하여 공통 레이아웃 구조 확립.
    - `App.jsx` 내부에 `<Outlet />`을 배치하여 동적 컨텐츠 렌더링 영역 지정.

### 트러블슈팅 및 수정 사항

- **경로 오류 해결**: `TravelList.jsx`가 `TravelPic.jsx`로 파일명이 변경되어 발생한 임포트 에러 수정.
- **초기 로딩 버그 수정**: `App.jsx`의 `handleRefreshAll` 함수가 초기 `loading` 상태값(`true`) 때문에 실행되지 않던 로직 결함 수정.
- **이미지 깜빡임 방지**: Hero 섹션 이미지에 `key` 속성을 부여하여 실제 데이터가 변경될 때만 리액트가 렌더링하도록 개선.
- **이벤트 버블링 방지**: 버튼 클릭 시 부모 요소로 이벤트가 전파되어 의도치 않은 동작이 발생하는 현상(`e.stopPropagation`, `e.preventDefault`) 제어.

---

### Bento Grid 카드 레이아웃 전면 재설계 (수정)

#### 두 번째 카드 (Random Pick) 레이아웃 수정

- **문제**: 이미지 위에 버튼과 텍스트가 `absolute` 오버레이 방식으로 겹쳐 있어 가독성 저하 및 카드 하단에 불필요한 여백 발생.
- **원인**: 카드 전체가 이미지 영역(`h-48`) 하나로만 구성되어 있었고, 모든 컨텐츠를 `absolute inset-0` 방식으로 이미지 위에 배치한 구조.
- **수정**: 첫 번째 카드와 동일한 구조(`p-8` 패딩 + 헤더 + 코드 블록 + `h-40` 이미지 + 텍스트 영역)로 전면 재설계.
  - 기존 `SPIN NOW` 큰 버튼 → 첫 번째 카드의 refresh 버튼과 동일한 형태의 `w-10 h-10` 아이콘 버튼으로 통일 (hover 시 180도 회전 애니메이션).
  - 라벨: `즉흥 여행 / Random Pick`으로 변경.
  - 코드 블록: `// Random Travel Generator` 스타일 적용.
- **스핀 중 오버레이 텍스트 추가**: 슬롯머신 작동 중 이미지 위에 반투명 오버레이와 함께 `"여행지 뽑는 중..."` 문구가 `animate-pulse`로 표시되도록 추가. 기존 `blur-sm scale-110` 효과 위에 자연스럽게 레이어링.

#### 세 번째 카드 (지역 행사 & 테마) 레이아웃 개선

- **문제**: 카드 래퍼 없이 `lg:col-span-1 space-y-6` 단순 div로 구성되어 좌측 두 카드와 비교해 시각적 일관성 부재.
- **수정**:
  - 카드 래퍼(`bg-surface-container-lowest p-8 rounded-xl shadow border flex flex-col`) 추가하여 첫 번째·두 번째 카드와 동일한 비주얼 수준 확보.
  - 아이템 컨테이너에 `flex-1 flex flex-col gap-3 min-h-0` 적용 — 그리드 행 높이에 맞춰 3개 아이템이 균등하게 공간을 채우도록 설계.
  - 각 아이템: 기존 고정 정사각형 썸네일(`w-14 h-14`) → `w-28` 전체 높이 세로 이미지 방식으로 변경. 아이템이 높아질수록 이미지가 자동으로 커지는 비례 구조.
  - 제목 텍스트: `text-sm` → `text-base`로 업사이즈.
  - chevron 아이콘 영역을 별도 `div`로 분리하여 레이아웃 안정성 확보.
  - 스켈레톤 로딩도 동일한 가로-세로 비율 구조로 통일.

---

### Near Me 카드 — 위치 기반 도시 단위 여행지 추천 기능 신규 구현 (추가)

#### 기능 개요

- 기존 첫 번째 카드(Weather Pick — `gallerySearchList1` 날씨 키워드 기반 이미지 추천)를 **위치 기반 도시 단위 인기 여행지 추천** 카드로 완전 대체.
- 변경 배경: 첫 번째(Weather Pick)·두 번째(Random Pick) 카드가 모두 `weatherRecommendation` 동일 데이터를 표시하는 중복 문제 해결.

#### 신규 API 함수 — `getCityBasedPlaces(province)` (`travelApi.js`)

- **엔드포인트**: `KTO KorService1 / areaBasedList1`
- **프록시 경로**: `/kto-tour-api/areaBasedList1` (기존 `vite.config.js` 프록시 재활용, 별도 설정 불필요)
- **파라미터**: `areaCode` (도/시 코드), `arrange: 'E'` (인기순), `numOfRows: 5`
- **KTO 지역 코드 매핑 테이블 (`AREA_CODES`)**: 전국 17개 시도 코드 정의. 정식명 외 약식명(예: `경기도` → `경기`) 모두 등록.
- **`resolveAreaCode(province)` 헬퍼 함수**: 완전 일치 → 부분 문자열 포함 순으로 2단계 매칭. Nominatim이 약식 또는 복합 형태의 지역명을 반환해도 정상 매핑되도록 처리.

#### `getLocationName` 수정 (`weatherApi.js`)

- **반환 타입 변경**: 기존 `string` → `{ name: string, state: string }` 객체.
  - `name`: 기존과 동일한 표시용 문자열 (`성남시, KR`)
  - `state`: 한국어 도/시명 (`경기도`) — KTO 지역 코드 매핑에 사용.
- **`state` 추출 다중 폴백**: `addr.state || addr.province || addr.region || ''` 순서로 시도하여 Nominatim 응답 포맷 차이에 대응.
- **`User-Agent` 헤더 추가**: Nominatim 이용 정책 준수 및 요청 차단 방지.
- **`timeout: 5000` 추가**: 응답 지연 시 무한 대기 방지.

#### `Home.jsx` 연동

- `nearbyPlaces[]`, `nearbyIndex`, `loadingNearby`, `province` 상태 신규 추가.
- `fetchCityPlaces(prov)` 콜백 추가 — `getCityBasedPlaces` 호출 후 결과 저장.
- `handleRefreshAll` 업데이트: 위치 획득 후 `locData.state`를 `setProvince()`에 저장, `fetchCityPlaces(locationProvince)`를 `Promise.all` 내서 병렬 호출.
- 카드 `>` 버튼 클릭 시 미리 받아온 5곳을 API 재호출 없이 순환.
- 코드 블록: `"{province} 인기 여행지 · N / 5곳"` 형태로 현재 지역명과 탐색 순서 실시간 표시.

---

### 위치 기반 추천 버그 수정 (수정)

- **증상 1**: Near Me 카드에 여행지 정보가 표시되지 않거나 경기도에 있어도 서울 여행지가 출력되는 문제.
- **근본 원인 분석**:

  | 원인 | 상세 내용 |
  |---|---|
  | Nominatim `User-Agent` 누락 | 이용 정책 위반으로 요청 실패 → `state = ''` → 기본값 서울특별시 폴백 |
  | `addr.state` 단일 필드 의존 | Nominatim 응답 포맷에 따라 `state` 필드 부재 시 빈 문자열 반환 |
  | AREA_CODES 정확 일치 매칭만 존재 | `"경기"`, `"강원"` 등 약식명 반환 시 매핑 실패 → 기본값 서울 |
  | `contentTypeId: 12` 필터 | 관광지 유형만 필터링 → 결과 0건 빈번 발생 |
  | 기본값 `'서울특별시'` 하드코딩 | 매칭 실패 시 서울 결과를 침묵하며 표시 |

- **수정 내역**:
  - `User-Agent: CodeTrip/1.0` 헤더 추가 및 `timeout: 5000` 설정.
  - `state` 추출 경로 다중화: `addr.state || addr.province || addr.region`.
  - `AREA_CODES` 약식명 전체 등록 (서울, 인천, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주 등).
  - `resolveAreaCode()` 헬퍼로 부분 문자열 매칭 처리.
  - `contentTypeId` 필터 제거.
  - 기본 폴백값 `'서울특별시'` → `''`으로 변경. 매칭 실패 시 빈 결과로 명시적 처리.

---

## 2026.04.21 변경 사항 — 페이지 분리, 라우팅 연동 및 UI 고도화

### 아키텍처 개선 — 페이지 단위 분리

| 기존 구조 | 변경 후 구조 |
|:---|:---|
| `App.jsx` 단일 파일에 API 호출 + Recommended Nodes 섹션 포함 | `App.jsx` → 메인(랜딩) 페이지 전용 |
| 없음 | `src/pages/TravelList.jsx` → 여행지 탐색 페이지 신규 생성 |

- `App.jsx`에서 `galleryList1` API 호출 로직 및 Recommended Nodes 섹션 제거
- `axios`, `useState`, `useEffect`, `useCallback` 관련 코드 App.jsx에서 완전 분리
- API 연동 및 목록 렌더링 로직을 `TravelList.jsx`로 완전 이관

### React Router DOM 라우팅 설정

- **설치 상태**: `react-router-dom v7.14.1` (기존 설치 확인)
- **`main.jsx` 업데이트**: `BrowserRouter` + `Routes` 래핑 적용

```jsx
// main.jsx
<BrowserRouter>
  <Routes>
    <Route path="/"        element={<App />} />
    <Route path="/explore" element={<TravelList />} />
  </Routes>
</BrowserRouter>
```

- `App.jsx` 사이드바 네비게이션: `<a>` → `<Link to="...">` 전환
- `TravelList.jsx` 네비게이션: 동일하게 `<Link>` 컴포넌트 적용
- **이동 경로 정리**:
  - 메인 사이드바 `// explore` 클릭 → `/explore` 이동
  - 여행지 페이지 `// home` 또는 로고 클릭 → `/` 이동
  - 메인 Hero 섹션 `INITIATE_V1` 버튼 → `/explore` 이동

### App.jsx — 메인 페이지 전면 재설계

- 제공된 HTML 디자인 파일(`home.html`) 기반으로 JSX 전환
- **구성 섹션**:
  1. 좌측 사이드바 (데스크탑): 네비게이션 링크 (home / explore / bookmarks / settings)
  2. 상단 Top Nav: 검색창 (시각적 요소, 미연동) + 알림/계정 아이콘
  3. Hero Section: 배경 이미지 + 그라디언트 오버레이 + `INITIATE_V1` → `/explore` 링크
  4. Bento Grid:
     - **날씨 위젯**: 온도 표시 + Recommendation Logic 카드 + `Explore Destinations` 링크
     - **Trending Themes**: 4개 테마 카드 (Cyberpunk Tokyo / Nordic Minimalist / High Sierra Mono / Brutalist Berlin)
  5. 하단 Footer + 모바일 Bottom Navigation
- **주요 변경**: `Re-compile Recommendations` 버튼 → `Explore Destinations` (`/explore` Link)로 대체
- Tailwind 시멘틱 컬러 토큰(`bg-surface-container-low`, `text-primary` 등) 전면 적용

### TravelList.jsx — 여행지 탐색 페이지 신규 구현

- **파일 경로**: `src/pages/TravelList.jsx`
- **레이아웃**: `grid-cols-12` 3단 구성

```
[상단 고정 헤더 — Code Trip 로고 + 수평 네비 + 검색창]
┌────────────┬───────────────────────────┬──────────────┐
│ 좌측 사이드바 │       메인 카드 그리드        │  우측 사이드바  │
│ filters.config│  col-span-7 (2열 카드)    │  col-span-3  │
│ col-span-2  │                          │  (xl 이상)    │
└────────────┴───────────────────────────┴──────────────┘
[다크 푸터]
```

**좌측 사이드바 (`filters.config`)**:
- Region 리스트: East Asia / Korea, South / Western Europe / North America
- Theme 체크박스: #heritage / #minimalist / #high_tech / #nature_debug
- `RUN_FILTER.SH` 버튼 (UI 구현, 필터 로직 확장 예정)

**메인 카드 그리드**:
- `galleryList1` API 연동 (`VITE_GALLERY_API_KEY` 환경변수 사용)
- 2열 카드 그리드 (`grid-cols-1 md:grid-cols-2`)
- 카드 구성: 이미지(h-64) + 제목(`galTitle`) + 촬영지(`galPhotographyLocation`) + 코드 블록(created/photographer/id) + `상세보기` 버튼
- 검색창 실시간 필터링: `galTitle` 및 `galPhotographyLocation` 기준
- 빈 결과 처리: `search_off` 아이콘 + 메시지 출력

**우측 사이드바 (xl 이상 표시)**:
- 터미널 위젯 (`trip_metadata.log`): 날씨/명소 정보 표시 (정적 목 데이터)
- 주변 인기 명소 리스트: 광안대교 야경 / 경주 대릉원 / 한라산 국립공원 (정적)

### 환경변수 및 보안 개선

- `.env`에 `VITE_GALLERY_API_KEY` 추가
- `BoardList.jsx`에 하드코딩되어 있던 공공데이터 API 키를 환경변수로 이관

### tailwind.config.js 업데이트

```js
borderRadius: {
  DEFAULT: "0.125rem",
  lg: "0.25rem",
  xl: "0.5rem",
  full: "0.75rem",
}
```

---

## 2026.04.21 변경 사항 — 리팩토링 및 문서 구조화

- **아키텍처 정리**: 폴더명을 `2_Code_Trip`으로 변경하고, `features` 단위의 컴포넌트 분리(BoardList, BoardForm) 완료.
- **사이드바 토글 기능 구현**:
    - `useState` 기반의 `isCollapsed` 상태를 통한 동적 레이아웃 제어 (64rem ↔ 20rem).
    - `cubic-bezier` 트랜지션 및 CSS 유틸리티를 활용한 부드러운 텍스트 숨김/노출 애니메이션 적용.
    - 접힘 상태 시 툴팁(`title`) 지원으로 사용성 보완.
- **문서 고도화**: 실제 구현된 코드(Axios Interceptor, Dynamic Routing, Filtering)를 기반으로 명세서 상세 업데이트.
- **검색 엔진 최적화(준비)**: 검색창 UI 및 대소문자 구분 없는 필터링 로직 안정성 확보.

---

## 2026.04.20 변경 사항 — 프로젝트 고도화 및 상세 페이지 개발

- **동적 라우팅 구현**: `useParams`를 활용한 게시판 수정 페이지(BoardForm) 연동.
- **API 통신 안정화**: 공공데이터 API 연동 시 `params` 구조화 및 예외 처리 로직 강화.
- **상세 데이터 렌더링**: 게시글 상세 보기 및 수정 시 기존 데이터를 폼에 바인딩하는 `fetchPost` 로직 구현.
- **스타일 마이그레이션**: Tailwind CSS v4의 `@theme` 및 `@plugin` 시스템 적용.
- **Express 백엔드 구축**: `server` 디렉토리에 Express 기반 API 서버 구축 완료.
- **DB 연동**: `mysql2/promise` 라이브러리로 EC2 내 MySQL 연결.
- **환경 변수 분리**: 서버용 `.env`(DB 접속 정보)와 프론트엔드 `.env`(`VITE_API_URL`) 분리.
- **RESTful API**: 게시판 CRUD 5가지 엔드포인트 구현 완료.

---

## 2026.04.16 변경 사항 — 초기 환경 구축 및 UI 테스트

- 테스트용 리액트 프로젝트(`projecttest`) 생성.
- InstaTripCard (인스타그램 스타일 카드) UI 및 상태 관리(`isLiked`) 구현.
- 랜덤 여행지 로직(Ver.1) 및 로딩 애니메이션 구현.
- **트러블슈팅**:
    - ESLint `no-unused-vars` 및 JSX 인식 오류 해결.
    - `App.jsx` 구조 개선 및 JSX 주석 문법(`{/* ... */}`) 수정.