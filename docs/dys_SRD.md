# 📋 dys SRD (System Requirements Document)

**작성일자**: 2025년 11월 4일  
**문서 버전**: 1.3  
**상태**: 초기 기술 요구사항 정의 (인프라 설정 추가, Phase 0 완료 반영, 구현 상태 정정, 프로젝트명 통일)  
**참조 문서**: BRD.md (버전 1.2), SYSTEM_DEVELOPMENT_STATUS_REPORT.md

---

## 📌 0. 문서 정보

| 항목 | 내용 |
|------|------|
| **프로젝트명** | dysproto (Design Intelligence Support System) |
| **문서 유형** | System Requirements Document (SRD) |
| **관련 문서** | BRD.md (비즈니스 요구사항), SYSTEM_DEVELOPMENT_STATUS_REPORT.md (현재 구현 현황) |
| **작성 목적** | BRD의 비즈니스 요구사항을 기술적 요구사항으로 변환하고, 현재 구현 상태와의 Gap을 명확히 식별 |

---

## 🎯 1. 개요 및 목적

### 1.1 시스템 목적

본 SRD는 **dysproto (Design Intelligence Support System)**의 기술적 요구사항을 정의합니다. 이 문서는 BRD.md의 비즈니스 요구사항을 기술적 구현 관점에서 재정의하고, 현재 시스템 구현 현황(`SYSTEM_DEVELOPMENT_STATUS_REPORT.md` 기반)과의 Gap을 명확히 식별합니다.

### 1.2 시스템 범위

**포함 범위**:
- 디자인 이미지 분석 및 데이터화 시스템
- MultiLLM 기반 AI 분석 엔진
- 실시간 데이터 동기화 및 대시보드
- 사용자 인터페이스 및 경험 최적화
- 벤치마킹 및 성능 추적 시스템

**제외 범위**:
- 외부 디자인 플랫폼(Behance, Pinterest)의 직접 통합 (API 연동 제외)
- 사용자 인증 시스템 (현재 익명 접근 지원, 향후 확장 예정)
- dysBlPrint Phase 1-4의 고급 기능 (향후 구현 예정)

### 1.3 인프라 정보

- **GCP Project ID**: `dysproto`
- **Firebase Project ID**: `dysproto`
- **Firebase Project Number**: `894139739522`
- **Service Account**: `firebase-adminsdk-fbsvc@dysproto.iam.gserviceaccount.com`
- **Credential Path**: `C:/dys/user/dysproto-firebase-adminsdk-fbsvc-c11f2c761d.json`

#### 1.3.1 Firebase Storage
- **Bucket URL**: `gs://dysproto.firebasestorage.app`
- **리전**: `us-east-1` ⚠️ (주의: asia-northeast3 아님)
- **용도**: 이미지 파일 저장
- **초기 경로 구조**: `users/{userId}/analyses/{timestamp}_{filename}`

#### 1.3.2 Firebase Authentication
- **인증 방식**: 익명 인증 (Phase 0 초기 설정)
- **용도**: 사용자 식별 및 세션 관리
- **향후 확장**: 이메일/비밀번호, 소셜 로그인 (Google, GitHub 등)

#### 1.3.3 Cloud Firestore
- **데이터베이스 이름**: `dysproto`
- **모드**: Standard (네이티브 모드)
- **리전**: `asia-northeast3` (서울)
- **주요 컬렉션**: 
  - `analyses` - 분석 결과 저장 (AnalysisDocument)
  - `chatSessions` - AI 챗봇 세션 저장 (ChatSessionDocument)
  - `users` - 사용자 프로필 저장 (UserDocument)
  - `bookmarks` - 북마크 저장 (BookmarkDocument)
  - `collections` - 컬렉션 저장 (CollectionDocument)
- **보안 규칙**: 테스트 모드 (2025-12-19까지)
- **용도**: 분석 결과 및 사용자 데이터 저장

#### 1.3.4 Cloud Functions
- **리전**: `asia-northeast3` (서울)
- **Runtime**: Node.js 20
- **API Key 관리**: Secret Manager (OPENAI_API_KEY)

### 1.4 참조 문서

- **BRD.md**: 비즈니스 요구사항 정의 (Section 3의 4개 주요 기능)
- **SYSTEM_DEVELOPMENT_STATUS_REPORT.md**: 현재 구현 현황 상세 분석
- **dysBlPrint.md**: 향후 시스템 확장 청사진 (참고용)

---

## 📋 2. 기능 요구사항 (Functional Requirements)

**사용자 여정 중심 구조**: 업로드 및 분석 → 서칭 → 마이 페이지 → 설정

---

### 2.1 업로드 및 분석 기능 (Upload & Analysis)

**BRD 참조**: Section 3.1  
**사용자 여정**: 이미지 업로드 → 분석 실행 → 결과 확인

#### 2.1.1 FR-1.1: 이미지 업로드 시스템

**요구사항**:
- 사용자는 포트폴리오 이미지를 시스템에 업로드할 수 있어야 함
- **드래그 앤 드롭 인터페이스 제공** (신규)
  - 파일을 드래그하여 업로드 영역에 드롭 가능
  - 드롭 영역 시각적 피드백 제공
