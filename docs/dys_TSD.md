# 📋 dys TSD (Technical Specification Document)

**작성일자**: 2025년 11월 4일  
**문서 버전**: 1.3  
**상태**: 초기 기술 명세 정의 (인프라 설정 추가, Phase 0 완료 반영, 리전 정보 정정, 구현 상태 정정, 프로젝트명 통일)  
**참조 문서**: BRD.md (버전 1.2), dys_SRD.md (버전 1.3), dys_FRD.md (버전 1.3)

---

## 📌 0. 문서 정보

| 항목 | 내용 |
|------|------|
| **프로젝트명** | dysproto (Design Intelligence Support System) |
| **문서 유형** | Technical Specification Document (TSD) |
| **관련 문서** | BRD.md (비즈니스 요구사항), dys_SRD.md (시스템 요구사항), dys_FRD.md (기능 요구사항) |
| **작성 목적** | SRD의 기술 요구사항을 실제 구현 가능한 구체적인 기술 명세로 변환하며, 개발자가 바로 사용할 수 있는 수준의 상세 명세 제공 |

---

## 🎯 1. 개요 및 목적

### 1.1 문서 목적

본 TSD는 **dysproto (Design Intelligence Support System)**의 기술적 구현 명세를 정의합니다. 이 문서는:

- SRD의 기술 요구사항을 실제 구현 가능한 수준으로 상세화
- API 명세, 데이터베이스 스키마, 알고리즘, 컴포넌트 설계를 구체적으로 정의
- 개발자가 코드를 작성할 수 있을 정도로 상세한 명세 제공
- 구현 가이드 및 모범 사례 포함

### 1.2 문서 범위

**포함 범위**:
- Cloud Functions API 상세 명세 (요청/응답 스키마, 예제)
- Firestore 데이터베이스 스키마 상세 정의
- 알고리즘 및 로직 명세 (MultiLLM, 벤치마크 계산, 메트릭 정규화 등)
- 컴포넌트 설계 및 인터페이스 정의
- 에러 처리 및 재시도 전략
- 성능 최적화 가이드라인
- 보안 구현 가이드
- 테스트 전략
- 배포 및 운영 가이드

**제외 범위**:
- dysBlPrint Phase 1-4의 고급 기능 (향후 확장 예정)
- 외부 디자인 플랫폼 API 통합 상세 (기본 구조만 포함)

### 1.3 참조 문서

- **BRD.md**: 비즈니스 요구사항 정의
- **dys_SRD.md**: 시스템 요구사항 정의 (본 문서의 입력 기준)
- **dys_FRD.md**: 기능 요구사항 정의
- **functions/src/index.ts**: 백엔드 구현 코드
- **functions/src/types.ts**: Firestore 타입 정의

### 1.4 인프라 정보

- **GCP Project ID**: `dysproto`
- **Firebase Project ID**: `dysproto`
- **Firebase Project Number**: `894139739522`
- **Region**: `asia-northeast3` (서울) - Functions 및 Firestore
- **Service Account**: `firebase-adminsdk-fbsvc@dysproto.iam.gserviceaccount.com`
- **Service Account Key Path**: `C:/dys/user/dysproto-firebase-adminsdk-fbsvc-c11f2c761d.json`
- **Storage Bucket**: `gs://dysproto.firebasestorage.app`
- **Storage Region**: `us-east-1` ⚠️ (주의: asia-northeast3 아님)
- **Authentication**: 익명 인증 활성화 (Phase 0)
- **Firestore Database**: `dysproto`
- **Firestore Mode**: Standard (네이티브)
- **Firestore Region**: `asia-northeast3`
- **Firestore Initial Collection**: `analyses`
- **Firestore Security Rules**: 테스트 모드 (2025-12-19까지)
- **Cloud Functions Region**: `asia-northeast3`

### 1.5 Phase 0 완료 상태 (2025.01.19)

#### 1.5.1 프론트엔드 스캐폴딩 완료
- ✅ 디렉토리 구조 생성 완료 (p0_TSD.md Section 1 참조)
- ✅ Firebase 초기화 코드 완료 (`services/firebase.ts`)
- ✅ 인증 시스템 기반 완료 (`AuthContext`, `ProtectedRoute`)
- ✅ 라우팅 설정 완료 (`App.jsx`, React Router)
- ✅ 기본 페이지 컴포넌트 생성 완료

#### 1.5.2 백엔드 설정 완료
- ✅ Cloud Functions 환경 설정 완료 (Node.js 20)
- ✅ OpenAI 연동 코드 준비 완료 (`testOpenAI` 함수)
- ✅ Secret Manager 연동 완료 (`OPENAI_API_KEY`)

#### 1.5.3 인프라 프로비저닝 완료
- ✅ Firebase Storage 버킷 생성 완료 (`gs://dysproto.firebasestorage.app`, `us-east-1`)
- ✅ Firestore 데이터베이스 생성 완료 (`dysproto`, `asia-northeast3`, Standard 모드)
- ✅ Firebase Authentication 설정 완료 (익명 인증 활성화)
- ✅ 보안 규칙 배포 완료 (테스트 모드, 2025-12-19까지)

---

## 📋 목차

1. [개요 및 아키텍처](#1-개요-및-아키텍처)
2. [API 명세서](#2-api-명세서)
3. [데이터베이스 스키마 상세](#3-데이터베이스-스키마-상세)
4. [알고리즘 및 로직 명세](#4-알고리즘-및-로직-명세)
5. [컴포넌트 설계](#5-컴포넌트-설계)
6. [에러 처리 및 예외 상황](#6-에러-처리-및-예외-상황)
7. [성능 최적화](#7-성능-최적화)
8. [보안 명세](#8-보안-명세)
9. [테스트 전략](#9-테스트-전략)
10. [배포 및 운영](#10-배포-및-운영)
11. [코드 예제 및 구현 가이드](#11-코드-예제-및-구현-가이드)
12. [부록](#12-부록)

---

## 1. 개요 및 아키텍처

### 1.1 시스템 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  HomePage   │  │ BenchmarkPage│  │ TrendsPage │              │
│  │             │  │             │  │            │              │
│  │ PromptInput │  │ Benchmark    │  │ TimeSeries │              │
│  │ ReportDisplay│ │ Dashboard    │  │ Chart      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                  ┌────────▼────────┐                            │
│                  │   APIService    │                            │
│                  │  (Firebase SDK) │                            │
│                  └────────┬────────┘                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐    ┌─────────▼────────┐
        │ Firebase       │    │ Firebase         │
        │ Storage        │    │ Firestore        │
        │ (images/)      │    │ (analyses, etc)  │
        └───────┬────────┘    └─────────┬────────┘
                │                       │
                │                       │
        ┌───────▼───────────────────────▼────────┐
        │     Cloud Functions (Backend)          │
        │                                         │
        │  ┌─────────────────────────────────┐  │
        │  │ analyzeImageOnUpload (Storage)   │  │
        │  └───────────┬───────────────────────┘  │
        │              │                           │
        │  ┌───────────▼───────────────────────┐  │
        │  │ MultiLLMOrchestrator               │  │
        │  │ - OpenAI GPT-4o                   │  │
        │  │ - Claude 3.5 Sonnet               │  │
        │  │ - Vertex AI Gemini 1.5 Pro       │  │
        │  └───────────┬───────────────────────┘  │
        │              │                           │
        │  ┌───────────▼───────────────────────┐  │
        │  │ generateNaturalLanguageSummary    │  │
        │  └───────────┬───────────────────────┘  │
        │              │                           │
        │  ┌───────────▼───────────────────────┐  │
        │  │ Firestore Update                   │  │
        │  │ (analyses/{docId})                │  │
        │  └───────────────────────────────────┘  │
        │                                         │
        │  ┌───────────────────────────────────┐  │
        │  │ generateSunburstCache (Firestore)│  │
        │  └───────────────────────────────────┘  │
        │                                         │
        │  ┌───────────────────────────────────┐  │
        │  │ continueCritique (HTTP)            │  │
        │  └───────────────────────────────────┘  │
        │                                         │
        │  ┌───────────────────────────────────┐  │
        │  │ aggregateFeedback (Scheduler)       │  │
        │  └───────────────────────────────────┘  │
        └─────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────▼────────┐    ┌─────────▼────────┐
        │ Secret Manager │    │   BigQuery       │
        │ (API Keys)      │    │   (Metrics)      │
        └────────────────┘    └──────────────────┘
```

### 1.1.1 프론트엔드 디렉토리 구조 (Phase 0 완료)

이 구조는 Phase 0에서 완료되었으며, 향후 모든 개발의 기준이 됩니다.

```text
프로젝트 루트/
├── components/      # React 컴포넌트
│   ├── UploadAnalysis.tsx    # 이미지 업로드 및 분석
│   ├── SearchPage.tsx        # 검색 페이지
│   ├── MyPage.tsx            # 마이페이지
│   ├── SettingsPage.tsx     # 설정 페이지
│   ├── Sidebar.tsx           # 사이드바 네비게이션
│   └── RadarChart.tsx        # 레이더 차트 컴포넌트
├── services/       # 서비스 레이어
│   ├── firebase.ts           # Firebase 초기화
│   ├── dataService.ts        # 데이터 서비스 (Cloud Functions 호출)
│   ├── geminiService.ts      # Gemini AI 서비스
│   └── authService.ts        # 인증 서비스
├── functions/      # Cloud Functions
│   └── src/
│       ├── index.ts          # Cloud Functions 진입점
│       └── types.ts          # Firestore 타입 정의
├── contexts/        # 전역 상태 (AuthContext.jsx)
├── hooks/           # 커스텀 훅 (useAuth, useFirestore)
├── lib/             # 외부 라이브러리 설정
│   ├── firebase.js  # Firebase 초기화 코드
│   └── openai.js    # OpenAI 클라이언트 설정 (Frontend용 아님, 참고용)
├── pages/           # 라우트 페이지 컴포넌트
│   ├── Home.jsx
│   ├── Upload.jsx
│   ├── Search.jsx
│   ├── MyPage.jsx
│   ├── Settings.jsx
│   ├── Login.jsx
│   └── NotFound.jsx
├── styles/          # 전역 스타일 (index.css, variables.css)
├── utils/           # 유틸리티 함수 (dateFormatter, validators)
├── App.jsx          # 라우팅 설정
└── main.jsx         # Entry Point
```

**Path Alias 설정**: `src/`를 `@/`로 참조할 수 있도록 `vite.config.js`에 설정됨

### 1.2 기술 스택 상세 명세

#### 1.2.1 프론트엔드

| 기술 | 버전 | 용도 | 설정 |
|------|------|------|------|
| React | 19.1.1 | UI 프레임워크 | - |
| React Router | 7.9.4 | 라우팅 | Hash Router |
| Firebase SDK | 10.x | Firebase 서비스 연동 | Storage, Firestore, Analytics |

#### 1.2.2 백엔드

| 기술 | 버전 | 용도 | 설정 |
|------|------|------|------|
| Node.js | 20 | 런타임 | - |
| Firebase Cloud Functions | v2 | 서버리스 함수 | asia-northeast3 리전 |
| Firebase Admin SDK | 12.x | 서버 사이드 Firebase 연동 | - |

#### 1.2.3 데이터베이스 및 스토리지

| 기술 | 용도 | 설정 |
|------|------|------|
| Firestore | NoSQL 데이터베이스 | Standard, asia-northeast3 |
| Firebase Storage | 파일 저장소 | us-east-1 ⚠️ (주의: asia-northeast3 아님) |
| BigQuery | 데이터 웨어하우스 | (준비됨, 미활용) |

#### 1.2.4 외부 AI 서비스

| 서비스 | 모델 | 용도 | 비용 |
|--------|------|------|------|
| OpenAI | GPT-4o | 이미지 분석 | $0.01/1K input, $0.03/1K output |
| OpenAI | GPT-4o-mini | 자연어 요약 | $0.15/1M input, $0.60/1M output |
| Anthropic | Claude 3.5 Sonnet | 이미지 분석 | $0.003/1K input, $0.015/1K output |
| Vertex AI | Gemini 1.5 Pro Vision | 이미지 분석 | $0.00025/1K input, $0.0005/1K output |

#### 1.2.5 향후 기술 스택 (dysBlPrint Phase 2)

**SRD 참조**: dysBlPrint.md, Gap-3.1.1, Gap-3.2.1  
**도입 예정**: Phase 3 (2026년 상반기)

| 기술 | 용도 | 도입 시기 | 비고 |
|------|------|----------|------|
| **Vertex AI Vector Search** | 벡터 기반 검색 엔진 | Phase 3 (2026년 2월) | 이미지 및 DNA 기반 검색 |
| **Neo4j** | 그래프 데이터베이스 | Phase 3 (2026년 상반기) | 디자인 관계 네트워크 분석 |
| **Redis** | 캐싱 레이어 | Phase 3 (2026년 상반기) | 고성능 캐싱 |
| **Dialogflow CX** | 대화형 인터페이스 | Phase 4 (2026년 하반기) | 고급 대화형 피드백 |
| **K-means 클러스터링** | 색상 팔레트 추출 | Phase 2 (2025년 12월) | Gap-1.2.1 해결 |
| **BigQuery** | 데이터 분석 | Phase 2 (2025년 12월) | 성능 메트릭 분석 |
| **WebGL** | 실시간 시뮬레이션 | Phase 4 (2026년 하반기) | 3D 시각화 |
| **XAI (Explainable AI)** | AI 설명 가능성 | Phase 4 (2026년 하반기) | 분석 결과 설명 |

**각 기술의 도입 시기 및 용도**:

- **Vertex AI Vector Search**: 
  - 검색 시스템 구현 시 벡터 임베딩 기반 유사도 검색
  - 이미지 임베딩 및 DNA 벡터 검색 지원
  
- **Neo4j**:
  - 디자인 요소 간 관계 네트워크 구축
  - 스타일 유사도 그래프 분석
  
- **Redis**:
  - 고빈도 데이터 캐싱 (분석 결과, 사용자 프로파일)
  - 세션 데이터 임시 저장

---

### 2.1 Cloud Functions API

#### 2.1.1 `analyzeDesign` (실제 구현됨)

**구현 상태**: ✅ 구현 완료  
**구현 일자**: 2025.01  
**현재 상태**: Callable Function으로 구현됨

**SRD 참조**: FR-1.1, FR-1.2

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 300초

**요청 스키마**:
```typescript
{
  imageData: string;      // Base64 인코딩된 이미지 데이터
  mimeType: string;       // "image/jpeg", "image/png", "image/webp"
  fileName: string;       // 파일명
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
  data: {
    summary: string;
    metrics: {
      layout: { score: number; reason: string; benchmark: string; keyElements: string[] };
      typography: { score: number; reason: string; benchmark: string; keyElements: string[] };
      color: { score: number; reason: string; benchmark: string; keyElements: string[] };
      components: { score: number; reason: string; benchmark: string; keyElements: string[] };
      formLanguage: { score: number; reason: string; benchmark: string; keyElements: string[] };
      overall: number;
    };
    colors: Array<{ hex: string; rgb: string }>;
    keywords: string[];
    detectedObjects: Array<{ name: string; confidence: number }>;
    suggestions: string;
  };
  analysisId: string;
  imageUrl: string;
}
```

**처리 플로우**:
1. 이미지를 Firebase Storage에 업로드 (`users/{userId}/analyses/{timestamp}_{fileName}`)
2. Gemini 3 Pro API 호출하여 디자인 분석 수행
3. 분석 결과를 Firestore `analyses` 컬렉션에 저장
4. 분석 결과 및 이미지 URL 반환

---

#### 2.1.2 `chatWithMentor` (실제 구현됨)

**구현 상태**: ✅ 구현 완료  
**구현 일자**: 2025.01  
**현재 상태**: Callable Function으로 구현됨

**SRD 참조**: FR-2.1

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  message: string;                    // 사용자 메시지
  sessionId?: string;                // 기존 세션 ID (선택사항)
  analysisContext?: {                 // 분석 컨텍스트 (선택사항)
    id: string;
    fileName: string;
    summary: string;
    metrics: object;
  };
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
  response: string;                   // AI 응답 메시지
  sessionId: string;                  // 세션 ID
}
```

**처리 플로우**:
1. 세션 ID가 제공되면 기존 세션 로드, 없으면 새 세션 생성
2. 분석 컨텍스트가 있으면 프롬프트에 포함
3. Gemini 3 Pro Chat API 호출
4. 대화 기록을 Firestore `chatSessions` 컬렉션에 저장
5. AI 응답 반환

---

#### 2.1.3 `getAnalyses` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  limit?: number;        // 기본값: 20
  startAfter?: string;   // 페이지네이션용 문서 ID
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
  analyses: Array<{
    id: string;
    fileName: string;
    timestamp: string;
    summary: string;
    metrics: object;
    colors: Array<{ hex: string; rgb: string }>;
    keywords: string[];
    detectedObjects: Array<{ name: string; confidence: number }>;
    suggestions: string;
    imageUrl: string;
  }>;
  hasMore: boolean;
}
```

---

#### 2.1.4 `getAnalysis` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  analysisId: string;
}
```

**응답 스키마**: `getAnalyses`의 단일 항목과 동일

---

#### 2.1.5 `deleteAnalysis` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  analysisId: string;
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
}
```

---

#### 2.1.6 `getUserProfile` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**: 없음 (userId는 인증에서 자동 추출)

**응답 스키마**:
```typescript
{
  success: boolean;
  profile: {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    subscription: "free" | "pro" | "premium";
    bio?: string;
    settings: {
      notifications: {
        weeklyReport: boolean;
        growthAlerts: boolean;
        marketingEmails: boolean;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}
```

**참고**: 프로필이 없으면 기본 프로필을 생성하여 반환

---

#### 2.1.7 `updateUserProfile` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  displayName?: string;
  photoURL?: string;
  bio?: string;
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
}
```

---

#### 2.1.8 `updateUserSettings` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  settings: {
    notifications: {
      weeklyReport?: boolean;
      growthAlerts?: boolean;
      marketingEmails?: boolean;
    };
  };
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
}
```

---

#### 2.1.9 `toggleBookmark` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  referenceId: string;
  imageUrl?: string;
  title?: string;
  category?: string;
  similarity?: number;
  reason?: string;
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
  bookmarked: boolean;  // true: 추가됨, false: 제거됨
}
```

---

#### 2.1.10 `getBookmarks` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**: 없음

**응답 스키마**:
```typescript
{
  success: boolean;
  bookmarks: Array<{
    id: string;
    referenceId: string;
    imageUrl: string;
    title: string;
    category: string;
    similarity: number;
    reason?: string;
    createdAt: string;
  }>;
}
```

---

#### 2.1.11 `createCollection` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  name: string;
  description?: string;
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
  collectionId: string;
}
```

---

#### 2.1.12 `updateCollection` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  collectionId: string;
  analysisId: string;
  action: "add" | "remove";
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
}
```

---

#### 2.1.13 `getCollections` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**: 없음

**응답 스키마**:
```typescript
{
  success: boolean;
  collections: Array<{
    id: string;
    name: string;
    description?: string;
    analysisIds: string[];
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

#### 2.1.14 `searchImages` (실제 구현됨)

**구현 상태**: ✅ 구현 완료

**트리거**: Callable Function (onCall)  
**리전**: asia-northeast3

**요청 스키마**:
```typescript
{
  query: string;
  num?: number;      // 기본값: 10, 최대: 10
  start?: number;    // 기본값: 1 (페이지네이션)
}
```

**응답 스키마**:
```typescript
{
  success: boolean;
  results: Array<{
    id: string;
    imageUrl: string;
    title: string;
    similarity: number;
    category: string;
    reason: string;
    awards?: string[];
    isSaved: boolean;
  }>;
  totalResults: number;
  searchTime: number;
}
```

**참고**: Google Custom Search API를 사용하여 이미지 검색 수행

---

#### 2.1.15 `analyzeImageOnUpload` (미구현 - 향후 구현 예정)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**참고**: 현재는 `analyzeDesign` Callable Function을 사용하며, Storage 트리거 방식은 향후 구현 예정

**SRD 참조**: FR-1.1, FR-1.2

**트리거**: Storage 파일 업로드 이벤트  
**트리거 경로**: `users/{userId}/analyses/{timestamp}_{fileName}`  
**Functions 리전**: asia-northeast3  
**Storage Bucket**: `gs://dysproto.firebasestorage.app`  
**Storage 리전**: `us-east-1` ⚠️ (주의: asia-northeast3 아님)  
**리소스**: CPU 2, Memory 1GiB, Timeout 540초

**Storage 이벤트 데이터 구조**:
```typescript
interface StorageEvent {
  data: {
    bucket: string;           // "dysproto.firebasestorage.app"
    name: string;            // "users/{userId}/analyses/1733318400000_abc123.jpg"
    contentType: string;     // "image/jpeg"
    size: number;            // 파일 크기 (바이트)
    timeCreated: string;     // ISO 8601 타임스탬프
    updated: string;        // ISO 8601 타임스탬프
    md5Hash: string;         // MD5 해시
    metadata?: {
      [key: string]: string;
    };
  };
}
```

**처리 플로우**:
```
1. Storage 이벤트 수신
   ↓
2. 파일 경로 및 타입 검증
   - filePath.startsWith("users/")
   - contentType.startsWith("image/")
   ↓
3. Firestore에 분석 시작 상태 기록
   - Collection: analyses
   - Document ID: fileName에서 확장자 제거
   - Status: "analyzing"
   ↓
4. Cloud Storage에서 파일 다운로드
   - bucket.file(filePath).download()
   ↓
5. Base64 변환
   - Buffer → base64 string
   - dataUrl 생성: "data:{mimeType};base64,{base64}"
   ↓
6. MultiLLMOrchestrator 실행
   - runParallelAnalysis(dataUrl, 'design_system')
   - 3개 모델 병렬 실행 (Promise.allSettled)
   ↓
7. 자연어 요약 생성
   - generateNaturalLanguageSummary(consolidatedResult)
   - GPT-4o-mini 사용
   ↓
8. Firestore 결과 저장
   - Status: "completed"
   - analysisResult: consolidatedResult
   - summary: string
   ↓
9. 성공 응답 반환
```

**에러 처리**:
```typescript
try {
  // 분석 처리
} catch (error) {
  // Firestore에 실패 상태 기록
  await db.collection("analyses").doc(documentId).update({
    status: "failed",
    error: error.message,
    failedAt: new Date()
  });
  
  // 에러 로그 기록
  await logError('analyze_image_error', error, {
    documentId,
    filePath
  });
  
  throw error; // Cloud Functions 로깅을 위해 재throw
}
```

**성능 메트릭**:
- 총 처리 시간: P95 < 60초 목표
- 각 단계별 시간 측정 및 로깅
- BigQuery 메트릭 저장 (향후 활성화)

---

#### 2.1.2 `continueCritique`

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-2.1

**트리거**: HTTP 요청  
**메서드**: POST  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 540초  
**CORS**: 모든 도메인 허용 (`*`)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["sessionId", "userMessage"],
  "properties": {
    "sessionId": {
      "type": "string",
      "description": "세션 식별자 (존재하지 않으면 자동 생성)",
      "pattern": "^[a-zA-Z0-9_-]{1,128}$"
    },
    "userMessage": {
      "type": "string",
      "description": "사용자 메시지",
      "minLength": 1,
      "maxLength": 2000
    },
    "context": {
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "description": "사용자 ID (선택사항, 현재는 'anonymous' 사용)"
        }
      }
    }
  }
}
```

**요청 예제**:
```json
{
  "sessionId": "session_1733318400000_abc123",
  "userMessage": "타이포그래피가 어색해 보여요. 어떻게 개선할 수 있을까요?",
  "context": {
    "userId": "anonymous"
  }
}
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "sessionId", "hypotheses", "summary"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "sessionId": {
      "type": "string"
    },
    "hypotheses": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "title", "description", "confidence"],
        "properties": {
          "type": {
            "type": "string",
            "enum": ["safe", "innovative", "alternative"]
          },
          "title": {
            "type": "string",
            "maxLength": 100
          },
          "description": {
            "type": "string",
            "maxLength": 500
          },
          "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "reasoning": {
            "type": "string",
            "maxLength": 1000
          },
          "actionItems": {
            "type": "array",
            "items": {
              "type": "string",
              "maxLength": 200
            },
            "maxItems": 5
          }
        }
      },
      "minItems": 3,
      "maxItems": 3
    },
    "summary": {
      "type": "string",
      "maxLength": 1000
    },
    "nextSteps": {
      "type": "array",
      "items": {
        "type": "string",
        "maxLength": 200
      },
      "maxItems": 5
    },
    "metadata": {
      "type": "object",
      "required": ["timestamp", "model", "phase"],
      "properties": {
        "timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "model": {
          "type": "string",
          "enum": ["gpt-4o"]
        },
        "phase": {
          "type": "integer",
          "minimum": 1
        }
      }
    }
  }
}
```

**응답 예제**:
```json
{
  "success": true,
  "sessionId": "session_1733318400000_abc123",
  "hypotheses": [
    {
      "type": "safe",
      "title": "폰트 크기 계층 구조 개선",
      "description": "현재 타이포그래피에서 명확한 크기 계층이 부족합니다. 제목, 본문, 보조 텍스트에 일관된 비율(예: 1.25배)을 적용하여 가독성을 향상시킬 수 있습니다.",
      "confidence": 0.85,
      "reasoning": "8px 그리드 시스템과 일관된 타이포그래피 스케일은 디자인 시스템의 기본 원칙입니다.",
      "actionItems": [
        "모듈러 스케일 1.25 비율 적용",
        "제목/본문/보조 텍스트 크기 정의",
        "라인 높이를 폰트 크기의 1.5배로 설정"
      ]
    },
    {
      "type": "innovative",
      "title": "가변 폰트 활용한 동적 타이포그래피",
      "description": "가변 폰트를 도입하여 화면 크기와 컨텍스트에 따라 폰트 두께와 너비를 동적으로 조절합니다.",
      "confidence": 0.65,
      "reasoning": "최신 웹 기술을 활용한 혁신적 접근이지만, 브라우저 호환성과 성능을 고려해야 합니다.",
      "actionItems": [
        "가변 폰트 파일 형식 검토 (woff2)",
        "폴백 폰트 스택 정의",
        "성능 테스트 및 최적화"
      ]
    },
    {
      "type": "alternative",
      "title": "시각적 무게 기반 타이포그래피 시스템",
      "description": "크기 대신 폰트 두께와 색상 대비를 활용하여 계층 구조를 만드는 창의적 접근입니다.",
      "confidence": 0.75,
      "reasoning": "기존 크기 기반 접근을 벗어나 새로운 시각적 언어를 구축할 수 있습니다.",
      "actionItems": [
        "폰트 두께 범위 정의 (400-700)",
        "색상 대비 기준 설정 (WCAG AA)",
        "프로토타입 테스트 및 사용자 피드백 수집"
      ]
    }
  ],
  "summary": "타이포그래피 개선을 위해 세 가지 관점의 가설을 제시했습니다. 안전한 접근은 모듈러 스케일 적용이며, 혁신적 접근은 가변 폰트 활용, 대안적 접근은 시각적 무게 기반 시스템입니다.",
  "nextSteps": [
    "각 가설의 우선순위 결정",
    "프로토타입 제작",
    "사용자 테스트 진행"
  ],
  "metadata": {
    "timestamp": "2025-11-04T12:00:00.000Z",
    "model": "gpt-4o",
    "phase": 2
  }
}
```

**에러 응답**:
```json
{
  "error": "대화 처리 중 오류가 발생했습니다.",
  "details": "AI 응답 파싱 실패: Unexpected token",
  "timestamp": "2025-11-04T12:00:00.000Z"
}
```

**에러 코드**:
- `400`: 잘못된 요청 (sessionId 또는 userMessage 누락)
- `405`: 허용되지 않은 메서드 (POST가 아닌 요청)
- `500`: 서버 내부 오류 (AI API 실패, 파싱 오류 등)

---

#### 2.1.3 `generateSunburstCache`

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.1 (증분 캐시 생성)

**트리거**: Firestore 문서 생성 이벤트  
**트리거 경로**: `analyses/{analysisId}/benchmarks/models/{modelId}`  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 60초, MaxInstances 10

**Firestore 이벤트 데이터 구조**:
```typescript
interface FirestoreEvent {
  params: {
    analysisId: string;
    modelId: string;
  };
  data: {
    data(): {
      metrics: {
        layout: number;
        typography: number;
        color: number;
        components: number;
        formLanguage: number;
      };
      performance: {
        success: boolean;
        responseTime: number;
        cost: number;
      };
      timestamp: Timestamp;
    };
  };
}
```

**처리 플로우**:
```
1. Firestore 이벤트 수신
   ↓
