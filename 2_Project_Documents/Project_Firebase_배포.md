# CodeTrip Firebase 배포 전환 문서

> 작성일: 2026-05-02  
> 대상 브랜치: `firebase`  
> 배포 URL: https://newagent-9c2a8.web.app  
> Realtime Database URL: `https://newagent-9c2a8.firebaseio.com`

---

## 1. 문서 목적

이 문서는 CodeTrip 프로젝트를 기존 Express/MySQL 기반 구조에서 Firebase 기반 무료 배포 구조로 전환한 작업 내역을 정리합니다.

기존 `main` 브랜치는 팀 협업용 코드 흐름을 유지하고, Firebase 배포 버전은 별도 `firebase` 브랜치에서 관리합니다. 따라서 본 문서는 `firebase` 브랜치 기준의 배포, 설정, 데이터 구조, 운영 방법을 설명합니다.

---

## 2. 전환 배경

초기 배포 방향은 Firebase Hosting에 프론트엔드를 배포하고, Express 서버는 Cloud Run, MySQL은 Cloud SQL로 운영하는 구조였습니다.

하지만 다음 이유로 Cloud SQL/Firestore 대신 Realtime Database로 방향을 변경했습니다.

1. Cloud SQL은 계속 무료로 운영하기 어렵습니다.
2. 복구한 Firebase 프로젝트 `newagent-9c2a8`의 기본 Firestore DB가 `DATASTORE_MODE`였습니다.
3. `DATASTORE_MODE` DB는 Firebase Web SDK용 Firestore Native mode로 바로 사용할 수 없습니다.
4. 별도 Firestore Native DB 생성을 시도했지만 결제 연결이 필요했습니다.
5. 프로젝트 목적이 소규모 시연/개인 배포이므로 Realtime Database로도 충분하다고 판단했습니다.

최종 결정:

```text
Firebase Hosting
+ Firebase Authentication
+ Firebase Realtime Database
+ Vite/React 프론트 단독 배포
```

---

## 3. 최종 아키텍처

### 3.1 기존 구조

```text
React/Vite Frontend
  -> /api
  -> Express Server
  -> MySQL
```

주요 구성:

```text
server/index.js
server/routes/*
server/config/db.js
server/db/init.js
src/api/axiosInstance.js
src/api/*Api.js
```

### 3.2 Firebase 전환 후 구조

```text
React/Vite Frontend
  -> Firebase Auth
  -> Firebase Realtime Database
  -> 공공데이터 API 직접 호출
  -> Firebase Hosting
```

서버 없이 브라우저에서 직접 Firebase SDK를 사용합니다.

```text
src/firebase.js
src/api/authApi.js
src/api/boardApi.js
src/api/wishlistApi.js
src/api/travelCommentApi.js
src/api/notificationApi.js
database.rules.json
firebase.json
```

---

## 4. Firebase 프로젝트 설정

### 4.1 사용 프로젝트

```text
Firebase Project ID: newagent-9c2a8
Firebase Project Name: CodeTrip
Hosting URL: https://newagent-9c2a8.web.app
Realtime Database URL: https://newagent-9c2a8.firebaseio.com
```

### 4.2 Firebase 콘솔에서 활성화한 기능

Firebase 콘솔에서 다음 기능을 사용합니다.

```text
Build
  Authentication
  Realtime Database
  Hosting
```

Storage는 사용하지 않습니다. 프로필 이미지는 Firebase Storage 대신 data URL로 저장하도록 변경했습니다.

---

## 5. 환경 변수

