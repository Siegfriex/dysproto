# CO-1016 CURATOR ODYSSEY: 데이터 모델 명세서

버전: 1.0  
최종 수정: 2025-01-XX  
작성자: Dr. Sarah Kim (Data Architect)  

## 목차

1. [데이터베이스 개요](#1-데이터베이스-개요)
2. [ER 다이어그램](#2-er-다이어그램)
3. [컬렉션 스키마 상세](#3-컬렉션-스키마-상세)
4. [인덱스 전략](#4-인덱스-전략)
5. [보안 규칙](#5-보안-규칙)
6. [ETL 파이프라인](#6-etl-파이프라인)
7. [데이터 품질 검증](#7-데이터-품질-검증)
8. [Mock 데이터 확장 전략](#8-mock-데이터-확장-전략)

---

## 1. 데이터베이스 개요

### 1.1 데이터베이스 유형

- **데이터베이스**: Firebase Firestore (NoSQL)
- **BigQuery 사용 여부**: 없음 (현재 프로젝트에서 미사용)
- **리전**: asia-northeast3 (서울)

### 1.2 컬렉션 구조

**총 12개 컬렉션:**

| 카테고리 | 컬렉션 수 | 컬렉션 목록 |
|---------|----------|------------|
| 원천 데이터 | 9개 | `entities`, `events`, `measures`, `axis_map`, `edges`, `sources`, `codebook`, `weights`, `snapshots` |
| 서빙 레이어 | 3개 | `artist_summary`, `timeseries`, `compare_pairs` |

### 1.3 데이터 흐름 개요

```
외부 API (Met/AIC/Artsy)
  ↓
fnEtlExtract (원본 수집)
  ↓
Cloud Storage (raw 데이터)
  ↓
fnEtlTransform (정제/정규화)
  ↓
Firestore 원천 컬렉션 (entities, events, measures)
  ↓
fnBatchNormalize (정규화)
  ↓
fnBatchWeightsApply (가중치 적용)
  ↓
artist_summary 컬렉션
  ↓
fnBatchTimeseries (시계열 집계)
  ↓
timeseries 컬렉션
  ↓
fnBatchComparePairs (비교 분석)
  ↓
compare_pairs 컬렉션
```

---

## 2. ER 다이어그램

### 2.1 전체 ER 다이어그램

```mermaid
erDiagram
    entities ||--o{ events : "participates"
    entities ||--o{ measures : "has"
    entities ||--o{ edges : "relates"
    
    events ||--o{ measures : "generates"
    events }o--|| sources : "references"
    
    measures }o--|| codebook : "uses"
    measures }o--|| weights : "applies"
    measures }o--|| axis_map : "mapped_to"
    
    measures ||--|| artist_summary : "aggregates_to"
    measures ||--|| timeseries : "converts_to"
    
    timeseries ||--|| compare_pairs : "compares"
    
    entities {
        string entity_id PK
        string identity_type
        array names_ko
        array names_en
        integer debut_year
        string career_status
    }
    
    events {
        string event_id PK
        string title
        string org
        date start_date
        string type
        array entity_participants
        string tier
    }
    
    measures {
        string measure_id PK
        string entity_id FK
        string axis
        string metric_code
        number value_raw
        number value_normalized
        string time_window
    }
    
    artist_summary {
        string artist_id PK
        object radar5
        object sunburst_l1
        string weights_version
        timestamp updated_at
    }
    
    timeseries {
        string timeseries_id PK
        string artist_id FK
        string axis
        array bins
        string version
    }
    
    compare_pairs {
        string pair_id PK
        string artistA_id FK
        string artistB_id FK
        string axis
        array series
        number abs_diff_sum
    }
```

### 2.2 핵심 관계 설명

**1. entities ↔ events (1:N)**
- 하나의 엔터티(작가)는 여러 이벤트에 참여 가능
- `events.entity_participants` 배열에 `entities.entity_id` 포함

**2. events → measures (1:N)**
- 하나의 이벤트는 여러 측정값(measures) 생성 가능
- 측정값은 `events.event_id` 참조

**3. measures → artist_summary (N:1)**
- 여러 측정값이 집계되어 하나의 `artist_summary` 문서 생성
- `fnBatchWeightsApply` 배치 함수로 집계

**4. measures → timeseries (N:1)**
- 여러 측정값이 시간축으로 집계되어 `timeseries` 문서 생성
- `fnBatchTimeseries` 배치 함수로 집계

**5. timeseries → compare_pairs (2:1)**
- 두 개의 `timeseries` 문서가 비교되어 하나의 `compare_pairs` 문서 생성
- `fnBatchComparePairs` 배치 함수로 생성

---

## 3. 컬렉션 스키마 상세

### 3.1 원천 데이터 컬렉션

#### 3.1.1 entities (엔터티 마스터)

**컬렉션 이름**: `entities`  
**기본 키**: `entity_id`  
**설명**: 작가, 기관 등 모든 엔터티의 마스터 정보

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `entity_id` | string | ✅ | 엔터티 고유 식별자 | `ARTIST_0005` |
| `identity_type` | string | ✅ | 엔터티 유형 | `artist`, `institution`, `gallery` |
| `names_ko` | array[string] | ❌ | 한국어 이름 배열 | `['양혜규', '양혜규 작가']` |
| `names_en` | array[string] | ❌ | 영어 이름 배열 | `['Haegue Yang', 'Yang Haegue']` |
| `alias` | array[string] | ❌ | 별칭 배열 | `['하이거 양', 'H.Yang']` |
| `external_ids` | object | ❌ | 외부 시스템 식별자 | `{viaf: '...', ulan: '...'}` |
| `debut_year` | integer | ✅ | 데뷔년도 (시계열 분석 기준점) | `1994` |
| `career_status` | string | ❌ | 활동 상태 | `active`, `inactive`, `deceased` |
| `metadata` | object | ❌ | 메타데이터 | `{created_at, updated_at, data_quality_score}` |

**데이터 타입 예시:**
```javascript
{
  entity_id: "ARTIST_0005",
  identity_type: "artist",
  names_ko: ["양혜규", "양혜규 작가"],
  names_en: ["Haegue Yang", "Yang Haegue"],
  alias: ["하이거 양"],
  external_ids: {
    viaf: "123456789",
    ulan: "500123456"
  },
  debut_year: 1994,
  career_status: "active",
  metadata: {
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-10-16T00:00:00Z",
    data_quality_score: 0.95
  }
}
```

#### 3.1.2 events (이벤트 원본)

**컬렉션 이름**: `events`  
**기본 키**: `event_id`  
**설명**: 전시, 수상 등 모든 발생 이벤트 원본

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `event_id` | string | ✅ | 이벤트 고유 식별자 | `2019-03-15+TATE+HAEGUE_YANG_SOLO` |
| `title` | string | ✅ | 이벤트 제목 | `Haegue Yang: ETA 1994-2018` |
| `org` | string | ✅ | 주최 기관명 | `Tate St Ives` |
| `start_date` | date | ✅ | 시작일 | `2019-03-15` |
| `end_date` | date | ❌ | 종료일 | `2019-06-15` |
| `venue_id` | string | ❌ | 장소 식별자 | `VENUE_TATE_ST_IVES` |
| `type` | string | ✅ | 이벤트 유형 | `exhibition`, `award`, `publication` |
| `entity_participants` | array[string] | ✅ | 참여 엔터티 ID 목록 | `['ARTIST_0005', 'CURATOR_001']` |
| `tier` | string | ❌ | 기관/이벤트 등급 | `S`, `A`, `B`, `C` |
| `geographical_scope` | string | ❌ | 지리적 범위 | `local`, `national`, `international` |

#### 3.1.3 measures (측정값)

**컬렉션 이름**: `measures`  
**기본 키**: `measure_id`  
**설명**: 이벤트로부터 추출된 개별 측정값 (분석의 원자 단위)

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `measure_id` | string | ✅ | 측정값 고유 식별자 | `M_ARTIST_0005_INST_001` |
| `entity_id` | string | ✅ | 대상 엔터티 ID | `ARTIST_0005` |
| `event_id` | string | ✅ | 관련 이벤트 ID | `2019-03-15+TATE+...` |
| `axis` | string | ✅ | 축 (제도/학술/담론/네트워크) | `제도`, `학술`, `담론`, `네트워크` |
| `metric_code` | string | ✅ | 지표 코드 (codebook 참조) | `INSTITUTION_SHOW`, `AWARD_PRIZE` |
| `value_raw` | number | ✅ | 원본 측정값 | `85.5` |
| `value_normalized` | number | ❌ | 정규화된 측정값 | `0.78` |
| `time_window` | string | ✅ | 시간 구간 (ISO 형식) | `2019-03 to 2019-06` |
| `source_id` | string | ❌ | 출처 ID (sources 참조) | `SOURCE_MET_001` |

### 3.2 서빙 레이어 컬렉션

#### 3.2.1 artist_summary (Phase 1 서빙)

**컬렉션 이름**: `artist_summary`  
**기본 키**: `artist_id`  
**설명**: Phase 1 레이더 + 선버스트 데이터

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `artist_id` | string | ✅ | 작가 ID | `ARTIST_0005` |
| `name` | string | ✅ | 작가 이름 | `양혜규` |
| `radar5` | object | ✅ | 5축 레이더 데이터 | `{I: 97.5, F: 90.0, A: 92.0, M: 86.0, Sedu: 9.8}` |
| `sunburst_l1` | object | ✅ | 4축 선버스트 L1 데이터 | `{제도: 91.2, 학술: 88.0, 담론: 86.0, 네트워크: 90.0}` |
| `weights_version` | string | ✅ | 가중치 버전 | `AHP_v1` |
| `updated_at` | timestamp | ✅ | 업데이트 시간 | `2024-10-16T00:00:00Z` |
| `is_temporary` | boolean | ❌ | 임시 데이터 플래그 | `true` (P1), `false` (P2) |
| `data_source` | string | ❌ | 데이터 소스 | `firestore_p2`, `p1_temp_collection` |

**데이터 타입 상세:**

**radar5 객체 구조:**
```typescript
{
  I: number;      // Institution (기관전시) - 0~100
  F: number;      // Fair (아트페어) - 0~100
  A: number;      // Award (시상) - 0~100
  M: number;      // Media (미디어) - 0~100
  Sedu: number;   // Seduction (교육) - 0~100
}
```

**sunburst_l1 객체 구조:**
```typescript
{
  제도: number;    // 제도적 성취 - 0~100
  학술: number;    // 학술적 성취 - 0~100
  담론: number;    // 담론적 성취 - 0~100
  네트워크: number; // 네트워크 성취 - 0~100
}
```

**예시 데이터:**
```javascript
{
  artist_id: "ARTIST_0005",
  name: "양혜규",
  radar5: {
    I: 97.5,
    F: 90.0,
    A: 92.0,
    M: 86.0,
    Sedu: 9.8
  },
  sunburst_l1: {
    제도: 91.2,
    학술: 88.0,
    담론: 86.0,
    네트워크: 90.0
  },
  weights_version: "AHP_v1",
  updated_at: "2024-10-16T00:00:00Z",
  is_temporary: false,
  data_source: "firestore_p2"
}
```

#### 3.2.2 timeseries (Phase 2 서빙)

**컬렉션 이름**: `timeseries`  
**기본 키**: `timeseries_id` (복합 키: `{artist_id}_{axis}`)  
**설명**: Phase 2 시계열 분석 데이터

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `timeseries_id` | string | ✅ | 시계열 ID (복합 키) | `ARTIST_0005_제도` |
| `artist_id` | string | ✅ | 작가 ID | `ARTIST_0005` |
| `axis` | string | ✅ | 축 (제도/학술/담론/네트워크) | `제도`, `학술`, `담론`, `네트워크` |
| `bins` | array[object] | ✅ | 시계열 데이터 배열 | `[{t: 0, v: 45.2}, {t: 1, v: 52.8}]` |
| `version` | string | ✅ | 데이터 버전 | `v1.0` |
| `debut_year` | integer | ✅ | 데뷔년도 (상대 시간축 기준점) | `1994` |
| `last_calculated` | timestamp | ✅ | 마지막 계산 시간 | `2024-10-16T00:00:00Z` |

**bins 배열 구조:**
```typescript
[
  {
    t: number;  // 상대 시간 (t = year - debut_year)
    v: number;  // 측정값 (0~100)
  }
]
```

**예시 데이터:**
```javascript
{
  timeseries_id: "ARTIST_0005_제도",
  artist_id: "ARTIST_0005",
  axis: "제도",
  bins: [
    {t: 0, v: 45.2},   // 데뷔년 (1994)
    {t: 5, v: 58.7},   // 1999년
    {t: 10, v: 72.3},  // 2004년
    {t: 15, v: 85.1},  // 2009년
    {t: 20, v: 91.2}   // 2014년
  ],
  version: "v1.0",
  debut_year: 1994,
  last_calculated: "2024-10-16T00:00:00Z"
}
```

#### 3.2.3 compare_pairs (Phase 3 서빙)

**컬렉션 이름**: `compare_pairs`  
**기본 키**: `pair_id` (복합 키: `{artistA_id}_{artistB_id}_{axis}`)  
**설명**: Phase 3 비교 분석 데이터

| 필드명 | 타입 | 필수 | 설명 | 예시 |
|--------|------|------|------|------|
| `pair_id` | string | ✅ | 비교 쌍 ID | `ARTIST_0005_ARTIST_0010_제도` |
| `artistA_id` | string | ✅ | 작가 A ID | `ARTIST_0005` |
| `artistB_id` | string | ✅ | 작가 B ID | `ARTIST_0010` |
| `axis` | string | ✅ | 축 | `제도`, `학술`, `담론`, `네트워크` |
| `series` | array[object] | ✅ | 비교 시계열 데이터 | `[{t, v_A, v_B, diff}]` |
| `abs_diff_sum` | number | ✅ | 절대 차이 합계 | `125.7` |
| `correlation` | number | ❌ | 상관계수 | `0.85` |
| `calculated_at` | timestamp | ✅ | 계산 시간 | `2024-10-16T00:00:00Z` |

**series 배열 구조:**
```typescript
[
  {
    t: number;    // 상대 시간
    v_A: number;  // 작가 A 측정값
    v_B: number;  // 작가 B 측정값
    diff: number; // 차이 (v_A - v_B)
  }
]
```

---

## 4. 인덱스 전략

### 4.1 Firestore Composite Index 정의

**인덱스 정의 파일**: `firestore.indexes.json`

#### 4.1.1 measures 컬렉션 인덱스

| 인덱스 이름 | 필드 조합 | 타입 | 용도 |
|-----------|----------|------|------|
| `measures_entity_axis_metric` | `entity_id` (ASC) + `axis` (ASC) + `metric_code` (ASC) | composite | 특정 작가의 특정 축/지표 조회 |
| `measures_entity_axis_time` | `entity_id` (ASC) + `axis` (ASC) + `time_window` (ASC) | composite | 시계열 집계 쿼리 최적화 |

**예시 쿼리:**
```javascript
// fnBatchTimeseries에서 사용
db.collection('measures')
  .where('entity_id', '==', 'ARTIST_0005')
  .where('axis', '==', '제도')
  .where('time_window', '>=', '2014-01')
  .orderBy('time_window')
```

#### 4.1.2 timeseries 컬렉션 인덱스

| 인덱스 이름 | 필드 조합 | 타입 | 용도 |
|-----------|----------|------|------|
| `timeseries_artist_axis` | `artist_id` (ASC) + `axis` (ASC) | composite | 특정 작가의 특정 축 시계열 조회 |

**예시 쿼리:**
```javascript
// getArtistTimeseries에서 사용
db.collection('timeseries')
  .where('artist_id', '==', 'ARTIST_0005')
  .where('axis', '==', '제도')
```

#### 4.1.3 compare_pairs 컬렉션 인덱스

| 인덱스 이름 | 필드 조합 | 타입 | 용도 |
|-----------|----------|------|------|
| `compare_pairs_pair_axis` | `pair_id` (ASC) + `axis` (ASC) | composite | 특정 비교 쌍의 특정 축 조회 |

#### 4.1.4 events 컬렉션 인덱스

| 인덱스 이름 | 필드 조합 | 타입 | 용도 |
|-----------|----------|------|------|
| `events_participants_date` | `entity_participants` (array_contains) + `start_date` (DESC) | composite | 특정 작가의 이벤트 시간순 조회 |

**예시 쿼리:**
```javascript
// Phase 2 EventTimeline에서 사용
db.collection('events')
  .where('entity_participants', 'array-contains', 'ARTIST_0005')
  .orderBy('start_date', 'desc')
```

### 4.2 인덱스 생성 방법

**방법 1: Firebase Console**
1. Firebase Console → Firestore → Indexes 탭
2. "Create Index" 클릭
3. 컬렉션 및 필드 선택
4. 인덱스 생성 대기 (수분~수십분 소요)

**방법 2: firestore.indexes.json 배포**
```bash
firebase deploy --only firestore:indexes
```

**방법 3: CLI로 직접 생성**
```bash
firebase firestore:indexes:create
```

---

## 5. 보안 규칙

### 5.1 Firestore Security Rules 구조

**파일 위치**: `firestore.rules`

### 5.2 컬렉션별 보안 규칙 테이블

| 컬렉션 | Read 권한 | Write 권한 | 설명 |
|--------|----------|-----------|------|
| `artist_summary` | 공개 (`allow read: if true`) | 배치 함수/관리자만 | Phase 1 공개 데이터 |
| `timeseries` | 공개 (`allow read: if true`) | 배치 함수/관리자만 | Phase 2 공개 데이터 |
| `compare_pairs` | 공개 (`allow read: if true`) | 배치 함수/관리자만 | Phase 3 공개 데이터 |
| `entities` | 인증된 사용자만 | 관리자/데이터 관리자만 | 원천 데이터 보호 |
| `events` | 인증된 사용자만 | 관리자/데이터 관리자만 | 원천 데이터 보호 |
| `measures` | 관리자/분석가만 | 관리자/배치 함수만 | 원천 데이터 보호 |
| `codebook` | 인증된 사용자만 | 관리자만 | 설정 데이터 |
| `weights` | 인증된 사용자만 | 관리자만 | 설정 데이터 |
| `axis_map` | 인증된 사용자만 | 관리자/배치 함수만 | 설정 데이터 |
| `edges` | 인증된 사용자만 | 관리자/데이터 관리자만 | 관계 데이터 |
| `sources` | 인증된 사용자만 | 관리자/데이터 관리자만 | 출처 메타데이터 |
| `snapshots` | 관리자/분석가만 | 관리자/배치 함수만 | 스냅샷 데이터 |

### 5.3 보안 함수 정의

**firestore.rules에 정의된 헬퍼 함수:**

```javascript
// 관리자 확인
function isAdmin() {
  return request.auth != null && 
         request.auth.token.admin == true;
}

// 배치 함수 확인
function isAuthorizedBatchFunction() {
  return request.auth != null && 
         request.auth.token.firebase.identities.service_account != null;
}

// 데이터 관리자 확인
function isAuthorizedDataManager() {
  return request.auth != null && 
         request.auth.token.role == 'data_manager';
}

// 분석가 확인
function isAuthorizedAnalyst() {
  return request.auth != null && 
         request.auth.token.role == 'analyst';
}

// 인증된 사용자 확인
function isAuthenticated() {
  return request.auth != null;
}
```

### 5.4 데이터 검증 함수

**measures 컬렉션 데이터 검증:**
```javascript
function isValidMeasureData(data) {
  return data.keys().hasAll(['measure_id', 'entity_id', 'axis', 'metric_code', 'value_raw']) &&
         data.value_raw is number &&
         data.value_raw >= 0 &&
         data.axis in ['제도', '학술', '담론', '네트워크'];
}
```

**artist_summary 컬렉션 일관성 검증:**
```javascript
function validateRadarSunburstConsistency(data) {
  let radarSum = data.radar5.I + data.radar5.F + data.radar5.A + data.radar5.M + data.radar5.Sedu;
  let sunburstSum = data.sunburst_l1.제도 + data.sunburst_l1.학술 + data.sunburst_l1.담론 + data.sunburst_l1.네트워크;
  // 간단한 매핑 규칙 적용 (정확한 계산은 백엔드에서)
  let mappedSum = sunburstSum * 0.9; // 예시 비율
  return abs(radarSum - mappedSum) <= 0.5; // ±0.5p 허용 오차
}
```

### 5.5 IAM 역할 매핑 테이블

| 역할 | 서비스 계정 | 권한 | 설명 |
|------|------------|------|------|
| 관리자 | `firebase-adminsdk-fbsvc@co-1016` | `roles/firebase.admin`, `roles/datastore.user` | 전체 권한 |
| 배치 함수 실행자 | `co-function-runner@co-1016` | `roles/datastore.user`, `roles/secretmanager.secretAccessor` | 배치 함수 실행 |
| 데이터 관리자 | (사용자 계정) | `roles/datastore.user` (커스텀) | 원천 데이터 관리 |
| 분석가 | (사용자 계정) | `roles/datastore.user` (커스텀) | 데이터 분석 |

---

## 6. ETL 파이프라인

### 6.1 ETL 아키텍처

```mermaid
graph LR
    A[외부 API] --> B[fnEtlExtract]
    B --> C[Cloud Storage<br/>raw/]
    C --> D[fnEtlTransform]
    D --> E[Firestore<br/>원천 컬렉션]
    E --> F[fnBatchNormalize]
    F --> G[fnBatchWeightsApply]
    G --> H[artist_summary]
    E --> I[fnBatchTimeseries]
    I --> J[timeseries]
```

### 6.2 fnEtlExtract (원본 수집)

**목적**: 외부 API(Met/AIC/Artsy)에서 원본 데이터 수집

**입력:**
- 외부 API 엔드포인트
- Secret Manager API 키

**출력:**
- Cloud Storage `gs://co-1016.appspot.com/raw/{provider}/{date}/` 경로에 JSON 파일 저장

**스크립트 템플릿:**

```javascript
// functions/src/etl/fnEtlExtract.js
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { Storage } = require('@google-cloud/storage');
const { loadAppConfig } = require('../services/configLoader');
const axios = require('axios');

exports.fnEtlExtract = onSchedule({
  schedule: '0 3 * * *', // 매일 03:00 JST
  timeZone: 'Asia/Tokyo',
  region: 'asia-northeast3'
}, async (event) => {
  const storage = new Storage();
  const bucket = storage.bucket('co-1016.appspot.com');
  const config = await loadAppConfig();
  
  const providers = ['met', 'aic', 'artsy'];
  
  for (const provider of providers) {
    try {
      console.log(`📥 ${provider} API 수집 시작...`);
      
      // API 키 로드
      const apiKey = await getSecret(`external-apis/${provider}-api-key`);
      
      // API 호출 (스로틀링 적용)
      const data = await fetchWithRetry(provider, apiKey, {
        maxRetries: 3,
        backoff: 'exponential',
        maxDelay: 10000
      });
      
      // Cloud Storage에 저장
      const today = new Date().toISOString().split('T')[0];
      const filePath = `raw/${provider}/${today}/data.json`;
      const file = bucket.file(filePath);
      
      await file.save(JSON.stringify(data, null, 2), {
        metadata: {
          contentType: 'application/json',
          metadata: {
            provider,
            extracted_at: new Date().toISOString(),
            record_count: data.length
          }
        }
      });
      
      console.log(`✅ ${provider} 데이터 저장 완료: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ ${provider} 수집 실패:`, error);
      // 에러 로깅 및 알림
    }
  }
});

async function fetchWithRetry(provider, apiKey, options) {
  // 스로틀링 및 재시도 로직
  // ...
}
```

### 6.3 fnEtlTransform (정제/정규화)

**목적**: raw 데이터를 Firestore 스키마에 맞게 변환

**입력:**
- Cloud Storage `raw/{provider}/{date}/data.json`

**출력:**
- Firestore 컬렉션: `entities`, `events`, `measures`

**스크립트 템플릿:**

```javascript
// functions/src/etl/fnEtlTransform.js
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { Storage } = require('@google-cloud/storage');
const { getFirestore } = require('firebase-admin/firestore');
const { createHash } = require('crypto');

exports.fnEtlTransform = onSchedule({
  schedule: '10 3 * * *', // 매일 03:10 JST (fnEtlExtract 이후)
  timeZone: 'Asia/Tokyo',
  region: 'asia-northeast3'
}, async (event) => {
  const storage = new Storage();
  const db = getFirestore();
  const bucket = storage.bucket('co-1016.appspot.com');
  
  const today = new Date().toISOString().split('T')[0];
  
  for (const provider of ['met', 'aic', 'artsy']) {
    try {
      const filePath = `raw/${provider}/${today}/data.json`;
      const file = bucket.file(filePath);
      
      if (!(await file.exists())[0]) {
        console.log(`⚠️ ${filePath} 파일 없음, 스킵`);
        continue;
      }
      
      const [fileContent] = await file.download();
      const rawData = JSON.parse(fileContent.toString());
      
      console.log(`🔄 ${provider} 데이터 변환 시작... (${rawData.length}건)`);
      
      // 배치로 Firestore에 저장
      const batch = db.batch();
      let batchCount = 0;
      
      for (const item of rawData) {
        // entities 매핑
        const entityId = generateEntityId(provider, item);
        const entityRef = db.collection('entities').doc(entityId);
        batch.set(entityRef, {
          entity_id: entityId,
          identity_type: 'artist',
          names_ko: extractKoreanNames(item),
          names_en: extractEnglishNames(item),
          debut_year: extractDebutYear(item),
          // ... 기타 필드
        }, { merge: true });
        
        // events 매핑
        const events = extractEvents(item);
        for (const event of events) {
          const eventId = generateEventId(event);
          const eventRef = db.collection('events').doc(eventId);
          batch.set(eventRef, {
            event_id: eventId,
            title: event.title,
            org: event.org,
            start_date: event.start_date,
            entity_participants: [entityId],
            // ... 기타 필드
          }, { merge: true });
          
          // measures 생성
          const measures = generateMeasures(entityId, eventId, event);
          for (const measure of measures) {
            const measureId = generateMeasureId(measure);
            const measureRef = db.collection('measures').doc(measureId);
            batch.set(measureRef, {
              measure_id: measureId,
              entity_id: entityId,
              event_id: eventId,
              axis: measure.axis,
              metric_code: measure.metric_code,
              value_raw: measure.value_raw,
              time_window: measure.time_window,
              // ... 기타 필드
            }, { merge: true });
          }
        }
        
        batchCount++;
        if (batchCount >= 500) { // Firestore 배치 제한
          await batch.commit();
          batchCount = 0;
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(`✅ ${provider} 변환 완료: ${rawData.length}건 처리`);
      
    } catch (error) {
      console.error(`❌ ${provider} 변환 실패:`, error);
    }
  }
});

function generateEntityId(provider, item) {
  const hash = createHash('sha256')
    .update(`${provider}:${item.external_id}`)
    .digest('hex')
    .substring(0, 8);
  return `ARTIST_${hash.toUpperCase()}`;
}

function generateEventId(event) {
  return `${event.start_date}+${event.org}+${event.title}`.replace(/[^a-zA-Z0-9+_-]/g, '_');
}

function generateMeasureId(measure) {
  return `M_${measure.entity_id}_${measure.axis}_${measure.time_window}`;
}
```

---

## 7. 데이터 품질 검증

### 7.1 ±0.5p 일관성 검증 공식

**검증 목적**: `artist_summary`의 `radar5` 합계와 `sunburst_l1`에서 변환한 합계의 차이가 ±0.5p 이내여야 함

**검증 공식:**

```
1. 레이더 5축 합계 계산:
   radarSum = Σ(radar5[I, F, A, M, Sedu])

2. 선버스트 4축 → 레이더 5축 변환:
   radar5FromSunburst = mapSunburstToRadar5(sunburst_l1)
   
   매핑 규칙:
   - I (Institution) = 제도 × 0.7
   - F (Fair) = 제도 × 0.3
   - A (Award) = 학술 × 0.6
   - M (Media) = 담론 × 0.8
   - Sedu (Seduction) = 학술 × 0.15
   
3. 변환된 레이더 합계:
   radar5FromSunburstSum = Σ(radar5FromSunburst[I, F, A, M, Sedu])

4. 차이 계산:
   difference = |radarSum - radar5FromSunburstSum|

5. 검증:
   isValid = difference ≤ 0.5
```

**수식 상세:**

```
radarSum = radar5.I + radar5.F + radar5.A + radar5.M + radar5.Sedu

radar5FromSunburstSum = 
  (sunburst_l1.제도 × 0.7) +      // I
  (sunburst_l1.제도 × 0.3) +      // F
  (sunburst_l1.학술 × 0.6) +      // A
  (sunburst_l1.담론 × 0.8) +      // M
  (sunburst_l1.학술 × 0.15)       // Sedu

= (sunburst_l1.제도 × 1.0) + 
  (sunburst_l1.학술 × 0.75) + 
  (sunburst_l1.담론 × 0.8)

difference = |radarSum - radar5FromSunburstSum|

isValid = difference ≤ 0.5
```

**코드 구현:**

```javascript
// src/utils/dataQualityValidator.js
performConsistencyCalculation(radar5, sunburst_l1) {
  // 1. 레이더 5축 합계
  const radarSum = Object.values(radar5).reduce((sum, value) => sum + (value || 0), 0);
  
  // 2. 선버스트 → 레이더 변환
  const radar5FromSunburst = {
    I: (sunburst_l1.제도 || 0) * 0.7,
    F: (sunburst_l1.제도 || 0) * 0.3,
    A: (sunburst_l1.학술 || 0) * 0.6,
    M: (sunburst_l1.담론 || 0) * 0.8,
    Sedu: (sunburst_l1.학술 || 0) * 0.15
  };
  
  // 3. 변환된 합계
  const radar5FromSunburstSum = Object.values(radar5FromSunburst).reduce(
    (sum, value) => sum + (value || 0), 0
  );
  
  // 4. 차이 계산
  const difference = Math.abs(radarSum - radar5FromSunburstSum);
  
  // 5. 검증
  const isConsistent = difference <= 0.5;
  
  return {
    valid: isConsistent,
    difference: difference,
    tolerance: 0.5,
    radar5_sum: radarSum,
    radar5FromSunburst_sum: radar5FromSunburstSum,
    detailed_analysis: {
      radar5_original: radar5,
      radar5_from_sunburst: radar5FromSunburst,
      sunburst_l1: sunburst_l1
    }
  };
}
```

### 7.2 검증 실행 시점

1. **배치 함수 실행 후**: `fnBatchWeightsApply` 완료 후 자동 검증
2. **데이터 로딩 시**: API 응답 데이터 검증 (선택적)
3. **CI/CD 파이프라인**: 배포 전 데이터 품질 체크

---

## 8. Mock 데이터 확장 전략

### 8.1 현재 상태

**현재 Mock 데이터:**
- 위치: `src/utils/mockData.js`
- 작가 수: 2명 (양혜규, 이우환)
- 데이터 형식: `artist_summary`, `sunburst`, `timeseries`, `comparison`

### 8.2 확장 목표

**100인 규모 데이터셋 생성**

### 8.3 데이터 생성 알고리즘

**스크립트 위치**: `scripts/generateMockData.js`

```javascript
// scripts/generateMockData.js
const fs = require('fs');
const path = require('path');

// 작가 이름 목록 (100명)
const artistNames = [
  // 한국 작가 50명
  '양혜규', '이우환', '백남준', '구본준', '김수자',
  // ... 95명 더
];

// 데이터 생성 함수
function generateMockArtistSummary(artistId, artistName, index) {
  // 데뷔년도 랜덤 생성 (1950-2010)
  const debutYear = 1950 + Math.floor(Math.random() * 60);
  
  // radar5 값 생성 (균등 분포 + 약간의 변동)
  const baseScore = 50 + (index % 50); // 50-100 범위
  const radar5 = {
    I: baseScore + (Math.random() * 20 - 10), // ±10 변동
    F: baseScore + (Math.random() * 20 - 10),
    A: baseScore + (Math.random() * 20 - 10),
    M: baseScore + (Math.random() * 20 - 10),
    Sedu: Math.random() * 20 // 0-20 범위
  };
  
  // sunburst_l1 생성 (radar5와 일관성 유지)
  const sunburst_l1 = {
    제도: (radar5.I + radar5.F) / 1.0, // 제도 = I + F
    학술: (radar5.A + radar5.Sedu) / 0.75, // 학술 = (A + Sedu) / 0.75
    담론: radar5.M / 0.8, // 담론 = M / 0.8
    네트워크: baseScore + (Math.random() * 20 - 10) // 독립 생성
  };
  
  // ±0.5p 일관성 검증
  const validator = new DataQualityValidator();
  const validation = validator.performConsistencyCalculation(radar5, sunburst_l1);
  
  if (!validation.valid) {
    // 재조정
    return generateMockArtistSummary(artistId, artistName, index);
  }
  
  return {
    artist_id: artistId,
    name: artistName,
    radar5,
    sunburst_l1,
    weights_version: 'AHP_v1',
    updated_at: new Date().toISOString(),
    debut_year: debutYear
  };
}

// 100인 데이터 생성
const mockData = {
  artists: [],
  timeseries: [],
  comparisons: []
};

for (let i = 0; i < 100; i++) {
  const artistId = `ARTIST_${String(i + 1).padStart(4, '0')}`;
  const artistName = artistNames[i];
  
  const summary = generateMockArtistSummary(artistId, artistName, i);
  mockData.artists.push(summary);
  
  // timeseries 생성 (각 축별)
  const axes = ['제도', '학술', '담론', '네트워크'];
  for (const axis of axes) {
    const bins = generateTimeseriesBins(summary.debut_year, axis);
    mockData.timeseries.push({
      artist_id: artistId,
      axis,
      bins
    });
  }
}

// 파일로 저장
fs.writeFileSync(
  path.join(__dirname, '../src/utils/mockData100.js'),
  `export const mockData100 = ${JSON.stringify(mockData, null, 2)};`
);
```

### 8.4 데이터 일관성 보장

**±0.5p 일관성 검증을 모든 생성 데이터에 적용:**

```javascript
// 생성된 모든 데이터 검증
const validationResults = mockData.artists.map(artist => {
  const validator = new DataQualityValidator();
  return validator.performConsistencyCalculation(artist.radar5, artist.sunburst_l1);
});

const failedValidations = validationResults.filter(r => !r.valid);
if (failedValidations.length > 0) {
  console.error(`❌ ${failedValidations.length}건의 일관성 검증 실패`);
  // 재생성 또는 수정
}
```

---

## 부록: 스키마 버전 관리

### 스키마 버전 히스토리

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| v1.0 | 2024-10-16 | 초기 스키마 설계 (Dr. Sarah Kim) |
| v1.1 | 2024-11-01 | `is_temporary` 필드 추가 (P1/P2 구분) |

### 스키마 변경 프로세스

1. 스키마 변경 제안 문서 작성
2. Dr. Sarah Kim 검토
3. `SCHEMA_DESIGN_GUIDE.js` 업데이트
4. 마이그레이션 스크립트 작성
5. 테스트 환경에서 검증
6. 프로덕션 배포

---

**문서 버전 관리:**
- v1.0 (2025-01-XX): 초기 작성
- 향후 업데이트: ETL 파이프라인 구현 완료 시 v1.1 업데이트 예정