2. 기존 캐시 로드 또는 초기 구조 생성
   - 경로: analyses/{analysisId}/sunburst_cache/current
   - 캐시 없으면 initializeStructure() 호출
   ↓
3. 증분 업데이트 (IncrementalSunburstAggregator)
   - updateStructureWithModel() 호출
   - 메트릭 정규화 적용
   ↓
4. 원자적 업데이트 (트랜잭션)
   - version: increment(1)
   - modelCount: increment(1)
   - lastUpdated: serverTimestamp()
```

**캐시 구조 예제**:
```json
{
  "structure": {
    "name": "root",
    "children": [
      {
        "name": "Layout",
        "key": "layout",
        "children": [
          {
            "name": "gpt-4o",
            "value": 85,
            "timestamp": "2025-11-04T12:00:00Z"
          }
        ]
      }
    ]
  },
  "lastUpdated": "2025-11-04T12:00:00Z",
  "version": 1,
  "modelCount": 3
}
```

---

#### 2.1.4 `aggregateFeedback`

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-2.1 (피드백 집계)

**트리거**: Cloud Scheduler  
**스케줄**: `0 2 * * *` (매일 새벽 2시 KST)  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 300초

**처리 플로우**:
```
1. 스케줄러 트리거
   ↓
2. 어제 날짜 범위 계산
   - yesterday: 00:00:00
   - today: 00:00:00
   ↓
3. 피드백 데이터 수집
   - Collection: feedbacks
   - Query: timestamp >= yesterday AND timestamp < today
   ↓
4. 집계 처리
   - 가설 타입별 집계 (safe, innovative, alternative)
   - 도메인별 집계
   - 태그별 집계
   - 평균 평점 계산
   ↓
5. 인사이트 도출
   - deriveInsights() 함수 호출
   ↓
6. 결과 저장
   - Collection: feedback_aggregations
   - Document ID: YYYY-MM-DD
```

**집계 결과 스키마**:
```typescript
interface FeedbackAggregation {
  date: string; // "YYYY-MM-DD"
  totalFeedbacks: number;
  byHypothesisType: {
    safe: {
      count: number;
      avgRating: number;
      useful: number;
      usefulness: number; // useful / count
    };
    innovative: { /* 동일 구조 */ };
    alternative: { /* 동일 구조 */ };
  };
  byDomain: {
    [domain: string]: {
      count: number;
      avgRating: number;
    };
  };
  topTags: {
    [tag: string]: number;
  };
  insights: string[];
}
```

---

#### 2.1.5 인증 토큰 검증 미들웨어

**SRD 참조**: Gap-NFR-2.1  
**우선순위**: P0 (Critical)  
**구현 예정**: Phase 1 (즉시)

**목적**: 모든 HTTP 요청에 대해 Firebase Authentication 토큰을 검증하고 사용자 정보를 추출

**미들웨어 함수**:
```typescript
// functions/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
  };
}

export async function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'Unauthorized',
      code: 'MISSING_TOKEN',
      message: 'Authorization header is required'
    });
    return;
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    next();
  } catch (error: any) {
    let errorCode = 'INVALID_TOKEN';
    let message = 'Invalid authentication token';
    
    if (error.code === 'auth/id-token-expired') {
      errorCode = 'TOKEN_EXPIRED';
      message = 'Authentication token has expired';
    } else if (error.code === 'auth/id-token-revoked') {
      errorCode = 'TOKEN_REVOKED';
      message = 'Authentication token has been revoked';
    }
    
    res.status(401).json({
      error: 'Unauthorized',
      code: errorCode,
      message: message
    });
  }
}

// 선택적 인증 미들웨어 (인증 실패해도 계속 진행)
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
    } catch (error) {
      // 인증 실패해도 계속 진행 (익명 사용자로 처리)
      req.user = undefined;
    }
  }
  
  next();
}
```

**사용 예시**:
```typescript
// functions/src/index.ts
import { onRequest } from 'firebase-functions/v2/https';
import { verifyToken, AuthenticatedRequest } from './middleware/authMiddleware';

// 필수 인증이 필요한 엔드포인트
export const continueCritique = onRequest(
  { cors: true },
  async (req: AuthenticatedRequest, res: Response) => {
    await verifyToken(req, res, async () => {
      const userId = req.user!.uid;
      const { sessionId, userMessage } = req.body;
      
      // userId를 세션에 자동 설정
      // ... 나머지 로직
    });
  }
);

// 선택적 인증 엔드포인트 (익명 사용자도 허용)
import { optionalAuth } from './middleware/authMiddleware';

export const aggregateFeedback = onRequest(
  { cors: true },
  async (req: AuthenticatedRequest, res: Response) => {
    await optionalAuth(req, res, async () => {
      const userId = req.user?.uid || 'anonymous';
      // ... 나머지 로직
    });
  }
);
```

**에러 응답 스키마**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["error", "code", "message"],
  "properties": {
    "error": {
      "type": "string",
      "enum": ["Unauthorized"]
    },
    "code": {
      "type": "string",
      "enum": ["MISSING_TOKEN", "INVALID_TOKEN", "TOKEN_EXPIRED", "TOKEN_REVOKED"]
    },
    "message": {
      "type": "string"
    }
  }
}
```

**사용자별 데이터 필터링 유틸리티**:
```typescript
// functions/src/utils/dataFilter.ts
import { getFirestore, Query, FieldPath } from 'firebase-admin/firestore';

export function filterByUser(query: Query, userId: string): Query {
  return query.where('userId', '==', userId);
}

export function filterByUserOrPublic(query: Query, userId: string): Query {
  return query.where(
    FieldPath.documentId(),
    'in',
    [
      ...(await query.where('userId', '==', userId).select().get()).docs.map(d => d.id),
      ...(await query.where('isPublic', '==', true).select().get()).docs.map(d => d.id)
    ]
  );
}

// 사용 예시
const db = getFirestore();
const userAnalyses = await filterByUser(
  db.collection('analyses'),
  userId
).orderBy('createdAt', 'desc').limit(20).get();
```

---

#### 2.1.6 `generateGrowthReport`

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-2.2, Gap-2.2.1  
**우선순위**: P1 (High)

**트리거**: HTTP POST 또는 Cloud Scheduler  
**메서드**: POST  
**URL**: `/generateGrowthReport`  
**리전**: asia-northeast3  
**리소스**: Memory 2GiB, Timeout 300초  
**CORS**: 인증된 사용자만 허용

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["userId", "period"],
  "properties": {
    "userId": {
      "type": "string",
      "description": "Firebase Auth UID"
    },
    "period": {
      "type": "string",
      "enum": ["weekly", "monthly"],
      "description": "리포트 기간"
    },
    "startDate": {
      "type": "string",
      "format": "date-time",
      "description": "시작 날짜 (ISO 8601), 선택사항"
    },
    "endDate": {
      "type": "string",
      "format": "date-time",
      "description": "종료 날짜 (ISO 8601), 선택사항"
    }
  }
}
```

**요청 예제**:
```json
{
  "userId": "user_abc123",
  "period": "monthly",
  "startDate": "2025-10-01T00:00:00Z",
  "endDate": "2025-10-31T23:59:59Z"
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 날짜 범위 계산
   - period === "weekly": 지난 7일
   - period === "monthly": 지난 30일
   - startDate/endDate가 제공되면 해당 범위 사용
   ↓
3. 사용자별 분석 데이터 수집
   - Collection: analyses
   - Query: userId == {userId} AND createdAt >= startDate AND createdAt <= endDate
   ↓
4. 메트릭 집계
   - 평균 점수 계산
   - 메트릭별 변화 추이 계산
   - 개선율 계산 (이전 기간 대비)
   ↓
5. 개선 영역 및 강점 도출
   - 상위 3개 강점 식별
   - 상위 3개 개선 영역 식별
   ↓
6. 리포트 생성
   - 리포트 템플릿 적용
   - 차트 데이터 생성
   ↓
7. Firestore에 리포트 저장
   - Collection: growthReports
   - Document ID: {userId}_{period}_{YYYY-MM-DD}
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "reportId"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "reportId": {
      "type": "string",
      "description": "생성된 리포트 문서 ID"
    },
    "report": {
      "type": "object",
      "properties": {
        "summary": {
          "type": "object",
          "properties": {
            "totalAnalyses": { "type": "number" },
            "averageScore": { "type": "number" },
            "improvementRate": { "type": "number" },
            "topStrengths": {
              "type": "array",
              "items": { "type": "string" }
            },
            "topAreasForImprovement": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

**에러 처리**:
- `401 Unauthorized`: 인증 토큰 없음 또는 유효하지 않음
- `404 Not Found`: 사용자 데이터 없음
- `500 Internal Server Error`: 리포트 생성 실패

**성능 고려사항**:
- 대량 데이터 처리 시 배치 쿼리 사용
- 리포트 생성은 비동기 처리 고려 (Cloud Tasks 활용)
- 생성된 리포트는 캐싱하여 재사용

---

#### 2.1.7 `setUserGoal`

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-2.3, Gap-2.2.2, Gap-2.3.1  
**우선순위**: P1 (High)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/setUserGoal`  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 60초  
**CORS**: 인증된 사용자만 허용

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["userId", "targetMetric", "targetValue", "deadline"],
  "properties": {
    "userId": {
      "type": "string",
      "description": "Firebase Auth UID"
    },
    "targetMetric": {
      "type": "string",
      "enum": ["layout", "typography", "color", "components", "formLanguage", "overallScore"],
      "description": "목표 메트릭"
    },
    "targetValue": {
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "목표 값 (0-100)"
    },
    "deadline": {
      "type": "string",
      "format": "date-time",
      "description": "목표 달성 기한 (ISO 8601)"
    },
    "description": {
      "type": "string",
      "maxLength": 500,
      "description": "목표 설명 (선택사항)"
    }
  }
}
```

**요청 예제**:
```json
{
  "userId": "user_abc123",
  "targetMetric": "typography",
  "targetValue": 85,
  "deadline": "2025-12-31T23:59:59Z",
  "description": "타이포그래피 점수를 85점 이상으로 향상시키기"
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 요청 데이터 검증
   - targetValue 범위 검증 (0-100)
   - deadline이 미래 날짜인지 검증
   ↓
3. 현재 값 조회
   - userProfiles에서 평균 메트릭 값 조회
   - 또는 최근 분석 결과의 평균값 사용
   ↓
4. 진척도 계산
   - progress = (currentValue / targetValue) * 100
   - 최대 100%로 제한
   ↓
5. 목표 문서 생성/업데이트
   - Collection: userGoals
   - Document ID: {userId}_{targetMetric}_{timestamp}
   - 기존 목표가 있으면 업데이트, 없으면 생성
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "goalId"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "goalId": {
      "type": "string",
      "description": "생성된 목표 문서 ID"
    },
    "goal": {
      "type": "object",
      "properties": {
        "currentValue": { "type": "number" },
        "targetValue": { "type": "number" },
        "progress": { "type": "number" }
      }
    }
  }
}
```

**목표 검증 로직**:
```typescript
function validateGoal(targetMetric: string, targetValue: number, deadline: Date): void {
  if (targetValue < 0 || targetValue > 100) {
    throw new Error('Target value must be between 0 and 100');
  }
  
  if (deadline <= new Date()) {
    throw new Error('Deadline must be in the future');
  }
  
  const validMetrics = ['layout', 'typography', 'color', 'components', 'formLanguage', 'overallScore'];
  if (!validMetrics.includes(targetMetric)) {
    throw new Error(`Invalid target metric: ${targetMetric}`);
  }
}
```

---

#### 2.1.8 `getUserGoals`

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-2.3, Gap-2.3.1  
**우선순위**: P1 (High)

**트리거**: HTTP GET  
**메서드**: GET  
**URL**: `/getUserGoals`  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 30초  
**CORS**: 인증된 사용자만 허용

**쿼리 파라미터**:
- `userId` (필수): Firebase Auth UID
- `status` (선택): `active` | `completed` | `expired`
- `limit` (선택): 반환할 목표 수 (기본값: 20)

**요청 예제**:
```
GET /getUserGoals?userId=user_abc123&status=active&limit=10
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 쿼리 파라미터 검증
   ↓
3. 목표 조회
   - Collection: userGoals
   - Query: userId == {userId}
   - status 필터 적용 (있는 경우)
   - deadline 기준 정렬
   ↓
4. 진척도 업데이트
   - 각 목표의 currentValue를 최신 userProfiles 데이터로 업데이트
   - progress 재계산
   ↓
5. 응답 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "goals"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "goals": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["goalId", "targetMetric", "targetValue", "currentValue", "progress", "deadline"],
        "properties": {
          "goalId": { "type": "string" },
          "targetMetric": { "type": "string" },
          "targetValue": { "type": "number" },
          "currentValue": { "type": "number" },
          "progress": { "type": "number" },
          "deadline": { "type": "string", "format": "date-time" },
          "description": { "type": "string" },
          "createdAt": { "type": "string", "format": "date-time" }
        }
      }
    },
    "total": {
      "type": "number",
      "description": "전체 목표 수"
    }
  }
}
```

**응답 예제**:
```json
{
  "success": true,
  "goals": [
    {
      "goalId": "user_abc123_typography_1733318400000",
      "targetMetric": "typography",
      "targetValue": 85,
      "currentValue": 72,
      "progress": 84.7,
      "deadline": "2025-12-31T23:59:59Z",
      "description": "타이포그래피 점수를 85점 이상으로 향상시키기",
      "createdAt": "2025-11-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

---

#### 2.1.9 `searchReferences` (향후 구현)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-3.1, Gap-3.1.1  
**우선순위**: P1 (High)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/searchReferences`  
**리전**: asia-northeast3  
**리소스**: Memory 2GiB, Timeout 60초  
**CORS**: 인증된 사용자만 허용

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["userId", "searchType"],
  "properties": {
    "userId": {
      "type": "string",
      "description": "Firebase Auth UID"
    },
    "searchType": {
      "type": "string",
      "enum": ["keyword", "image", "dna"],
      "description": "검색 타입"
    },
    "query": {
      "type": "string",
      "description": "검색어 (keyword 타입일 때 필수)",
      "maxLength": 200
    },
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "description": "이미지 URL (image 타입일 때 필수)"
    },
    "dnaProfile": {
      "type": "object",
      "description": "DNA 프로파일 (dna 타입일 때 필수)",
      "properties": {
        "averageMetrics": {
          "type": "object",
          "properties": {
            "layout": { "type": "number" },
            "typography": { "type": "number" },
            "color": { "type": "number" },
            "components": { "type": "number" },
            "formLanguage": { "type": "number" }
          }
        }
      }
    },
    "limit": {
      "type": "number",
      "minimum": 1,
      "maximum": 50,
      "default": 10,
      "description": "반환할 결과 수"
    }
  }
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 검색 타입별 처리
   - keyword: 텍스트 검색 (Firestore 쿼리)
   - image: 이미지 임베딩 생성 → Vertex AI Vector Search
   - dna: DNA 벡터 생성 → Vertex AI Vector Search
   ↓
3. 검색 결과 반환
   - 유사도 점수 포함
   - 메타데이터 포함
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "results"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "referenceId": { "type": "string" },
          "title": { "type": "string" },
          "imageUrl": { "type": "string" },
          "similarity": { "type": "number" },
          "metadata": { "type": "object" }
        }
      }
    },
    "total": {
      "type": "number"
    }
  }
}
```

**벡터 검색 엔진**: Vertex AI Vector Search  
**구현 예정**: Phase 3 (2026년 2월)

---

#### 2.1.10 `getRecommendations` (향후 구현)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-3.2, Gap-3.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 3 (2026년 4월)

**트리거**: HTTP GET  
**메서드**: GET  
**URL**: `/getRecommendations`  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 30초  
**CORS**: 인증된 사용자만 허용

**쿼리 파라미터**:
- `userId` (필수): Firebase Auth UID
- `type` (선택): `dna` | `similarity` (기본값: `dna`)
- `limit` (선택): 반환할 추천 수 (기본값: 10, 최대: 20)

**요청 예제**:
```
GET /getRecommendations?userId=user_abc123&type=dna&limit=10
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 사용자 DNA 프로파일 조회
   - Collection: userProfiles
   - Document ID: {userId}
   ↓
3. 추천 타입별 처리
   - dna: DNA 유사도 기반 추천 (Section 4.12 참조)
   - similarity: 유사 사용자 기반 추천
   ↓
4. 추천 점수 계산
   - 유사도: 60%
   - 인기도: 25%
   - 최신성: 15%
   ↓
5. 결과 반환 (상위 N개)
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "recommendations"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "referenceId": { "type": "string" },
          "title": { "type": "string" },
          "imageUrl": { "type": "string" },
          "recommendationScore": { "type": "number" },
          "reason": { "type": "string" },
          "metadata": { "type": "object" }
        }
      }
    },
    "total": {
      "type": "number"
    }
  }
}
```

**추천 타입**:
- **DNA 기반**: 사용자의 디자인 DNA와 유사한 레퍼런스 추천
- **유사도 기반**: 유사한 디자인 스타일을 가진 다른 사용자의 작업 추천

**구현 예정**: Phase 3 (2026년 4월)

---

#### 2.1.11 `extractColorPalette` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.3, Gap-1.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/extractColorPalette`  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 60초  
**CORS**: 인증된 사용자만 허용 (optionalAuth 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["imageUrl"],
  "properties": {
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "description": "분석할 이미지 URL"
    },
    "maxColors": {
      "type": "integer",
      "minimum": 1,
      "maximum": 20,
      "default": 10,
      "description": "추출할 최대 색상 수"
    }
  }
}
```

**처리 플로우**:
```
1. 이미지 URL 검증 및 다운로드
   ↓
2. 색상 팔레트 추출 알고리즘 실행 (Section 4.13 참조)
   - K-means 클러스터링 또는 주요 색상 추출
   ↓
3. 색상 코드 변환 (RGB → HEX)
   ↓
4. 각 색상의 이미지 내 비율 계산
   ↓
5. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "colorPalette"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "colorPalette": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["hex", "rgb", "percentage"],
        "properties": {
          "hex": {
            "type": "string",
            "pattern": "^#[0-9A-Fa-f]{6}$"
          },
          "rgb": {
            "type": "object",
            "required": ["r", "g", "b"],
            "properties": {
              "r": { "type": "integer", "minimum": 0, "maximum": 255 },
              "g": { "type": "integer", "minimum": 0, "maximum": 255 },
              "b": { "type": "integer", "minimum": 0, "maximum": 255 }
            }
          },
          "percentage": {
            "type": "number",
            "minimum": 0,
            "maximum": 100,
            "description": "이미지 내 색상 비율 (%)"
          }
        }
      }
    }
  }
}
```

---

#### 2.1.12 `extractKeywords` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.3, Gap-1.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/extractKeywords`  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 30초  
**CORS**: 인증된 사용자만 허용 (optionalAuth 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["analysisId"],
  "properties": {
    "analysisId": {
      "type": "string",
      "description": "분석 문서 ID"
    }
  }
}
```

**처리 플로우**:
```
1. 분석 문서 조회 (analyses/{analysisId})
   ↓
2. 연관 키워드 추출 알고리즘 실행 (Section 4.14 참조)
   - AI 모델 프롬프트에 키워드 추출 요청
   - 분석 결과의 insights, strengths, improvements에서 키워드 추출
   ↓
3. 키워드 정규화 및 중복 제거
   ↓
4. analyses 문서에 keywords 필드 업데이트
   ↓
5. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "keywords"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "maxItems": 20
    }
  }
}
```

---

#### 2.1.13 `detectObjects` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.3, Gap-1.3.2  
**우선순위**: P2 (Medium)  
**구현 예정**: Phase 2 (2026년 2월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/detectObjects`  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 30초  
**CORS**: 인증된 사용자만 허용 (optionalAuth 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["imageUrl"],
  "properties": {
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "description": "분석할 이미지 URL"
    }
  }
}
```

**처리 플로우**:
```
1. 이미지 URL 검증 및 다운로드
   ↓
2. Google Cloud Vision API Object Detection 호출
   - 또는 AI 모델 프롬프트에 객체 감지 요청
   ↓
3. 객체 감지 알고리즘 실행 (Section 4.15 참조)
   ↓
4. 신뢰도 점수 및 바운딩 박스 계산
   ↓
5. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "objects"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "objects": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "confidence"],
        "properties": {
          "name": {
            "type": "string",
            "description": "감지된 객체 이름"
          },
          "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "신뢰도 점수"
          },
          "boundingBox": {
            "type": "object",
            "properties": {
              "x": { "type": "number" },
              "y": { "type": "number" },
              "width": { "type": "number" },
              "height": { "type": "number" }
            }
          }
        }
      }
    }
  }
}
```

---

#### 2.1.14 `archiveAnalysis` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.3, Gap-1.3.4  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/archiveAnalysis`  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 10초  
**CORS**: 인증된 사용자만 허용 (verifyToken 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["analysisId"],
  "properties": {
    "analysisId": {
      "type": "string",
      "description": "아카이빙할 분석 문서 ID"
    },
    "folderId": {
      "type": "string",
      "description": "속한 폴더 ID (선택사항)"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 10
    },
    "notes": {
      "type": "string",
      "maxLength": 500
    }
  }
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 분석 문서 조회 및 소유권 확인
   - analyses/{analysisId} 조회
   - userId == request.auth.uid 확인
   ↓
3. archivedAnalyses 컬렉션에 문서 생성
   ↓
4. analyses 문서에 archivedAt 필드 업데이트
   ↓
5. folderId가 있으면 styleFolders 문서 업데이트
   ↓
6. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "archiveId"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "archiveId": {
      "type": "string",
      "description": "생성된 아카이브 문서 ID"
    }
  }
}
```

---

#### 2.1.15 `createBoard` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-3.2, Gap-3.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 2월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/createBoard`  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 10초  
**CORS**: 인증된 사용자만 허용 (verifyToken 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "보드 이름"
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "category": {
      "type": "string",
      "maxLength": 50
    },
    "isPublic": {
      "type": "boolean",
      "default": false
    }
  }
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. boards 컬렉션에 문서 생성
   - userId: request.auth.uid
   - imageIds: []
   - createdAt, updatedAt: serverTimestamp()
   ↓
3. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "boardId"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "boardId": {
      "type": "string",
      "description": "생성된 보드 문서 ID"
    }
  }
}
```

---

#### 2.1.16 `saveToBoard` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-3.3, Gap-3.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 2월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/saveToBoard`  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 10초  
**CORS**: 인증된 사용자만 허용 (verifyToken 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["boardId", "analysisId"],
  "properties": {
    "boardId": {
      "type": "string",
      "description": "보드 문서 ID"
    },
    "analysisId": {
      "type": "string",
      "description": "저장할 분석 문서 ID"
    }
  }
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 보드 소유권 확인
   - boards/{boardId} 조회
   - userId == request.auth.uid 확인
   ↓
3. 분석 문서 존재 확인
   - analyses/{analysisId} 조회
   ↓
4. 보드의 imageIds 배열에 analysisId 추가 (중복 체크)
   ↓
5. analyses 문서의 boardIds 배열에 boardId 추가
   ↓
6. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success"],
  "properties": {
    "success": {
      "type": "boolean"
    }
  }
}
```

---

#### 2.1.17 `searchWithFilters` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-3.4, Gap-3.4.1  
**우선순위**: P2 (Medium)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/searchWithFilters`  
**리전**: asia-northeast3  
**리소스**: Memory 2GiB, Timeout 60초  
**CORS**: 인증된 사용자만 허용 (optionalAuth 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "maxLength": 200,
      "description": "텍스트 검색 쿼리"
    },
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "description": "이미지 검색 URL"
    },
    "diversityLevel": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "default": 50,
      "description": "다양성 조절 레벨 (0: 낮음, 100: 높음)"
    },
    "styleReflectionLevel": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "default": 50,
      "description": "스타일 반영률 (0: 낮음, 100: 높음)"
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" },
      "maxItems": 10
    }
  }
}
```

**처리 플로우**:
```
1. 검색 파라미터 검증
   ↓
2. 검색 알고리즘 실행
   - 텍스트 검색: 키워드 매칭
   - 이미지 검색: 벡터 유사도 검색 (향후 Vertex AI Vector Search)
   - 사용자 스타일 기반: DNA 유사도 검색
   ↓
3. 필터 적용
   - diversityLevel: 검색 결과 다양성 조절
   - styleReflectionLevel: 사용자 스타일 반영률 조절
   - keywords: 키워드 필터링
   ↓
4. 결과 정렬 및 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "results"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "results": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["analysisId", "similarityScore", "reason"],
        "properties": {
          "analysisId": { "type": "string" },
          "similarityScore": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "reason": {
            "type": "string",
            "description": "중앙값 기반 추천 근거"
          }
        }
      }
    },
    "total": {
      "type": "integer"
    }
  }
}
```

---

#### 2.1.18 `getRepresentativeStyle` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.3, FR-2.4, Gap-1.3.2  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**트리거**: HTTP GET  
**메서드**: GET  
**URL**: `/getRepresentativeStyle`  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 10초  
**CORS**: 인증된 사용자만 허용 (verifyToken 미들웨어)

**쿼리 파라미터**:
- `userId` (필수): Firebase Auth UID

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 사용자 대표 스타일 조회
   - representativeStyles 컬렉션에서 userId로 조회
   - isCurrent == true인 문서 조회
   ↓
3. 타임라인 조회
   - representativeStyles 컬렉션에서 userId로 전체 조회
   - createdAt DESC 정렬
   ↓
4. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "currentStyle", "timeline"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "currentStyle": {
      "type": "object",
      "properties": {
        "styleId": { "type": "string" },
        "imageUrl": { "type": "string" },
        "metrics": { "type": "object" },
        "description": { "type": "string" }
      }
    },
    "timeline": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "styleId": { "type": "string" },
          "createdAt": { "type": "string", "format": "date-time" },
          "imageUrl": { "type": "string" }
        }
      }
    }
  }
}
```

---

#### 2.1.19 `compareStyles` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.3, FR-2.4, Gap-1.3.2  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/compareStyles`  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 30초  
**CORS**: 인증된 사용자만 허용 (verifyToken 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["currentStyleId", "pastStyleId"],
  "properties": {
    "currentStyleId": {
      "type": "string",
      "description": "현재 대표 스타일 ID"
    },
    "pastStyleId": {
      "type": "string",
      "description": "과거 대표 스타일 ID"
    }
  }
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 두 스타일 문서 조회
   - representativeStyles/{currentStyleId}
   - representativeStyles/{pastStyleId}
   ↓
3. 스타일 비교 분석 알고리즘 실행 (Section 4.16 참조)
   - 메트릭 차이 계산
   - AI 모델로 텍스트 분석 생성
   ↓
4. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "comparison"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "comparison": {
      "type": "object",
      "properties": {
        "metricsDiff": {
          "type": "object",
          "description": "메트릭 차이"
        },
        "textAnalysis": {
          "type": "string",
          "description": "상세 비교/분석 텍스트"
        }
      }
    }
  }
}
```

---

#### 2.1.20 `createStyleFolder` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-2.2, Gap-2.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/createStyleFolder`  
**리전**: asia-northeast3  
**리소스**: Memory 512MiB, Timeout 10초  
**CORS**: 인증된 사용자만 허용 (verifyToken 미들웨어)

**요청 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "폴더 이름"
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "representativeImageId": {
      "type": "string",
      "description": "폴더 대표 이미지 ID (analyses 문서 ID)"
    }
  }
}
```

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. styleFolders 컬렉션에 문서 생성
   - userId: request.auth.uid
   - analysisIds: []
   - createdAt, updatedAt: serverTimestamp()
   ↓
3. userProfiles 문서의 styleFolders 배열에 folderId 추가
   ↓
4. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "folderId"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "folderId": {
      "type": "string",
      "description": "생성된 폴더 문서 ID"
    }
  }
}
```

---

#### 2.1.21 `updateProfileImage` (신규)

**구현 상태**: ❌ 미구현 (Phase 1 예정)  
**구현 일자**: 미정  
**현재 상태**: 설계 완료, 코드 미작성

**SRD 참조**: FR-1.3, Gap-1.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**트리거**: HTTP POST  
**메서드**: POST  
**URL**: `/updateProfileImage`  
**리전**: asia-northeast3  
**리소스**: Memory 1GiB, Timeout 30초  
**CORS**: 인증된 사용자만 허용 (verifyToken 미들웨어)

**요청 본문**: FormData (multipart/form-data)
- `image` (필수): 이미지 파일 (JPEG, PNG, WebP)
- `cropData` (선택): 크롭 데이터 (JSON string)

**처리 플로우**:
```
1. 인증 토큰 검증 (verifyToken 미들웨어)
   ↓
2. 이미지 파일 검증
   - 파일 타입: image/jpeg, image/png, image/webp
   - 파일 크기: 최대 5MB
   ↓
3. 이미지 크롭 및 리사이즈 (cropData가 있으면)
   ↓
4. Firebase Storage에 업로드
   - 경로: profileImages/{userId}/{timestamp}.{ext}
   ↓
5. userProfiles 문서의 profileImage 필드 업데이트
   ↓
6. 결과 반환
```

**응답 스키마 (JSON Schema)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["success", "imageUrl"],
  "properties": {
    "success": {
      "type": "boolean"
    },
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "description": "업로드된 프로필 이미지 URL"
    }
  }
}
```

---

**처리 순서**:
```javascript
// 1. 파일 선택 및 유효성 검사
const handleFileSelect = (file) => {
  // 파일 타입 검사: file.type.startsWith('image/')
  // 파일 크기 검사: file.size <= 10 * 1024 * 1024
  setSelectedFile(file);
};

// 2. 업로드 및 분석 요청
const handleSearch = async () => {
  // 고유 문서 ID 생성
  const docId = `${Date.now()}_${Math.random().toString(36).substr(7)}`;
  
  // 파일명 생성
  const fileName = `${docId}.${fileExtension}`;
  
  // Firebase Storage 업로드
  const storageRef = ref(storage, `users/${userId}/analyses/${timestamp}_${fileName}`);
  await uploadBytes(storageRef, selectedFile);
  
  // Storage 트리거가 자동으로 analyzeImageOnUpload 실행
  // Firestore 리스너가 상태 변경 감지
};
```

**실시간 결과 구독**:
```javascript
useEffect(() => {
  if (!docId) return;
  
  const unsubscribe = onSnapshot(
    doc(db, 'analyses', docId),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        if (data.status === 'completed') {
          setAnalysisResult(data.analysisResult);
          setIsLoading(false);
        } else if (data.status === 'failed') {
          setError(data.error);
          setIsLoading(false);
        }
      }
    }
  );
  
  return () => unsubscribe();
}, [docId]);
```

---

#### 2.2.2 벤치마크 데이터 구독

**파일**: `frontend/src/components/BenchmarkDashboard.js`

**데이터 구독 전략**:
```javascript
// 1. 새 구조 우선 시도 (collectionGroup)
const query = query(
  collectionGroup(db, 'models'),
  orderBy('timestamp', 'desc'),
  limit(50)
);

// 2. 폴백: 기존 구조
const fallbackQuery = query(
  collection(db, 'benchmarkResults'),
  orderBy('timestamp', 'desc'),
  limit(50)
);

// 3. 실시간 구독
const unsubscribe = onSnapshot(
  query,
  (snapshot) => {
    const data = processNewStructureData(snapshot);
    setBenchmarkData(data);
  },
  (error) => {
    // 폴백 쿼리로 전환
    onSnapshot(fallbackQuery, ...);
  }
);
```

---

### 2.3 외부 API 통합 명세

#### 2.3.1 OpenAI API 통합

**SRD 참조**: Section 8.2.1

**사용 위치**:
- `functions/src/index.ts`: `analyzeDesign()` (Gemini API 사용)
- `functions/multiLLMOrchestrator.js`: `analyzeWithOpenAI()`
- `functions/continueCritique.js`: 대화형 응답 생성

**API 키 관리**:
```javascript
// Secret Manager에서 가져오기
async function getOpenAiApiKey() {
  const [version] = await secretManagerClient.accessSecretVersion({
    name: 'projects/dysproto/secrets/openai-api-key/versions/latest'
  });
  return version.payload.data.toString().trim();
}

// 클라이언트 초기화
const openai = new OpenAI({ apiKey: await getOpenAiApiKey() });
```

**Vision API 호출 예제**:
```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: prompt },
      {
        type: "image_url",
        image_url: {
          url: dataUrl, // "data:image/jpeg;base64,..."
          detail: "high"
        }
      }
    ]
  }],
  max_tokens: 1500,
  temperature: 0.3
});
```

**비용 계산**:
```javascript
cost = (inputTokens / 1000) * 0.01 + (outputTokens / 1000) * 0.03;
```

**에러 처리**:
```javascript
try {
  const response = await openai.chat.completions.create(...);
} catch (error) {
  if (error.status === 429) {
    // Rate limit - 재시도 필요
    throw new Error('RATE_LIMIT_EXCEEDED');
  } else if (error.status === 401) {
    // 인증 오류 - API 키 문제
    throw new Error('AUTHENTICATION_FAILED');
  } else {
    throw error;
  }
}
```

---

#### 2.3.2 Anthropic Claude API 통합

**API 키 관리**:
```javascript
const anthropicKey = await getSecret('anthropic-api-key');
const anthropic = new Anthropic({ apiKey: anthropicKey });
```

**Vision API 호출 예제**:
```javascript
// Base64 변환 필요
const imageData = await convertImageToBase64(imageUrl);

const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1500,
  temperature: 0.3,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: imageData.mimeType,
          data: imageData.base64
        }
      },
      { type: "text", text: prompt }
    ]
  }]
});
```

**비용 계산**:
```javascript
cost = (inputTokens / 1000) * 0.003 + (outputTokens / 1000) * 0.015;
```

---

#### 2.3.3 Vertex AI (Gemini) 통합

**인증 방식**:
```javascript
// Service Account Credentials 사용
const credentials = JSON.parse(vertexCredentials);
const vertexai = new VertexAI({
  project: 'dysproto',
  location: 'asia-northeast3',
  googleAuthOptions: { credentials }
});
```

**Vision API 호출 예제**:
```javascript
const model = vertexai.getGenerativeModel({
  model: 'gemini-1.5-pro-vision'
});

const request = {
  contents: [{
    role: 'user',
    parts: [
      { text: prompt },
      {
        inline_data: {
          mime_type: imageData.mimeType,
          data: imageData.base64
        }
      }
    ]
  }],
  generation_config: {
    max_output_tokens: 1500,
    temperature: 0.3
  }
};

const response = await model.generateContent(request);
```

**비용 계산**:
```javascript
cost = (inputTokens / 1000) * 0.00025 + (outputTokens / 1000) * 0.0005;
```

---

## 3. 데이터베이스 스키마 상세

### 3.1 Firestore 컬렉션별 상세 스키마

#### 3.1.1 `analyses` 컬렉션 (실제 구현됨)

**SRD 참조**: Section 7.1.1

**경로**: `analyses/{analysisId}`

**문서 스키마 (실제 구현 기반, functions/src/types.ts)**:
```typescript
interface AnalysisDocument {
  // 필수 필드
  userId: string;                    // Firebase Auth UID 또는 "anonymous"
  fileName: string;                  // 파일명
  imageUrl: string;                  // Storage URL (users/{userId}/analyses/{timestamp}_{fileName})
  timestamp: Timestamp | FieldValue; // 분석 시각
  summary: string;                   // AI 요약
  
  // 메트릭 (5축 + 전체 점수)
  metrics: {
    layout: MetricDetail;            // 레이아웃 메트릭
    typography: MetricDetail;        // 타이포그래피 메트릭
    color: MetricDetail;            // 색상 메트릭
    components: MetricDetail;       // 컴포넌트 메트릭
    formLanguage: MetricDetail;      // 폼 언어 메트릭
    overall: number;                 // 전체 점수 (0-100)
  };
  
  // 추가 데이터
  colors: Color[];                   // 색상 팔레트
  keywords: string[];                // 관련 키워드
  detectedObjects: DetectedObject[]; // 감지된 객체 목록
  suggestions: string;               // 개선 제안
}

interface MetricDetail {
  score: number;                      // 점수 (0-100)
  reason: string;                    // 상세 이유 (한국어)
  benchmark: string;                 // 기준 (한국어)
  keyElements: string[];             // 주요 요소 목록 (한국어)
}

interface Color {
  hex: string;                       // HEX 색상 코드 (#RRGGBB)
  rgb: string;                       // RGB 문자열 형식
}

interface DetectedObject {
  name: string;                      // 객체 이름
  confidence: number;                // 신뢰도 (0-1)
}
```

**필드 검증 규칙**:
- `fileName`: 필수, 문자열, 최대 255자
- `status`: 필수, enum 값만 허용
- `metrics`: 각 값은 0-100 범위 내
- `insights`: 배열 길이 최대 10

**인덱스**:
- `userId` ASC, `createdAt` DESC (향후 사용자별 조회용)
- `status` ASC, `createdAt` DESC (상태별 조회용)
- `userId` ASC, `archivedAt` DESC (사용자별 아카이브 목록 조회, 신규)
- `userId` ASC, `boardIds` ARRAY_CONTAINS, `createdAt` DESC (보드별 분석 조회, 신규)
- `keywords` ARRAY_CONTAINS, `createdAt` DESC (키워드 검색, 신규)

**서브컬렉션**:
- `analyses/{id}/benchmarks/models/{modelKey}/{docId}`: 모델별 벤치마크
- `analyses/{id}/sunburst_cache/current`: Sunburst 캐시

---

#### 3.1.2 `chatSessions` 컬렉션 (실제 구현됨)

**SRD 참조**: Section 7.1.2

**경로**: `chatSessions/{sessionId}`

**문서 스키마 (실제 구현 기반, functions/src/types.ts)**:
```typescript
interface ChatSessionDocument {
  userId: string;                    // Firebase Auth UID 또는 "anonymous"
  analysisId?: string;               // 연결된 분석 ID (선택사항)
  messages: ChatMessage[];          // 대화 메시지 배열
  createdAt: Timestamp | FieldValue; // 생성 시각
  updatedAt: Timestamp | FieldValue; // 마지막 업데이트 시각
}

interface ChatMessage {
  id: string;                        // 메시지 ID
  role: "user" | "model";            // 메시지 역할
  text: string;                      // 메시지 텍스트
  timestamp: number;                 // Unix timestamp (밀리초)
}
```

**인덱스**:
- `userId` ASC, `createdAt` DESC (사용자별 세션 조회)
- `userId` ASC, `updatedAt` DESC (최근 활동 순 조회)

---

#### 3.1.3 `users` 컬렉션 (실제 구현됨)

**경로**: `users/{userId}`

**문서 스키마 (실제 구현 기반, functions/src/types.ts)**:
```typescript
interface UserDocument {
  displayName: string;                 // 표시 이름
  email: string;                       // 이메일 주소
  photoURL?: string;                   // 프로필 사진 URL (선택사항)
  subscription: "free" | "pro" | "premium"; // 구독 플랜
  bio?: string;                        // 자기소개 (선택사항)
  createdAt: Timestamp | FieldValue;   // 생성 시각
  updatedAt: Timestamp | FieldValue;   // 마지막 업데이트 시각
  settings: {                          // 사용자 설정
    notifications: {
      weeklyReport: boolean;          // 주간 리포트 알림
      growthAlerts: boolean;           // 성장 알림
      marketingEmails: boolean;       // 마케팅 이메일
    };
  };
}
```

**인덱스**:
- `email` ASC (이메일로 사용자 조회, 향후 인증 통합 시)

---

#### 3.1.4 `bookmarks` 컬렉션 (실제 구현됨)

**경로**: `bookmarks/{bookmarkId}`

**문서 스키마 (실제 구현 기반, functions/src/types.ts)**:
```typescript
interface BookmarkDocument {
  userId: string;                      // 사용자 ID
  referenceId: string;                 // 참조 ID (검색 결과 ID 등)
  imageUrl: string;                   // 이미지 URL
  title: string;                       // 제목
  category: string;                    // 카테고리
  similarity: number;                  // 유사도 (0-100)
  reason?: string;                     // 북마크 이유 (선택사항)
  createdAt: Timestamp | FieldValue;   // 생성 시각
}
```

**인덱스**:
- `userId` ASC, `createdAt` DESC (사용자별 북마크 조회)
- `userId` ASC, `referenceId` ASC (중복 확인용, 복합 인덱스)

---

#### 3.1.5 `collections` 컬렉션 (실제 구현됨)

**경로**: `collections/{collectionId}`

**문서 스키마 (실제 구현 기반, functions/src/types.ts)**:
```typescript
interface CollectionDocument {
  userId: string;                      // 사용자 ID
  name: string;                        // 컬렉션 이름
  description?: string;                // 설명 (선택사항)
  analysisIds: string[];               // 포함된 분석 ID 배열
  createdAt: Timestamp | FieldValue;   // 생성 시각
  updatedAt: Timestamp | FieldValue;   // 마지막 업데이트 시각
}
```

**인덱스**:
- `userId` ASC, `createdAt` DESC (사용자별 컬렉션 조회)
- `userId` ASC, `updatedAt` DESC (최근 업데이트 순 조회)

---

#### 3.1.6 `feedbacks` 컬렉션 (미구현)

**경로**: `feedbacks/{feedbackId}`

**문서 스키마**:
```typescript
interface FeedbackDocument {
  userId?: string;              // Firebase Auth UID (선택사항, 익명 피드백 허용)
  timestamp: Timestamp;         // 필수
  rating: number;               // 범위: 1-5, 필수
  comment?: string;            // 최대 길이: 1000
  hypothesisType?: "safe" | "innovative" | "alternative";
  tags?: string[];             // 최대 항목 수: 10
  context?: {
    domain?: string;           // 최대 길이: 100
  };
}
```

---

#### 3.1.7 `benchmarks` 컬렉션 (미구현)

**경로**: `benchmarks/models/{modelName}`

**문서 스키마**:
```typescript
interface BenchmarkModel {
  modelName: string;            // 필수: "gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"
  metrics: {
    totalScore: number;         // 범위: 0-100
    accuracy: number;           // 범위: 0-100
    responseTime: number;      // 단위: 밀리초
    cost: number;               // 단위: USD
    efficiency: number;         // 범위: 0-100
  };
  statistics: {
    totalRequests: number;     // 총 요청 수
    successRate: number;        // 범위: 0-100
    avgResponseTime: number;    // 단위: 밀리초
    totalCost: number;          // 단위: USD
  };
  lastUpdated: Timestamp;
}
```

**서브컬렉션**:
- `analyses/{analysisId}/benchmarks/models/{modelKey}/{docId}`: 분석별 모델 벤치마크

---

#### 3.1.8 `sunburst_cache` 컬렉션 (미구현)

**경로**: `analyses/{analysisId}/sunburst_cache/current`

**문서 스키마**:
```typescript
interface SunburstCache {
  structure: {
    name: string;               // "root"
    children: Array<{
      name: string;             // 메트릭 카테고리: "Layout", "Typography", etc.
      key: string;              // "layout", "typography", etc.
      children: Array<{
        name: string;           // 모델명: "gpt-4o", "claude-3-5-sonnet", etc.
        value: number;          // 범위: 0-100
        timestamp: string;     // ISO 8601 형식
      }>;
    }>;
  };
  lastUpdated: Timestamp;
  version: number;              // 버전 번호 (증분)
  modelCount: number;          // 집계된 모델 수
}
```

---

#### 3.1.9 `userGoals` 컬렉션 (미구현)

**SRD 참조**: Section 7.1.3, Gap-2.2.2, Gap-2.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2

**경로**: `userGoals/{goalId}`

**문서 스키마 (TypeScript 인터페이스)**:
```typescript
interface UserGoal {
  // 필수 필드
  userId: string;                    // Firebase Auth UID (필수)
  targetMetric: string;              // "layout" | "typography" | "color" | "components" | "formLanguage" | "overallScore"
  targetValue: number;               // 범위: 0-100
  currentValue: number;               // 범위: 0-100, 현재 값
  progress: number;                  // 범위: 0-100, 진척도 백분율
  deadline: Timestamp;               // 목표 달성 기한
  createdAt: Timestamp;              // 필수
  updatedAt: Timestamp;              // 필수
  
  // 선택 필드
  description?: string;              // 최대 길이: 500
  status?: "active" | "completed" | "expired";  // 상태 (자동 계산)
  completedAt?: Timestamp;           // 달성 완료 시각
}
```

**필드 검증 규칙**:
- `userId`: 필수, 문자열, Firebase Auth UID 형식
- `targetMetric`: 필수, enum 값만 허용
- `targetValue`: 필수, 0-100 범위
- `currentValue`: 필수, 0-100 범위
- `progress`: 자동 계산, `(currentValue / targetValue) * 100`, 최대 100
- `deadline`: 필수, 미래 날짜만 허용

**인덱스**:
- `userId` ASC, `deadline` ASC (사용자별 목표 조회)
- `userId` ASC, `status` ASC, `deadline` ASC (상태별 필터링)
- `userId` ASC, `targetMetric` ASC (메트릭별 조회)

**문서 ID 형식**: `{userId}_{targetMetric}_{timestamp}`

---

#### 3.1.10 `growthReports` 컬렉션 (미구현)

**SRD 참조**: Section 7.1.3, Gap-2.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2

**경로**: `growthReports/{reportId}`

**문서 스키마 (TypeScript 인터페이스)**:
```typescript
interface GrowthReport {
  // 필수 필드
  userId: string;                    // Firebase Auth UID (필수)
  period: "weekly" | "monthly";       // 리포트 기간
  startDate: Timestamp;              // 시작 날짜
  endDate: Timestamp;                // 종료 날짜
  generatedAt: Timestamp;            // 리포트 생성 시각
  createdAt: Timestamp;              // 필수
  
  // 리포트 요약
  summary: {
    totalAnalyses: number;           // 기간 내 총 분석 수
    averageScore: number;             // 평균 전체 점수 (0-100)
    improvementRate: number;          // 개선율 (이전 기간 대비, 백분율)
    topStrengths: string[];          // 상위 3개 강점 (메트릭명)
    topAreasForImprovement: string[]; // 상위 3개 개선 영역 (메트릭명)
  };
  
  // 차트 데이터
  charts: {
    timeline: {                       // 시계열 데이터
      dates: string[];                // 날짜 배열 (ISO 8601)
      scores: number[];               // 각 날짜의 평균 점수
      metrics: {                      // 메트릭별 시계열
        layout: number[];
        typography: number[];
        color: number[];
        components: number[];
        formLanguage: number[];
      };
    };
    metrics: {                        // 메트릭별 집계
      layout: {
        average: number;
        trend: "improving" | "stable" | "declining";
        change: number;               // 이전 기간 대비 변화량
      };
      typography: { /* 동일 구조 */ };
      color: { /* 동일 구조 */ };
      components: { /* 동일 구조 */ };
      formLanguage: { /* 동일 구조 */ };
    };
  };
  
  // 상세 분석
  detailedAnalysis?: {
    analyses: string[];               // 분석 문서 ID 배열
    insights: Array<{
      type: "strength" | "improvement";
      metric: string;
      description: string;
      recommendation: string;
    }>;
  };
}
```

**필드 검증 규칙**:
- `userId`: 필수, 문자열, Firebase Auth UID 형식
- `period`: 필수, enum 값만 허용
- `startDate`, `endDate`: 필수, `endDate > startDate`
- `summary.topStrengths`, `summary.topAreasForImprovement`: 최대 3개 항목

**인덱스**:
- `userId` ASC, `generatedAt` DESC (사용자별 최신 리포트 조회)
- `userId` ASC, `period` ASC, `generatedAt` DESC (기간별 리포트 조회)

**문서 ID 형식**: `{userId}_{period}_{YYYY-MM-DD}`

---

#### 3.1.8 `userProfiles` 컬렉션

**SRD 참조**: Section 7.1.3, Gap-1.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2

**경로**: `userProfiles/{userId}`

**문서 스키마 (TypeScript 인터페이스)**:
```typescript
interface UserProfile {
  // 필수 필드
  userId: string;                    // Firebase Auth UID (문서 ID와 동일)
  createdAt: Timestamp;              // 필수
  updatedAt: Timestamp;              // 필수
  
