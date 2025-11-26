# 🧬 User Style DNA & Bulk Processing Strategy

## 1. 개요 (Overview)
사용자의 개별 작업물들을 분석하여 **정규화된 JSON 데이터(Style DNA)**로 축적하고, 이를 기반으로 **"나의 스타일"**에 맞는 레퍼런스를 서칭하거나 새로운 디자인을 생성/편집하는 시스템을 제안합니다.

## 2. 핵심 컨셉: "Visual DNA" (Style Profile)

단순히 이미지를 모아두는 것이 아니라, **"사용자의 취향을 수학적 벡터와 통계적 분포로 정의"**하는 것이 핵심입니다.

### 2.1 데이터 구조 (JSON Schema)
각 유저(`users/{userId}`)는 하나의 `style_profile` 문서를 가지며, 이는 모든 작업물의 집합적 특성을 담습니다.

```json
{
  "userId": "user_123",
  "lastUpdated": "2025-11-26T12:00:00Z",
  "totalWorksAnalyzed": 15,
  "dna": {
    // 1. 벡터 임베딩의 평균 (Centroid) - 스타일의 "중심점"
    "styleVector": [0.12, -0.54, 0.33, ...], 
    
    // 2. 선호 색상 분포 (Clustered)
    "colorPreferences": [
      { "hex": "#FF5733", "weight": 0.4 }, // 자주 쓰는 메인 컬러
      { "hex": "#333333", "weight": 0.2 }
    ],
    
    // 3. 메트릭 성향 (Radar Chart Data)
    "metricsAverage": {
      "layout": 85,      // 레이아웃을 중시함
      "typography": 60,
      "color": 90,       // 색감에 민감함
      "components": 70,
      "formLanguage": 50
    },
    
    // 4. 주요 키워드 (Word Cloud)
    "topKeywords": ["minimal", "pastel", "rounded", "mobile-first"]
  }
}
```

---

## 3. 업로드 탭 UX 혁신: "Batch & Source"

단순 1회성 업로드가 아닌, **"나의 스타일 소스(Source)"**를 구축하는 과정으로 업로드 경험을 재설계합니다.

### 3.1 대량 업로드 (Bulk Upload)
- **기능**: 사용자가 폴더째로 이미지를 드래그하거나, 여러 장(10장 이상)을 한 번에 선택.
- **처리**:
    1. 클라이언트에서 비동기 병렬 업로드.
    2. 백엔드에서 개별 분석(`analyzeDesign`) 수행.
    3. 분석 완료 후 **`aggregateUserStyle`** 트리거가 발동하여 `style_profile` 갱신.
- **UI**: "내 스타일 DNA 강화하기" 버튼으로 접근. 업로드 진행률과 함께 "DNA 정밀도가 85%로 상승했습니다" 같은 피드백 제공.

### 3.2 포트폴리오 임포트 (Portfolio Import)
- **기능**: Behance, Dribbble, Pinterest 보드 URL 입력.
- **처리**: 크롤러가 이미지를 수집하여 분석 파이프라인에 태움. (Phase 2)

---

## 4. 백엔드 로직: 스타일 집계 및 정규화

### 4.1 Aggregation Logic (Cloud Function)
새로운 분석 결과가 나올 때마다 유저의 DNA를 재계산합니다.

1.  **Vector Update**: `New_Vector = (Old_Vector * N + Current_Vector) / (N + 1)` (이동 평균)
2.  **Weighted Update**: 최근 작업물에 더 높은 가중치를 부여하여 "현재의 취향"을 반영.
3.  **Outlier Removal**: 전체 스타일에서 너무 동떨어진 작업물(예: 갑자기 업로드한 밈 이미지)은 DNA 계산에서 제외하거나 가중치 축소.

---

## 5. 활용: 스타일 기반 서칭 및 생성 (Target Goal)

### 5.1 "내 스타일로 서칭" (Style-based Search)
- **기존**: 텍스트 검색 ("모던한 UI") → 텍스트 매칭 결과.
- **변경**: **"내 DNA 기반 추천"** 토글 활성화.
    - 쿼리: `Search_Vector = User_Style_Vector`
    - 결과: 내 취향(색감, 레이아웃 밀도 등)과 유사한 레퍼런스 우선 노출.
    - **편집 서칭**: "내 스타일인데(Base), 컬러만 파란색으로(Modifier)" 같은 복합 쿼리 가능.

### 5.2 "내 스타일로 생성/편집" (Generative UI)
- **기능**: 프롬프트 입력 시 내 DNA JSON을 시스템 프롬프트(Context)로 주입.
- **프롬프트 예시**:
    > "System: You are a UI designer who follows this style DNA: {User_DNA_JSON}.
    > User: Create a login page."
- **결과**: 사용자가 평소에 쓰는 여백, 폰트 스타일, 컬러 톤을 반영한 로그인 페이지 초안 생성.

---

## 6. 구현 로드맵 (Action Items)

1.  **DB Schema Update**: `users` 컬렉션 하위에 `style_profile` 구조 설계.
2.  **Backend**: `aggregateUserStyle` Cloud Function 구현 (평균 벡터 계산 로직).
3.  **Frontend (Upload)**: `react-dropzone`을 활용한 다중 파일 업로드 UI 구현.
4.  **Frontend (Search)**: 검색 API 호출 시 `userId`를 함께 보내 백엔드에서 DNA 벡터를 조회하도록 수정.