루트 `.env`에 Firebase 웹 앱 설정과 Realtime Database URL을 추가했습니다.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=newagent-9c2a8.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=newagent-9c2a8
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=https://newagent-9c2a8.firebaseio.com
```

주의:

- `VITE_` 접두사가 붙은 값은 브라우저 번들에 포함됩니다.
- Firebase 웹 config는 비밀키가 아니지만, DB 보안은 반드시 Firebase Rules로 제어해야 합니다.
- `server/.env`는 Firebase 배포 버전에서는 사용하지 않습니다.

---

## 6. 코드 변경 요약

### 6.1 Firebase SDK 추가

`firebase` 패키지를 설치했습니다.

```bash
npm install firebase
```

변경 파일:

```text
package.json
package-lock.json
```

### 6.2 Firebase 초기화 파일 추가

파일:

```text
src/firebase.js
```

역할:

```text
Firebase App 초기화
Firebase Auth 인스턴스 생성
Realtime Database 인스턴스 생성
```

현재 구조:

```js
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const realtimeDb = getDatabase(firebaseApp);
```

### 6.3 공통 Firebase 헬퍼 추가

파일:

```text
src/api/firebaseHelpers.js
```

주요 역할:

```text
현재 로그인 사용자 조회
localStorage 사용자 정보 조회
Realtime Database snapshot -> 배열 변환
날짜 ISO 문자열 변환
좋아요 map -> userId 배열 변환
게시글/댓글 응답 shape 정규화
```

---

## 7. API 레이어 전환 내역

기존에는 `axios`로 Express API를 호출했습니다.

```text
/api/signup
/api/login
/api/board/posts
/api/wishlist/details
/api/travel-comments/:contentId
/api/notifications
```

Firebase 전환 후에는 각 API 파일이 Realtime Database SDK를 직접 호출합니다.

### 7.1 인증 API

파일:

```text
src/api/authApi.js
```

전환 내용:

```text
회원가입: createUserWithEmailAndPassword
로그인: signInWithEmailAndPassword
비밀번호 재설정: sendPasswordResetEmail
비밀번호 변경: reauthenticateWithCredential + updatePassword
프로필 수정: updateProfile + users/{uid} update
관심 지역 저장: users/{uid}/favoriteRegions
```

기존 JWT 기반 인증은 Firebase Auth 토큰 기반으로 대체했습니다. 다만 기존 화면 호환을 위해 `trip_user`, `trip_token` localStorage 구조는 유지했습니다.

### 7.2 게시판 API

파일:

```text
src/api/boardApi.js
```

전환 내용:

```text
boardPosts
boardComments
notifications
```

지원 기능:

```text
게시글 목록 조회
게시글 상세 조회
게시글 작성/수정/삭제
게시글 조회수 증가
게시글 좋아요
게시글 댓글 작성/수정/삭제
댓글 좋아요
내가 쓴 게시글 조회
내가 쓴 게시글 댓글 조회
내가 좋아요한 게시글 조회
내가 쓴 여행지 댓글 조회
```

Realtime Database는 Firestore처럼 복합 쿼리가 강하지 않으므로, 소규모 데이터 기준으로 전체 데이터를 읽고 클라이언트에서 필터링/정렬합니다.

### 7.3 여행지 댓글 API

파일:

```text
src/api/travelCommentApi.js
```

전환 내용:

```text
travelComments
wishlists
notifications
```

지원 기능:

```text
여행지별 댓글 조회
여행지 댓글 작성/수정/삭제
여행지 댓글 좋아요
찜한 여행지에 댓글 작성 시 알림 생성
```

### 7.4 알림 API

파일:

```text
src/api/notificationApi.js
```

전환 내용:

```text
notifications
```

지원 기능:

```text
알림 목록 조회
읽지 않은 알림 수 계산
전체 읽음 처리
개별 읽음 처리
개별 알림 삭제
읽은 알림 전체 삭제
```

### 7.5 위시리스트 API

파일:

```text
src/api/wishlistApi.js
```

전환 내용:

```text
wishlists
wishlistFolders
wishlistNotes
```

지원 기능:

```text
찜 목록 조회
찜 추가/삭제 toggle
폴더 목록 조회
폴더 생성/수정/삭제
여행지 폴더 이동
폴더별 노트 조회
노트 생성
체크리스트 완료 toggle
노트 삭제
```

### 7.6 공공데이터 API

파일:

```text
src/api/travelApi.js
src/api/travelInfoApi.js
```

기존에는 Express 서버가 공공데이터 API 프록시 및 캐시 역할을 했습니다.

Firebase 무료 배포 버전에서는 서버를 제거했으므로 브라우저에서 공공데이터 API를 직접 호출하도록 변경했습니다.

주의:

- 서버 캐시가 사라졌으므로 API 호출량이 많아지면 429 또는 CORS 문제가 발생할 수 있습니다.
- 소규모 시연에서는 허용 가능한 수준으로 판단했습니다.

---

## 8. Realtime Database 데이터 구조

현재 Realtime Database는 다음 JSON 트리 구조를 사용합니다.

```json
{
  "users": {
    "uid": {
      "email": "user@example.com",
      "name": "User Name",
      "profileImg": "",
      "favoriteRegions": ["11", "26"],
      "created_at": "2026-05-02T00:00:00.000Z",
      "updated_at": "2026-05-02T00:00:00.000Z"
    }
  },
  "boardPosts": {
    "postId": {
      "user_id": "uid",
      "nickname": "User Name",
      "title": "게시글 제목",
      "content": "게시글 내용",
      "tags": [],
      "view_count": 0,
      "likeUserIds": {
        "uid": true
      },
      "created_at": "2026-05-02T00:00:00.000Z",
      "updated_at": "2026-05-02T00:00:00.000Z"
    }
  },
  "boardComments": {
    "commentId": {
      "post_id": "postId",
      "user_id": "uid",
      "nickname": "User Name",
      "body": "댓글 내용",
      "likeUserIds": {},
      "created_at": "2026-05-02T00:00:00.000Z",
      "updated_at": "2026-05-02T00:00:00.000Z"
    }
  },
  "travelComments": {
    "commentId": {
      "content_id": "12345",
      "user_id": "uid",
      "nickname": "User Name",
      "body": "댓글 내용",
      "likeUserIds": {},
      "created_at": "2026-05-02T00:00:00.000Z",
      "updated_at": "2026-05-02T00:00:00.000Z"
    }
  },
  "wishlists": {
    "wishlistId": {
      "user_id": "uid",
      "contentId": "12345",
      "title": "여행지명",
      "imageUrl": "",
      "folder_id": null,
      "created_at": "2026-05-02T00:00:00.000Z"
    }
  },
  "wishlistFolders": {
    "folderId": {
      "user_id": "uid",
      "name": "여행 폴더",
      "start_date": "2026-05-10",
      "end_date": "2026-05-12",
      "created_at": "2026-05-02T00:00:00.000Z",
      "updated_at": "2026-05-02T00:00:00.000Z"
    }
  },
  "wishlistNotes": {
    "noteId": {
      "folder_id": "folderId",
      "user_id": "uid",
      "content": "준비물",
      "type": "CHECKLIST",
      "is_completed": false,
      "created_at": "2026-05-02T00:00:00.000Z"
    }
  },
  "notifications": {
    "notificationId": {
      "user_id": "uid",
      "message": "알림 메시지",
      "content_id": "/board/postId",
      "is_read": false,
      "created_at": "2026-05-02T00:00:00.000Z"
    }
  }
}
```

---

## 9. 보안 규칙

파일:

```text
database.rules.json
```

주요 원칙:

```text
users/{uid}: 본인만 읽기/쓰기
boardPosts: 누구나 읽기, 로그인 사용자만 쓰기
boardComments: 누구나 읽기, 로그인 사용자만 쓰기
travelComments: 누구나 읽기, 로그인 사용자만 쓰기
wishlists: 로그인 사용자만 읽기, 본인 데이터만 쓰기
wishlistFolders: 로그인 사용자만 읽기, 본인 데이터만 쓰기
wishlistNotes: 로그인 사용자만 읽기, 본인 데이터만 쓰기
notifications: 로그인 사용자만 읽기, 본인 데이터만 쓰기
```

주의:

현재 Realtime Database 특성상 `wishlists`, `wishlistFolders`, `wishlistNotes`, `notifications`는 로그인 사용자 전체에게 read가 열려 있고, 클라이언트에서 `user_id`로 필터링합니다. 소규모 시연용으로는 동작하지만, 실제 운영 서비스라면 사용자별 하위 경로 구조로 재설계하는 것이 더 안전합니다.

예시 개선 구조:

```text
userWishlists/{uid}/{wishlistId}
userFolders/{uid}/{folderId}
userNotifications/{uid}/{notificationId}
```

---

## 10. Firebase 설정 파일

### 10.1 `.firebaserc`

Firebase CLI의 기본 프로젝트를 지정합니다.

```json
{
  "projects": {
    "default": "newagent-9c2a8"
  }
}
```

### 10.2 `firebase.json`

Hosting과 Realtime Database Rules 배포 설정입니다.

```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

