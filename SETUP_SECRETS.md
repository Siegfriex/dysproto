# Firebase Functions Secret Manager 환경 변수 설정 가이드

## 현재 상태
- ✅ `GOOGLE_SEARCH_API_KEY`: Secret Manager에 설정됨 (버전 2 활성화)
- ⚠️ `GEMINI_API_KEY`: Secret Manager에 설정됨 (버전 6 활성화, 버전 7은 DESTROYED)

## 방법 1: Firebase Console에서 설정 (권장)

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com/project/dysproto/functions
   ```

2. **각 함수 설정**
   - `analyzeDesign` 함수 클릭 → Configuration 탭
   - `chatWithMentor` 함수 클릭 → Configuration 탭  
   - `searchImages` 함수 클릭 → Configuration 탭

3. **환경 변수 추가**
   - "Environment variables" 섹션에서 "Add variable" 클릭
   - Name: `GEMINI_API_KEY`, Value: Secret Manager의 `GEMINI_API_KEY` 선택
   - Name: `GOOGLE_SEARCH_API_KEY`, Value: Secret Manager의 `GOOGLE_SEARCH_API_KEY` 선택
   - Save 클릭

4. **Functions 재배포**
   ```powershell
   firebase deploy --only functions
   ```

## 방법 2: Secret 값 확인 후 직접 설정

### Secret 값 확인
```powershell
# GEMINI_API_KEY (버전 6 사용)
firebase functions:secrets:access GEMINI_API_KEY@6

# GOOGLE_SEARCH_API_KEY
firebase functions:secrets:access GOOGLE_SEARCH_API_KEY
```

### Firebase Console에서 환경 변수로 설정
위에서 확인한 값을 복사하여 Firebase Console의 각 함수 설정에서 환경 변수로 추가하세요.

## 방법 3: 새 Secret 버전 생성 (GEMINI_API_KEY)

만약 GEMINI_API_KEY의 최신 버전을 사용하고 싶다면:

```powershell
# 새 Secret 버전 생성 (터미널에서 API 키 입력)
echo "YOUR_NEW_GEMINI_API_KEY" | firebase functions:secrets:set GEMINI_API_KEY

# 또는 파일에서 읽기
firebase functions:secrets:set GEMINI_API_KEY --data-file=path/to/key.txt
```

## 확인

설정 완료 후 Functions 로그에서 확인:
```powershell
firebase functions:log --only analyzeDesign
```

환경 변수가 제대로 설정되었는지 확인할 수 있습니다.

