# CivicRising 배포 가이드

## Firebase Hosting으로 배포하기

### 1단계: Firebase 로그인
```bash
firebase login
```
- 브라우저가 열리면 Google 계정으로 로그인
- williamyoon777@gmail.com 계정 사용

### 2단계: 배포
```bash
firebase deploy --only hosting
```

### 3단계: 완료!
배포가 완료되면 다음 URL로 접속할 수 있습니다:
- **메인 URL**: https://civicrising-c9431.web.app
- **대체 URL**: https://civicrising-c9431.firebaseapp.com

## 배포 후 업데이트 방법

파일을 수정한 후 다시 배포하려면:
```bash
firebase deploy --only hosting
```

## 주의사항

1. **Firebase 로그인 필요**: 처음 한 번만 `firebase login` 실행
2. **무료 플랜**: Firebase Hosting은 무료로 사용 가능
   - 저장 공간: 10GB
   - 전송량: 360MB/일
3. **자동 HTTPS**: Firebase가 자동으로 HTTPS 인증서 제공
4. **전 세계 CDN**: 빠른 속도로 전 세계 어디서나 접속 가능

## 커스텀 도메인 연결 (선택사항)

나만의 도메인(예: civicrising.com)을 연결하려면:
1. Firebase Console > Hosting > "커스텀 도메인 추가"
2. 도메인 구매 필요 (연간 약 $10-15)
3. DNS 설정 업데이트

## 문제 해결

### "firebase: command not found"
```bash
npm install -g firebase-tools
```

### 로그인 실패
```bash
firebase logout
firebase login --reauth
```

### 배포 실패
- `.firebaserc` 파일의 프로젝트 ID 확인
- `firebase.json` 파일 확인