  // 디자인 DNA 프로파일
  designDNA: {
    averageMetrics: {
      layout: number;                // 범위: 0-100, 가중 평균
      typography: number;            // 범위: 0-100
      color: number;                  // 범위: 0-100
      components: number;             // 범위: 0-100
      formLanguage: number;          // 범위: 0-100
    };
    preferences: {
      colorPalette: string[];       // 선호 색상 팔레트 (최대 10개)
      style: string[];               // 선호 스타일 (예: "minimalist", "bold")
      domains: string[];              // 관심 도메인 (예: "web", "mobile", "print")
    };
    updatedAt: Timestamp;            // DNA 마지막 업데이트 시각
  };
  
  // 시계열 이력 (DNA 변화 추적)
  history?: Array<{
    timestamp: Timestamp;
    metrics: {
      layout: number;
      typography: number;
      color: number;
      components: number;
      formLanguage: number;
    };
    analysisId?: string;             // 해당 분석 문서 ID (선택사항)
  }>;                                // 최대 길이: 100 (오래된 항목 자동 삭제)
  
  // 통계
  statistics?: {
    totalAnalyses: number;           // 총 분석 수
    lastAnalysisAt?: Timestamp;      // 마지막 분석 시각
    averageScore: number;            // 전체 평균 점수
  };
  
  // 설정
  settings?: {
    isPublic: boolean;               // 프로파일 공개 여부 (기본값: false)
    notifications: {
      weeklyReport: boolean;
      goalReminder: boolean;
    };
  };
  
  // 신규 필드 (Section 2.3.1, 2.3.2 참조)
  profileImage?: string;             // 프로필 이미지 URL
  representativeStyleId?: string;    // 현재 대표 스타일 ID
  styleFolders?: string[];           // 소유한 스타일 폴더 ID 배열
}
```

**필드 검증 규칙**:
- `userId`: 필수, 문서 ID와 동일해야 함
- `designDNA.averageMetrics`: 각 값은 0-100 범위
- `designDNA.preferences.colorPalette`: 최대 10개 항목
- `history`: 최대 100개 항목 (오래된 항목 자동 삭제)

**인덱스**:
- `userId` ASC (문서 ID로 직접 조회, 인덱스 불필요하지만 명시)
- `designDNA.updatedAt` DESC (최근 업데이트된 프로파일 조회, 선택사항)

**업데이트 규칙**:
- `designDNA`는 `analyzeImageOnUpload` 완료 시 자동 업데이트
- 가중 평균 계산: 최근 분석에 더 높은 가중치 (0.7) 적용
- `history`는 분석 완료 시마다 추가 (최대 100개 유지)
- `profileImage`: 프로필 이미지 업로드 시 업데이트 (신규)
- `representativeStyleId`: 대표 스타일 선정 시 업데이트 (신규)
- `styleFolders`: 폴더 생성/삭제 시 업데이트 (신규)

---

#### 3.1.9 `boards` 컬렉션 (신규)

**SRD 참조**: Section 7.1.3, Gap-3.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 2월)

**경로**: `boards/{boardId}`

**문서 스키마 (TypeScript 인터페이스)**:
```typescript
interface Board {
  // 필수 필드
  userId: string;                    // Firebase Auth UID
  name: string;                      // 보드 이름 (최대 100자)
  createdAt: Timestamp;              // 필수
  updatedAt: Timestamp;              // 필수
  
  // 선택 필드
  description?: string;              // 보드 설명 (최대 500자)
  category?: string;                 // 카테고리 (최대 50자)
  imageIds: string[];                // 저장된 이미지 ID 배열 (analyses 문서 ID 참조)
  coverImageId?: string;             // 대표 이미지 ID (analyses 문서 ID)
  isPublic: boolean;                 // 공개 여부 (기본값: false)
}
```

**필드 검증 규칙**:
- `userId`: 필수, Firebase Auth UID
- `name`: 필수, 1-100자
- `description`: 선택, 최대 500자
- `category`: 선택, 최대 50자
- `imageIds`: 배열, 최대 1000개 항목
- `isPublic`: 기본값 false

**인덱스**:
- `userId` ASC, `createdAt` DESC (사용자별 보드 목록 조회)
- `userId` ASC, `category` ASC, `createdAt` DESC (카테고리별 보드 조회)
- `isPublic` ASC, `createdAt` DESC (공개 보드 조회)

**관계**:
- `imageIds` → `analyses/{analysisId}` (참조)
- `userId` → `userProfiles/{userId}` (참조)

---

#### 3.1.10 `styleFolders` 컬렉션 (신규)

**SRD 참조**: Section 7.1.3, Gap-2.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**경로**: `styleFolders/{folderId}`

**문서 스키마 (TypeScript 인터페이스)**:
```typescript
interface StyleFolder {
  // 필수 필드
  userId: string;                    // Firebase Auth UID
  name: string;                      // 폴더 이름 (최대 100자)
  analysisIds: string[];             // 포함된 분석 ID 배열
  createdAt: Timestamp;              // 필수
  updatedAt: Timestamp;              // 필수
  
  // 선택 필드
  description?: string;              // 폴더 설명 (최대 500자)
  representativeImageId?: string;     // 폴더 대표 이미지 ID (analyses 문서 ID)
}
```

**필드 검증 규칙**:
- `userId`: 필수, Firebase Auth UID
- `name`: 필수, 1-100자
- `description`: 선택, 최대 500자
- `analysisIds`: 배열, 최대 1000개 항목
- `representativeImageId`: 선택, analyses 문서 ID

**인덱스**:
- `userId` ASC, `createdAt` DESC (사용자별 폴더 목록 조회)
- `userId` ASC, `name` ASC (사용자별 폴더 이름 정렬)

**관계**:
- `analysisIds` → `analyses/{analysisId}` (참조)
- `representativeImageId` → `analyses/{analysisId}` (참조)
- `userId` → `userProfiles/{userId}` (참조)

---

#### 3.1.11 `representativeStyles` 컬렉션 (신규)

**SRD 참조**: Section 7.1.3, Gap-1.3.2  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**경로**: `representativeStyles/{styleId}`

**문서 스키마 (TypeScript 인터페이스)**:
```typescript
interface RepresentativeStyle {
  // 필수 필드
  userId: string;                    // Firebase Auth UID
  analysisId: string;                // 해당 분석 문서 ID
  imageUrl: string;                   // 이미지 URL
  metrics: {
    layout: number;                   // 범위: 0-100
    typography: number;               // 범위: 0-100
    color: number;                     // 범위: 0-100
    components: number;                // 범위: 0-100
    formLanguage: number;              // 범위: 0-100
    overallScore: number;             // 범위: 0-100
  };
  isCurrent: boolean;                 // 현재 대표 스타일 여부
  createdAt: Timestamp;               // 필수
  
  // 선택 필드
  description?: string;                // 스타일 설명 텍스트 (최대 500자)
}
```

**필드 검증 규칙**:
- `userId`: 필수, Firebase Auth UID
- `analysisId`: 필수, analyses 문서 ID
- `imageUrl`: 필수, 유효한 URL
- `metrics`: 필수, 각 값은 0-100 범위
- `isCurrent`: 필수, boolean
- `description`: 선택, 최대 500자

**인덱스**:
- `userId` ASC, `isCurrent` DESC, `createdAt` DESC (현재 대표 스타일 조회)
- `userId` ASC, `createdAt` DESC (타임라인 조회)

**관계**:
- `analysisId` → `analyses/{analysisId}` (참조)
- `userId` → `userProfiles/{userId}` (참조)

**업데이트 규칙**:
- 새로운 대표 스타일 생성 시, 기존 스타일의 `isCurrent`를 false로 변경
- 대표 스타일 선정 알고리즘 실행 (Section 4.17 참조)

---

#### 3.1.12 `archivedAnalyses` 컬렉션 (신규)

**SRD 참조**: Section 7.1.3, Gap-1.3.4  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**경로**: `archivedAnalyses/{archiveId}`

**문서 스키마 (TypeScript 인터페이스)**:
```typescript
interface ArchivedAnalysis {
  // 필수 필드
  userId: string;                    // Firebase Auth UID
  analysisId: string;                // 원본 analyses 문서 ID
  archivedAt: Timestamp;            // 아카이빙 시각
  
  // 선택 필드
  folderId?: string;                  // 속한 폴더 ID (styleFolders 문서 ID)
  tags?: string[];                    // 사용자 태그 (최대 10개)
  notes?: string;                     // 사용자 메모 (최대 500자)
}
```

**필드 검증 규칙**:
- `userId`: 필수, Firebase Auth UID
- `analysisId`: 필수, analyses 문서 ID
- `archivedAt`: 필수, Timestamp
- `folderId`: 선택, styleFolders 문서 ID
- `tags`: 선택, 배열, 최대 10개 항목
- `notes`: 선택, 최대 500자

**인덱스**:
- `userId` ASC, `archivedAt` DESC (사용자별 아카이브 목록 조회)
- `userId` ASC, `folderId` ASC, `archivedAt` DESC (폴더별 아카이브 조회)
- `userId` ASC, `tags` ARRAY_CONTAINS, `archivedAt` DESC (태그별 아카이브 조회)

**관계**:
- `analysisId` → `analyses/{analysisId}` (참조)
- `folderId` → `styleFolders/{folderId}` (참조)
- `userId` → `userProfiles/{userId}` (참조)

**업데이트 규칙**:
- 아카이빙 시 `analyses` 문서의 `archivedAt` 필드도 업데이트
- `folderId`가 있으면 `styleFolders` 문서의 `analysisIds` 배열에 추가

---

**기존 컬렉션 스키마 업데이트**:

#### 3.1.1 `analyses` 컬렉션 확장

**추가 필드**:
```typescript
interface AnalysisDocument {
  // 기존 필드...
  