SPA 라우팅을 위해 모든 경로를 `/index.html`로 rewrite합니다.

---

## 11. 배포 절차

Firebase 배포 버전은 반드시 `firebase` 브랜치에서 작업합니다.

```bash
git switch firebase
npm run build
npx firebase-tools deploy --only hosting,database
```

배포 성공 시 확인할 URL:

```text
https://newagent-9c2a8.web.app
```

Realtime Database 데이터 확인:

```text
Firebase Console
-> Build
-> Realtime Database
-> Data
```

---

## 12. 검증 내역

전환 작업 후 다음 명령을 실행했습니다.

```bash
npm run build
npm run lint
npx firebase-tools deploy --only hosting,database
```

결과:

```text
npm run build: 성공
npm run lint: 오류 없음, 기존 React Hook warning 12개 확인
firebase deploy: Hosting + Realtime Database rules 배포 성공
```

배포 완료 메시지:

```text
Hosting URL: https://newagent-9c2a8.web.app
```

---

## 13. Git 브랜치 운영

### 13.1 브랜치 분리 이유

`main` 브랜치는 팀 협업용 기존 코드 흐름을 유지합니다.  
Firebase 배포 버전은 개인 배포 목적이므로 `firebase` 브랜치에서만 관리합니다.

```text
main
  팀 협업용, 기존 Express/MySQL 구조 유지

firebase
  개인 배포용, Firebase Auth + Realtime Database 구조
```

