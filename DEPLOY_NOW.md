# 🚀 CivicRising 지금 바로 배포하기

## 방법 1: Firebase Hosting (추천)

### 단계별 가이드:

#### 1. 터미널 열기
현재 이 터미널을 사용하세요.

#### 2. Firebase 로그인
```bash
firebase login
```
- 브라우저가 자동으로 열립니다
- Google 계정(williamyoon777@gmail.com)으로 로그인
- "Firebase CLI가 Google 계정에 액세스하도록 허용" 클릭
- "로그인 성공" 메시지 확인

#### 3. 배포 실행
```bash
cd /home/tototong/Civic
firebase deploy --only hosting
```

#### 4. 완료! 🎉
배포가 완료되면 다음 URL이 표시됩니다:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/civicrising-c9431/overview
Hosting URL: https://civicrising-c9431.web.app
```

---

## 방법 2: GitHub Pages (대안)

### 준비물:
- GitHub 계정 필요

### 단계:
1. GitHub에 저장소 생성
2. 코드 푸시
3. Settings > Pages에서 활성화
4. URL: `https://yourusername.github.io/civicrising`

---

## 방법 3: Netlify (가장 쉬움)

### 단계:
1. https://app.netlify.com 접속
2. "Add new site" > "Deploy manually"
3. Civic 폴더 전체를 드래그 앤 드롭
4. 즉시 배포 완료!
5. URL: `https://random-name.netlify.app`

---

## 💡 추천 순서

1. **Netlify** - 가장 빠르고 쉬움 (2분 완료)
2. **Firebase Hosting** - 이미 Firebase 사용 중이므로 통합 관리
3. **GitHub Pages** - 버전 관리와 함께 사용

---

## Netlify 빠른 배포 (지금 바로!)

1. https://app.netlify.com/drop 접속
2. Civic 폴더를 웹페이지로 드래그 앤 드롭
3. 완료! URL이 즉시 생성됩니다

---

## 배포 후 URL 공유

배포가 완료되면 다음과 같은 URL을 받습니다:
- Firebase: `https://civicrising-c9431.web.app`
- Netlify: `https://civicrising-abc123.netlify.app`
- GitHub: `https://yourusername.github.io/civicrising`

이 URL을 친구들과 공유하세요! 🎉