  // 신규 필드
  userId?: string;                    // Firebase Auth UID (인증 시스템 도입 시 필수)
  archivedAt?: Timestamp;            // 아카이빙 시각
  boardIds?: string[];                // 속한 보드 ID 배열
  keywords?: string[];                // 연관 키워드 (최대 20개)
  colorPalette?: Array<{              // 색상 팔레트
    hex: string;                      // HEX 색상 코드 (#RRGGBB)
    rgb: {                             // RGB 값
      r: number;                       // 0-255
      g: number;                       // 0-255
      b: number;                       // 0-255
    };
    percentage: number;                // 이미지 내 비율 (0-100)
  }>;
  detectedObjects?: Array<{           // 감지된 객체
    name: string;                      // 객체 이름
    confidence: number;                 // 신뢰도 (0-1)
    boundingBox?: {                    // 바운딩 박스 (선택사항)
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  
  // ... 기존 필드
}
```

**인덱스 추가**:
- `userId` ASC, `archivedAt` DESC (사용자별 아카이브 목록 조회)
- `userId` ASC, `boardIds` ARRAY_CONTAINS, `createdAt` DESC (보드별 분석 조회)
- `keywords` ARRAY_CONTAINS, `createdAt` DESC (키워드 검색)

---

**SRD 참조**: Section 7.2

**컬렉션 그룹 인덱스**:
- `entries` (collection group):
  - `modelId` ASC, `timestamp` DESC
  - `metrics.layout.normalized` DESC, `timestamp` DESC

**컬렉션 인덱스**:
- `analyses`:
  - `userId` ASC, `createdAt` DESC
  - `status` ASC, `createdAt` DESC
- `critiqueSessions`:
  - `userId` ASC, `state.current` ASC, `metadata.updatedAt` DESC
  - `metadata.lastActivity` DESC
- `benchmarks`:
  - `modelName` ASC, `metrics.totalScore` DESC
- `metrics_timeseries`:
  - `date` DESC, `modelId` ASC
- `sunburst_cache`:
  - `modelId` ASC, `metadata.version` DESC

**필드 제외 (Indexing Exclusions)**:
- `analysisResult.insights` (배열 필드)
- `conversationHistory` (배열 필드)
- `structure.children` (중첩 배열)

---

## 4. 알고리즘 및 로직 명세

### 4.1 MultiLLM 분석 알고리즘

**SRD 참조**: Section 8.1.1

**파일**: `functions/multiLLMOrchestrator.js`

**병렬 실행 전략**:
```javascript
// Promise.allSettled 사용 - 일부 실패해도 계속 진행
const results = await Promise.allSettled([
  this.analyzeWithOpenAI(imageData, prompt),
  this.analyzeWithClaude(imageData, prompt),
  this.analyzeWithVertexAI(imageData, prompt)
]);

// 결과 처리
const successful = [];
const failed = [];

results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    successful.push({
      model: MODEL_KEYS[index],
      data: result.value
    });
  } else {
    failed.push({
      model: MODEL_KEYS[index],
      error: result.reason
    });
  }
});
```

**결과 통합 알고리즘**:
```javascript
function consolidateResults(results) {
  const consolidated = {
    metrics: {
      layout: average(results.map(r => r.metrics.layout)),
      typography: average(results.map(r => r.metrics.typography)),
      color: average(results.map(r => r.metrics.color)),
      components: average(results.map(r => r.metrics.components)),
      formLanguage: average(results.map(r => r.metrics.formLanguage))
    },
    insights: deduplicateInsights(results.flatMap(r => r.insights)),
    modelComparisons: {}
  };
  
  // 모델별 비교 데이터 생성
  results.forEach(result => {
    consolidated.modelComparisons[result.model] = {
      accuracy: calculateAccuracy(result),
      responseTime: result.performance.responseTime,
      cost: result.performance.cost
    };
  });
  
  return consolidated;
}
```

**인사이트 중복 제거**:
```javascript
function deduplicateInsights(insights) {
  const seen = new Set();
  const unique = [];
  
  for (const insight of insights) {
    const key = `${insight.type}-${insight.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(insight);
    }
  }
  
  // 유사도 기반 추가 필터링 (선택적)
  return unique.slice(0, 10); // 최대 10개
}
```

---

### 4.2 벤치마크 점수 계산

**SRD 참조**: Section 8.1.2

**파일**: `functions/multiLLMOrchestrator.js`

**가중치 설정**:
```javascript
const benchmarkWeights = {
  accuracy: 0.4,      // 정확도 40%
  responseTime: 0.3,  // 응답시간 30%
  cost: 0.3          // 비용 30%
};
```

**정확도 점수 계산**:
```javascript
function calculateAccuracyScore(analysisResult) {
  // 메트릭 완성도 기반
  const metricsProvided = countProvidedMetrics(analysisResult.metrics);
  const totalMetrics = 5; // layout, typography, color, components, formLanguage
  
  // 인사이트 품질 기반
  const insightScore = Math.min(analysisResult.insights.length / 10, 1.0);
  
  // 구조적 일관성 검증
  const structureScore = validateStructure(analysisResult) ? 1.0 : 0.8;
  
  return (metricsProvided / totalMetrics * 0.5 + 
          insightScore * 0.3 + 
          structureScore * 0.2) * 100;
}
```

**응답시간 점수 계산**:
```javascript
function calculateResponseTimeScore(responseTimeMs) {
  // 기준값: 5초 = 100점, 30초 = 50점, 60초 = 0점
  if (responseTimeMs <= 5000) return 100;
  if (responseTimeMs >= 60000) return 0;
  
  // 선형 보간
  const normalized = (60000 - responseTimeMs) / 55000;
  return Math.max(0, Math.min(100, normalized * 100));
}
```

**비용 점수 계산**:
```javascript
function calculateCostScore(costUSD) {
  // 기준값: $0.01 = 100점, $0.10 = 50점, $0.50 = 0점
  if (costUSD <= 0.01) return 100;
  if (costUSD >= 0.50) return 0;
  
  // 선형 보간
  const normalized = (0.50 - costUSD) / 0.49;
  return Math.max(0, Math.min(100, normalized * 100));
}
```

**총 벤치마크 점수**:
```javascript
function calculateBenchmarkScore(accuracy, responseTime, cost) {
  const accuracyScore = calculateAccuracyScore(accuracy);
  const responseTimeScore = calculateResponseTimeScore(responseTime);
  const costScore = calculateCostScore(cost);
  
  return (accuracyScore * benchmarkWeights.accuracy +
          responseTimeScore * benchmarkWeights.responseTime +
          costScore * benchmarkWeights.cost);
}
```

---

### 4.3 메트릭 정규화 알고리즘

**SRD 참조**: Section 8.1.3

**파일**: `functions/metrics/MetricNormalizer.js`

**정규화 타입별 알고리즘**:

**1. 선형 정규화 (Linear)**:
```javascript
normalized = (value - min) / (max - min)
```
- 적용: `layout.columns`, `layout.gutter`, `typography.lineHeight`

**2. 로그 정규화 (Logarithmic)**:
```javascript
normalized = (log(value) - log(min)) / (log(max) - log(min))
```
- 적용: `typography.fontSize` (8px ~ 72px)

**3. WCAG 대비율 정규화**:
```javascript
if (value >= 7) return 1.0;      // AAA
else if (value >= 4.5) return 0.75 + (value - 4.5) * 0.25 / 2.5;  // AA
else if (value >= 3) return 0.5 + (value - 3) * 0.25 / 1.5;       // AA Large
else return value * 0.5 / 3;     // 미달
```
- 적용: `color.contrast`

**4. 비율 정규화 (Ratio)**:
```javascript
normalized = Math.max(0, Math.min(1, value))
```
- 적용: `layout.grid`, `color.harmony`, `color.accessibility`, `components.*`, `formLanguage.*`

**5. 카운트 정규화**:
```javascript
normalized = (value - min) / (max - min)
```
- 적용: `layout.breakpoints`, `color.palette`

**6. 단계 정규화 (Step)**:
```javascript
steps = (max - min) / step
stepValue = Math.round((value - min) / step)
normalized = Math.max(0, Math.min(1, stepValue / steps))
```
- 적용: `typography.fontWeight` (100, 200, ..., 900)

**가중 점수 계산**:
```javascript
// 카테고리별 가중치
const WEIGHTS = {
  layout: 0.25,
  typography: 0.20,
  color: 0.20,
  components: 0.20,
  formLanguage: 0.15
};

// 전체 점수 계산
let weightedSum = 0;
for (const [category, weight] of Object.entries(WEIGHTS)) {
  const categoryAverage = average(normalizedMetrics[category]);
  weightedSum += categoryAverage * weight;
}
const finalScore = (weightedSum / totalWeight) * 100;
```

---

### 4.4 증분 Sunburst 집계 알고리즘

**SRD 참조**: Section 8.1.4

**파일**: `functions/aggregation/IncrementalSunburstAggregator.js`

**디바운스 전략**:
```javascript
// 100ms 디바운스로 빈번한 업데이트 방지
scheduleAggregation(analysisId) {
  if (this.debounceTimer) {
    clearTimeout(this.debounceTimer);
  }
  
  this.debounceTimer = setTimeout(() => {
    this.performIncrementalAggregation(analysisId);
  }, 100); // 100ms
}
```

**트리 구조 업데이트**:
```javascript
function updateStructure(structure, updates) {
  // 각 업데이트에 대해
  for (const update of updates) {
    const { modelId, metrics } = update;
    
    // 메트릭 정규화
    const normalized = MetricNormalizer.normalizeAll(metrics);
    
    // 각 카테고리별로 업데이트
    for (const [category, value] of Object.entries(normalized)) {
      const categoryNode = findOrCreateCategoryNode(structure, category);
      
      // 모델 노드 찾기 또는 생성
      let modelNode = categoryNode.children.find(c => c.name === modelId);
      if (!modelNode) {
        modelNode = {
          name: modelId,
          value: 0,
          timestamp: new Date().toISOString()
        };
        categoryNode.children.push(modelNode);
      }
      
      // 값 업데이트 (평균 계산)
      const existingValue = modelNode.value;
      const count = getModelCount(categoryNode, modelId);
      modelNode.value = (existingValue * (count - 1) + value * 100) / count;
      modelNode.timestamp = new Date().toISOString();
    }
  }
  
  return structure;
}
```

**원자적 업데이트 (트랜잭션)**:
```javascript
await db.runTransaction(async (transaction) => {
  const cacheRef = db.doc(`analyses/${analysisId}/sunburst_cache/current`);
  const cacheDoc = await transaction.get(cacheRef);
  
  const current = cacheDoc.exists ? cacheDoc.data() : initializeStructure();
  
  const updated = updateStructure(current.structure, updates);
  
  transaction.set(cacheRef, {
    structure: updated,
    version: FieldValue.increment(1),
    modelCount: FieldValue.increment(updates.length),
    lastUpdated: FieldValue.serverTimestamp()
  });
});
```

---

### 4.5 상태 머신 전환 로직

**SRD 참조**: Section 8.1.5

**파일**: `functions/conversation/BidirectionalStateMachine.js`

**상태 전환 규칙**:
```javascript
const TRANSITIONS = {
  'initial': {
    next: ['exploring', 'refining'],
    back: []
  },
  'exploring': {
    next: ['refining', 'validating'],
    back: ['initial']
  },
  'refining': {
    next: ['validating', 'implementing'],
    back: ['exploring', 'initial']
  },
  'validating': {
    next: ['implementing', 'completed'],
    back: ['refining', 'exploring']
  },
  'implementing': {
    next: ['completed'],
    back: ['validating', 'refining']
  },
  'completed': {
    next: [],
    back: ['implementing', 'validating']
  }
};
```

**전환 검증**:
```javascript
function validateTransition(currentState, targetState, history) {
  // 유효한 전환인지 확인
  const allowed = TRANSITIONS[currentState]?.next || [];
  const allowedBack = TRANSITIONS[currentState]?.back || [];
  
  if (!allowed.includes(targetState) && !allowedBack.includes(targetState)) {
    throw new Error(`Invalid transition from ${currentState} to ${targetState}`);
  }
  
  // 히스토리 길이 검증
  if (history.length > 100) {
    throw new Error('History length exceeded maximum');
  }
  
  return true;
}
```

**상태 업데이트**:
```javascript
function updateState(currentState, targetState, history, currentIndex) {
  validateTransition(currentState, targetState, history);
  
  // 히스토리 업데이트
  const newHistory = history.slice(0, currentIndex + 1);
  newHistory.push({
    name: targetState,
    enteredAt: Date.now(),
    context: {}
  });
  
  return {
    current: targetState,
    phase: calculatePhase(targetState),
    history: newHistory,
    currentIndex: newHistory.length - 1
  };
}
```

---

### 4.6 성장 리포트 생성 알고리즘

**SRD 참조**: FR-2.2, Gap-2.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2

**파일**: `functions/growthReportGenerator.js`

**메트릭 집계 알고리즘**:
```typescript
async function aggregateMetrics(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<MetricAggregation> {
  const db = getFirestore();
  
  // 분석 데이터 수집
  const analysesSnapshot = await db.collection('analyses')
    .where('userId', '==', userId)
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .where('createdAt', '<=', Timestamp.fromDate(endDate))
    .where('status', '==', 'completed')
    .get();
  
  if (analysesSnapshot.empty) {
    throw new Error('No analyses found for the period');
  }
  
  const analyses = analysesSnapshot.docs.map(doc => doc.data());
  
  // 평균 점수 계산
  const averageScore = analyses.reduce((sum, a) => 
    sum + (a.analysisResult?.overallScore || 0), 0
  ) / analyses.length;
  
  // 메트릭별 평균 계산
  const metricAverages = {
    layout: average(analyses.map(a => a.analysisResult?.metrics?.layout || 0)),
    typography: average(analyses.map(a => a.analysisResult?.metrics?.typography || 0)),
    color: average(analyses.map(a => a.analysisResult?.metrics?.color || 0)),
    components: average(analyses.map(a => a.analysisResult?.metrics?.components || 0)),
    formLanguage: average(analyses.map(a => a.analysisResult?.metrics?.formLanguage || 0))
  };
  
  return {
    totalAnalyses: analyses.length,
    averageScore,
    metricAverages
  };
}
```

**개선율 계산 로직**:
```typescript
async function calculateImprovementRate(
  userId: string,
  currentPeriod: { start: Date; end: Date },
  previousPeriod: { start: Date; end: Date }
): Promise<number> {
  const currentMetrics = await aggregateMetrics(userId, currentPeriod.start, currentPeriod.end);
  const previousMetrics = await aggregateMetrics(userId, previousPeriod.start, previousPeriod.end);
  
  if (previousMetrics.averageScore === 0) {
    return 0; // 이전 데이터 없음
  }
  
  const improvementRate = ((currentMetrics.averageScore - previousMetrics.averageScore) / 
                           previousMetrics.averageScore) * 100;
  
  return Math.round(improvementRate * 100) / 100; // 소수점 2자리
}
```

**강점 및 개선 영역 도출**:
```typescript
function deriveStrengthsAndImprovements(
  metricAverages: Record<string, number>,
  improvementRates: Record<string, number>
): {
  topStrengths: string[];
  topAreasForImprovement: string[];
} {
  // 강점: 평균 점수가 높고 개선율이 양수인 메트릭
  const strengths = Object.entries(metricAverages)
    .filter(([metric, avg]) => avg >= 70 && improvementRates[metric] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([metric]) => metric);
  
  // 개선 영역: 평균 점수가 낮거나 개선율이 음수인 메트릭
  const improvements = Object.entries(metricAverages)
    .filter(([metric, avg]) => avg < 70 || improvementRates[metric] < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([metric]) => metric);
  
  return { topStrengths: strengths, topAreasForImprovement: improvements };
}
```

**리포트 템플릿 생성**:
```typescript
async function generateReportTemplate(
  summary: ReportSummary,
  charts: ChartData
): Promise<GrowthReport> {
  return {
    userId: summary.userId,
    period: summary.period,
    startDate: Timestamp.fromDate(summary.startDate),
    endDate: Timestamp.fromDate(summary.endDate),
    generatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
    summary: {
      totalAnalyses: summary.totalAnalyses,
      averageScore: summary.averageScore,
      improvementRate: summary.improvementRate,
      topStrengths: summary.topStrengths,
      topAreasForImprovement: summary.topAreasForImprovement
    },
    charts: {
      timeline: charts.timeline,
      metrics: charts.metrics
    }
  };
}
```

---

### 4.7 목표 진척도 계산 알고리즘

**SRD 참조**: FR-2.3, Gap-2.2.2, Gap-2.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2

**파일**: `functions/goalProgressCalculator.js`

**현재 값 vs 목표 값 비교**:
```typescript
async function getCurrentMetricValue(
  userId: string,
  targetMetric: string
): Promise<number> {
  const db = getFirestore();
  const profileRef = db.doc(`userProfiles/${userId}`);
  const profile = await profileRef.get();
  
  if (!profile.exists) {
    // 프로파일이 없으면 최근 분석 결과의 평균값 사용
    const recentAnalyses = await db.collection('analyses')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    if (recentAnalyses.empty) {
      return 0;
    }
    
    const metrics = recentAnalyses.docs.map(doc => 
      doc.data().analysisResult?.metrics?.[targetMetric] || 0
    );
    
    return average(metrics);
  }
  
  const profileData = profile.data();
  
  if (targetMetric === 'overallScore') {
    return profileData.statistics?.averageScore || 0;
  }
  
  return profileData.designDNA?.averageMetrics?.[targetMetric] || 0;
}
```

**진척도 백분율 계산**:
```typescript
function calculateProgress(
  currentValue: number,
  targetValue: number
): number {
  if (targetValue === 0) {
    return 0;
  }
  
  const progress = (currentValue / targetValue) * 100;
  
  // 최대 100%로 제한
  return Math.min(100, Math.max(0, Math.round(progress * 100) / 100));
}
```

**목표 달성 예측**:
```typescript
function predictGoalAchievement(
  currentValue: number,
  targetValue: number,
  deadline: Date,
  historicalImprovementRate: number
): {
  predictedAchievementDate: Date | null;
  confidence: number;
  recommendation: string;
} {
  const daysRemaining = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const valueGap = targetValue - currentValue;
  
  if (valueGap <= 0) {
    return {
      predictedAchievementDate: null,
      confidence: 100,
      recommendation: '목표를 이미 달성했습니다!'
    };
  }
  
  if (historicalImprovementRate <= 0) {
    return {
      predictedAchievementDate: null,
      confidence: 0,
      recommendation: '현재 추세로는 목표 달성이 어려울 수 있습니다. 더 많은 분석을 진행해보세요.'
    };
  }
  
  // 예상 일일 개선량 계산
  const dailyImprovement = (currentValue * historicalImprovementRate / 100) / 30;
  const daysNeeded = Math.ceil(valueGap / dailyImprovement);
  
  const predictedDate = new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000);
  
  let confidence = 50;
  if (daysNeeded <= daysRemaining) {
    confidence = Math.min(100, 50 + (daysRemaining - daysNeeded) * 2);
  } else {
    confidence = Math.max(0, 50 - (daysNeeded - daysRemaining) * 2);
  }
  
  let recommendation = '';
  if (daysNeeded <= daysRemaining) {
    recommendation = `현재 추세로는 ${predictedDate.toLocaleDateString()}경 목표를 달성할 수 있을 것으로 예상됩니다.`;
  } else {
    recommendation = `목표 달성을 위해서는 더 빠른 개선이 필요합니다. 주간 분석 횟수를 늘려보세요.`;
  }
  
  return {
    predictedAchievementDate: predictedDate,
    confidence,
    recommendation
  };
}
```

---

### 4.8 사용자 DNA 프로파일 업데이트 알고리즘

**SRD 참조**: Gap-1.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2

**파일**: `functions/userProfileUpdater.js`

**가중 평균 계산 로직**:
```typescript
function calculateWeightedAverage(
  currentAverage: number,
  newValue: number,
  weights: { recentWeight: number; historicalWeight: number }
): number {
  // 가중 평균: recentWeight * newValue + historicalWeight * currentAverage
  return (weights.recentWeight * newValue) + (weights.historicalWeight * currentAverage);
}
```

**DNA 프로파일 업데이트**:
```typescript
async function updateUserDNA(
  userId: string,
  newAnalysis: AnalysisDocument
): Promise<void> {
  const db = getFirestore();
  const profileRef = db.doc(`userProfiles/${userId}`);
  
  await db.runTransaction(async (transaction) => {
    const profileDoc = await transaction.get(profileRef);
    
    const currentDNA = profileDoc.exists 
      ? profileDoc.data()!.designDNA 
      : initializeDNA();
    
    const newMetrics = newAnalysis.analysisResult!.metrics;
    
    // 가중 평균 계산 (최근 분석에 더 높은 가중치)
    const updatedMetrics = {
      layout: calculateWeightedAverage(
        currentDNA.averageMetrics.layout,
        newMetrics.layout,
        { recentWeight: 0.7, historicalWeight: 0.3 }
      ),
      typography: calculateWeightedAverage(
        currentDNA.averageMetrics.typography,
        newMetrics.typography,
        { recentWeight: 0.7, historicalWeight: 0.3 }
      ),
      color: calculateWeightedAverage(
        currentDNA.averageMetrics.color,
        newMetrics.color,
        { recentWeight: 0.7, historicalWeight: 0.3 }
      ),
      components: calculateWeightedAverage(
        currentDNA.averageMetrics.components,
        newMetrics.components,
        { recentWeight: 0.7, historicalWeight: 0.3 }
      ),
      formLanguage: calculateWeightedAverage(
        currentDNA.averageMetrics.formLanguage,
        newMetrics.formLanguage,
        { recentWeight: 0.7, historicalWeight: 0.3 }
      )
    };
    
    // Preferences 업데이트
    const updatedPreferences = updatePreferences(
      currentDNA.preferences,
      newAnalysis.analysisResult!
    );
    
    // History 업데이트 (최대 100개 유지)
    const history = profileDoc.exists 
      ? (profileDoc.data()!.history || [])
      : [];
    
    history.push({
      timestamp: FieldValue.serverTimestamp(),
      metrics: newMetrics,
      analysisId: newAnalysis.id
    });
    
    // 오래된 항목 제거 (최대 100개 유지)
    const trimmedHistory = history.slice(-100);
    
    // 통계 업데이트
    const statistics = profileDoc.exists
      ? profileDoc.data()!.statistics || { totalAnalyses: 0, averageScore: 0 }
      : { totalAnalyses: 0, averageScore: 0 };
    
    const newTotalAnalyses = statistics.totalAnalyses + 1;
    const newAverageScore = calculateAverageScore(
      statistics.averageScore,
      statistics.totalAnalyses,
      newAnalysis.analysisResult!.overallScore
    );
    
    // 프로파일 업데이트
    transaction.set(profileRef, {
      userId,
      designDNA: {
        averageMetrics: updatedMetrics,
        preferences: updatedPreferences,
        updatedAt: FieldValue.serverTimestamp()
      },
      history: trimmedHistory,
      statistics: {
        totalAnalyses: newTotalAnalyses,
        lastAnalysisAt: FieldValue.serverTimestamp(),
        averageScore: newAverageScore
      },
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });
}
```

**Preferences 업데이트 로직**:
```typescript
function updatePreferences(
  currentPreferences: {
    colorPalette: string[];
    style: string[];
    domains: string[];
  },
  analysisResult: AnalysisResult
): {
  colorPalette: string[];
  style: string[];
  domains: string[];
} {
  // 색상 팔레트 추출 (향후 구현)
  const newColors = extractColorPalette(analysisResult);
  
  // 선호 색상 업데이트 (최대 10개 유지)
  const updatedColorPalette = [
    ...new Set([...currentPreferences.colorPalette, ...newColors])
  ].slice(0, 10);
  
  // 스타일 추출 (인사이트에서 추출)
  const newStyles = extractStyles(analysisResult.insights);
  const updatedStyle = [
    ...new Set([...currentPreferences.style, ...newStyles])
  ].slice(0, 10);
  
  // 도메인은 사용자 입력 또는 분석 결과에서 추출 (향후 구현)
  const updatedDomains = currentPreferences.domains; // 현재는 유지
  
  return {
    colorPalette: updatedColorPalette,
    style: updatedStyle,
    domains: updatedDomains
  };
}
```

**트리거 설정**:
```typescript
// functions/src/index.ts
export const analyzeImageOnUpload = onObjectFinalized(
  { region: 'asia-northeast3' },
  async (event) => {
    // ... 기존 분석 로직 ...
    
    // 분석 완료 후 DNA 프로파일 업데이트
    if (analysisResult.status === 'completed') {
      await updateUserDNA(analysisResult.userId, analysisResult);
    }
  }
);
```

**배치 업데이트 전략** (성능 최적화):
```typescript
// Cloud Functions에서 배치로 처리하여 성능 최적화
const BATCH_SIZE = 10;
const UPDATE_DEBOUNCE_MS = 5000; // 5초 내 여러 분석이 완료되면 한 번에 업데이트

const pendingUpdates = new Map<string, NodeJS.Timeout>();

function scheduleDNAUpdate(userId: string, analysis: AnalysisDocument) {
  if (pendingUpdates.has(userId)) {
    clearTimeout(pendingUpdates.get(userId)!);
  }
  
  const timeout = setTimeout(async () => {
    await updateUserDNA(userId, analysis);
    pendingUpdates.delete(userId);
  }, UPDATE_DEBOUNCE_MS);
  
  pendingUpdates.set(userId, timeout);
}
```

---

### 4.9 가독성 평가 알고리즘

**SRD 참조**: FR-1.4, Gap-1.4.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2

**파일**: `functions/readabilityEvaluator.js`

**OCR을 통한 텍스트 추출**:
```typescript
import { vision } from '@google-cloud/vision';

async function extractTextElements(imageBuffer: Buffer): Promise<TextElement[]> {
  const client = new vision.ImageAnnotatorClient();
  
  const [result] = await client.textDetection({
    image: { content: imageBuffer }
  });
  
  const detections = result.textAnnotations || [];
  
  return detections.map(detection => ({
    text: detection.description || '',
    boundingBox: detection.boundingPoly?.vertices || [],
    fontSize: estimateFontSize(detection.boundingPoly),
    confidence: detection.confidence || 0
  }));
}
```

**폰트 크기 및 대비 분석**:
```typescript
function analyzeTypography(textElements: TextElement[], imageData: ImageData): TypographyMetrics {
  const fontSizes = textElements.map(e => e.fontSize);
  const avgFontSize = average(fontSizes);
  const minFontSize = Math.min(...fontSizes);
  
  // 대비 분석 (텍스트 영역의 색상 대비)
  const contrastRatios = textElements.map(element => {
    const textColor = extractTextColor(imageData, element.boundingBox);
    const bgColor = extractBackgroundColor(imageData, element.boundingBox);
    return calculateContrastRatio(textColor, bgColor);
  });
  
  const avgContrast = average(contrastRatios);
  const minContrast = Math.min(...contrastRatios);
  
  return {
    averageFontSize: avgFontSize,
    minimumFontSize: minFontSize,
    averageContrast: avgContrast,
    minimumContrast: minContrast
  };
}
```

**가독성 점수 계산**:
```typescript
function calculateReadabilityScore(metrics: TypographyMetrics): number {
  // 폰트 크기 점수 (최소 12px 이상 권장)
  const fontSizeScore = Math.min(100, (metrics.minimumFontSize / 12) * 100);
  
  // 대비 점수 (WCAG AA 기준: 4.5:1 이상)
  const contrastScore = Math.min(100, (metrics.minimumContrast / 4.5) * 100);
  
  // 가독성 점수 = 폰트 크기 점수 * 0.4 + 대비 점수 * 0.6
  const readabilityScore = fontSizeScore * 0.4 + contrastScore * 0.6;
  
  return Math.round(readabilityScore * 100) / 100;
}
```

**개선 권장사항 생성**:
```typescript
function generateReadabilityRecommendations(
  score: number,
  metrics: TypographyMetrics
): string[] {
  const recommendations: string[] = [];
  
  if (metrics.minimumFontSize < 12) {
    recommendations.push(`최소 폰트 크기를 12px 이상으로 늘려주세요. (현재: ${metrics.minimumFontSize}px)`);
  }
  
  if (metrics.minimumContrast < 4.5) {
    recommendations.push(`텍스트와 배경의 대비를 높여주세요. WCAG AA 기준(4.5:1) 이상을 권장합니다. (현재: ${metrics.minimumContrast.toFixed(2)}:1)`);
  }
  
  if (score < 70) {
    recommendations.push('전반적인 가독성을 개선하기 위해 폰트 크기와 색상 대비를 조정해보세요.');
  }
  
  return recommendations;
}
```

---

### 4.10 시선유도 분석 알고리즘 (향후 구현)

**SRD 참조**: FR-1.4, Gap-1.4.2  
**우선순위**: P2 (Medium)  
**구현 예정**: Phase 3

**파일**: `functions/eyeTrackingSimulator.js` (향후)

**Attention Map 생성 방법**:
```typescript
// 방법 1: AI 모델 기반 (Vision Transformer 사용)
async function generateAttentionMap(imageBuffer: Buffer): Promise<AttentionMap> {
  // Vision Transformer 모델을 사용하여 Attention Map 생성
  // 또는 Google Cloud Vision API의 Object Detection 활용
  // 향후 구현 예정
}

// 방법 2: Eye-tracking 시뮬레이션 (규칙 기반)
function simulateEyeTracking(imageData: ImageData): EyeTrackingPath {
  // 시각적 계층 구조 분석
  // 밝기, 대비, 색상 포화도 기반 포인트 식별
  // 향후 구현 예정
}
```

**시각적 흐름 분석 알고리즘**:
```typescript
function analyzeVisualFlow(attentionMap: AttentionMap): VisualFlow {
  // Z-pattern 또는 F-pattern 분석
  // 주요 포인트 식별
  // 시선 경로 시각화
  // 향후 구현 예정
}
```

**구현 예정 시기**: Phase 3 (2026년 상반기)

---

### 4.11 피드백 원리 적용 알고리즘

**SRD 참조**: FR-1.4, Gap-1.4.3  
**우선순위**: P2 (Medium)  
**구현 예정**: Phase 2

**파일**: `functions/designPrinciplesEvaluator.js`

**디자인 원칙 체크리스트**:
```typescript
interface DesignPrinciple {
  id: string;
  name: string;
  description: string;
  checkFunction: (analysis: AnalysisResult) => boolean;
  weight: number; // 중요도 (0-1)
}

const DESIGN_PRINCIPLES: DesignPrinciple[] = [
  {
    id: 'balance',
    name: '균형',
    description: '요소들이 시각적으로 균형을 이루는가?',
    checkFunction: (analysis) => analysis.metrics.layout > 60,
    weight: 0.2
  },
  {
    id: 'contrast',
    name: '대비',
    description: '요소 간 충분한 대비가 있는가?',
    checkFunction: (analysis) => analysis.metrics.color > 70,
    weight: 0.15
  },
  {
    id: 'hierarchy',
    name: '계층 구조',
    description: '정보의 중요도가 시각적으로 명확한가?',
    checkFunction: (analysis) => analysis.metrics.typography > 65 && analysis.metrics.layout > 65,
    weight: 0.2
  },
  {
    id: 'alignment',
    name: '정렬',
    description: '요소들이 일관되게 정렬되어 있는가?',
    checkFunction: (analysis) => analysis.metrics.layout > 70,
    weight: 0.15
  },
  {
    id: 'proximity',
    name: '근접성',
    description: '관련 요소들이 가까이 배치되어 있는가?',
    checkFunction: (analysis) => analysis.metrics.layout > 65,
    weight: 0.15
  },
  {
    id: 'repetition',
    name: '반복',
    description: '일관된 스타일이 반복되는가?',
    checkFunction: (analysis) => analysis.metrics.components > 70 && analysis.metrics.formLanguage > 70,
    weight: 0.15
  }
];
```

**원칙 준수도 평가 알고리즘**:
```typescript
function evaluatePrincipleCompliance(
  analysis: AnalysisResult
): PrincipleComplianceResult {
  const compliance: Record<string, boolean> = {};
  const scores: Record<string, number> = {};
  
  for (const principle of DESIGN_PRINCIPLES) {
    const isCompliant = principle.checkFunction(analysis);
    compliance[principle.id] = isCompliant;
    scores[principle.id] = isCompliant ? 100 : 0;
  }
  
  // 가중 평균 점수 계산
  const overallScore = DESIGN_PRINCIPLES.reduce((sum, p) => 
    sum + (scores[p.id] * p.weight), 0
  );
  
  return {
    compliance,
    scores,
    overallScore: Math.round(overallScore * 100) / 100
  };
}
```

**위반 항목 식별 및 개선 권장사항 생성**:
```typescript
function generatePrincipleRecommendations(
  compliance: PrincipleComplianceResult
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  for (const principle of DESIGN_PRINCIPLES) {
    if (!compliance.compliance[principle.id]) {
      recommendations.push({
        principle: principle.name,
        issue: `${principle.name} 원칙이 충분히 적용되지 않았습니다.`,
        recommendation: principle.description,
        priority: principle.weight >= 0.2 ? 'high' : 'medium'
      });
    }
  }
  
  // 우선순위별 정렬
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
```

---

### 4.12 추천 알고리즘 기본 설계

**SRD 참조**: FR-3.2, Gap-3.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 3

**파일**: `functions/recommendationEngine.js` (향후)

**DNA 유사도 계산 방법**:
```typescript
function calculateDNASimilarity(
  userDNA: DesignDNA,
  referenceDNA: DesignDNA
): number {
  // 각 메트릭별 유사도 계산 (코사인 유사도 또는 유클리드 거리)
  const metricSimilarities = {
    layout: cosineSimilarity(
      [userDNA.averageMetrics.layout],
      [referenceDNA.averageMetrics.layout]
    ),
    typography: cosineSimilarity(
      [userDNA.averageMetrics.typography],
      [referenceDNA.averageMetrics.typography]
    ),
    color: cosineSimilarity(
      [userDNA.averageMetrics.color],
      [referenceDNA.averageMetrics.color]
    ),
    components: cosineSimilarity(
      [userDNA.averageMetrics.components],
      [referenceDNA.averageMetrics.components]
    ),
    formLanguage: cosineSimilarity(
      [userDNA.averageMetrics.formLanguage],
      [referenceDNA.averageMetrics.formLanguage]
    )
  };
  
  // 가중 평균으로 전체 유사도 계산
  const weights = { layout: 0.2, typography: 0.2, color: 0.2, components: 0.2, formLanguage: 0.2 };
  const overallSimilarity = Object.entries(metricSimilarities).reduce(
    (sum, [metric, similarity]) => sum + (similarity * weights[metric as keyof typeof weights]),
    0
  );
  
  return Math.round(overallSimilarity * 100) / 100;
}
```

**추천 점수 계산 알고리즘 기본 틀**:
```typescript
function calculateRecommendationScore(
  similarity: number,
  popularity: number,
  recency: number
): number {
  // 유사도: 60%, 인기도: 25%, 최신성: 15%
  const score = (similarity * 0.6) + (popularity * 0.25) + (recency * 0.15);
  return Math.round(score * 100) / 100;
}
```

**유사도 임계값 설정**:
- 최소 유사도: 0.7 (70% 이상)
- 추천 개수: 상위 10개
- 다양성 고려: 동일 도메인 최대 3개

**구현 예정 시기**: Phase 3 (2026년 4월)

---

#### 4.13 색상 팔레트 추출 알고리즘 (신규)

**SRD 참조**: FR-1.3, Gap-1.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**파일**: `functions/colorPaletteExtractor.js` (신규)

**입력 데이터 구조**:
```typescript
interface ColorExtractionInput {
  imageUrl: string;                  // 이미지 URL 또는 base64 데이터
  maxColors: number;                 // 추출할 최대 색상 수 (기본값: 10)
}
```

**출력 데이터 구조**:
```typescript
interface ColorPalette {
  colors: Array<{
    hex: string;                      // HEX 색상 코드 (#RRGGBB)
    rgb: { r: number; g: number; b: number };
    percentage: number;               // 이미지 내 비율 (0-100)
  }>;
}
```

**알고리즘 로직**:

**방법 1: K-means 클러스터링** (권장):
```typescript
async function extractColorPaletteKMeans(
  imageBuffer: Buffer,
  maxColors: number = 10
): Promise<ColorPalette> {
  // 1. 이미지 픽셀 데이터 추출
  const pixels = extractPixels(imageBuffer);
  
  // 2. K-means 클러스터링 실행
  const clusters = kmeans(pixels, maxColors, {
    maxIterations: 100,
    tolerance: 0.01
  });
  
  // 3. 각 클러스터의 중심 색상 및 비율 계산
  const colors = clusters.map(cluster => ({
    hex: rgbToHex(cluster.centroid),
    rgb: cluster.centroid,
    percentage: (cluster.points.length / pixels.length) * 100
  }));
  
  // 4. 비율 기준 내림차순 정렬
  return { colors: colors.sort((a, b) => b.percentage - a.percentage) };
}
```

**방법 2: AI 모델 프롬프트** (대안):
```typescript
async function extractColorPaletteAI(
  imageDataUrl: string
): Promise<ColorPalette> {
  const prompt = `
    Analyze this image and extract the dominant color palette.
    Return a JSON array with up to 10 colors, each containing:
    - hex: HEX color code (#RRGGBB)
    - rgb: { r, g, b } values (0-255)
    - percentage: approximate percentage of the image (0-100)
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageDataUrl } }
      ]
    }],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

**성능 고려사항**:
- K-means: 빠르지만 정확도 낮음 (약 100ms)
- AI 모델: 느리지만 정확도 높음 (약 2-3초)
- 하이브리드: K-means로 빠른 추출 후 AI로 보정

---

#### 4.14 연관 키워드 추출 알고리즘 (신규)

**SRD 참조**: FR-1.3, Gap-1.3.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**파일**: `functions/keywordExtractor.js` (신규)

**입력 데이터 구조**:
```typescript
interface KeywordExtractionInput {
  analysisId: string;                // 분석 문서 ID
  analysisResult: AnalysisResult;    // 분석 결과 데이터
}
```

**출력 데이터 구조**:
```typescript
interface KeywordExtractionOutput {
  keywords: string[];                 // 추출된 키워드 배열 (최대 20개)
}
```

