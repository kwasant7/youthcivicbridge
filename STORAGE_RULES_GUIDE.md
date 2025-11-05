# Firebase Storage 보안 규칙 가이드

## 현재 상황
"Your security rules are defined as public" 경고가 나타나는 것은 **정상**입니다.

## 단계별 설정

### 1단계: 테스트용 공개 규칙 (지금 사용)
**경고가 나와도 Publish 버튼을 클릭하세요.**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**장점:**
- ✅ 즉시 작동
- ✅ 인증 없이 테스트 가능

**단점:**
- ⚠️ 누구나 파일 업로드/삭제 가능
- ⚠️ 프로덕션 환경에는 부적합

---

## 2단계: 보안 규칙 (나중에 적용)

### 옵션 A: 읽기는 공개, 쓰기는 제한

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      // 누구나 읽을 수 있음
      allow read: if true;

      // 파일 크기 제한 (10MB)
      allow write: if request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

**특징:**
- 모든 사용자가 사진 볼 수 있음
- 파일 크기와 형식 제한
- 이미지 파일만 허용

### 옵션 B: Firebase Authentication 사용

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      // 누구나 읽을 수 있음
      allow read: if true;

      // 인증된 사용자만 업로드 가능
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

**특징:**
- Firebase Authentication 필요
- 로그인한 사용자만 업로드 가능
- 가장 안전한 방법

### 옵션 C: 관리자만 업로드 (가장 안전)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      // 누구나 읽을 수 있음
      allow read: if true;

      // 특정 이메일만 업로드 가능
      allow write: if request.auth != null
                   && request.auth.token.email == 'williamyoon777@gmail.com'
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

**특징:**
- 관리자 이메일만 업로드 가능
- Firebase Authentication 필요
- 최고 수준의 보안

---

## 규칙 변경 방법

1. Firebase Console > Storage > **Rules** 탭
2. 원하는 규칙으로 코드 변경
3. **Publish** 클릭

---

## 권장 사항

### 개발/테스트 단계 (지금)
- ✅ 공개 규칙 사용 (allow read, write: if true)
- 빠른 테스트 가능

### 프로덕션 배포 전
- ✅ 옵션 A 또는 B로 변경
- Firebase Authentication 추가 고려

### 학교 프로젝트/데모
- ✅ 옵션 A로 충분
- 파일 크기 제한만 적용

---

## FAQ

**Q: 경고 메시지가 계속 나와요**
A: 공개 규칙을 사용하면 항상 경고가 나타납니다. 무시하고 Publish를 눌러도 괜찮습니다.

**Q: 누군가 악의적으로 파일을 업로드할 수 있나요?**
A: 네, 가능합니다. 하지만 학교 프로젝트나 소규모 데모에서는 큰 문제가 되지 않습니다. 나중에 규칙을 강화하세요.

**Q: Storage 비용이 많이 나올까요?**
A: Firebase 무료 플랜:
  - 저장 공간: 5GB
  - 다운로드: 1GB/일
  - 업로드: 무제한

일반적인 학교 프로젝트에는 충분합니다.

**Q: 지금 당장 보안을 강화해야 하나요?**
A: 아니요. 테스트 단계에서는 공개 규칙이 더 편리합니다. 실제 사용자가 많아지면 그때 변경하세요.