### 13.2 작업 커밋

Firebase 전환 커밋:

```text
b921ebf 260502 feat: Firebase Realtime Database 전환
```

### 13.3 PR 상태

PR:

```text
#16 260502 feat: Firebase Realtime Database 전환
base: main
compare: firebase
```

이 PR은 main에 병합하지 않고 draft 상태로 유지하는 것을 권장합니다.

주의:

```text
Merge pull request 버튼을 누르면 firebase 작업이 main에 병합됩니다.
main을 건드리지 않으려면 병합하지 않습니다.
```

---

## 14. 기능 테스트 체크리스트

배포 후 다음 순서로 테스트합니다.

```text
1. 회원가입
2. 로그인
3. 게시글 작성
4. 게시글 상세 조회
5. 게시글 좋아요
6. 게시글 댓글 작성/수정/삭제
7. 여행지 상세 페이지 댓글 작성
8. 여행지 찜 추가/삭제
9. 위시리스트 폴더 생성/수정/삭제
10. 폴더 노트/체크리스트 생성
11. 알림 생성/읽음/삭제
12. 설정 페이지에서 관심 지역 저장
13. Firebase 콘솔 Realtime Database에서 데이터 생성 확인
```

---

## 15. 현재 한계와 주의사항

### 15.1 서버 캐시 제거

Express 서버를 제거하면서 기존 서버 메모리 캐시도 사라졌습니다.

영향:

```text
공공데이터 API 호출이 브라우저에서 직접 발생
API 호출량 증가 가능
429 Too Many Requests 가능성 증가
CORS 정책 영향 가능
```

소규모 시연에서는 허용 가능한 수준으로 판단했습니다.

### 15.2 Realtime Database 쿼리 한계

Realtime Database는 Firestore보다 복합 쿼리가 약합니다.

현재 처리 방식:

```text
게시글 검색: 전체 게시글 로드 후 클라이언트 필터
좋아요순 정렬: 전체 게시글 로드 후 클라이언트 정렬
내 활동 조회: 전체 댓글/게시글 로드 후 클라이언트 필터
```

데이터가 많아질 경우 개선이 필요합니다.

### 15.3 프로필 이미지 저장 방식

Firebase Storage를 사용하지 않고 data URL을 Realtime Database에 저장합니다.

장점:

```text
Storage 설정 불필요
무료 배포 흐름 단순화
```

단점:

```text
이미지 크기가 커지면 DB 용량 증가
많은 사용자에게 적합하지 않음
```

현재 `Settings.jsx`에서 이미지 압축 후 업로드하므로 시연용으로는 충분합니다.

### 15.4 보안 규칙 개선 여지

현재 구조는 기존 화면 구조를 최대한 유지하기 위해 루트 컬렉션 형태를 유지했습니다.

실제 운영 서비스라면 다음 구조가 더 안전합니다.

```text
users/{uid}
userWishlists/{uid}/{wishlistId}
userNotifications/{uid}/{notificationId}
```

---

## 16. 향후 개선 방향

1. 사용자별 데이터 경로 재설계
2. Realtime Database index 규칙 추가
3. 공공데이터 API 호출 캐싱 전략 보완
4. Firebase Storage 또는 압축 이미지 정책 개선
5. Firebase Hosting preview channel 도입
6. CI/CD에서 `firebase` 브랜치만 자동 배포하도록 분리
7. README의 기존 Express/MySQL 설명과 Firebase 배포 설명을 브랜치별로 명확히 분리

---

## 17. 운영 명령어 요약

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 린트

```bash
npm run lint
```

### Firebase 배포

```bash
npx firebase-tools deploy --only hosting,database
```

### Firebase 브랜치 작업 흐름

```bash
git switch firebase

# 작업
npm run build
npx firebase-tools deploy --only hosting,database

git add -A
git commit -m "260502 fix: ..."
git push origin firebase
```

---

## 18. 결론

Firebase 전환 버전은 CodeTrip을 무료로 배포하고 시연하기 위한 개인 배포 브랜치입니다.  
`main` 브랜치의 팀 협업용 Express/MySQL 구조와 병합하지 않고, `firebase` 브랜치에서 별도 운영하는 것이 가장 안전합니다.