**알고리즘 로직**:
```typescript
async function extractKeywords(
  analysisResult: AnalysisResult
): Promise<string[]> {
  // 1. 분석 결과에서 텍스트 추출
  const textSources = [
    ...analysisResult.strengths,
    ...analysisResult.improvements,
    ...analysisResult.insights.map(i => `${i.title} ${i.description}`)
  ].join(' ');
  
  // 2. AI 모델로 키워드 추출
  const prompt = `
    Extract key design-related keywords from the following analysis.
    Return a JSON array of up to 20 keywords.
    Focus on: style, technique, element, principle, trend.
    
    Analysis: ${textSources}
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  
  const result = JSON.parse(response.choices[0].message.content);
  
  // 3. 키워드 정규화 및 중복 제거
  const keywords = result.keywords
    .map((k: string) => k.toLowerCase().trim())
    .filter((k: string, i: number, arr: string[]) => arr.indexOf(k) === i);
  
  return keywords.slice(0, 20);
}
```

**키워드 카테고리**:
- 스타일: "minimalist", "bold", "vintage", "modern"
- 기술: "grid", "typography", "color-harmony"
- 원칙: "balance", "contrast", "hierarchy"
- 트렌드: "glassmorphism", "neomorphism"

---

#### 4.15 객체 감지 알고리즘 (신규)

**SRD 참조**: FR-1.3, Gap-1.3.2  
**우선순위**: P2 (Medium)  
**구현 예정**: Phase 2 (2026년 2월)

**파일**: `functions/objectDetector.js` (신규)

**입력 데이터 구조**:
```typescript
interface ObjectDetectionInput {
  imageUrl: string;                   // 이미지 URL
}
```

**출력 데이터 구조**:
```typescript
interface ObjectDetectionOutput {
  objects: Array<{
    name: string;                     // 객체 이름
    confidence: number;               // 신뢰도 (0-1)
    boundingBox?: {                   // 바운딩 박스 (선택사항)
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}
```

**알고리즘 로직**:

**방법 1: Google Cloud Vision API** (권장):
```typescript
import { ImageAnnotatorClient } from '@google-cloud/vision';

async function detectObjectsVisionAPI(
  imageUrl: string
): Promise<ObjectDetectionOutput> {
  const client = new ImageAnnotatorClient();
  
  // 이미지 다운로드
  const imageBuffer = await downloadImage(imageUrl);
  
  // 객체 감지 요청
  const [result] = await client.objectLocalization({
    image: { content: imageBuffer }
  });
  
  const objects = result.localizedObjectAnnotations.map(obj => ({
    name: obj.name,
    confidence: obj.score || 0,
    boundingBox: obj.boundingPoly?.normalizedVertices ? {
      x: obj.boundingPoly.normalizedVertices[0].x,
      y: obj.boundingPoly.normalizedVertices[0].y,
      width: obj.boundingPoly.normalizedVertices[2].x - obj.boundingPoly.normalizedVertices[0].x,
      height: obj.boundingPoly.normalizedVertices[2].y - obj.boundingPoly.normalizedVertices[0].y
    } : undefined
  }));
  
  return { objects };
}
```

**방법 2: AI 모델 프롬프트** (대안):
```typescript
async function detectObjectsAI(
  imageDataUrl: string
): Promise<ObjectDetectionOutput> {
  const prompt = `
    Analyze this design image and identify all UI/design elements.
    Return a JSON array with objects containing:
    - name: element name (e.g., "button", "card", "navigation")
    - confidence: confidence score (0-1)
    - boundingBox: { x, y, width, height } if applicable
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageDataUrl } }
      ]
    }],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

**성능 고려사항**:
- Vision API: 빠르고 정확 (약 500ms)
- AI 모델: 느리지만 컨텍스트 이해 가능 (약 3-5초)
- 하이브리드: Vision API로 빠른 감지 후 AI로 보정

---

#### 4.16 스타일 비교 분석 알고리즘 (신규)

**SRD 참조**: FR-1.3, FR-2.4, Gap-1.3.2  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**파일**: `functions/styleComparator.js` (신규)

**입력 데이터 구조**:
```typescript
interface StyleComparisonInput {
  currentStyle: RepresentativeStyle;
  pastStyle: RepresentativeStyle;
}
```

**출력 데이터 구조**:
```typescript
interface StyleComparisonOutput {
  metricsDiff: {
    layout: number;                   // 차이값 (현재 - 과거)
    typography: number;
    color: number;
    components: number;
    formLanguage: number;
    overallScore: number;
  };
  textAnalysis: string;               // 상세 비교/분석 텍스트
}
```

**알고리즘 로직**:
```typescript
async function compareStyles(
  current: RepresentativeStyle,
  past: RepresentativeStyle
): Promise<StyleComparisonOutput> {
  // 1. 메트릭 차이 계산
  const metricsDiff = {
    layout: current.metrics.layout - past.metrics.layout,
    typography: current.metrics.typography - past.metrics.typography,
    color: current.metrics.color - past.metrics.color,
    components: current.metrics.components - past.metrics.components,
    formLanguage: current.metrics.formLanguage - past.metrics.formLanguage,
    overallScore: current.metrics.overallScore - past.metrics.overallScore
  };
  
  // 2. AI 모델로 텍스트 분석 생성
  const prompt = `
    Compare these two design styles and provide a detailed analysis.
    Current Style Metrics: ${JSON.stringify(current.metrics)}
    Past Style Metrics: ${JSON.stringify(past.metrics)}
    Differences: ${JSON.stringify(metricsDiff)}
    
    Provide insights on:
    - What has improved
    - What has changed
    - Overall evolution trend
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500
  });
  
  return {
    metricsDiff,
    textAnalysis: response.choices[0].message.content
  };
}
```

**개선 방향 분석**:
- 양수 차이: 개선된 영역
- 음수 차이: 후퇴한 영역
- 0 근처: 유지된 영역

---

#### 4.17 대표 스타일 선정 알고리즘 (신규)

**SRD 참조**: FR-1.3, FR-2.4, Gap-1.3.2  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 1월)

**파일**: `functions/representativeStyleSelector.js` (신규)

**입력 데이터 구조**:
```typescript
interface RepresentativeStyleSelectionInput {
  userId: string;                    // 사용자 ID
  recentAnalyses: AnalysisDocument[]; // 최근 분석 결과 배열
}
```

**출력 데이터 구조**:
```typescript
interface RepresentativeStyleSelectionOutput {
  selectedAnalysisId: string;        // 선정된 분석 문서 ID
  reason: string;                    // 선정 이유
}
```

**알고리즘 로직**:
```typescript
async function selectRepresentativeStyle(
  userId: string,
  recentAnalyses: AnalysisDocument[]
): Promise<RepresentativeStyleSelectionOutput> {
  // 1. 최근 30일 분석 결과 필터링
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recent = recentAnalyses.filter(a => 
    a.completedAt && a.completedAt.toDate() >= thirtyDaysAgo
  );
  
  if (recent.length === 0) {
    // 최근 분석이 없으면 전체 평균에 가장 가까운 분석 선택
    const userProfile = await getUserProfile(userId);
    const avgMetrics = userProfile.designDNA.averageMetrics;
    
    const closest = recentAnalyses.reduce((closest, current) => {
      const closestDiff = calculateMetricDistance(closest.analysisResult.metrics, avgMetrics);
      const currentDiff = calculateMetricDistance(current.analysisResult.metrics, avgMetrics);
      return currentDiff < closestDiff ? current : closest;
    });
    
    return {
      selectedAnalysisId: closest.id,
      reason: "가장 평균적인 스타일을 나타냄"
    };
  }
  
  // 2. 최근 분석 중 가장 높은 점수 선택
  const highestScore = recent.reduce((highest, current) => {
    const currentScore = current.analysisResult?.overallScore || 0;
    const highestScore = highest.analysisResult?.overallScore || 0;
    return currentScore > highestScore ? current : highest;
  });
  
  return {
    selectedAnalysisId: highestScore.id,
    reason: "최근 30일 내 최고 점수 분석"
  };
}

function calculateMetricDistance(
  metrics1: Metrics,
  metrics2: Metrics
): number {
  const diff = {
    layout: Math.abs(metrics1.layout - metrics2.layout),
    typography: Math.abs(metrics1.typography - metrics2.typography),
    color: Math.abs(metrics1.color - metrics2.color),
    components: Math.abs(metrics1.components - metrics2.components),
    formLanguage: Math.abs(metrics1.formLanguage - metrics2.formLanguage)
  };
  
  // 유클리드 거리 계산
  return Math.sqrt(
    diff.layout ** 2 +
    diff.typography ** 2 +
    diff.color ** 2 +
    diff.components ** 2 +
    diff.formLanguage ** 2
  );
}
```

**선정 기준**:
1. 최근 30일 내 분석 우선
2. 전체 점수(overallScore)가 가장 높은 분석
3. 사용자 DNA 프로파일과 가장 유사한 분석

---

#### 4.18 보드 기반 카테고리 분류 알고리즘 (신규)

**SRD 참조**: FR-3.2, Gap-3.2.1  
**우선순위**: P1 (High)  
**구현 예정**: Phase 2 (2026년 2월)

**파일**: `functions/boardCategorizer.js` (신규)

**입력 데이터 구조**:
```typescript
interface BoardCategorizationInput {
  boardId: string;                    // 보드 ID
  imageIds: string[];                 // 보드에 포함된 이미지 ID 배열
}
```

**출력 데이터 구조**:
```typescript
interface BoardCategorizationOutput {
  category: string;                   // 추천 카테고리
  confidence: number;                 // 신뢰도 (0-1)
}
```

**알고리즘 로직**:
```typescript
async function categorizeBoard(
  boardId: string,
  imageIds: string[]
): Promise<BoardCategorizationOutput> {
  // 1. 보드 내 이미지들의 분석 결과 조회
  const analyses = await Promise.all(
    imageIds.map(id => getAnalysis(id))
  );
  
  // 2. 키워드 집계
  const keywordCounts: Record<string, number> = {};
  analyses.forEach(analysis => {
    analysis.keywords?.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  // 3. 가장 빈번한 키워드 기반 카테고리 추정
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword]) => keyword);
  
  // 4. AI 모델로 카테고리 분류
  const prompt = `
    Based on these keywords, suggest a category for this design board.
    Keywords: ${topKeywords.join(', ')}
    
    Return a JSON object with:
    - category: single category name (e.g., "Web Design", "Mobile UI", "Branding")
    - confidence: confidence score (0-1)
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

**카테고리 예시**:
- "Web Design"
- "Mobile UI"
- "Branding"
- "Print Design"
- "Illustration"

---

**SRD 참조**: Section 9.1

#### 5.1.1 핵심 모듈 계층

```
functions/
├── index.js                    # 진입점 및 Cloud Functions 정의
├── multiLLMOrchestrator.js    # MultiLLM 병렬 처리
├── metrics/
│   └── MetricNormalizer.js    # 메트릭 정규화
├── aggregation/
│   └── IncrementalSunburstAggregator.js  # Sunburst 집계
└── conversation/
    └── BidirectionalStateMachine.js       # 상태 머신
```

**모듈 책임**:

- **`index.js`**: Cloud Functions 진입점, 이벤트 라우팅, 비즈니스 로직 조합
- **`multiLLMOrchestrator.js`**: 3개 LLM API 병렬 호출, 결과 통합, 벤치마크 계산
- **`MetricNormalizer.js`**: 메트릭 정규화 및 가중 점수 계산
- **`IncrementalSunburstAggregator.js`**: 실시간 Sunburst 캐시 업데이트
- **`BidirectionalStateMachine.js`**: 대화 세션 상태 관리

#### 5.1.2 모듈 간 의존성

```
index.js
├── multiLLMOrchestrator.js
│   ├── MetricNormalizer.js
│   └── Secret Manager
├── IncrementalSunburstAggregator.js
│   └── MetricNormalizer.js
└── BidirectionalStateMachine.js
```

**공통 유틸리티**:
- `getOpenAiApiKey()`: Secret Manager에서 API 키 가져오기
- `getSecret()`: 범용 Secret Manager 래퍼
- `logger`: Firebase Functions 로거

---

### 5.2 프론트엔드 컴포넌트 구조

**SRD 참조**: Section 9.2

#### 5.2.1 컴포넌트 계층 구조

```
frontend/src/
├── pages/
│   ├── UploadAnalysis.tsx     # 메인 페이지 (이미지 업로드 및 분석)
│   ├── BenchmarkPage.js       # 벤치마크 대시보드
│   └── TrendsPage.js          # 트렌드 분석
├── components/
│   ├── Header.js              # 헤더 컴포넌트
│   ├── PromptInput.js         # 프롬프트 입력 컴포넌트
│   ├── ReportDisplay.js       # 분석 결과 표시
│   └── BenchmarkDashboard.js # 벤치마크 대시보드
├── services/
│   └── APIService.js          # API 호출 서비스
└── firebaseConfig.js          # Firebase 초기화
```

#### 5.2.2 주요 컴포넌트 Props 및 State

**`HomePage` 컴포넌트**:
```typescript
interface HomePageState {
  isLoading: boolean;
  analysisResult: AnalysisResult | null;
  error: string | null;
  selectedFile: File | null;
  docId: string | null;
  firebaseStatus: 'checking' | 'connected' | 'error';
}

interface HomePageProps {
  // 없음 (루트 컴포넌트)
}
```

**`PromptInput` 컴포넌트**:
```typescript
interface PromptInputProps {
  onFileSelect: (file: File) => void;
  onSearch: () => void;
  isLoading: boolean;
  selectedFile: File | null;
}

interface PromptInputState {
  prompt: string;
}
```

**`ReportDisplay` 컴포넌트**:
```typescript
interface ReportDisplayProps {
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

interface AnalysisResult {
  metrics: {
    layout: number;
    typography: number;
    color: number;
    components: number;
    formLanguage: number;
  };
  insights: Insight[];
  overallScore: number;
  strengths: string[];
  improvements: string[];
  summary: string;
}
```

---

#### 5.2.3 신규 페이지 컴포넌트 설계 (신규)

**SRD 참조**: Section 2.1, 2.2, 2.3, 2.4

##### 5.2.3.1 UploadPage 컴포넌트

**경로**: `frontend/src/pages/UploadPage.js` (신규)

**Props 및 State**:
```typescript
interface UploadPageState {
  selectedFile: File | null;
  isDragging: boolean;
  isLoading: boolean;
  analysisResult: AnalysisResult | null;
  docId: string | null;
  showGuide: boolean;
  showAnalysisInfo: boolean;
}

interface UploadPageProps {
  // 없음 (라우트 컴포넌트)
}
```

**하위 컴포넌트**:
- `DragAndDropZone`: 드래그 앤 드롭 업로드 영역
- `GuideButton`: 서비스 소개 핀 가이드 버튼
- `AnalysisButton`: 분석 시작 버튼
- `AnalysisResultDisplay`: 분석 결과 표시 (확장)

**`DragAndDropZone` 컴포넌트**:
```typescript
interface DragAndDropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: (files: FileList) => void;
}

interface DragAndDropZoneState {
  isDragging: boolean;
}
```

**`GuideButton` 컴포넌트**:
```typescript
interface GuideButtonProps {
  onToggle: () => void;
  isOpen: boolean;
}

interface GuideButtonState {
  currentStep: number;
  steps: GuideStep[];
}
```

**`AnalysisResultDisplay` 컴포넌트 (확장)**:
```typescript
interface AnalysisResultDisplayProps {
  analysisResult: AnalysisResult;
  onArchive: () => void;
  onSaveToBoard: (boardId: string) => void;
}

interface AnalysisResultDisplayState {
  expandedSections: string[];
  selectedBoardId: string | null;
}
```

**데이터 플로우**:
```
1. DragAndDropZone에서 파일 선택
   ↓
2. 파일 검증 (타입, 크기)
   ↓
3. Firebase Storage 업로드
   ↓
4. AnalysisButton 클릭 시 분석 시작
   ↓
5. Firestore 리스너로 실시간 상태 추적
   ↓
6. AnalysisResultDisplay에 결과 표시
```

---

##### 5.2.3.2 SearchPage 컴포넌트

**경로**: `frontend/src/pages/SearchPage.js` (신규)

**Props 및 State**:
```typescript
interface SearchPageState {
  searchQuery: string;
  searchImage: File | null;
  searchResults: SearchResult[];
  selectedCategory: string | null;
  diversityLevel: number;
  styleReflectionLevel: number;
  selectedKeywords: string[];
  isLoading: boolean;
}

interface SearchPageProps {
  // 없음 (라우트 컴포넌트)
}
```

**하위 컴포넌트**:
- `SearchPanel`: 검색 입력 패널 (이미지/텍스트)
- `CategoryPanel`: 카테고리 패널
- `SearchResultGrid`: 검색 결과 그리드
- `ExplorationControlPanel`: 탐색 제어 패널 (슬라이더)

**`SearchPanel` 컴포넌트**:
```typescript
interface SearchPanelProps {
  onTextSearch: (query: string) => void;
  onImageSearch: (file: File) => void;
  onStyleSearch: () => void;
}

interface SearchPanelState {
  searchType: 'text' | 'image' | 'style';
  textQuery: string;
  imageFile: File | null;
}
```

**`CategoryPanel` 컴포넌트**:
```typescript
interface CategoryPanelProps {
  boards: Board[];
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
}

interface CategoryPanelState {
  categories: string[];
}
```

**`SearchResultGrid` 컴포넌트**:
```typescript
interface SearchResultGridProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  onSaveToBoard: (resultId: string, boardId: string) => void;
  onSaveImage: (resultId: string) => void;
}

interface SearchResult {
  analysisId: string;
  imageUrl: string;
  similarityScore: number;
  reason: string;
  metrics: Metrics;
}
```

**`ExplorationControlPanel` 컴포넌트**:
```typescript
interface ExplorationControlPanelProps {
  diversityLevel: number;
  styleReflectionLevel: number;
  keywords: string[];
  onDiversityChange: (value: number) => void;
  onStyleReflectionChange: (value: number) => void;
  onKeywordsChange: (keywords: string[]) => void;
  onApplyFilters: () => void;
}
```

**데이터 플로우**:
```
1. SearchPanel에서 검색 입력
   ↓
2. searchWithFilters API 호출
   ↓
3. SearchResultGrid에 결과 표시
   ↓
4. ExplorationControlPanel로 필터 조정
   ↓
5. 필터 적용 시 재검색
```

---

##### 5.2.3.3 MyPage 컴포넌트

**경로**: `frontend/src/pages/MyPage.js` (신규)

**Props 및 State**:
```typescript
interface MyPageState {
  userProfile: UserProfile | null;
  currentRepresentativeStyle: RepresentativeStyle | null;
  styleTimeline: RepresentativeStyle[];
  styleFolders: StyleFolder[];
  selectedPastStyle: RepresentativeStyle | null;
  comparisonResult: StyleComparison | null;
  isLoading: boolean;
}

interface MyPageProps {
  // 없음 (라우트 컴포넌트)
}
```

**하위 컴포넌트**:
- `ProfileSection`: 프로필 관리 섹션
- `RepresentativeStyleSection`: 대표 스타일 섹션
- `StyleGallery`: 스타일 갤러리

**`ProfileSection` 컴포넌트**:
```typescript
interface ProfileSectionProps {
  userProfile: UserProfile;
  onProfileImageUpdate: (file: File) => void;
  onProfileUpdate: (updates: Partial<UserProfile>) => void;
}

interface ProfileSectionState {
  isEditing: boolean;
  editedProfile: Partial<UserProfile>;
}
```

**`RepresentativeStyleSection` 컴포넌트**:
```typescript
interface RepresentativeStyleSectionProps {
  currentStyle: RepresentativeStyle | null;
  timeline: RepresentativeStyle[];
  onStyleSelect: (styleId: string) => void;
  onCompare: (currentId: string, pastId: string) => void;
}

interface RepresentativeStyleSectionState {
  selectedPastStyleId: string | null;
  comparisonResult: StyleComparison | null;
}
```

**`StyleGallery` 컴포넌트**:
```typescript
interface StyleGalleryProps {
  folders: StyleFolder[];
  archivedAnalyses: ArchivedAnalysis[];
  onFolderCreate: (name: string) => void;
  onFolderSelect: (folderId: string) => void;
  onImageArchive: (analysisId: string, folderId?: string) => void;
}

interface StyleGalleryState {
  viewMode: 'grid' | 'list';
  selectedFolderId: string | null;
  folders: StyleFolder[];
}
```

**데이터 플로우**:
```
1. MyPage 마운트 시 사용자 데이터 로드
   - getRepresentativeStyle API 호출
   - styleFolders 컬렉션 구독
   - archivedAnalyses 컬렉션 구독
   ↓
2. RepresentativeStyleSection에서 스타일 선택
   ↓
3. compareStyles API 호출
   ↓
4. StyleGallery에서 폴더 관리 및 아카이브
```

---

##### 5.2.3.4 SettingsPage 컴포넌트

**경로**: `frontend/src/pages/SettingsPage.js` (신규)

**Props 및 State**:
```typescript
interface SettingsPageState {
  accountSettings: AccountSettings;
  securitySettings: SecuritySettings;
  notificationSettings: NotificationSettings;
  isLoading: boolean;
}

interface AccountSettings {
  email: string;
  phone: string;
  subscription: SubscriptionInfo;
}

interface SecuritySettings {
  trustedDevices: Device[];
  lastPasswordChange: Date | null;
}

interface NotificationSettings {
  historyNotifications: boolean;
  weeklyReport: boolean;
  goalReminder: boolean;
}
```

**하위 컴포넌트**:
- `AccountSettings`: 계정 관리 섹션
- `SecuritySettings`: 보안 설정 섹션
- `InfoSection`: 정보 센터 섹션

**`AccountSettings` 컴포넌트**:
```typescript
interface AccountSettingsProps {
  account: AccountSettings;
  onEmailUpdate: (email: string) => void;
  onPhoneUpdate: (phone: string) => void;
  onSubscriptionChange: (plan: string) => void;
}

interface AccountSettingsState {
  isEditingEmail: boolean;
  isEditingPhone: boolean;
  newEmail: string;
  newPhone: string;
}
```

**`SecuritySettings` 컴포넌트**:
```typescript
interface SecuritySettingsProps {
  security: SecuritySettings;
  onPasswordChange: (oldPassword: string, newPassword: string) => void;
  onDeviceRevoke: (deviceId: string) => void;
  onLogout: (allDevices: boolean) => void;
}

interface SecuritySettingsState {
  isChangingPassword: boolean;
  showDeviceList: boolean;
}
```

**`InfoSection` 컴포넌트**:
```typescript
interface InfoSectionProps {
  // 정적 링크만 표시
}

interface InfoSectionState {
  // 없음
}
```

**데이터 플로우**:
```
1. SettingsPage 마운트 시 사용자 설정 로드
   - Firebase Auth에서 계정 정보 조회
   - userProfiles에서 설정 조회
   ↓
2. AccountSettings에서 정보 수정
   ↓
3. Firebase Auth 및 Firestore 업데이트
   ↓
4. SecuritySettings에서 보안 설정 변경
```

---

**컴포넌트 간 데이터 플로우**:
```
App.js (라우터)
├── UploadPage
│   ├── DragAndDropZone → Firebase Storage
│   ├── AnalysisButton → Cloud Functions
│   └── AnalysisResultDisplay → Firestore 리스너
├── SearchPage
│   ├── SearchPanel → searchWithFilters API
│   ├── CategoryPanel → boards 컬렉션
│   └── SearchResultGrid → saveToBoard API
├── MyPage
│   ├── ProfileSection → updateProfileImage API
│   ├── RepresentativeStyleSection → getRepresentativeStyle API
│   └── StyleGallery → createStyleFolder API
└── SettingsPage
    ├── AccountSettings → Firebase Auth
    ├── SecuritySettings → Firebase Auth
    └── InfoSection → 정적 링크
```

---

## 6. 에러 처리 및 예외 상황

### 6.1 에러 코드 체계

**SRD 참조**: Section 10.1

**에러 코드 분류**:

| 코드 | 설명 | HTTP 상태 | 재시도 가능 |
|------|------|-----------|-------------|
| `NETWORK_ERROR` | 네트워크 연결 실패 | 503 | ✅ |
| `RATE_LIMIT_EXCEEDED` | API Rate Limit 초과 | 429 | ✅ |
| `AUTHENTICATION_FAILED` | API 키 인증 실패 | 401 | ❌ |
| `INVALID_REQUEST` | 잘못된 요청 형식 | 400 | ❌ |
| `PARSING_ERROR` | 응답 파싱 실패 | 500 | ❌ |
| `STORAGE_ERROR` | Firebase Storage 오류 | 500 | ✅ |
| `FIRESTORE_ERROR` | Firestore 오류 | 500 | ✅ |
| `TIMEOUT_ERROR` | 요청 타임아웃 | 504 | ✅ |
| `UNKNOWN_ERROR` | 알 수 없는 오류 | 500 | ❌ |

**에러 응답 형식**:
```typescript
interface ErrorResponse {
  error: string;              // 에러 코드
  message: string;             // 사용자 친화적 메시지
  details?: string;           // 상세 오류 정보 (개발용)
  timestamp: string;           // ISO 8601 형식
  requestId?: string;         // 요청 추적 ID
}
```

---

### 6.2 재시도 전략

**SRD 참조**: Section 10.2

**지수 백오프 알고리즘**:
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  let attempt = 0;
  const baseDelay = 1000; // 1초
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // 지수 백오프: 1초, 2초, 4초
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}
```

**재시도 가능한 에러**:
- 네트워크 오류 (`NETWORK_ERROR`)
- Rate Limit (`RATE_LIMIT_EXCEEDED`)
- 타임아웃 (`TIMEOUT_ERROR`)
- 일시적 서버 오류 (5xx)

**재시도 불가능한 에러**:
- 인증 실패 (`AUTHENTICATION_FAILED`)
- 잘못된 요청 (`INVALID_REQUEST`)
- 파싱 오류 (`PARSING_ERROR`)

---

### 6.3 로깅 및 모니터링

**SRD 참조**: Section 10.3

**로그 레벨**:
- `INFO`: 일반 정보성 로그
- `WARN`: 경고 (복구 가능한 문제)
- `ERROR`: 오류 (복구 불가능한 문제)
- `DEBUG`: 디버깅 정보 (개발 환경만)

**로그 형식**:
```javascript
logger.info('Processing file:', { filePath, contentType });
logger.warn('API rate limit approaching', { usage: 80, limit: 100 });
logger.error('Failed to analyze image', { error: error.message, documentId });
```

**모니터링 메트릭**:
- 함수 실행 시간
- API 호출 성공률
- 에러 발생 빈도
- 메모리 사용량
- 비용 추적

---

## 7. 성능 최적화

### 7.1 성능 목표 및 요구사항

**SRD 참조**: NFR-1.1, NFR-1.3, NFR-4.1  
**목적**: SRD의 성능 요구사항을 명시적 목표로 정의하여 구현 검증 기준 제공

#### 7.1.1 이미지 분석 응답 시간

**목표**:
- 평균 응답 시간: 30초 이내
- P95 응답 시간: 60초 이내
- P99 응답 시간: 90초 이내

**현재 상태**:
- 평균 응답 시간: 약 45초 (3개 AI 모델 병렬 처리)
- 개선 필요: 목표 대비 15초 초과

**측정 방법**:
- Cloud Functions 실행 시간 로그 분석
- `analyzeImageOnUpload` 함수의 시작부터 완료까지 시간 측정
- BigQuery에 메트릭 저장 및 대시보드 시각화

**모니터링**:
```typescript
// functions/src/index.ts
const startTime = Date.now();

try {
  // 분석 로직 실행
  await performAnalysis();
  
  const duration = Date.now() - startTime;
  
  // BigQuery에 메트릭 저장
  await logPerformanceMetric({
    functionName: 'analyzeImageOnUpload',
    duration,
    timestamp: new Date()
  });
} catch (error) {
  // 에러 로깅
}
```

**개선 방안**:
- 병렬 처리 최적화: AI 모델 호출 순차 최적화
- 캐싱 전략: 동일 이미지 재분석 시 캐시 활용
- Cloud Functions 리소스 조정: Memory/CPU 할당량 최적화
- 타임아웃 설정: 각 AI 모델 호출에 타임아웃 적용 (30초)

**알림 설정 기준**:
- 평균 응답 시간이 35초 초과 시 경고 알림
- P95 응답 시간이 65초 초과 시 경고 알림
- P99 응답 시간이 95초 초과 시 경고 알림

#### 7.1.2 시스템 처리량

**목표**:
- 동시 사용자: 100명 지원
- 초당 처리량: 10개 이미지 분석 처리 가능
- 동시 실행 함수 수: 최대 100개

**현재 상태**:
- Firebase 서버리스 아키텍처로 자동 스케일링 지원
- Cloud Functions 동시 실행 제한 설정 필요

**제한 사항**:
- Cloud Functions `maxInstances` 설정 필요
- Firestore 읽기/쓰기 제한 고려 (초당 10,000회)

**모니터링**:
```typescript
// Cloud Functions 설정
export const analyzeImageOnUpload = onObjectFinalized(
  {
    region: 'asia-northeast3',
    maxInstances: 100, // 동시 실행 최대 100개
    memory: '2GiB',
    timeoutSeconds: 540
  },
  async (event) => {
    // 분석 로직
  }
);
```

**동시 실행 수 추적**:
- Firebase Monitoring 대시보드에서 실시간 모니터링
- BigQuery에 동시 실행 수 메트릭 저장
- 알림 설정: 동시 실행 수가 90개 초과 시 경고

#### 7.1.3 시스템 가동률

**목표**:
- 목표 가동률: 99.5% 이상
- 월간 다운타임: 최대 3.6시간 (월 30일 기준)

**측정 방법**:
- Firebase Monitoring 대시보드 활용
- Cloud Functions 실행 성공률 추적
- Firestore 가용성 모니터링

**SLA 정의**:
- 월간 가동률 리포트 생성
- 다운타임 원인 분석 및 개선 방안 도출

**장애 대응**:
- 자동 알림: 가동률이 99% 미만으로 떨어지면 즉시 알림
- 에스컬레이션: 1시간 이상 다운타임 발생 시 관리자 알림
- 복구 절차: Section 10.3 참조

**모니터링 메트릭**:
```typescript
// 가동률 계산
const uptime = (totalRequests - failedRequests) / totalRequests * 100;

// BigQuery에 저장
await logAvailabilityMetric({
  date: new Date().toISOString().split('T')[0],
  uptime,
  totalRequests,
  failedRequests
});
```

---

### 7.2 캐싱 전략

**SRD 참조**: Section 11.1

#### 7.2.1 Firestore 캐시

**캐시 계층**:
1. **메모리 캐시**: Cloud Functions 인스턴스 내 메모리 (임시)
2. **Firestore 캐시**: `sunburst_cache` 컬렉션 (영구)
3. **CDN 캐시**: (향후 구현) 정적 자산 캐싱

**캐시 무효화 전략**:
- 버전 번호 기반 (`version` 필드)
- TTL 기반 (24시간)
- 수동 무효화 (관리자 API)

#### 7.2.2 Redis 캐시 (향후)

**설계**:
- 키 형식: `dysproto:{resource}:{id}`
- TTL: 1시간 (기본)
- 캐시 키:
  - `dysproto:analysis:{analysisId}`
  - `dysproto:benchmark:{modelName}`
  - `dysproto:session:{sessionId}`

---

### 7.2 데이터베이스 쿼리 최적화

**SRD 참조**: Section 11.2

**쿼리 최적화 전략**:

1. **인덱스 활용**:
   - 모든 쿼리에 인덱스 사용 필수
   - 복합 인덱스로 정렬 최적화

2. **배치 읽기/쓰기**:
   ```javascript
   // 배치 읽기
   const docs = await db.getAll(...refs);
   
   // 배치 쓰기
   const batch = db.batch();
   refs.forEach(ref => batch.set(ref, data));
   await batch.commit();
   ```

3. **페이지네이션**:
   ```javascript
   const query = db.collection('analyses')
     .orderBy('createdAt', 'desc')
     .limit(20);
   ```

4. **컬렉션 그룹 쿼리 제한**:
   - 최대 50개 문서로 제한
   - 필터 조건 최소화

---

### 7.3 이미지 처리 최적화

**SRD 참조**: Section 11.3

**이미지 최적화 전략**:

1. **업로드 시 검증**:
   - 최대 크기: 10MB
   - 허용 형식: JPEG, PNG, WebP
   - 해상도 제한: 4096x4096px

2. **리사이징** (향후):
   - 썸네일 생성: 300x300px
   - 중간 크기: 1200x1200px
   - 원본 보존

3. **형식 변환**:
   - WebP 변환 (지원 브라우저)
   - JPEG 품질: 85%

---

## 8. 보안 명세

### 8.1 인증 및 인가

**SRD 참조**: Section 3.2.1, Gap-NFR-2.1  
**우선순위**: P0 (Critical)  
**구현 예정**: Phase 1 (즉시)

#### 8.1.1 Firebase Authentication 통합
**현재 상태**: 익명 인증 활성화 (Phase 0 완료)

**설정 정보**:
- **인증 방식**: 익명 인증
- **용도**: 사용자 식별 및 세션 관리
- **향후 확장**: 이메일/비밀번호, 소셜 로그인 (Google, GitHub 등)

**Firestore 보안 규칙 (현재 - Phase 0)**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 19);
    }
  }
}
```

**Storage 보안 규칙 (현재 - Phase 0)**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 19);
    }
  }
}
```

**주의사항**: 
- 현재 보안 규칙은 테스트 모드이며 2025-12-19까지 유효합니다.
- 프로덕션 배포 전 인증 기반 규칙으로 업데이트 필요합니다.
- Phase 0에서는 익명 인증을 사용하므로, 모든 사용자가 모든 데이터에 접근 가능합니다.

#### 8.1.1.1 Firebase Authentication 통합 (기존 내용)

**현재 상태**: 익명 접근 허용 (개발 단계)  
**목표**: 프로덕션 배포 가능한 수준의 인증 시스템 구축

**구현 단계**:

1. **Firebase Authentication 활성화**:
   - Firebase Console에서 Authentication 서비스 활성화
   - 이메일/비밀번호 인증 제공자 활성화
   - 추가 인증 방법 (Google, GitHub 등) 선택적 활성화

2. **프론트엔드 인증 플로우 구현**:
   ```typescript
   // frontend/src/services/AuthService.ts
   import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
   
   export class AuthService {
     private auth = getAuth();
     
     async signIn(email: string, password: string): Promise<UserCredential> {
       return await signInWithEmailAndPassword(this.auth, email, password);
     }
     
     async signUp(email: string, password: string): Promise<UserCredential> {
       return await createUserWithEmailAndPassword(this.auth, email, password);
     }
     
     async signOut(): Promise<void> {
       return await signOut(this.auth);
     }
     
     getCurrentUser(): User | null {
       return this.auth.currentUser;
     }
     
     onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
       return this.auth.onAuthStateChanged(callback);
     }
   }
   ```

3. **백엔드 토큰 검증 미들웨어**:
   ```typescript
   // functions/src/middleware/authMiddleware.ts
   import { Request, Response, NextFunction } from 'express';
   import { getAuth } from 'firebase-admin/auth';
   
   export interface AuthenticatedRequest extends Request {
     user?: {
       uid: string;
       email?: string;
     };
   }
   
   export async function verifyToken(
     req: AuthenticatedRequest,
     res: Response,
     next: NextFunction
   ): Promise<void> {
     const authHeader = req.headers.authorization;
     
     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       res.status(401).json({ error: 'Unauthorized: Missing token' });
       return;
     }
     
     const token = authHeader.split('Bearer ')[1];
     
     try {
       const decodedToken = await getAuth().verifyIdToken(token);
       req.user = {
         uid: decodedToken.uid,
         email: decodedToken.email
       };
       next();
     } catch (error) {
       res.status(401).json({ error: 'Unauthorized: Invalid token' });
     }
   }
   
   // 사용 예시: functions/src/index.ts
   import { verifyToken, AuthenticatedRequest } from './middleware/authMiddleware';
   
   export const continueCritique = onRequest(
     { cors: true },
     async (req: AuthenticatedRequest, res: Response) => {
       // 인증 미들웨어 적용
       await verifyToken(req, res, async () => {
         const userId = req.user!.uid;
         // ... 나머지 로직
       });
     }
   );
   ```

4. **사용자별 데이터 필터링 로직**:
   ```typescript
   // functions/src/utils/dataFilter.ts
   import { getFirestore, Query } from 'firebase-admin/firestore';
   
   export function filterByUser(query: Query, userId: string): Query {
     return query.where('userId', '==', userId);
   }
   
   // 사용 예시
   const db = getFirestore();
   const userAnalyses = await filterByUser(
     db.collection('analyses'),
     userId
   ).get();
   ```

#### 8.1.2 Firestore Security Rules 상세 규칙

**규칙 버전**: `rules_version = '2'`

**전체 보안 규칙**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 헬퍼 함수 정의
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isPublic(doc) {
      return doc.data().isPublic == true;
    }
    
    // analyses 컬렉션
    match /analyses/{analysisId} {
      // 읽기: 인증된 사용자이며 자신의 문서이거나 공개 문서
      allow read: if isAuthenticated() && 
                     (isOwner(resource.data.userId) || 
                      isPublic(resource));
      
      // 생성: 인증된 사용자이며 userId가 자신의 UID와 일치
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      // 수정/삭제: 인증된 사용자이며 자신의 문서
      allow update, delete: if isAuthenticated() && 
                               isOwner(resource.data.userId);
      
      // 서브컬렉션: benchmarks
      match /benchmarks/{document=**} {
        allow read: if isAuthenticated() && 
                       isOwner(get(/databases/$(database)/documents/analyses/$(analysisId)).data.userId);
        allow write: if isAuthenticated() && 
                        isOwner(get(/databases/$(database)/documents/analyses/$(analysisId)).data.userId);
      }
      
      // 서브컬렉션: sunburst_cache
      match /sunburst_cache/{document=**} {
        allow read: if isAuthenticated() && 
                       isOwner(get(/databases/$(database)/documents/analyses/$(analysisId)).data.userId);
        allow write: if isAuthenticated() && 
                        isOwner(get(/databases/$(database)/documents/analyses/$(analysisId)).data.userId);
      }
    }
    
    // critiqueSessions 컬렉션
    match /critiqueSessions/{sessionId} {
      allow read: if isAuthenticated() && 
                     (isOwner(resource.data.userId) || 
                      resource.data.userId == null); // 익명 세션은 생성자만 접근
      allow create: if isAuthenticated() && 
                       (request.resource.data.userId == request.auth.uid || 
                        request.resource.data.userId == null);
      allow update, delete: if isAuthenticated() && 
                               (isOwner(resource.data.userId) || 
                                resource.data.userId == null);
      
      // 서브컬렉션: messages
      match /messages/{messageId} {
        allow read, write: if isAuthenticated() && 
                              isOwner(get(/databases/$(database)/documents/critiqueSessions/$(sessionId)).data.userId);
      }
    }
    
    // feedbacks 컬렉션
    match /feedbacks/{feedbackId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                               isOwner(resource.data.userId);
    }
    
    // benchmarks 컬렉션 (전역)
    match /benchmarks/{document=**} {
      allow read: if isAuthenticated();
      allow write: if false; // Cloud Functions만 쓰기 가능
    }
    
    // userProfiles 컬렉션 (향후 추가)
    match /userProfiles/{userId} {
      allow read: if isAuthenticated() && 
                     (isOwner(userId) || isPublic(resource));
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
                               isOwner(userId);
    }
    
    // userGoals 컬렉션 (향후 추가)
    match /userGoals/{goalId} {
      allow read: if isAuthenticated() && 
                     isOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
                               isOwner(resource.data.userId);
    }
    
    // growthReports 컬렉션 (향후 추가)
    match /growthReports/{reportId} {
      allow read: if isAuthenticated() && 
                     isOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
                               isOwner(resource.data.userId);
    }
  }
}
```