- **파일 포맷 가이드 텍스트 제공** (신규)
  - 지원 형식: JPEG, PNG, WebP (image/* MIME 타입)
  - 최대 파일 크기: 5MB 안내
  - 파일 포맷 가이드 텍스트를 업로드 영역에 표시
- **가이드 버튼 (서비스 소개 핀 가이드)** (신규)
  - 서비스 사용법 및 주요 기능 소개
  - 핀 형태의 가이드 오버레이 제공
  - 첫 방문 사용자에게 자동 표시 옵션
- 업로드 즉시 Firebase Storage에 저장
- 업로드 완료 후 Firestore에 분석 요청 문서 생성

**현재 구현 상태**: ✅ 대부분 구현 완료 (85%)
- ✅ `UploadAnalysis.tsx`: 드래그 앤 드롭 인터페이스 구현 완료
- ✅ 파일 포맷 가이드 텍스트 표시 (JPEG, PNG, WebP, 최대 5MB)
- ✅ `analyzeDesign`: Callable Function으로 이미지 분석 구현
- ✅ Storage 업로드 및 Firestore 저장 구현
- ⚠️ 가이드 버튼 없음 (향후 구현 예정)

**기술 명세**:
```typescript
// 프론트엔드: components/UploadAnalysis.tsx
const storageRef = ref(storage, `users/${userId}/analyses/${timestamp}_${fileName}`);
await uploadBytes(storageRef, imageFile);

// 백엔드: Cloud Function 트리거
onObjectFinalized: (object) => {
  if (object.contentType.startsWith("image/") && 
      object.name.startsWith("users/")) {
    // 분석 시작
  }
}
```

**Gap 분석**:
- ✅ **Gap-1.1.1 해결됨**: 드래그 앤 드롭 인터페이스 구현 완료 (`UploadAnalysis.tsx`)

- **Gap-1.1.2**: 가이드 시스템 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 낮음
  - 해결 방안: React Joyride 또는 커스텀 가이드 컴포넌트 구현

#### 2.1.2 FR-1.2: 분석 실행

**요구사항**:
- **분석 버튼 제공** (신규)
  - 첨부된 이미지에 대해 분석을 시작할 수 있는 버튼 제공
  - 분석 중 상태 표시 (로딩 인디케이터)
- **분석 상태 실시간 추적**
  - Firestore 리스너를 통한 실시간 상태 업데이트
  - "analyzing" → "completed" / "failed" 상태 전환 표시

**현재 구현 상태**: ✅ 구현 완료 (90%)
- ✅ 파일 선택 시 자동 분석 시작 (`analyzeDesign` Callable Function 호출)
- ✅ 분석 중 상태 표시 (로딩 인디케이터 및 진행 메시지)
- ✅ 분석 완료 후 결과 자동 표시
- ⚠️ 명시적 분석 버튼 없음 (업로드 시 자동 시작, 향후 옵션 추가 가능)

**Gap 분석**:
- **Gap-1.2.1**: 명시적 분석 버튼 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 낮음
  - 해결 방안: 업로드 후 분석 버튼을 통한 수동 분석 시작 옵션 제공

#### 2.1.3 FR-1.3: 분석 결과 표시

**요구사항**:
- **분석 정보 (파일명, 분석 일시)** (신규)
  - 분석된 파일명 표시
  - 분석 일시 표시
  - 분석 정보를 모아 버튼으로 제공 (접기/펼치기 가능)
- **AI 요약**
  - 분석 데이터를 한 번 더 정리하여 AI 요약 데이터 제공
  - 자연어 요약 텍스트 표시
- **상세 분석 데이터 (5축 메트릭)**
  - Layout, Typography, Color, Components, Form Language
  - 각 메트릭별 점수 (0-100) 및 시각화
  - 전체 점수 (Overall Score) 표시
- **연관 키워드 추출** (신규)
  - 분석 이미지와 연관된 키워드를 추출하여 제공
  - 키워드 태그 형태로 표시
  - 클릭 시 관련 검색 결과로 이동 가능
- **색상 팔레트 제공** (신규, Gap-1.2.1 해결)
  - 분석 이미지 속 사용된 컬러를 모아 컬러 스킴 제공
  - 주요 색상 코드 (HEX, RGB) 표시
  - 색상 팔레트 시각화
- **감지 객체 목록** (신규)
  - 이미지에서 감지된 객체 목록 제공
  - 객체별 신뢰도 점수 표시
- **활용 제안** (신규)
  - 분석 결과를 바탕으로 한 활용 방안 제안
  - 개선점 및 강점 기반 제안
- **프롬포트 (추가 정보/수정 방안 입력)** (신규)
  - 분석 이미지에 대한 추가 정보 혹은 수정 방안 등을 사용자가 입력할 수 있도록 제공
  - 프롬포트 입력 후 재분석 또는 상세 분석 가능
- **아카이빙 버튼 (자동 연동)** (신규)
  - 업로드된 이미지 파일에 대한 아카이빙(자동 연동)할 수 있도록 버튼 제공
  - 아카이빙 시 스타일 갤러리에 자동 저장

**현재 구현 상태**: ✅ 대부분 구현 완료 (80%)
- ✅ AI 요약 제공 (`summary` 필드)
- ✅ 상세 분석 데이터 (5축 메트릭) 제공 (각 메트릭별 score, reason, benchmark, keyElements)
- ✅ 전체 점수 (Overall Score) 표시
- ✅ 색상 팔레트 제공 (`colors` 배열: hex, rgb)
- ✅ 연관 키워드 추출 (`keywords` 배열)
- ✅ 감지 객체 목록 (`detectedObjects` 배열: name, confidence)
- ✅ 활용 제안 (`suggestions` 필드)
- ✅ 분석 정보 표시 (파일명, 분석 일시)
- ❌ 분석 정보 접기/펼치기 버튼 없음
- ❌ 프롬포트 입력 기능 없음 (향후 구현 예정)
- ❌ 아카이빙 버튼 없음 (향후 구현 예정)

**Gap 분석**:
- ✅ **Gap-1.2.1 해결됨**: 색상 팔레트 추출 기능 구현 완료 (`analyzeDesign` 함수에서 `colors` 배열 반환)

- ✅ **Gap-1.3.1 해결됨**: 연관 키워드 추출 기능 구현 완료 (`analyzeDesign` 함수에서 `keywords` 배열 반환)

- ✅ **Gap-1.3.2 해결됨**: 감지 객체 목록 기능 구현 완료 (`analyzeDesign` 함수에서 `detectedObjects` 배열 반환)

- **Gap-1.3.3**: 프롬포트 입력 기능 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 낮음
  - 해결 방안: 프롬포트 입력 UI 추가 및 `continueCritique` API 확장

- **Gap-1.3.4**: 아카이빙 기능 부재
  - 우선순위: P1 (High)
  - 기술적 복잡도: 낮음
  - 해결 방안: 아카이빙 버튼 추가 및 `archivedAnalyses` 컬렉션에 저장

#### 2.1.4 FR-1.4: 디자인 법칙 기반 평가 체계

**요구사항**:
- 가독성 평가: 텍스트 가독성 점수 계산
- 시선유도 분석: 시각적 흐름 및 포인트 분석
- 피드백 원리 적용: 디자인 원칙 준수도 평가

**현재 구현 상태**: ❌ 미구현 (0%)
- ❌ 가독성 평가 (명시적 가독성 메트릭 없음)
- ❌ 시선유도 분석 (추상적 분석만 제공)
- ❌ 피드백 원리 적용 (구체적 원칙 평가 없음)

**Gap 분석**:
- **Gap-1.4.1**: 가독성 평가 체계 부재
  - 우선순위: P1 (High)
  - 기술적 복잡도: 중간
  - 해결 방안: OCR + 가독성 알고리즘 또는 AI 모델 프롬프트 강화

- **Gap-1.4.2**: 시선유도 분석 기능 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 높음
  - 해결 방안: Attention Map 생성 AI 모델 또는 Eye-tracking 시뮬레이션 도입

- **Gap-1.4.3**: 피드백 원리 적용 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 중간
  - 해결 방안: 디자인 원칙 체크리스트 기반 평가 로직 구현

---

### 2.2 서칭 기능 (Searching)

**BRD 참조**: Section 3.3  
**사용자 여정**: 검색 → 결과 탐색 → 저장

#### 2.2.1 FR-3.1: 검색 패널

**요구사항**:
- **이미지 검색 박스** (신규)
  - 검색할 이미지 첨부 박스 제공
  - 이미지 업로드 후 유사 이미지 검색
- **텍스트 검색** (신규)
  - 검색할 텍스트 기입 박스 제공
  - 키워드 기반 검색
- **사용자 스타일 기반 이미지 서치** (신규)
  - 사용자의 디자인 DNA 프로파일을 기반으로 유사한 스타일의 이미지 검색
  - DNA 유사도 기반 검색 결과 정렬

**현재 구현 상태**: ✅ 부분 구현 (70%)
- ✅ 텍스트 검색 기능 구현 (`searchImages` Callable Function)
- ✅ Google Custom Search API 연동
- ✅ 검색 결과 표시 및 필터링 (카테고리, 유사도)
- ✅ 검색 결과 북마크 기능
- ⚠️ 이미지 업로드 기반 검색 없음 (향후 구현 예정)
- ⚠️ DNA 기반 검색 없음 (향후 구현 예정)

**Gap 분석**:
- ✅ **Gap-3.1.1 부분 해결됨**: 기본 검색 시스템 구현 완료 (Google Custom Search API 사용)
  - 향후 개선: Vertex AI Vector Search 도입으로 DNA 기반 검색 추가 (dysBlPrint Phase 2 참조)

#### 2.2.2 FR-3.2: 카테고리 시스템

**요구사항**:
- **보드별 카테고리 패널** (신규)
  - 각 보드별로 카테고리 패널을 구비하여 개인화된 서칭 탭 제공
  - 사용자가 생성한 보드별로 이미지 분류
  - 카테고리별 필터링 기능

**현재 구현 상태**: ❌ 미구현 (0%)
- ❌ 보드 시스템 없음
- ❌ 카테고리 패널 없음

**Gap 분석**:
- **Gap-3.2.1**: 보드 및 카테고리 시스템 부재
  - 우선순위: P1 (High)
  - 기술적 복잡도: 중간
  - 해결 방안: `boards` 컬렉션 생성 및 카테고리 관리 기능 구현

#### 2.2.3 FR-3.3: 검색 결과 상호작용

**요구사항**:
- **상세 근거 제시 (중앙값 기반)** (신규)
  - 이미지를 추천한 근거(중앙값 기반) 데이터를 제공
  - 유사도 점수 및 근거 설명 표시
- **보드에 저장** (신규)
  - 선택된 이미지를 보드에 저장할 수 있는 기능 제공
  - 보드 선택 UI 제공
- **이미지 저장** (신규)
  - 선택된 이미지 저장 기능 제공
  - 로컬 다운로드 또는 사용자 갤러리에 저장

**현재 구현 상태**: ✅ 부분 구현 (60%)
- ✅ 검색 결과 상세 보기 (모달)
- ✅ 유사도 점수 표시
- ✅ 검색 결과 북마크 기능 (`toggleBookmark` 함수)
- ✅ 컬렉션에 저장 기능 (`collections` 컬렉션 사용)
- ⚠️ 보드 시스템은 컬렉션으로 대체됨
- ❌ 이미지 로컬 다운로드 기능 없음

**Gap 분석**:
- ✅ **Gap-3.3.1 부분 해결됨**: 검색 결과 상호작용 구현 완료 (북마크, 컬렉션 저장)
  - 향후 개선: 로컬 다운로드 기능 추가

#### 2.2.4 FR-3.4: 탐색 제어 패널

**요구사항**:
- **다양성 조절 슬라이더** (신규)
  - 검색 이미지의 범위 다양성에 대해 제한/조절 기능 제공
  - 슬라이더를 통한 다양성 레벨 조절 (0-100)
- **스타일 반영 슬라이더** (신규)
  - 사용자의 스타일을 얼마나 반영할 지에 대해 제한/조절 기능 제공
  - 슬라이더를 통한 스타일 반영률 조절 (0-100)
- **연관 키워드 지정** (신규)
  - 연관 키워드를 지정할 수 있는 기능 제공
  - 키워드 태그 입력 및 필터링

**현재 구현 상태**: ❌ 미구현 (0%)
- ❌ 탐색 제어 패널 없음
- ❌ 슬라이더 기능 없음

**Gap 분석**:
- **Gap-3.4.1**: 탐색 제어 패널 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 중간
  - 해결 방안: 검색 필터 UI 구현 및 검색 알고리즘에 파라미터 적용

---

### 2.3 마이 페이지 기능 (My Page)

**BRD 참조**: Section 3.1, 3.2  
**사용자 여정**: 프로필 관리 → 스타일 추적 → 갤러리 관리

#### 2.3.1 FR-1.3: 프로필 관리

**요구사항**:
- **프로필 이미지 업로드** (신규)
  - 유저가 원하는 프로필 이미지를 업로드 가능
  - 이미지 크롭 및 리사이즈 기능
- **개인정보 수정** (신규)
  - 개인정보를 수정할 수 있는 기능 제공
  - 닉네임, 소개 등 기본 정보 수정

**현재 구현 상태**: ✅ 부분 구현 (70%)
- ✅ 사용자 프로필 조회 (`getUserProfile` 함수)
- ✅ 프로필 정보 수정 (`updateUserProfile` 함수: displayName, photoURL, bio)
- ✅ 사용자 설정 관리 (`updateUserSettings` 함수)
- ⚠️ 프로필 이미지 업로드/크롭 기능 없음 (photoURL만 설정 가능)
- ⚠️ 익명 인증 사용 중 (Firebase Auth 통합 예정)

**Gap 분석**:
- **Gap-1.3.1**: 사용자별 DNA 프로파일링 부재
  - 우선순위: P1 (High)
  - 기술적 복잡도: 중간
  - 해결 방안: Firebase Authentication 통합 후 사용자별 프로파일 컬렉션 구축

- **Gap-NFR-2.1**: 인증 시스템 부재
  - 우선순위: P0 (Critical)
  - 기술적 복잡도: 중간
  - 해결 방안: Firebase Authentication 통합 및 보안 규칙 강화

#### 2.3.2 FR-1.3, FR-2.4: 스타일 대표 이미지

**요구사항**:
- **현재 스타일 대표 이미지 표시** (신규)
  - 현재 유저의 스타일을 가장 잘 나타내는 이미지와 텍스트 제공
  - 대표 이미지는 좌측에 표시
- **이전 대표 이미지 타임라인** (신규)
  - 우측으로 이전 대표 이미지가 최신순 타임라인으로 보여짐
  - 타임라인 스크롤 가능
- **현재 vs 과거 비교 분석** (신규)
  - 원하는 과거 대표 이미지를 누르면 현재와 이전 대표 이미지 두 개만 보여짐
  - 텍스트로 상세 비교/분석 제공
- **선호도 변화 추적 (데이터 차트)** (신규)
  - 데이터 차트로 유저의 선호도 변화를 추적
  - 시계열 차트로 메트릭 변화 시각화

**현재 구현 상태**: ✅ 부분 구현 (50%)
- ✅ 5축 메트릭 수치화 (0-100 범위)
- ✅ Design DNA 차트 표시 (`MyPage.tsx`, `RadarChart.tsx`)
- ✅ 분석 결과 목록 표시 (Style Timeline)
- ✅ 사용자별 분석 결과 평균 계산
- ❌ 대표 스타일 선정 로직 없음
- ❌ 대표 이미지 타임라인 없음
- ❌ 비교 분석 기능 없음
- ❌ 선호도 변화 추적 차트 없음

**Gap 분석**:
- **Gap-1.3.2**: DNA 변화 추적 기능 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 낮음
  - 해결 방안: 사용자별 시계열 데이터 저장 및 시각화 대시보드 구현

- **Gap-2.4.1**: 사용자별 시계열 추적 부재
  - 우선순위: P1 (High)
  - 기술적 복잡도: 중간
  - 해결 방안: Firebase Authentication 통합 후 사용자별 시계열 데이터 구조 구축

- **Gap-2.4.2**: 성장 그래프 시각화 미완성
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 낮음
  - 해결 방안: TimeSeriesChart 컴포넌트 데이터 연결 완성

#### 2.3.3 FR-2.2: 스타일 갤러리

**요구사항**:
- **스타일 나열** (신규)
  - 아카이빙된 분석 결과를 갤러리 형태로 나열
  - 그리드 또는 리스트 뷰 제공
- **스타일 폴더 생성 및 관리** (신규)
  - 저장한 스타일을 보여줌
  - 폴더를 만들었으면 폴더의 대표 이미지가 보임
  - 폴더를 누르면 사용자가 지정한 이미지들이 보임
- **폴더 대표 이미지 설정** (신규)
  - 폴더의 대표 이미지를 사용자가 지정 가능

**현재 구현 상태**: ✅ 부분 구현 (60%)
- ✅ 컬렉션 시스템 구현 (`collections` 컬렉션)
- ✅ 컬렉션 생성/수정/조회 기능 (`createCollection`, `updateCollection`, `getCollections`)
- ✅ 분석 결과를 컬렉션에 추가/제거 기능
- ❌ 폴더 형태의 갤러리 UI 없음 (컬렉션으로 대체)
- ❌ 대표 이미지 설정 없음
- ❌ 아카이빙 기능 없음

**Gap 분석**:
- **Gap-2.2.1**: 성장 리포트 생성 시스템 부재 (갤러리 기능 포함)
  - 우선순위: P1 (High)
  - 기술적 복잡도: 중간
  - 해결 방안: `styleFolders` 컬렉션 생성 및 갤러리 UI 구현

---

### 2.4 설정 기능 (Settings)

**BRD 참조**: Section 5.5 (법률 및 규제 기관)  
**사용자 여정**: 계정 관리 → 보안 설정 → 정보 확인

#### 2.4.1 NFR-2.1: 계정 관리

**요구사항**:
- **이메일 확인/변경** (신규)
  - 이메일 정보를 확인/변경 가능하도록 함
  - 이메일 인증 기능
- **전화번호 확인/변경** (신규)
  - 전화번호 정보를 확인/변경 가능하도록 함
  - 전화번호 인증 기능
- **구독 정보 확인/변경** (신규)
  - 구독 정보를 확인/변경 가능하도록 함
  - 구독 플랜 표시 및 변경
- **히스토리 알림 on/off** (신규)
  - 히스토리 알림 on/off 설정이 가능하도록 함
  - 알림 설정 저장

**현재 구현 상태**: ❌ 미구현 (0%)
- ❌ 계정 관리 기능 없음
- ❌ 사용자 인증 시스템 부재 (Gap-NFR-2.1)

**Gap 분석**:
- **Gap-NFR-2.1**: 인증 시스템 부재
  - 우선순위: P0 (Critical)
  - 기술적 복잡도: 중간
  - 해결 방안: Firebase Authentication 통합 및 보안 규칙 강화

#### 2.4.2 NFR-2.1: 보안 설정

**요구사항**:
- **비밀번호 변경** (신규)
  - 비밀번호 변경 기능 제공
  - 현재 비밀번호 확인 후 변경
- **신뢰할 수 있는 장치 관리** (신규)
  - 신뢰할 수 있는 장치 목록 표시
  - 장치별 정보 및 마지막 접속 시간 표시
- **로그아웃** (신규)
  - 이 기기에서 로그아웃 기능
  - 모든 장치에서 로그아웃 기능

**현재 구현 상태**: ❌ 미구현 (0%)
- ❌ 보안 설정 기능 없음
- ❌ 사용자 인증 시스템 부재 (Gap-NFR-2.1)

**Gap 분석**:
- **Gap-NFR-2.1**: 인증 시스템 부재
  - 우선순위: P0 (Critical)
  - 기술적 복잡도: 중간
  - 해결 방안: Firebase Authentication 통합 및 보안 규칙 강화

#### 2.4.3 NFR-2.2: 정보 센터

**요구사항**:
- **도움말 센터 링크** (신규)
  - 서비스 사용 시 도움을 받을 수 있는 정보 링크 제공
  - FAQ, 사용 가이드 등
- **이용약관 링크** (신규)
  - 서비스 약관, 사업자 약관 등을 확인할 수 있는 링크 제공
- **개인정보 보호 정책 링크** (신규)
  - 개인정보보호처리방침을 확인할 수 있는 링크 제공

**현재 구현 상태**: ❌ 미구현 (0%)
- ❌ 정보 센터 없음
- ❌ 약관 및 정책 문서 없음

**Gap 분석**:
- **Gap-2.4.1**: 정보 센터 부재
  - 우선순위: P2 (Medium)
  - 기술적 복잡도: 낮음
  - 해결 방안: 정적 페이지 생성 및 링크 제공

---

## 🎯 3. 비기능 요구사항 (Non-Functional Requirements)

### 3.1 성능 요구사항

**BRD 참조**: Section 2.2 (성공 지표)

#### 3.1.1 NFR-1.1: 이미지 분석 응답 시간

**요구사항**:
- 이미지 업로드 후 분석 완료까지 평균 응답 시간: 30초 이내
- P95 응답 시간: 60초 이내
- 실시간 상태 업데이트 지연: 1초 이내

**현재 구현 상태**: ✅ 부분 달성
- 평균 응답 시간: 약 45초 (3개 AI 모델 병렬 처리)
- 실시간 업데이트: Firestore 리스너로 즉시 반영

**개선 필요사항**:
- Cloud Functions 메모리/CPU 최적화
- AI 모델 응답 시간 모니터링 및 타임아웃 설정

#### 3.1.2 NFR-1.2: 사용자 작업 효율 향상

**BRD 목표**: 최소 30% 이상의 사용자 작업 효율 향상

**측정 방법**:
- 분석 소요 시간 측정 (기존 수동 분석 대비)
- 사용자 피드백 기반 효율성 설문

**현재 구현 상태**: 🚧 측정 불가 (베타 테스트 필요)

#### 3.1.3 NFR-1.3: 시스템 처리량

**요구사항**:
- 동시 사용자 100명 지원
- 초당 10개 이미지 분석 처리 가능
- 서버리스 자동 스케일링

**현재 구현 상태**: ✅ 기본 달성
- Firebase 서버리스 아키텍처로 자동 스케일링 지원
- Cloud Functions 동시 실행 제한 설정 (`maxInstances`)

### 3.2 보안 요구사항

**BRD 참조**: Section 5.5 (법률 및 규제 기관)

#### 3.2.1 NFR-2.1: 데이터 접근 제어

**요구사항**:
- 사용자별 데이터 접근 제어
- 인증된 사용자만 데이터 읽기/쓰기 가능
- 관리자 권한 분리

**현재 구현 상태**: ❌ 미구현 (Critical)
- ⚠️ 현재 모든 컬렉션이 익명 읽기/쓰기 허용 (`allow read, write: if true`)
- Firebase Authentication 미통합

**Gap 분석**:
- **Gap-NFR-2.1**: 인증 시스템 부재
  - 우선순위: P0 (Critical)
  - 기술적 복잡도: 중간
  - 해결 방안: Firebase Authentication 통합 및 보안 규칙 강화

#### 3.2.2 NFR-2.2: 개인정보 보호

**요구사항**:
- 사용자 업로드 이미지 암호화 저장
- 개인정보 최소 수집 원칙 준수
- 데이터 보존 정책 적용

**현재 구현 상태**: 🚧 부분 구현
- ✅ Firebase Storage 암호화 저장 (기본 제공)
- ❌ 개인정보 보호 정책 문서화 없음
- ❌ 데이터 보존 정책 없음

#### 3.2.3 NFR-2.3: API 키 보안

**요구사항**:
- API 키는 Secret Manager에 안전하게 저장
- 프론트엔드에 API 키 노출 방지
- 키 로테이션 정책 수립

**현재 구현 상태**: ✅ 기본 달성
- ✅ Secret Manager 사용 (OpenAI, Claude, Vertex AI)
- ⚠️ `firebaseConfig.js`에 Firebase API 키 하드코딩 (환경 변수화 필요)

### 3.3 확장성 요구사항

#### 3.3.1 NFR-3.1: 수평 확장성

**요구사항**:
- 사용자 증가에 따른 자동 스케일링
- 데이터베이스 성능 유지
- 비용 효율적 확장

**현재 구현 상태**: ✅ 기본 달성
- Firebase 서버리스 아키텍처로 자동 스케일링
- Firestore 인덱스 최적화

#### 3.3.2 NFR-3.2: 기능 확장성

**요구사항**:
- 새로운 AI 모델 추가 용이성
- 새로운 분석 타입 추가 가능
- 플러그인 형태 기능 확장

**현재 구현 상태**: ✅ 기본 달성
- 모듈화된 코드 구조 (`multiLLMOrchestrator.js`)
- 새로운 모델 추가 시 `analyzeWithXXX()` 함수만 추가하면 됨

### 3.4 가용성 요구사항

#### 3.4.1 NFR-4.1: 시스템 가동률

**요구사항**:
- 목표 가동률: 99.5% 이상
- 계획된 다운타임 사전 공지
- 장애 복구 시간: 1시간 이내

**현재 구현 상태**: 🚧 모니터링 필요
- Firebase 기본 SLA 보장
- 장애 모니터링 시스템 구축 필요

#### 3.4.2 NFR-4.2: 데이터 백업 및 복구

**요구사항**:
- 일일 자동 백업
- 최대 30일 데이터 보존
- 재해 복구 계획 수립

**현재 구현 상태**: ❌ 미구현
- Firestore 자동 백업 설정 필요
- 데이터 보존 정책 수립 필요

### 3.5 호환성 요구사항

#### 3.5.1 NFR-5.1: 브라우저 호환성

**요구사항**:
- Chrome, Firefox, Safari, Edge 최신 2개 버전 지원
- 모바일 브라우저 지원 (iOS Safari, Chrome Mobile)

**현재 구현 상태**: ✅ 기본 달성
- React 기반으로 대부분의 브라우저 호환
- 모바일 브라우저 테스트 필요

#### 3.5.2 NFR-5.2: API 호환성

**요구사항**:
- 외부 API 변경 시 대응 방안
- 버전 관리 및 하위 호환성 유지

**현재 구현 상태**: ✅ 기본 달성
- Secret Manager로 API 키 관리
- API 버전 관리 전략 필요

---

## 📊 4. 현재 구현 상태

### 4.0 Phase 0 완료 상태 (2025.01.19)

#### 4.0.1 공통 기반 스캐폴딩
- ✅ 디렉토리 구조 생성 완료 (src/components, src/hooks, src/lib 등)
- ✅ Firebase 초기화 코드 완료 (firebase.js)
- ✅ 인증 시스템 기반 완료 (AuthContext, ProtectedRoute)
- ✅ 라우팅 설정 완료 (React Router)
- ✅ 기본 페이지 컴포넌트 생성 완료 (Home, Upload, Search, MyPage, Settings, Login, NotFound)

#### 4.0.2 백엔드 설정
- ✅ Cloud Functions 환경 설정 완료 (Node.js 20)
- ✅ OpenAI 연동 코드 준비 완료 (testOpenAI 함수)
- ✅ Secret Manager 연동 완료 (OPENAI_API_KEY)

#### 4.0.3 인프라 프로비저닝
- ✅ Firebase Storage 버킷 생성 완료 (gs://dysproto.firebasestorage.app, us-east-1)
- ✅ Firestore 데이터베이스 생성 완료 (dysproto, asia-northeast3, Standard 모드)
- ✅ Firebase Authentication 설정 완료 (익명 인증 활성화)
- ✅ 보안 규칙 배포 완료 (테스트 모드, 2025-12-19까지)

### 4.1 Phase 1 미시작 상태

**현재 상태**: Phase 0 스캐폴딩 완료, Phase 1 기능 구현 미시작

#### 4.1.1 업로드 및 분석 기능
- ❌ 이미지 업로드 시스템 미구현
- ❌ 분석 실행 기능 미구현
- ❌ 분석 결과 표시 기능 미구현
- ❌ 디자인 법칙 평가 체계 미구현

#### 4.1.2 서칭 기능
- ❌ 검색 시스템 미구현
- ❌ 카테고리 시스템 미구현
- ❌ 검색 결과 상호작용 미구현

#### 4.1.3 마이 페이지 기능
- ❌ 프로필 관리 미구현
- ❌ 스타일 추적 미구현
- ❌ 갤러리 관리 미구현

#### 4.1.4 설정 기능
- ❌ 계정 관리 미구현
- ❌ 보안 설정 미구현
- ❌ 정보 센터 미구현

### 4.2 Cloud Functions 구현 상태

- ✅ helloWorld (테스트용)
- ✅ testOpenAI (Secret 테스트용)
- ❌ analyzeImageOnUpload (미구현)
- ❌ continueCritique (미구현)
- ❌ searchReferences (미구현)
- ❌ extractColorPalette (미구현)
- ❌ extractKeywords (미구현)
- ❌ detectObjects (미구현)
- ❌ archiveAnalysis (미구현)
- ❌ createBoard (미구현)
- ❌ saveToBoard (미구현)
- ❌ getRepresentativeStyle (미구현)
- ❌ compareStyles (미구현)
- ❌ createStyleFolder (미구현)
- ❌ updateProfileImage (미구현)
- ❌ generateGrowthReport (미구현)
- [기타 모든 API 미구현]

### 4.3 프론트엔드 구현 상태

- ✅ 기본 페이지 컴포넌트 Shell (Placeholder)
- ❌ 실제 기능 구현 없음
- ❌ UI 컴포넌트 로직 없음
- ❌ 드래그 앤 드롭 인터페이스 미구현
- ❌ 분석 결과 표시 컴포넌트 미구현
- ❌ 검색 UI 미구현
- ❌ 프로필 관리 UI 미구현

### 4.4 미구현 기능 (0%)

#### 4.4.1 참조 자료 검색 시스템
- ❌ AI 기반 검색
- ❌ 레퍼런스 데이터베이스
- ❌ 추천 엔진
- ❌ 트렌드 분석

#### 4.4.2 사용자 인증 및 보안
- ❌ Firebase Authentication 통합 (이메일/비밀번호)
- ❌ 사용자별 데이터 접근 제어
- ❌ 프로덕션 보안 규칙

#### 4.4.3 dysBlPrint 고급 기능
- ❌ Dialogflow CX
- ❌ Neo4j 그래프 데이터베이스
- ❌ Vertex AI Vector Search
- ❌ WebGL 시뮬레이션

---

## 🔍 5. Gap 분석

### 5.1 Gap 분석 매트릭스

| BRD 기능 | 요구사항 | 구현 상태 | 완료도 | 우선순위 | Gap 항목 수 |
|---------|---------|----------|--------|---------|------------|
| **기능 1: 디자인 스타일 분석** | 이미지 분석 및 데이터화 | 미구현 | 0% | P1 | 5개 |
| **기능 2: 맞춤형 피드백** | 성장 트래킹, 리포트 | 미구현 | 0% | P1 | 6개 |
| **기능 3: 참조 자료 검색** | AI 기반 레퍼런스 추천 | 미구현 | 0% | P1 | 3개 |
| **기능 4: UI/UX 최적화** | 반응형 웹앱 | 미구현 | 0% | P1-P2 | 4개 |

### 5.2 우선순위별 Gap 목록

#### P0 (Critical) - 즉시 해결 필요

| Gap ID | 설명 | 기술적 복잡도 | 예상 소요 시간 |
|--------|------|--------------|---------------|
| **Gap-NFR-2.1** | 인증 시스템 부재 | 중간 | 2주 |

#### P1 (High) - 단기 해결 필요 (1-2개월)

| Gap ID | 설명 | 기술적 복잡도 | 예상 소요 시간 |
|--------|------|--------------|---------------|
| **Gap-1.3.1** | 사용자별 DNA 프로파일링 부재 | 중간 | 3주 |
| **Gap-1.4.1** | 가독성 평가 체계 부재 | 중간 | 2주 |
| **Gap-2.2.1** | 성장 리포트 생성 시스템 부재 | 중간 | 3주 |
| **Gap-2.2.2** | 목표 설정 기능 부재 | 낮음 | 1주 |
| **Gap-2.3.1** | 목표 설정 시스템 부재 | 낮음 | 1주 |
| **Gap-2.4.1** | 사용자별 시계열 추적 부재 | 중간 | 2주 |
| **Gap-3.1.1** | 검색 시스템 부재 | 높음 | 6주 |
| **Gap-3.2.1** | 추천 시스템 부재 | 높음 | 8주 |
| **Gap-4.2.1** | 모바일 최적화 부족 | 중간 | 3주 |

#### P2 (Medium) - 중기 해결 필요 (3-6개월)

| Gap ID | 설명 | 기술적 복잡도 | 예상 소요 시간 |
|--------|------|--------------|---------------|
| **Gap-1.2.1** | 색상 팔레트 추출 기능 부재 | 중간 | 2주 |
| **Gap-1.2.2** | 그리드 시스템 인식 기능 부재 | 높음 | 4주 |
| **Gap-1.4.2** | 시선유도 분석 기능 부재 | 높음 | 6주 |
| **Gap-1.4.3** | 피드백 원리 적용 부재 | 중간 | 3주 |
| **Gap-2.1.1** | 액션 아이템 우선순위화 부재 | 낮음 | 1주 |
| **Gap-2.4.2** | 성장 그래프 시각화 미완성 | 낮음 | 1주 |
| **Gap-2.5.1** | 비교 분석 기능 부재 | 중간 | 3주 |
| **Gap-4.1.1** | 3-click 규칙 미적용 | 낮음 | 1주 |
| **Gap-4.1.2** | 법칙 기반 디자인 가이드라인 부재 | 낮음 | 2주 |
| **Gap-4.3.1** | 상세 사용자 행동 추적 부재 | 중간 | 2주 |
| **Gap-4.4.1** | 개인화 대시보드 부재 | 중간 | 3주 |

#### P3 (Low) - 장기 해결 필요 (6개월 이상)

| Gap ID | 설명 | 기술적 복잡도 | 예상 소요 시간 |
|--------|------|--------------|---------------|
| **Gap-2.5.2** | 커뮤니티 피드백 시스템 부재 | 높음 | 8주 |
| **Gap-3.3.1** | 트렌드 수집 시스템 부재 | 매우 높음 | 12주 |

### 5.3 기술적 복잡도 평가 기준

- **낮음**: 기존 코드에 기능 추가, 1-2주 소요
- **중간**: 새로운 모듈 개발 필요, 2-4주 소요
- **높음**: 주요 아키텍처 변경 또는 외부 시스템 통합, 4-8주 소요
- **매우 높음**: 완전히 새로운 시스템 구축, 8주 이상 소요

---

## 🏗️ 6. 기술 스택 요구사항

### 6.1 현재 사용 중인 기술 스택

#### 프론트엔드
- **React**: 19.1.1
- **React Router**: 7.9.4
- **Firebase SDK**: Storage, Firestore, Analytics

#### 백엔드
- **Firebase Cloud Functions**: v2 (Node.js 20)
- **Firebase Firestore**: NoSQL 데이터베이스
- **Firebase Storage**: 파일 저장소

#### 외부 AI 서비스
- **OpenAI**: GPT-4o, GPT-4o-mini
- **Anthropic**: Claude 3.5 Sonnet
- **Google Vertex AI**: Gemini 1.5 Pro Vision

#### 인프라
- **Google Cloud Platform**: asia-northeast3 (서울)
- **Secret Manager**: API 키 관리
- **BigQuery**: (준비됨, 미활용)

### 6.2 향후 기술 스택 (dysBlPrint 기반)

#### 예정된 추가 기술
- **Neo4j**: 그래프 데이터베이스 (Phase 2)
- **Vertex AI Vector Search**: 벡터 검색 (Phase 2)
- **Redis**: 캐싱 레이어 (Phase 1)
- **Dialogflow CX**: 대화형 인터페이스 (Phase 1)
- **WebGL**: 실시간 시뮬레이션 (Phase 3)

### 6.3 기술 선택 근거

#### 현재 스택 선택 이유
1. **Firebase 서버리스**: 빠른 프로토타이핑, 자동 스케일링
2. **MultiLLM**: AI 모델 비교 분석 및 안정성 확보
3. **React**: 컴포넌트 기반 UI 개발, 풍부한 생태계

#### 향후 스택 도입 이유
1. **Neo4j**: 디자인 패턴 간 관계 모델링 필요
2. **Vector Search**: 의미론적 검색 및 추천 시스템 구축
3. **Redis**: 성능 최적화 및 세션 관리

### 6.4 인프라
- **Google Cloud Platform**: asia-northeast3 (서울)
- **Firebase Storage**: us-east-1 리전 ⚠️ (주의: asia-northeast3 아님)
- **Cloud Firestore**: asia-northeast3 리전 (Standard 모드)
- **Cloud Functions**: asia-northeast3 리전
- **Secret Manager**: API 키 관리

---

## 💾 7. 데이터 모델 요구사항

### 7.1 Firestore 스키마 정의

#### 7.1.1 `analyses` 컬렉션

**용도**: 이미지 분석 결과 저장

**문서 구조**:
```typescript
analyses/{documentId}: {
  fileName: string,
  filePath: string,
  status: "analyzing" | "completed" | "failed",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  completedAt?: Timestamp,
  analysisResult?: {
    metrics: {
      layout: number (0-100),
      typography: number (0-100),
      color: number (0-100),
      components: number (0-100),
      formLanguage: number (0-100)
    },
    insights: Array<{
      type: "strength" | "weakness",
      title: string,
      description: string,
      recommendation: string
    }>,
    overallScore: number (0-100),
    strengths: string[],
    improvements: string[]
  },
  summary?: string,
  error?: string
}
```

**서브컬렉션**:
- `analyses/{id}/benchmarks/models/{modelKey}/{docId}`: 모델별 벤치마크 데이터
- `analyses/{id}/sunburst_cache/current`: Sunburst 캐시 구조

#### 7.1.2 `chatSessions` 컬렉션

**용도**: AI 챗봇 세션 관리 (실제 구현된 컬렉션)

**문서 구조**:
```typescript
chatSessions/{sessionId}: {
  userId?: string,  // 향후 Firebase Auth UID
  createdAt: Timestamp,
  state: {
    current: string,
    phase: number,
    history: Array<{
      name: string,
      enteredAt: number,
      context: object
    }>
  },
  metadata: {
    version: number,
    updatedAt: Timestamp,
    lastActivity?: Timestamp
  },
  conversationHistory?: Array<{
    role: "user" | "assistant",
    content: string,
    timestamp: Timestamp
  }>
}
```

#### 7.1.3 실제 사용 중인 추가 컬렉션

**`users` 컬렉션** (실제 구현됨):
```typescript
users/{userId}: {
  displayName: string,
  email: string,
  photoURL?: string,
  subscription: "free" | "pro" | "premium",
  bio?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  settings: {
    notifications: {
      weeklyReport: boolean,
      growthAlerts: boolean,
      marketingEmails: boolean
    }
  }
}
```

**`bookmarks` 컬렉션** (실제 구현됨):
```typescript
bookmarks/{bookmarkId}: {
  userId: string,
  referenceId: string,
  imageUrl: string,
  title: string,
  category: string,
  similarity: number,
  reason?: string,
  createdAt: Timestamp
}
```

**`collections` 컬렉션** (실제 구현됨):
```typescript
collections/{collectionId}: {
  userId: string,
  name: string,
  description?: string,
  analysisIds: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 7.1.4 향후 추가 필요 컬렉션

**`userProfiles` 컬렉션** (Gap-1.3.1 해결):
```typescript
userProfiles/{userId}: {
  userId: string,
  designDNA: {
    averageMetrics: {
      layout: number,
      typography: number,
      color: number,
      components: number,
      formLanguage: number
    },
    preferences: {
      colorPalette: string[],
      style: string[],
      domains: string[]
    },
    updatedAt: Timestamp
  },
  profileImage?: string,  // 프로필 이미지 URL (신규)
  representativeStyleId?: string,  // 현재 대표 스타일 ID (신규)
  styleFolders?: string[],  // 소유한 스타일 폴더 ID 배열 (신규)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**`userGoals` 컬렉션** (Gap-2.3.1 해결):
```typescript
userGoals/{goalId}: {
  userId: string,
  targetMetric: string,  // "layout" | "typography" | "color" | "components" | "formLanguage" | "overallScore"
  targetValue: number,
  currentValue: number,
  progress: number (0-100),
  deadline: Timestamp,
  description?: string,  // 목표 설명 (신규)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**`growthReports` 컬렉션** (Gap-2.2.1 해결):
```typescript
growthReports/{reportId}: {
  userId: string,
  period: "weekly" | "monthly",
  startDate: Timestamp,
  endDate: Timestamp,
  summary: {
    totalAnalyses: number,
    averageScore: number,
    improvementRate: number,
    topStrengths: string[],
    topAreasForImprovement: string[]
  },
  charts: {
    timeline: object,
    metrics: object
  },
  generatedAt: Timestamp
}
```

**`boards` 컬렉션** (신규, Gap-3.2.1 해결):
```typescript
boards/{boardId}: {
  userId: string,
  name: string,  // 보드 이름
  description?: string,  // 보드 설명
  category?: string,  // 카테고리 (선택사항)
  imageIds: string[],  // 저장된 이미지 ID 배열 (analyses 문서 ID 참조)
  coverImageId?: string,  // 대표 이미지 ID
  isPublic: boolean,  // 공개 여부 (기본값: false)
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**`styleFolders` 컬렉션** (신규, Gap-2.2.1 해결):
```typescript
styleFolders/{folderId}: {
  userId: string,
  name: string,  // 폴더 이름
  description?: string,  // 폴더 설명
  representativeImageId?: string,  // 폴더 대표 이미지 ID (analyses 문서 ID)
  analysisIds: string[],  // 포함된 분석 ID 배열
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**`representativeStyles` 컬렉션** (신규, Gap-1.3.2 해결):
```typescript
representativeStyles/{styleId}: {
  userId: string,
  analysisId: string,  // 해당 분석 문서 ID
  imageUrl: string,  // 이미지 URL
  metrics: {
    layout: number,
    typography: number,
    color: number,
    components: number,
    formLanguage: number,
    overallScore: number
  },
  description?: string,  // 스타일 설명 텍스트
  isCurrent: boolean,  // 현재 대표 스타일 여부
  createdAt: Timestamp
}
```

**`archivedAnalyses` 컬렉션** (신규, Gap-1.3.4 해결):
```typescript
archivedAnalyses/{archiveId}: {
  userId: string,
  analysisId: string,  // 원본 analyses 문서 ID
  archivedAt: Timestamp,
  folderId?: string,  // 속한 폴더 ID (선택사항)
  tags?: string[],  // 사용자 태그
  notes?: string  // 사용자 메모
}
```

**기존 컬렉션 업데이트**:

**`analyses` 컬렉션 확장**:
```typescript
analyses/{documentId}: {
  // 기존 필드...
  userId?: string,  // Firebase Auth UID (신규, 인증 시스템 도입 시 필수)
  archivedAt?: Timestamp,  // 아카이빙 시각 (신규)
  boardIds?: string[],  // 속한 보드 ID 배열 (신규)
  keywords?: string[],  // 연관 키워드 (신규)
  colorPalette?: Array<{  // 색상 팔레트 (신규)
    hex: string,
    rgb: { r: number, g: number, b: number },
    percentage: number  // 이미지 내 비율
  }>,
  detectedObjects?: Array<{  // 감지된 객체 (신규)
    name: string,
    confidence: number,
    boundingBox?: object
  }>,
  // ... 기존 필드
}
```

### 7.2 데이터 관계도

```
userProfiles (새로 추가)
  └── {userId}
      ├── representativeStyles (참조)
      ├── styleFolders (참조)
      ├── boards (참조)
      └── analyses (서브컬렉션 또는 참조)
          └── {analysisId}

userGoals (새로 추가)
  └── {goalId}
      └── userId (참조)

growthReports (새로 추가)
  └── {reportId}
      └── userId (참조)

boards (신규)
  └── {boardId}
      └── userId (참조)
      └── imageIds (analyses 문서 ID 배열)

styleFolders (신규)
  └── {folderId}
      └── userId (참조)
      └── analysisIds (analyses 문서 ID 배열)

representativeStyles (신규)
  └── {styleId}
      └── userId (참조)
      └── analysisId (analyses 문서 ID 참조)

archivedAnalyses (신규)
  └── {archiveId}
      └── userId (참조)
      └── analysisId (analyses 문서 ID 참조)
      └── folderId (styleFolders 문서 ID 참조, 선택사항)

analyses (기존, 확장)
  └── {analysisId}
      ├── userId (참조, 신규)
      ├── boardIds (boards 문서 ID 배열, 신규)
      ├── archivedAt (신규)
      ├── keywords (신규)
      ├── colorPalette (신규)
      ├── detectedObjects (신규)
      ├── benchmarks/models/{modelKey}
      └── sunburst_cache/current

critiqueSessions (기존)
  └── {sessionId}
      └── userId (향후 참조 추가)
```

### 7.3 데이터 정규화 요구사항

#### 7.3.1 중복 데이터 최소화
- 사용자 정보는 `userProfiles`에 중앙 집중 저장
- 분석 결과는 `analyses`에 저장, 사용자별 집계는 별도 컬렉션에서 관리

#### 7.3.2 데이터 일관성
- Firestore 트랜잭션 사용하여 원자적 업데이트 보장
- 서브컬렉션을 통한 계층적 데이터 구조 유지

#### 7.3.3 데이터 보존 정책
- 분석 결과: 무기한 보존 (향후 사용자 삭제 요청 시 제거)
- 세션 데이터: 90일 후 자동 삭제
- 피드백 데이터: 집계 후 1년 보존

---

## 🔌 8. API 및 인터페이스 요구사항

### 8.1 Cloud Functions 엔드포인트

#### 8.1.1 `analyzeImageOnUpload`
- **트리거**: Storage 파일 업로드
- **경로**: `users/{userId}/analyses/{timestamp}_{fileName}`
- **입력**: Storage 이벤트 데이터
- **출력**: Firestore 문서 업데이트

#### 8.1.2 `continueCritique`
- **트리거**: HTTP POST 요청
- **URL**: `/continueCritique`
- **CORS**: 모든 도메인 허용 (향후 제한 필요)
- **요청 본문**:
  ```json
  {
    "sessionId": "string",
    "userMessage": "string",
    "context": {
      "userId": "string (optional)"
    }
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "sessionId": "string",
    "hypotheses": Array<Hypothesis>,
    "summary": "string",
    "nextSteps": Array<string>
  }
  ```

#### 8.1.3 향후 추가 필요 엔드포인트

**업로드 및 분석 관련 API**:

**`extractColorPalette`** (신규, Gap-1.2.1 해결):
- **트리거**: HTTP POST
- **URL**: `/extractColorPalette`
- **기능**: 이미지에서 색상 팔레트 추출
- **요청 본문**:
  ```json
  {
    "imageUrl": "string",
    "maxColors": 10
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "colorPalette": [
      {
        "hex": "#FF5733",
        "rgb": { "r": 255, "g": 87, "b": 51 },
        "percentage": 25.5
      }
    ]
  }
  ```

**`extractKeywords`** (신규, Gap-1.3.1 해결):
- **트리거**: HTTP POST
- **URL**: `/extractKeywords`
- **기능**: 분석 이미지에서 연관 키워드 추출
- **요청 본문**:
  ```json
  {
    "analysisId": "string"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "keywords": ["minimalist", "modern", "clean"]
  }
  ```

**`detectObjects`** (신규, Gap-1.3.2 해결):
- **트리거**: HTTP POST
- **URL**: `/detectObjects`
- **기능**: 이미지에서 객체 감지
- **요청 본문**:
  ```json
  {
    "imageUrl": "string"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "objects": [
      {
        "name": "button",
        "confidence": 0.95,
        "boundingBox": { "x": 100, "y": 200, "width": 50, "height": 30 }
      }
    ]
  }
  ```

**`archiveAnalysis`** (신규, Gap-1.3.4 해결):
- **트리거**: HTTP POST
- **URL**: `/archiveAnalysis`
- **기능**: 분석 결과 아카이빙
- **요청 본문**:
  ```json
  {
    "analysisId": "string",
    "folderId": "string (optional)",
    "tags": ["string"],
    "notes": "string (optional)"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "archiveId": "string"
  }
  ```

**서칭 관련 API**:

**`createBoard`** (신규, Gap-3.2.1 해결):
- **트리거**: HTTP POST
- **URL**: `/createBoard`
- **기능**: 보드 생성
- **요청 본문**:
  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "category": "string (optional)",
    "isPublic": false
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "boardId": "string"
  }
  ```

**`saveToBoard`** (신규, Gap-3.3.1 해결):
- **트리거**: HTTP POST
- **URL**: `/saveToBoard`
- **기능**: 이미지를 보드에 저장
- **요청 본문**:
  ```json
  {
    "boardId": "string",
    "analysisId": "string"
  }
  ```
- **응답**:
  ```json
  {
    "success": true
  }
  ```

**`searchWithFilters`** (신규, Gap-3.4.1 해결):
- **트리거**: HTTP POST
- **URL**: `/searchWithFilters`
- **기능**: 필터를 적용한 검색 (다양성/스타일 슬라이더)
- **요청 본문**:
  ```json
  {
    "query": "string (optional)",
    "imageUrl": "string (optional)",
    "diversityLevel": 50,
    "styleReflectionLevel": 70,
    "keywords": ["string"]
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "results": [
      {
        "analysisId": "string",
        "similarityScore": 0.85,
        "reason": "중앙값 기반 유사도"
      }
    ]
  }
  ```

**마이 페이지 관련 API**:

**`getRepresentativeStyle`** (신규, Gap-1.3.2 해결):
- **트리거**: HTTP GET
- **URL**: `/getRepresentativeStyle?userId={userId}`
- **기능**: 사용자의 대표 스타일 조회
- **응답**:
  ```json
  {
    "success": true,
    "currentStyle": {
      "styleId": "string",
      "imageUrl": "string",
      "metrics": { /* ... */ },
      "description": "string"
    },
    "timeline": [
      {
        "styleId": "string",
        "createdAt": "timestamp",
        "imageUrl": "string"
      }
    ]
  }
  ```

**`compareStyles`** (신규, Gap-1.3.2 해결):
- **트리거**: HTTP POST
- **URL**: `/compareStyles`
- **기능**: 현재와 과거 스타일 비교 분석
- **요청 본문**:
  ```json
  {
    "currentStyleId": "string",
    "pastStyleId": "string"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "comparison": {
      "metricsDiff": { /* ... */ },
      "textAnalysis": "string"
    }
  }
  ```

**`createStyleFolder`** (신규, Gap-2.2.1 해결):
- **트리거**: HTTP POST
- **URL**: `/createStyleFolder`
- **기능**: 스타일 폴더 생성
- **요청 본문**:
  ```json
  {
    "name": "string",
    "description": "string (optional)",
    "representativeImageId": "string (optional)"
  }
  ```
- **응답**:
  ```json
  {
    "success": true,
    "folderId": "string"
  }
  ```

**`updateProfileImage`** (신규, Gap-1.3.1 해결):
- **트리거**: HTTP POST
- **URL**: `/updateProfileImage`
- **기능**: 프로필 이미지 업로드 및 업데이트
- **요청 본문**: FormData (multipart/form-data)
- **응답**:
  ```json
  {
    "success": true,
    "imageUrl": "string"
  }
  ```

**기존 API 확장**:

**`generateGrowthReport`** (Gap-2.2.1 해결):
- **트리거**: HTTP POST 또는 Scheduler
- **URL**: `/generateGrowthReport`
- **기능**: 사용자별 성장 리포트 생성
- **요청 본문**:
  ```json
  {
    "userId": "string",
    "period": "weekly" | "monthly",
    "startDate": "timestamp (optional)",
    "endDate": "timestamp (optional)"
  }
  ```

**`searchReferences`** (Gap-3.1.1 해결):
- **트리거**: HTTP POST
- **URL**: `/searchReferences`
- **기능**: AI 기반 레퍼런스 검색
- **요청 본문**:
  ```json
  {
    "query": "string (optional)",
    "imageUrl": "string (optional)",
    "userId": "string (optional)",
    "limit": 20
  }
  ```

### 8.2 외부 API 통합 요구사항

#### 8.2.1 OpenAI API
- **현재 상태**: ✅ 통합 완료
- **API 키 관리**: Secret Manager
- **모델**: GPT-4o, GPT-4o-mini

#### 8.2.2 Anthropic API
- **현재 상태**: ✅ 통합 완료
- **API 키 관리**: Secret Manager
- **모델**: Claude 3.5 Sonnet

#### 8.2.3 Vertex AI API
- **현재 상태**: ✅ 통합 완료
- **인증**: Service Account (Secret Manager)
- **모델**: Gemini 1.5 Pro Vision

#### 8.2.4 향후 통합 예정 API

**Behance API** (Gap-3.1.1 참조):
- 레퍼런스 수집용
- API 키 필요
- 속도 제한 고려 필요

**Pinterest API** (Gap-3.1.1 참조):
- 레퍼런스 수집용
- API 키 필요
- 속도 제한 고려 필요

### 8.3 프론트엔드-백엔드 인터페이스

#### 8.3.1 Firebase SDK 사용 패턴

**Storage 업로드**:
```javascript
import { ref, uploadBytes } from 'firebase/storage';
const storageRef = ref(storage, `users/${userId}/analyses/${timestamp}_${fileName}`);
await uploadBytes(storageRef, imageFile);
```

**Firestore 실시간 구독**:
```javascript
import { doc, onSnapshot } from 'firebase/firestore';
const unsubscribe = onSnapshot(
  doc(db, 'analyses', docId),
  (snapshot) => { /* 상태 업데이트 */ }
);
```

#### 8.3.2 HTTP API 호출

**대화형 피드백 요청**:
```javascript
const response = await fetch('/continueCritique', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: sessionId,
    userMessage: message,
    context: { userId: userId }
  })
});
```

---

## 🔒 9. 보안 및 규정 준수 요구사항

### 9.1 Firebase 보안 규칙 요구사항

#### 9.1.1 Firestore 보안 규칙

**현재 상태**: ⚠️ 개발 테스트 모드
```javascript
// 현재: 모든 사용자 읽기/쓰기 허용
allow read, write: if true;
```

**프로덕션 요구사항**:
```javascript
// 권장: 인증된 사용자만 접근
allow read: if request.auth != null && 
            (resource.data.userId == request.auth.uid || 
             isPublic(resource.data));
