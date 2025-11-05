# Firebase Storage 설정 가이드

## 문제 상황
이미지 업로드 시 "Uploading... 0%"에서 멈추는 경우, Firebase Storage 권한 설정이 필요합니다.

## 해결 방법

### 1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: **civicrising-c9431**

### 2. Storage 규칙 설정
1. 왼쪽 메뉴에서 **Storage** 클릭
2. 상단 탭에서 **Rules** 클릭
3. 기존 규칙을 다음과 같이 수정:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // 모든 사용자가 읽기 가능, 쓰기 가능 (개발/테스트용)
      allow read, write: if true;
    }
  }
}
```

4. **Publish** 버튼 클릭하여 저장

### 3. (권장) 보안 규칙 설정
위의 규칙은 개발/테스트용입니다. 프로덕션 환경에서는 다음과 같이 설정하세요:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      // 모든 사용자가 읽을 수 있지만, 인증된 사용자만 업로드 가능
      allow read: if true;
      allow write: if request.auth != null;

      // 파일 크기 제한 (10MB)
      allow write: if request.resource.size < 10 * 1024 * 1024;

      // 이미지 파일만 허용
      allow write: if request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 4. Storage 활성화 (중요!)
1. Firebase Console > Storage
2. Storage가 활성화되어 있는지 확인
3. 활성화되어 있지 않다면 **Get Started** 버튼 클릭
4. "Start in test mode" 선택 (또는 "Start in production mode")
5. 리전 선택 (권장: `asia-northeast3` - 서울)
6. **Done** 버튼 클릭

**무료 플랜으로도 Storage 사용 가능합니다!**
- 저장 공간: 5GB
- 다운로드: 1GB/일
- 업로드: 무제한

### 5. 브라우저 테스트
1. 브라우저에서 `http://localhost:8000/team.html` 접속
2. **F12** 키를 눌러 개발자 도구 열기
3. **Console** 탭 확인
4. "Add Photo" 버튼 클릭하여 이미지 업로드 테스트
5. Console에 에러 메시지가 있는지 확인

### 6. 일반적인 에러 메시지

#### "storage/unauthorized"
- Firebase Storage 규칙이 업로드를 허용하지 않음
- 위의 규칙을 적용하여 해결

#### "Firebase Storage is not initialized"
- Firebase Storage SDK가 로드되지 않음
- team.html에 Storage SDK 스크립트가 포함되어 있는지 확인

#### CORS 에러
- 로컬 파일을 직접 열지 말고 HTTP 서버를 통해 접속
- `python3 -m http.server 8000` 실행 후 `http://localhost:8000` 접속

## 추가 도움말

### Storage 사용량 확인
- Firebase Console > Storage > Usage 탭에서 확인
- 무료 플랜: 5GB 저장 공간, 1GB/일 다운로드

### 이미지 최적화 팁
- 업로드 전 이미지 크기 조정 (권장: 1920px 이하)
- JPEG 품질 80-85% 사용
- WebP 포맷 사용 고려

## 문제가 계속되는 경우
1. 브라우저 콘솔의 에러 메시지 확인
2. Firebase Console에서 Storage 규칙이 올바르게 적용되었는지 확인
3. 브라우저 캐시 삭제 후 재시도