**테스트 시나리오**:

1. **인증되지 않은 사용자**:
   - 모든 컬렉션 읽기/쓰기 거부
   - 에러 코드: 401 Unauthorized

2. **인증된 사용자 (자신의 데이터)**:
   - 자신의 `analyses` 문서 읽기/쓰기 허용
   - 자신의 `critiqueSessions` 읽기/쓰기 허용
   - 자신의 `userProfiles` 읽기/쓰기 허용

3. **인증된 사용자 (다른 사용자의 데이터)**:
   - 다른 사용자의 `analyses` 읽기 거부 (공개 문서 제외)
   - 다른 사용자의 `critiqueSessions` 읽기 거부
   - 다른 사용자의 데이터 쓰기 거부

#### 8.1.3 Storage Security Rules 상세 규칙

**규칙 버전**: `rules_version = '2'`

**전체 보안 규칙**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 사용자별 폴더 구조: users/{userId}/analyses/{timestamp}_{fileName}
    match /users/{userId}/analyses/{fileName} {
      // 읽기: 인증된 사용자이며 자신의 폴더이거나 공개 이미지
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      resource.metadata.isPublic == 'true');
      
      // 쓰기: 인증된 사용자이며 자신의 폴더
      allow write: if request.auth != null && 
                      request.auth.uid == userId &&
                      // 파일 크기 검증: 최대 10MB
                      request.resource.size < 10 * 1024 * 1024 &&
                      // 파일 타입 검증: 이미지 파일만 허용
                      request.resource.contentType.matches('image/.*') &&
                      // 파일명 검증: 특수 문자 제거
                      fileName.matches('[a-zA-Z0-9._-]+');
      
      // 삭제: 인증된 사용자이며 자신의 파일
      allow delete: if request.auth != null && 
                       request.auth.uid == userId;
    }
    
    // 임시 업로드 폴더 (익명 사용자용, 향후 제거)
    match /users/temp/{fileName} {
      allow read: if true; // 임시 폴더는 공개 읽기
      allow write: if request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
      allow delete: if true;
    }
  }
}
```

**파일 업로드 플로우**:
```typescript
// frontend/src/services/StorageService.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export async function uploadImage(file: File): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated to upload images');
  }
  
  const storage = getStorage();
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `users/${user.uid}/analyses/${timestamp}_${fileName}`);
  
  // 파일 검증
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB');
  }
  
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}
```

#### 8.1.4 마이그레이션 계획

**목표**: 기존 익명 데이터를 인증 사용자 계정에 연결

**마이그레이션 전략**:

1. **데이터 마이그레이션 스크립트**:
   ```typescript
   // functions/src/scripts/migrateAnonymousData.ts
   import { getFirestore } from 'firebase-admin/firestore';
   
   interface MigrationMapping {
     anonymousId: string;
     userId: string;
   }
   
   export async function migrateUserData(
     anonymousId: string,
     userId: string
   ): Promise<void> {
     const db = getFirestore();
     const batch = db.batch();
     
     // analyses 컬렉션 마이그레이션
     const analysesSnapshot = await db.collection('analyses')
       .where('userId', '==', anonymousId)
       .get();
     
     analysesSnapshot.forEach(doc => {
       batch.update(doc.ref, { userId });
     });
     
     // critiqueSessions 컬렉션 마이그레이션
     const sessionsSnapshot = await db.collection('critiqueSessions')
       .where('userId', '==', anonymousId)
       .get();
     
     sessionsSnapshot.forEach(doc => {
       batch.update(doc.ref, { userId });
     });
     
     await batch.commit();
   }
   ```

2. **사용자별 데이터 분리 전략**:
   - 기존 익명 데이터는 `userId: "anonymous_{sessionId}"` 형식 유지
   - 새 인증 사용자는 `userId: "{firebaseAuthUid}"` 형식 사용
   - Storage 파일은 `users/{userId}/analyses/` 폴더 구조로 분리

3. **롤백 계획**:
   - 마이그레이션 전 전체 데이터 백업
   - 단계별 마이그레이션 (컬렉션별)
   - 각 단계 완료 후 검증
   - 문제 발생 시 즉시 롤백

**마이그레이션 일정**:
- Week 1: 마이그레이션 스크립트 개발 및 테스트
- Week 2: 스테이징 환경 마이그레이션 및 검증
- Week 3: 프로덕션 마이그레이션 (점진적 배포)

---

### 8.2 API 키 관리

**SRD 참조**: Section 12.2

**Secret Manager 사용**:
- 모든 API 키는 Secret Manager에 저장
- 버전 관리 및 로테이션 지원
- 최소 권한 원칙 적용

**접근 제어**:
- Cloud Functions만 Secret Manager 접근 가능
- 로컬 개발 환경: 환경 변수 사용
- 프로덕션: Secret Manager 필수

---

### 8.3 입력 검증 및 Sanitization

**SRD 참조**: Section 12.3

**검증 규칙**:
- 파일 크기: 최대 10MB
- 파일 타입: 이미지 파일만 허용
- 파일명: 특수 문자 제거
- 사용자 메시지: XSS 방지 (HTML 이스케이프)

**Sanitization**:
```javascript
function sanitizeInput(input) {
  return input
    .replace(/<script>/gi, '')
    .replace(/<\/script>/gi, '')
    .trim();
}
```

---

## 9. 테스트 전략

### 9.1 단위 테스트

**SRD 참조**: Section 13.1

**테스트 대상**:
- `MetricNormalizer`: 메트릭 정규화 로직
- `IncrementalSunburstAggregator`: 집계 알고리즘
- `BidirectionalStateMachine`: 상태 전환 로직

**테스트 프레임워크**: Jest

**예제 테스트**:
```javascript
describe('MetricNormalizer', () => {
  test('should normalize linear metric correctly', () => {
    const result = MetricNormalizer.normalize('layout', 'columns', 12);
    expect(result).toBeCloseTo(0.478, 2); // (12-1)/(24-1)
  });
  
  test('should handle WCAG contrast normalization', () => {
    const result = MetricNormalizer.normalize('color', 'contrast', 7);
    expect(result).toBe(1.0); // AAA
  });
});
```

---

### 9.2 통합 테스트

**SRD 참조**: Section 13.2

**테스트 시나리오**:
1. 이미지 업로드 → 분석 완료 플로우
2. MultiLLM 병렬 처리 및 결과 통합
3. Firestore 실시간 업데이트
4. 에러 처리 및 재시도

**테스트 환경**:
- Firebase Emulator Suite 사용
- 테스트용 API 키 사용

---

### 9.3 E2E 테스트

**SRD 참조**: Section 13.3

**테스트 시나리오**:
1. 사용자가 이미지 업로드
2. 분석 결과 실시간 표시
3. 벤치마크 대시보드 확인
4. 대화형 세션 생성 및 진행

**테스트 도구**: Playwright 또는 Cypress

---

## 10. 배포 및 운영

### 10.1 배포 프로세스

**SRD 참조**: Section 14.1

**배포 단계**:
1. 코드 검증 및 린트 체크
2. 단위 테스트 실행
3. Firebase Functions 배포: `firebase deploy --only functions`
4. 프론트엔드 빌드: `npm run build`
5. Firebase Hosting 배포: `firebase deploy --only hosting`
6. 헬스 체크 및 모니터링

**환경 변수 관리**:
- 개발: `.env.local`
- 프로덕션: Secret Manager 또는 Firebase Config

---

### 10.2 모니터링 및 알림

**SRD 참조**: Section 14.2, NFR-1.1, NFR-4.1

#### 10.2.1 성능 모니터링 방법

**메트릭 수집 방법**:

1. **Firebase Monitoring**:
   - Cloud Functions 실행 시간 자동 수집
   - 에러 발생률 추적
   - 메모리 사용량 모니터링
   - 동시 실행 수 추적

2. **BigQuery 메트릭 저장**:
   ```typescript
   // functions/src/utils/metricsLogger.ts
   import { BigQuery } from '@google-cloud/bigquery';
   
   const bigquery = new BigQuery();
   const datasetId = 'dysproto_metrics';
   const tableId = 'performance_metrics';
   
   interface PerformanceMetric {
     functionName: string;
     duration: number;
     memoryUsed: number;
     timestamp: Date;
     userId?: string;
     status: 'success' | 'error';
   }
   
   export async function logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
     await bigquery.dataset(datasetId).table(tableId).insert([{
       function_name: metric.functionName,
       duration_ms: metric.duration,
       memory_used_mb: metric.memoryUsed,
       timestamp: metric.timestamp.toISOString(),
       user_id: metric.userId || null,
       status: metric.status
     }]);
   }
   ```

3. **커스텀 메트릭 수집**:
   ```typescript
   // 응답 시간 측정
   const startTime = Date.now();
   await performOperation();
   const duration = Date.now() - startTime;
   
   await logPerformanceMetric({
     functionName: 'analyzeImageOnUpload',
     duration,
     memoryUsed: process.memoryUsage().heapUsed / 1024 / 1024,
     timestamp: new Date(),
     userId: userId,
     status: 'success'
   });
   ```

**모니터링 대시보드**:
- Firebase Console Monitoring 탭
- BigQuery 데이터 기반 커스텀 대시보드 (Data Studio 또는 Looker)
- 주요 메트릭:
  - 평균 응답 시간 (P50, P95, P99)
  - 에러 발생률
  - 동시 실행 수
  - 가동률

#### 10.2.2 알림 설정 기준

**응답 시간 초과 알림**:
- 평균 응답 시간이 35초 초과 시 경고 알림
- P95 응답 시간이 65초 초과 시 경고 알림
- P99 응답 시간이 95초 초과 시 경고 알림
- 연속 5분 이상 초과 시 Critical 알림

**가동률 저하 알림**:
- 가동률이 99% 미만으로 떨어지면 즉시 알림
- 1시간 이상 99% 미만 유지 시 Critical 알림
- 월간 가동률이 99.5% 미만 시 월간 리포트 알림

**에러율 증가 알림**:
- 에러율이 5% 초과 시 경고 알림
- 에러율이 10% 초과 시 Critical 알림
- 특정 에러 코드가 빈번히 발생 시 알림

**리소스 사용량 알림**:
- 동시 실행 수가 90개 초과 시 경고 알림
- 메모리 사용량이 할당량의 90% 초과 시 경고 알림
- 비용이 일일 예산의 80% 초과 시 알림

**알림 채널**:
- Slack: 실시간 알림 (모든 Critical 알림)
- 이메일: 일일/주간 요약 리포트
- SMS: Critical 알림 (선택적)

#### 10.2.3 성능 저하 대응 절차

**1단계: 문제 감지**:
- 모니터링 시스템이 자동으로 성능 저하 감지
- 알림 발송 (Slack, 이메일)

**2단계: 원인 분석**:
- BigQuery 쿼리로 최근 성능 메트릭 분석
- Cloud Functions 로그 확인
- 외부 API 응답 시간 확인 (OpenAI, Claude, Vertex AI)

**3단계: 즉시 대응**:
- 자동 스케일링 확인 (Firebase 자동 처리)
- Cloud Functions 리소스 조정 필요 시 수동 조정
- 캐시 무효화 (필요 시)

**4단계: 근본 원인 해결**:
- 코드 최적화
- 쿼리 최적화
- 인덱스 추가
- 알고리즘 개선

**5단계: 검증 및 모니터링**:
- 개선 후 성능 메트릭 재확인
- 목표 달성 여부 확인
- 지속 모니터링

**모니터링 항목**:
- 함수 실행 시간
- 에러 발생률
- API 호출 성공률
- 비용 추적
- 메모리 사용량
- 동시 실행 수
- 가동률

**알림 설정**:
- 에러 발생 시 Slack 알림
- 비용 초과 시 이메일 알림
- 성능 저하 감지 시 알림
- 가동률 저하 시 Critical 알림

---

### 10.3 장애 대응 절차

**SRD 참조**: Section 14.3

**장애 대응 프로세스**:
1. **감지**: 모니터링 시스템이 장애 감지
2. **분석**: 로그 확인 및 원인 파악
3. **대응**: 
   - 자동 재시도 (일시적 오류)
   - 롤백 (배포 문제)
   - 수동 개입 (심각한 오류)
4. **복구**: 문제 해결 및 검증
5. **보고**: 사후 분석 및 개선

---

### 10.4 구현 우선순위 및 로드맵

**SRD 참조**: Section 10 (구현 로드맵)  
**목적**: SRD의 Gap 분석과 우선순위를 반영한 단계별 구현 계획 제시

본 섹션은 SRD의 Gap 분석과 우선순위를 반영한 단계별 구현 계획을 제시합니다. 각 Phase별로 목표, 주요 작업, 예상 소요 시간, 담당자, 마일스톤을 정의합니다.

#### 10.4.1 Phase 1: Critical 항목 (1-2주)

**목표**: 프로덕션 배포 준비

**주요 작업**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-NFR-2.1 | Firebase Authentication 통합 | 1주 | 백엔드 | P0 |
| Gap-NFR-2.1 | Firestore 보안 규칙 강화 | 3일 | 백엔드 | P0 |
| Gap-NFR-2.1 | Storage 보안 규칙 강화 | 2일 | 백엔드 | P0 |
| Gap-NFR-2.1 | 인증 마이그레이션 스크립트 개발 | 2일 | 백엔드 | P0 |
| Gap-NFR-2.1 | 프론트엔드 인증 플로우 구현 | 3일 | 프론트엔드 | P0 |

**마일스톤**: M1 - 프로덕션 보안 완료 (2025.11.18)

**완료 기준**:
- Firebase Authentication 활성화 및 통합 완료
- 모든 Firestore 컬렉션에 보안 규칙 적용
- Storage 보안 규칙 적용
- 인증된 사용자만 데이터 접근 가능
- 마이그레이션 스크립트 테스트 완료

**검증 방법**:
- 보안 규칙 테스트 시나리오 실행
- 인증 플로우 E2E 테스트
- 마이그레이션 스크립트 스테이징 환경 테스트

#### 10.4.2 Phase 2: High 우선순위 Gap 해결 (1-2개월)

**목표**: 핵심 기능 완성

**Week 1-2: 사용자 프로파일링**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-1.3.1 | userProfiles 컬렉션 구현 | 1주 | 백엔드 | P1 |
| Gap-1.3.1 | DNA 프로파일 업데이트 알고리즘 구현 | 1주 | 백엔드 | P1 |
| Gap-1.3.1 | analyzeImageOnUpload 트리거 연동 | 2일 | 백엔드 | P1 |
| Gap-2.4.1 | 시계열 추적 기능 구현 | 1주 | 백엔드 | P1 |

**Week 3-4: 목표 및 리포트 시스템**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-2.2.2, Gap-2.3.1 | userGoals 컬렉션 구현 | 2일 | 백엔드 | P1 |
| Gap-2.2.2, Gap-2.3.1 | 목표 설정 API 구현 | 2일 | 백엔드 | P1 |
| Gap-2.2.2, Gap-2.3.1 | 목표 진척도 계산 알고리즘 | 1일 | 백엔드 | P1 |
| Gap-2.2.1 | growthReports 컬렉션 구현 | 2일 | 백엔드 | P1 |
| Gap-2.2.1 | 성장 리포트 생성 API 구현 | 1주 | 백엔드 | P1 |
| Gap-2.2.1 | 리포트 생성 알고리즘 구현 | 1주 | 백엔드 | P1 |

**Week 5-6: 분석 기능 강화**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-1.4.1 | 가독성 평가 알고리즘 구현 | 1주 | 백엔드 | P1 |
| Gap-2.4.2 | 성장 그래프 시각화 컴포넌트 | 1주 | 프론트엔드 | P1 |

**Week 7-8: 모바일 최적화**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-4.2.1 | 반응형 디자인 적용 | 1주 | 프론트엔드 | P1 |
| Gap-4.2.1 | 모바일 터치 제스처 최적화 | 1주 | 프론트엔드 | P1 |
| Gap-4.2.1 | 모바일 성능 최적화 | 1주 | 프론트엔드 | P1 |

**마일스톤**: M2 - 핵심 기능 완성 (2025.12.10)

**완료 기준**:
- 사용자별 DNA 프로파일링 동작 확인
- 성장 리포트 생성 및 조회 기능 동작 확인
- 목표 설정 및 진척도 추적 기능 동작 확인
- 모바일 환경에서 정상 동작 확인

#### 10.4.3 Phase 3: Medium 우선순위 Gap 해결 (3-6개월)

**Month 3-4: 검색 시스템**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-3.1.1 | Vertex AI Vector Search 통합 | 2주 | 백엔드 | P1 |
| Gap-3.1.1 | searchReferences API 기본 구조 구현 | 2주 | 백엔드 | P1 |
| Gap-3.1.1 | 키워드/이미지/DNA 기반 검색 구현 | 2주 | 백엔드 | P1 |

**마일스톤**: M4 - 검색 시스템 런칭 (2026.02.28)

**Month 5-6: 추천 시스템**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-3.2.1 | DNA 유사도 계산 알고리즘 구현 | 2주 | 백엔드 | P1 |
| Gap-3.2.1 | 추천 점수 계산 알고리즘 구현 | 2주 | 백엔드 | P1 |
| Gap-3.2.1 | getRecommendations API 구현 | 2주 | 백엔드 | P1 |
| Gap-3.2.1 | 추천 결과 시각화 컴포넌트 | 2주 | 프론트엔드 | P1 |

**마일스톤**: M5 - 추천 시스템 런칭 (2026.04.30)

**Medium 우선순위 항목 (병행 진행)**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-1.2.1 | 색상 팔레트 추출 기능 | 2주 | 백엔드 | P2 |
| Gap-1.4.3 | 피드백 원리 적용 로직 | 3주 | 백엔드 | P2 |
| Gap-2.5.1 | 비교 분석 기능 | 3주 | 백엔드/프론트엔드 | P2 |
| Gap-4.1.1 | 3-click 규칙 적용 | 1주 | 프론트엔드 | P2 |
| Gap-4.3.1 | 사용자 행동 추적 시스템 | 2주 | 백엔드/프론트엔드 | P2 |
| Gap-4.4.1 | 개인화 대시보드 | 3주 | 프론트엔드 | P2 |

**마일스톤**: M3 - 베타 테스트 준비 (2025.12.20)

#### 10.4.4 Phase 4: Low 우선순위 및 향후 기능 (6개월 이상)

**커뮤니티 기능**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-2.5.2 | 커뮤니티 피드백 시스템 설계 | 2주 | 기획/백엔드 | P3 |
| Gap-2.5.2 | 댓글/좋아요/공유 기능 구현 | 6주 | 백엔드/프론트엔드 | P3 |

**트렌드 수집 시스템**:

| Gap ID | 작업 내용 | 예상 소요 시간 | 담당 | 우선순위 |
|--------|----------|---------------|------|---------|
| Gap-3.3.1 | 외부 API 통합 (Behance, Pinterest) | 4주 | 백엔드 | P3 |
| Gap-3.3.1 | 트렌드 데이터 수집 파이프라인 | 4주 | 백엔드 | P3 |
| Gap-3.3.1 | 트렌드 분석 및 시각화 | 4주 | 백엔드/프론트엔드 | P3 |

**dysBlPrint 고급 기능**:
- Neo4j 그래프 데이터베이스 통합
- Vertex AI Vector Search 고급 기능
- K-means 클러스터링
- Dialogflow CX 통합
- Redis 캐싱 레이어
- BigQuery 분석
- WebGL 시각화
- XAI (Explainable AI)

#### 10.4.5 마일스톤 정의

**SRD Section 10.3의 마일스톤 반영**:

| 마일스톤 | 날짜 | 완료 기준 | 검증 방법 |
|---------|------|----------|----------|
| **M1: 프로덕션 보안 완료** | 2025.11.18 | Firebase Authentication 통합 및 보안 규칙 강화 완료 | 보안 규칙 테스트 통과, 인증 플로우 E2E 테스트 통과 |
| **M2: 핵심 기능 완성** | 2025.12.10 | 사용자 프로파일링, 목표 설정, 성장 리포트 구현 완료 | 기능별 통합 테스트 통과, 사용자 시나리오 테스트 통과 |
| **M3: 베타 테스트 준비** | 2025.12.20 | 모바일 최적화 완료 및 베타 테스트 환경 구축 | 모바일 테스트 통과, 베타 테스트 체크리스트 완료 |
| **M4: 검색 시스템 런칭** | 2026.02.28 | AI 기반 검색 시스템 구현 완료 | 검색 정확도 테스트 통과, 성능 테스트 통과 |
| **M5: 추천 시스템 런칭** | 2026.04.30 | 개인화 추천 시스템 구현 완료 | 추천 정확도 테스트 통과, 사용자 만족도 설문 통과 |

**마일스톤별 검증 방법**:
- **기능 테스트**: 각 기능의 정상 동작 확인
- **성능 테스트**: 목표 성능 달성 여부 확인
- **보안 테스트**: 보안 규칙 및 인증 플로우 검증
- **사용자 테스트**: 실제 사용자 시나리오 테스트

---

### 11.1 이미지 분석 요청 예제

**프론트엔드**:
```javascript
// components/UploadAnalysis.tsx
const handleSearch = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    // 문서 ID 생성
    const docId = `${Date.now()}_${Math.random().toString(36).substr(7)}`;
    setDocId(docId);
    
    // 파일명 생성
    const fileName = `${docId}.${getFileExtension(selectedFile.name)}`;
    
    // Firebase Storage 업로드
    const storageRef = ref(storage, `users/${userId}/analyses/${timestamp}_${fileName}`);
    await uploadBytes(storageRef, selectedFile);
    
    // Firestore 리스너가 자동으로 결과 수신
  } catch (error) {
    setError(`업로드 실패: ${error.message}`);
    setIsLoading(false);
  }
};
```

**백엔드**:
```javascript
// index.js
exports.analyzeImageOnUpload = onObjectFinalized(
  { cpu: 2, memory: "1GiB", timeoutSeconds: 540 },
  async (event) => {
    const filePath = event.data.name;
    
    // 이미지 다운로드 및 Base64 변환
    const file = bucket.file(filePath);
    const [fileBuffer] = await file.download();
    const base64Image = fileBuffer.toString('base64');
    
    // MultiLLM 분석 실행
    const orchestrator = new MultiLLMOrchestrator();
    await orchestrator.initialize();
    const result = await orchestrator.runParallelAnalysis(
      base64Image,
      mimeType
    );
    
    // Firestore 업데이트
    await db.collection('analyses').doc(documentId).update({
      status: 'completed',
      analysisResult: result.consolidated,
      summary: await generateNaturalLanguageSummary(result.consolidated)
    });
  }
);
```

---

### 11.2 벤치마크 점수 계산 예제

```javascript
// multiLLMOrchestrator.js
function calculateBenchmarkScores(results) {
  return results.map(result => {
    const accuracy = calculateAccuracy(result);
    const responseTime = result.performance.responseTime;
    const cost = result.performance.cost;
    
    return {
      model: result.model,
      metrics: {
        accuracy: accuracy,
        responseTime: responseTime,
        cost: cost,
        efficiency: calculateEfficiency(accuracy, responseTime, cost),
        totalScore: calculateBenchmarkScore(accuracy, responseTime, cost)
      }
    };
  });
}
```

---

### 11.3 모범 사례

**1. 에러 처리**:
```javascript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error: error.message });
  return { success: false, error: error.code };
}
```

**2. 비동기 처리**:
```javascript
// Promise.allSettled 사용 (일부 실패해도 계속 진행)
const results = await Promise.allSettled([
  operation1(),
  operation2(),
  operation3()
]);
```

**3. 리소스 정리**:
```javascript
// useEffect cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(query, callback);
  return () => unsubscribe(); // cleanup
}, []);
```

---

## 13. Gap 해결 방안

**SRD 참조**: Section 5.2 (Gap 분석)  
**목적**: SRD에서 식별된 모든 Gap 항목에 대한 해결 방안을 상세히 명세

본 섹션은 SRD의 Gap 분석을 바탕으로 각 Gap 항목의 해결 방안을 우선순위별로 정리합니다. 각 Gap 항목에 대해 현재 구현 상태, 해결 방안, 구현 우선순위, 예상 소요 시간, 의존성 관계, 참조 섹션을 제공합니다.

### 13.1 Critical Gap (P0)

#### Gap-NFR-2.1: 인증 시스템 부재

**SRD 참조**: Section 3.2.1, Gap-NFR-2.1  
**현재 상태**: Section 8.1 참조  
**해결 방안**: Section 8.1.1, 8.1.2, 8.1.3 참조  
**구현 우선순위**: P0 (즉시)  
**예상 소요 시간**: 2주  
**의존성**: 없음 (최우선 구현)  
**영향도**: 매우 높음 (프로덕션 배포 전 필수)

**해결 방안 요약**:
- Firebase Authentication 통합
- Firestore Security Rules 강화
- Storage Security Rules 강화
- 마이그레이션 계획 수립

---

### 13.2 High 우선순위 Gap (P1)

#### Gap-1.3.1: 사용자별 DNA 프로파일링 부재

**SRD 참조**: Section 2.1.3, Gap-1.3.1  
**현재 상태**: Section 3.1.8 (스키마만 정의됨)  
**해결 방안**: Section 4.8 참조  
**구현 우선순위**: P1  
**예상 소요 시간**: 3주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요)  
**영향도**: 높음 (핵심 기능)

**해결 방안 요약**:
- `userProfiles` 컬렉션 스키마 구현
- DNA 프로파일 업데이트 알고리즘 구현
- `analyzeImageOnUpload` 완료 후 프로파일 업데이트 트리거

#### Gap-1.3.2: DNA 변화 추적 기능 부재

**SRD 참조**: Section 2.1.3, Gap-1.3.2  
**현재 상태**: 미구현  
**해결 방안**: 
- `userProfiles` 컬렉션에 `history` 필드 추가하여 DNA 변화 이력 저장
- 시계열 데이터 시각화 컴포넌트 구현
**구현 우선순위**: P1  
**예상 소요 시간**: 2주  
**의존성**: Gap-1.3.1 (DNA 프로파일링 필요)  
**영향도**: 중간

#### Gap-1.4.1: 가독성 평가 체계 부재

**SRD 참조**: Section 2.1.4, Gap-1.4.1  
**현재 상태**: Section 4.9 참조 (향후 구현)  
**해결 방안**: Section 4.9 참조  
**구현 우선순위**: P1  
**예상 소요 시간**: 2주  
**의존성**: 없음  
**영향도**: 높음

**해결 방안 요약**:
- OCR을 통한 텍스트 추출
- 폰트 크기 및 대비 분석
- 가독성 점수 계산 알고리즘
- 개선 권장사항 생성

#### Gap-2.2.1: 성장 리포트 생성 시스템 부재

**SRD 참조**: Section 2.2.2, Gap-2.2.1  
**현재 상태**: Section 2.1.5 참조 (향후 구현)  
**해결 방안**: Section 2.1.5, 3.1.7, 4.6 참조  
**구현 우선순위**: P1  
**예상 소요 시간**: 3주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요), Gap-1.3.1 (DNA 프로파일링 필요)  
**영향도**: 높음 (핵심 기능)

**해결 방안 요약**:
- `generateGrowthReport` API 구현
- `growthReports` 컬렉션 스키마 구현
- 리포트 생성 알고리즘 구현
- 리포트 템플릿 구조 정의

#### Gap-2.2.2, Gap-2.3.1: 목표 설정 기능 부재

**SRD 참조**: Section 2.2.3, Gap-2.2.2, Gap-2.3.1  
**현재 상태**: Section 2.1.6, 2.1.7 참조 (향후 구현)  
**해결 방안**: Section 2.1.6, 2.1.7, 3.1.6, 4.7 참조  
**구현 우선순위**: P1  
**예상 소요 시간**: 1주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요)  
**영향도**: 높음 (핵심 기능)

**해결 방안 요약**:
- `setUserGoal` API 구현
- `getUserGoals` API 구현
- `userGoals` 컬렉션 스키마 구현
- 목표 진척도 계산 알고리즘 구현

#### Gap-2.4.1: 사용자별 시계열 추적 부재

**SRD 참조**: Section 2.2.4, Gap-2.4.1  
**현재 상태**: Section 3.1.2 (스키마만 정의됨)  
**해결 방안**: Section 4.8 참조 (DNA 프로파일 업데이트 시 이력 저장)  
**구현 우선순위**: P1  
**예상 소요 시간**: 2주  
**의존성**: Gap-1.3.1 (DNA 프로파일링 필요)  
**영향도**: 높음

**해결 방안 요약**:
- `userProfiles` 컬렉션에 `history` 필드 추가
- 분석 완료 시마다 메트릭 스냅샷 저장
- 시계열 데이터 쿼리 최적화

#### Gap-2.4.2: 성장 그래프 시각화 미완성

**SRD 참조**: Section 2.2.4, Gap-2.4.2  
**현재 상태**: 미구현  
**해결 방안**: 
- 프론트엔드에 시계열 차트 컴포넌트 추가 (Chart.js 또는 Recharts 사용)
- `growthReports` 데이터를 기반으로 그래프 생성
**구현 우선순위**: P1  
**예상 소요 시간**: 1주  
**의존성**: Gap-2.2.1 (성장 리포트 필요)  
**영향도**: 중간

#### Gap-3.1.1: 검색 시스템 부재

**SRD 참조**: Section 2.3.1, Gap-3.1.1  
**현재 상태**: Section 2.1.7 참조 (향후 구현)  
**해결 방안**: Section 2.1.7, 1.2.5 참조  
**구현 우선순위**: P1  
**예상 소요 시간**: 6주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요), Vertex AI Vector Search 도입 필요  
**영향도**: 높음

**해결 방안 요약**:
- Vertex AI Vector Search 통합
- `searchReferences` API 기본 구조 구현
- 키워드, 이미지, DNA 기반 검색 타입 지원

#### Gap-3.2.1: 추천 시스템 부재

**SRD 참조**: Section 2.3.2, Gap-3.2.1  
**현재 상태**: Section 2.1.8 참조 (향후 구현)  
**해결 방안**: Section 2.1.8, 4.12 참조  
**구현 우선순위**: P1  
**예상 소요 시간**: 8주  
**의존성**: Gap-1.3.1 (DNA 프로파일링 필요), Gap-3.1.1 (검색 시스템 필요)  
**영향도**: 높음

**해결 방안 요약**:
- DNA 유사도 계산 알고리즘 구현
- 추천 점수 계산 알고리즘 구현
- `getRecommendations` API 기본 구조 구현

#### Gap-4.2.1: 모바일 최적화 부족

**SRD 참조**: Section 2.4.2, Gap-4.2.1  
**현재 상태**: Section 5.2.3 참조 (부분 반영)  
**해결 방안**: Section 5.2.3 참조  
**구현 우선순위**: P1  
**예상 소요 시간**: 3주  
**의존성**: 없음  
**영향도**: 높음

**해결 방안 요약**:
- 반응형 디자인 가이드라인 적용
- 모바일 터치 제스처 최적화
- 모바일 성능 최적화 (이미지 리사이징, 레이지 로딩)

---

### 13.3 Medium 우선순위 Gap (P2)

#### Gap-1.2.1: 색상 팔레트 추출 기능 부재

**SRD 참조**: Section 2.1.2, Gap-1.2.1  
**현재 상태**: 미구현  
**해결 방안**: 
- 이미지 분석 시 주요 색상 추출 알고리즘 추가 (K-means 클러스터링)
- `analysisResult.metrics.color`에 팔레트 정보 추가
**구현 우선순위**: P2  
**예상 소요 시간**: 2주  
**의존성**: 없음  
**영향도**: 중간

#### Gap-1.2.2: 그리드 시스템 인식 기능 부재

**SRD 참조**: Section 2.1.2, Gap-1.2.2  
**현재 상태**: 미구현  
**해결 방안**: 
- 이미지 분석 시 그리드 라인 감지 알고리즘 추가 (Hough Transform 사용)
- 레이아웃 메트릭에 그리드 정렬도 추가
**구현 우선순위**: P2  
**예상 소요 시간**: 4주  
**의존성**: 없음  
**영향도**: 중간

#### Gap-1.4.2: 시선유도 분석 기능 부재

**SRD 참조**: Section 2.1.4, Gap-1.4.2  
**현재 상태**: Section 4.10 참조 (향후 구현)  
**해결 방안**: Section 4.10 참조  
**구현 우선순위**: P2  
**예상 소요 시간**: 6주  
**의존성**: 없음  
**영향도**: 중간

**해결 방안 요약**:
- Attention Map 생성 AI 모델 도입 또는 Eye-tracking 시뮬레이션
- 시각적 흐름 분석 알고리즘 구현
- 포인트 식별 및 시선 경로 시각화

#### Gap-1.4.3: 피드백 원리 적용 부재

**SRD 참조**: Section 2.1.4, Gap-1.4.3  
**현재 상태**: Section 4.11 참조 (향후 구현)  
**해결 방안**: Section 4.11 참조  
**구현 우선순위**: P2  
**예상 소요 시간**: 3주  
**의존성**: 없음  
**영향도**: 중간

**해결 방안 요약**:
- 디자인 원칙 체크리스트 정의
- 원칙 준수도 평가 알고리즘 구현
- 위반 항목 식별 및 개선 권장사항 생성

#### Gap-2.1.1: 액션 아이템 우선순위화 부재

**SRD 참조**: Section 2.2.1, Gap-2.1.1  
**현재 상태**: 미구현  
**해결 방안**: 
- 액션 아이템에 우선순위 점수 부여 (영향도 × 난이도)
- 우선순위별 정렬 기능 추가
**구현 우선순위**: P2  
**예상 소요 시간**: 1주  
**의존성**: 없음  
**영향도**: 낮음

#### Gap-2.5.1: 비교 분석 기능 부재

**SRD 참조**: Section 2.2.5, Gap-2.5.1  
**현재 상태**: 미구현  
**해결 방안**: 
- 사용자 간 분석 결과 비교 API 구현
- 비교 차트 컴포넌트 구현
**구현 우선순위**: P2  
**예상 소요 시간**: 3주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요)  
**영향도**: 중간

#### Gap-4.1.1: 3-click 규칙 미적용

**SRD 참조**: Section 2.4.1, Gap-4.1.1  
**현재 상태**: 미구현  
**해결 방안**: 
- 프론트엔드 네비게이션 구조 재설계
- 주요 기능을 3클릭 이내로 접근 가능하도록 최적화
**구현 우선순위**: P2  
**예상 소요 시간**: 1주  
**의존성**: 없음  
**영향도**: 중간

#### Gap-4.1.2: 법칙 기반 디자인 가이드라인 부재

**SRD 참조**: Section 2.4.1, Gap-4.1.2  
**현재 상태**: 미구현  
**해결 방안**: 
- 디자인 시스템 문서 작성
- 컴포넌트 라이브러리 가이드라인 정의
**구현 우선순위**: P2  
**예상 소요 시간**: 2주  
**의존성**: 없음  
**영향도**: 중간

#### Gap-4.3.1: 상세 사용자 행동 추적 부재

**SRD 참조**: Section 2.4.3, Gap-4.3.1  
**현재 상태**: 미구현  
**해결 방안**: 
- 사용자 이벤트 추적 시스템 구현 (Firebase Analytics 통합)
- 사용자 행동 데이터 수집 및 분석
**구현 우선순위**: P2  
**예상 소요 시간**: 2주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요)  
**영향도**: 중간

#### Gap-4.4.1: 개인화 대시보드 부재

**SRD 참조**: Section 2.4.4, Gap-4.4.1  
**현재 상태**: Section 5.2.2 (인터페이스만 정의됨)  
**해결 방안**: 
- 사용자 설정 컬렉션 생성 (`userSettings`)
- 대시보드 위젯 커스터마이징 기능 구현
**구현 우선순위**: P2  
**예상 소요 시간**: 3주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요)  
**영향도**: 중간

---

### 13.4 Low 우선순위 Gap (P3)

#### Gap-2.5.2: 커뮤니티 피드백 시스템 부재

**SRD 참조**: Section 2.2.5, Gap-2.5.2  
**현재 상태**: 미구현  
**해결 방안**: 
- 커뮤니티 기능 설계 (댓글, 좋아요, 공유)
- 사용자 간 상호작용 API 구현
**구현 우선순위**: P3  
**예상 소요 시간**: 8주  
**의존성**: Gap-NFR-2.1 (인증 시스템 필요)  
**영향도**: 낮음

#### Gap-3.3.1: 트렌드 수집 시스템 부재

**SRD 참조**: Section 2.3.3, Gap-3.3.1  
**현재 상태**: 미구현  
**해결 방안**: 
- 외부 디자인 플랫폼 API 통합 (Behance, Pinterest)
- 트렌드 데이터 수집 및 분석 파이프라인 구축
**구현 우선순위**: P3  
**예상 소요 시간**: 12주  
**의존성**: Gap-3.1.1 (검색 시스템 필요)  
**영향도**: 낮음

---

### 13.5 Gap 해결 우선순위 요약

| 우선순위 | Gap 수 | 예상 총 소요 시간 | 주요 항목 |
|---------|--------|------------------|----------|
| **P0 (Critical)** | 1 | 2주 | 인증 시스템 |
| **P1 (High)** | 10 | 25주 | DNA 프로파일링, 성장 리포트, 목표 설정, 검색/추천 시스템 |
| **P2 (Medium)** | 11 | 25주 | 디자인 법칙 평가, 비교 분석, 모바일 최적화 |
| **P3 (Low)** | 2 | 20주 | 커뮤니티 기능, 트렌드 수집 |

**총 예상 소요 시간**: 약 72주 (약 18개월)

**구현 전략**:
- Phase 1: Critical 항목 우선 구현 (2주)
- Phase 2: High 우선순위 항목 단계적 구현 (6개월)
- Phase 3: Medium 우선순위 항목 구현 (6개월)
- Phase 4: Low 우선순위 항목 및 향후 기능 (6개월 이상)

---

### 12.1 추적성 매트릭스

| BRD 요구사항 | SRD 요구사항 | TSD 명세 |
|-------------|-------------|----------|
| BR-1.1 (이미지 분석) | FR-1.1 | Section 3.1.1 |
| BR-1.2 (벤치마킹) | FR-1.2 | Section 3.1.3 |
| BR-2.1 (대화형 인터페이스) | FR-2.1 | Section 3.1.2 |
| BR-3.1 (실시간 업데이트) | NFR-1.1 | Section 2.2.1 |

---

### 12.2 용어 정의

- **MultiLLM**: 여러 LLM을 병렬로 실행하여 결과를 비교하는 시스템
- **벤치마크**: LLM의 성능(정확도, 응답시간, 비용)을 측정한 점수
- **메트릭 정규화**: 다양한 범위의 메트릭을 0-1 범위로 변환하는 과정
- **Sunburst**: 계층적 데이터를 시각화하는 차트 형식
- **상태 머신**: 유한한 상태와 전환 규칙으로 시스템 상태를 관리하는 방법

---

### 12.3 참조 문서

- **BRD.md**: 비즈니스 요구사항 정의
- **dys_SRD.md**: 시스템 요구사항 정의
- **SYSTEM_DEVELOPMENT_STATUS_REPORT.md**: 현재 개발 현황
- **dysBlPrint.md**: 장기 기술 청사진

---

---

## 📝 문서 히스토리

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2025.11.04 | 초기 TSD 문서 작성 | dys 팀 |
| 1.1 | 2025.01.19 | Firebase 인프라 설정 정보 추가 및 보안 규칙 상세 업데이트, Phase 0 완료 상태 반영, Storage 리전 정보 정정 (asia-northeast3 → us-east-1), 디렉토리 구조 병합 | dys 팀 |
| 1.2 | 2025.01.19 | API 명세에 구현 상태 필드 추가, 설계 완료 상태 명시 | dys 팀 |
| 1.3 | 2025.01.XX | 프로젝트명 통일 (DYSS → dysproto), 경로 수정 (dyss-7374 → dysproto), Storage 경로 수정 (images → users/analyses), Firestore 컬렉션명 수정 (image → analyses), 실제 구현된 15개 Cloud Functions API 명세 추가, 5개 Firestore 컬렉션 스키마 문서화, 코드 경로 수정 (functions/index.js → functions/src/index.ts, hosting/src → 실제 경로), Gap 분석 업데이트 | dys 팀 |

---

**문서 버전**: 1.3  
**최종 업데이트**: 2025년 1월 19일  
**작성자**: dys 팀  
**검토 상태**: SRD 정렬 완료, Gap 반영 완료, Phase 0 완료 반영