allow write: if request.auth != null && 
             request.resource.data.userId == request.auth.uid;
allow delete: if request.auth != null && 
               resource.data.userId == request.auth.uid && 
               isOwner(request.auth.uid);
```

**구현 필요사항**:
- Firebase Authentication 통합
- 사용자별 데이터 접근 제어 로직 구현
- 공개 데이터와 개인 데이터 구분

#### 9.1.2 Storage 보안 규칙

**현재 상태**: ⚠️ 인증 없이 업로드 가능
```javascript
match /users/{allPaths=**} {
  allow read, write: if request.resource.size < 5 * 1024 * 1024;
}
```

**프로덕션 요구사항**:
```javascript
match /users/{userId}/analyses/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
                 request.auth.uid == userId &&
                 request.resource.size < 5 * 1024 * 1024 &&
                 request.resource.contentType.matches('image/.*');
}
```

### 9.2 개인정보 보호 요구사항

**BRD 참조**: Section 5.5 (법률 및 규제 기관)

#### 9.2.1 데이터 수집 원칙
- 최소 수집 원칙: 분석에 필요한 최소한의 데이터만 수집
- 사용자 동의: 명시적 동의 없이 데이터 수집 금지
- 데이터 용도 명시: 수집 목적 명확히 고지

#### 9.2.2 데이터 보존 정책
- 분석 결과: 사용자 요청 시 즉시 삭제 가능
- 세션 데이터: 90일 후 자동 삭제
- 피드백 데이터: 집계 후 1년 보존 후 삭제

#### 9.2.3 사용자 권리
- 데이터 접근 권리: 사용자가 자신의 데이터 조회 가능
- 데이터 수정 권리: 사용자가 자신의 데이터 수정 가능
- 데이터 삭제 권리: 사용자가 자신의 데이터 삭제 요청 가능

### 9.3 데이터 보존 정책

#### 9.3.1 보존 기간

| 데이터 유형 | 보존 기간 | 삭제 방법 |
|------------|----------|----------|
| 분석 결과 | 무기한 | 사용자 요청 시 삭제 |
| 세션 데이터 | 90일 | 자동 삭제 (Cloud Scheduler) |
| 피드백 데이터 | 1년 | 집계 후 자동 삭제 |
| 로그 데이터 | 30일 | 자동 삭제 |

#### 9.3.2 백업 정책
- 일일 Firestore 자동 백업 설정 필요
- 백업 데이터는 최대 30일 보존
- 재해 복구 계획 수립 필요

---

## 🗺️ 10. 구현 로드맵

### 10.1 BRD 일정 기반 구현 계획

**BRD Section 6 참조**: 개발 1단계 (2025.11.04 ~ 11.18), 개발 2단계 (2025.11.19 ~ 12.10)

### 10.2 우선순위별 Gap 해소 계획

#### Phase 1: 즉시 해결 (1-2주)

**목표**: Critical 보안 이슈 해결

| Gap ID | 작업 내용 | 예상 소요 시간 |
|--------|----------|---------------|
| Gap-NFR-2.1 | Firebase Authentication 통합 | 1주 |
| Gap-NFR-2.1 | Firestore 보안 규칙 강화 | 3일 |
| Gap-NFR-2.1 | Storage 보안 규칙 강화 | 2일 |

**마일스톤**: 프로덕션 배포 준비 완료

#### Phase 2: 단기 해결 (1-2개월)

**목표**: 핵심 기능 완성 및 사용자 경험 개선

**Week 1-2**: 사용자 프로파일링
- Gap-1.3.1: 사용자별 DNA 프로파일링 구현 (3주)
- Gap-2.4.1: 사용자별 시계열 추적 구현 (2주)

**Week 3-4**: 목표 및 리포트 시스템
- Gap-2.2.2: 목표 설정 기능 구현 (1주)
- Gap-2.3.1: 목표 설정 시스템 구축 (1주)
- Gap-2.2.1: 성장 리포트 생성 시스템 구현 (3주)

**Week 5-6**: 분석 기능 강화
- Gap-1.4.1: 가독성 평가 체계 구현 (2주)
- Gap-1.2.1: 색상 팔레트 추출 기능 구현 (2주)

**Week 7-8**: 모바일 최적화
- Gap-4.2.1: 모바일 최적화 구현 (3주)

**마일스톤**: 베타 테스트 준비 완료

#### Phase 3: 중기 해결 (3-6개월)

**목표**: 검색 및 추천 시스템 구축

**Month 3-4**: 검색 시스템
- Gap-3.1.1: 검색 시스템 구현 (6주)
  - Vertex AI Vector Search 도입
  - 레퍼런스 데이터베이스 구축
  - 검색 UI 구현

**Month 5-6**: 추천 시스템
- Gap-3.2.1: 추천 시스템 구현 (8주)
  - 사용자 DNA 기반 추천 알고리즘
  - 유사도 계산 로직
  - 추천 UI 구현

**마일스톤**: 검색 및 추천 기능 런칭

#### Phase 4: 장기 해결 (6개월 이상)

**목표**: dysBlPrint 고급 기능 구현

- Neo4j 그래프 데이터베이스 통합
- Dialogflow CX 대화형 인터페이스
- WebGL 실시간 시뮬레이션
- 트렌드 수집 시스템

### 10.3 마일스톤 정의

| 마일스톤 | 목표 일자 | 완료 기준 |
|---------|----------|----------|
| **M1: 프로덕션 보안 완료** | 2025.11.18 | Firebase Authentication 통합 및 보안 규칙 강화 완료 |
| **M2: 핵심 기능 완성** | 2025.12.10 | 사용자 프로파일링, 목표 설정, 성장 리포트 구현 완료 |
| **M3: 베타 테스트 준비** | 2025.12.20 | 모바일 최적화 완료 및 베타 테스트 환경 구축 |
| **M4: 검색 시스템 런칭** | 2026.02.28 | AI 기반 검색 시스템 구현 완료 |
| **M5: 추천 시스템 런칭** | 2026.04.30 | 개인화 추천 시스템 구현 완료 |

---

## 📝 11. 문서 히스토리

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025.11.04 | 초기 SRD 문서 작성 | dys 팀 |
| 1.1 | 2025.01.19 | Firebase 인프라 설정 정보 추가 (Storage us-east-1, Firestore asia-northeast3, Auth 익명), Phase 0 완료 상태 반영, 리전 정보 정정 | dys 팀 |
| 1.2 | 2025.01.19 | 구현 상태 섹션 대폭 수정: 완전 구현 기능 삭제, 실제 상태 반영 | dys 팀 |
| 1.3 | 2025.01.XX | 프로젝트명 통일 (DYSS → dysproto), 실제 코드베이스 기반 경로 및 컬렉션명 동기화, 구현 상태 반영, Gap 분석 업데이트 (구현 완료 항목 표시) | dys 팀 |

---

## 📚 부록

### A. 용어 정의

- **DNA 프로파일링**: 사용자의 디자인 스타일을 수치화하여 고유한 프로파일을 생성하는 기능
- **5축 메트릭**: Layout, Typography, Color, Components, Form Language 5가지 평가 기준
- **MultiLLM**: 여러 AI 언어 모델을 병렬로 실행하여 결과를 비교 분석하는 시스템
- **벤치마크 점수**: AI 모델의 성능을 정확도, 응답시간, 비용을 종합하여 평가한 점수

### B. BRD 요구사항 추적성 매트릭스

| BRD Section | BRD 요구사항 | SRD Section | 구현 상태 |
|------------|-------------|------------|----------|
| 3.1.1 | 이미지 업로드 및 분석 | FR-1.1, FR-1.2 | ✅ 100% |
| 3.1.1 | DNA 프로파일링 | FR-1.3 | 🚧 40% |
| 3.1.1 | 디자인 법칙 평가 | FR-1.4 | ❌ 0% |
| 3.2.1 | 맞춤형 피드백 | FR-2.1 | ✅ 70% |
| 3.2.1 | 성장 리포트 | FR-2.2 | ❌ 0% |
| 3.2.1 | 목표 설정 | FR-2.3 | ❌ 0% |
| 3.2.2 | 시계열 추적 | FR-2.4 | 🚧 50% |
| 3.3.1 | 참조 자료 검색 | FR-3.1 | ❌ 0% |
| 3.3.2 | DNA 기반 추천 | FR-3.2 | ❌ 0% |
| 3.4.1 | 직관적 UI/UX | FR-4.1 | ✅ 70% |
| 3.4.1 | 반응형 웹앱 | FR-4.2 | ✅ 60% |
| 3.4.1 | 활동 추적 | FR-4.3 | 🚧 20% |
| 3.4.1 | 개인화 대시보드 | FR-4.4 | ❌ 0% |
| 2.2 | 성공 지표 | NFR-1.1, NFR-1.2 | 🚧 측정 불가 |
| 5.5 | 개인정보 보호 | NFR-2.2 | 🚧 부분 구현 |

### C. 기술 부채 목록

1. **Node.js 버전 불일치**: `firebase.json`은 nodejs18, `package.json`은 node 20
2. **Redis 캐싱 미연결**: 코드는 존재하나 실제 Redis 연결 없음
3. **BigQuery 미활용**: SQL 파일은 있으나 실제 사용 안 함
4. **API 키 하드코딩**: `firebaseConfig.js`에 Firebase API 키 노출
5. **에러 핸들링 불일치**: 함수마다 다른 에러 처리 방식

---

**문서 관리**: 이 문서는 BRD.md의 기술적 구현 사양을 정의하며, 시스템 개발 현황과의 Gap을 명확히 식별합니다. 변경 사항은 모든 이해관계자와 공유되어야 합니다.
