# Firebase 배포 완료 보고서

## 프로젝트 정보
- **GCP Project ID**: dysproto
- **Firebase Project ID**: dysproto
- **배포 날짜**: 2025-11-21
- **배포자**: 6siegfriex@argo.ai.kr

---

## 배포된 서비스

### 1. Firebase Hosting
- **URL**: https://dysproto.web.app
- **상태**: ✅ 배포 완료
- **빌드 출력**: `dist/` 디렉토리
- **마지막 배포**: 2025-11-21

### 2. Cloud Functions (v2)

#### analyzeDesign
- **리전**: asia-northeast3 (서울)
- **런타임**: Node.js 20
- **트리거**: Callable (HTTPS)
- **URL**: https://analyzedesign-894139739522.asia-northeast3.run.app
- **메모리**: 256MB
- **상태**: ✅ 배포 완료
- **접근 권한**: 전체 공개 (수동 설정)

#### chatWithMentor
- **리전**: asia-northeast3 (서울)
- **런타임**: Node.js 20
- **트리거**: Callable (HTTPS)
- **URL**: https://chatwithmentor-894139739522.asia-northeast3.run.app
- **메모리**: 256MB
- **상태**: ✅ 배포 완료
- **접근 권한**: 전체 공개 (수동 설정)

---

## 환경 변수 설정

### Functions 환경 변수
Functions는 `.env` 파일에서 환경 변수를 읽습니다:
```
GEMINI_API_KEY=AIzaSyDbIcUw7J1Bxt-hUvkIwoYawc4No2ldwUY
```

⚠️ **중요**: 프로덕션 배포 시 Secret Manager 사용 권장

---

## 프로젝트 구조

```
dysprototype/
├── components/          # React 컴포넌트
├── services/           # 서비스 레이어 (Gemini API)
├── functions/          # Cloud Functions
│   ├── src/
│   │   └── index.ts   # Functions 진입점
│   ├── lib/           # 컴파일된 출력
│   ├── package.json
│   └── tsconfig.json
├── dist/              # 프론트엔드 빌드 출력
├── firebase.json      # Firebase 설정
├── .firebaserc        # Firebase 프로젝트 연결
└── package.json       # 루트 패키지
```

---

## 배포 명령어

### 전체 배포
```bash
firebase deploy
```

### Functions만 배포
```bash
firebase deploy --only functions
```

### Hosting만 배포
```bash
firebase deploy --only hosting
```

### 특정 Function만 배포
```bash
firebase deploy --only functions:analyzeDesign
firebase deploy --only functions:chatWithMentor
```

---

## 로컬 개발

### 프론트엔드 개발 서버
```bash
npm run dev
```

### Functions 에뮬레이터
```bash
cd functions
npm run serve
```

### 프론트엔드 빌드
```bash
npm run build
```

### Functions 빌드
```bash
cd functions
npm run build
```

---

## 주의사항

1. **환경 변수**: Functions의 `.env` 파일은 `.gitignore`에 포함되어 있습니다. 배포 시 환경 변수를 수동으로 설정해야 합니다.

2. **IAM 권한**: 조직 정책으로 인해 `allUsers` 접근이 차단되어 있습니다. Firebase Console에서 수동으로 IAM 권한을 설정해야 합니다.

3. **GEMINI_API_KEY**: Functions가 시작될 때 환경 변수를 읽지 못하면 경고가 표시됩니다. Secret Manager 사용을 권장합니다.

4. **Firebase Functions 버전**: 현재 firebase-functions v6.3.0 사용 중입니다. 최신 버전으로 업그레이드를 고려하세요.

---

## Secret Manager 설정 (권장)

프로덕션 환경에서는 환경 변수를 Secret Manager로 관리하는 것이 좋습니다:

```bash
# Secret 생성
firebase functions:secrets:set GEMINI_API_KEY

# Functions 코드에서 사용
import { defineSecret } from "firebase-functions/params";
const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const analyzeDesign = onCall(
  {
    region: "asia-northeast3",
    secrets: [geminiApiKey]
  },
  async (request) => {
    const apiKey = geminiApiKey.value();
    // ...
  }
);
```

---

## 다음 단계

1. ✅ Firebase Hosting 배포 완료
2. ✅ Cloud Functions 배포 완료
3. ⚠️ Secret Manager로 환경 변수 마이그레이션 권장
4. ⚠️ 프론트엔드에서 Functions 호출 테스트 필요
5. ⚠️ Firebase Authentication 통합 (필요 시)
6. ⚠️ Firebase Storage 설정 (이미지 업로드 기능용)

---

## 문제 해결

### Functions 배포 실패 시
```bash
# 기존 Functions 삭제
firebase functions:delete FUNCTION_NAME --region REGION --force

# 재배포
firebase deploy --only functions
```

### IAM 권한 문제 시
Firebase Console에서 수동으로 설정:
1. Google Cloud Console → Cloud Run
2. 서비스 선택 (analyzedesign, chatwithmentor)
3. Permissions → Add Principal
4. "allUsers" 또는 "allAuthenticatedUsers" 추가
5. Role: "Cloud Run Invoker" 선택

---

## 배포 완료 ✅

모든 서비스가 성공적으로 배포되었습니다!

- Hosting: https://dysproto.web.app
- analyzeDesign: https://analyzedesign-894139739522.asia-northeast3.run.app
- chatWithMentor: https://chatwithmentor-894139739522.asia-northeast3.run.app
