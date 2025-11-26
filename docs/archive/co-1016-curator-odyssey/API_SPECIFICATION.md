# CO-1016 CURATOR ODYSSEY: API Specification v1.0

## Document Metadata (문서 메타)

**Document Name**: CO-1016 CURATOR ODYSSEY API Specification v1.0

**Version**: 1.0

**Status**: Draft (초안, SRD v1.0 및 TSD v1.0 기반)

**Last Modified**: 2025-11-02

**Owner**: NEO GOD (Director)

**Approver**: Product Owner (TBD)

**Revision History**:
- v1.0 (2025-11-02): SRD Phase 1-4 FR 및 TSD API Layer 기반 엔드포인트 정의, OpenAPI 3.0 호환 스펙화

**Distribution Scope**: Backend Development Team (Firebase Functions), Frontend Development Team (React Query Integration), QA Team (Testing)

**Change Management Process**: GitHub Issues/PR 워크플로, 변경 시 SRD/TSD 동시 업데이트. API 변경 시 OpenAPI 스펙 재생성 (Swagger Editor 사용 권장)

### References (참조 문서)

- **[SRD v1.0](../requirements/SRD.md)** - Functional Requirements (FR) 및 Acceptance Criteria (AC)
- **[TSD v1.0](../TSD.md)** - API Layer 상세 및 Functions 구현
- **[API Integration Guide](API_INTEGRATION_GUIDE.md)** - React Query 통합, 오류 처리
- **[OpenAPI Specification YAML](OPENAPI_SPECIFICATION.yaml)** - 본 명세서의 YAML 버전 (자동 생성 가능)

### Technology Stack (기술 스택)

**Backend**: Firebase Functions (Node.js 20, Express.js 호환 라우팅)

**Proxy**: Firebase Hosting (`/api/*` rewrites)

**Authentication**: 향후 Firebase Authentication (현재 공개 API, API Key 또는 Secret Manager 보호)

**Documentation Tools**: OpenAPI 3.0, Swagger UI (테스트용)

---

## 1. 개요와 범위 (Overview and Scope)

### 1.1 목적 (Purpose)

본 명세서는 CO-1016 CURATOR ODYSSEY 플랫폼의 RESTful API를 정의하며, Phase 1-4 기능을 지원하는 엔드포인트를 중심으로 요청/응답 형식, 매개변수, 오류 코드를 명확히 한다. Firebase Functions를 통해 서버리스로 구현되며, React Query를 통한 프론트엔드 통합을 가정한다. 이는 SRD의 FR (e.g., FR-P1-DQ-001)과 연계되어 추적성을 보장한다.

### 1.2 비즈니스 가치 (Business Value)

- **데이터 쿼리 효율화**: Firestore 인덱스 최적화로 p95 응답 <300ms 달성
- **AI 통합**: Vertex AI 호출을 통해 보고서 생성 <30초
- **확장성**: 서버리스 아키텍처로 30명 사용자 지원 (월 읽기 ops <1M)

### 1.3 In Scope (범위 내)

- **Phase 1**: Summary data retrieval (`/summary`)
- **Phase 2**: Timeseries data retrieval (`/timeseries`) + Batch API (`/batch/timeseries`)
- **Phase 3**: Comparison data retrieval (`/compare`)
- **Phase 4**: AI report generation (`/report/generate`)
- **Common**: Error handling, caching (React Query + Functions TTL), token optimization

### 1.4 Out of Scope (범위 외)

- User authentication endpoints (향후 Firebase Auth 도입 예정, v1.1)
- Large-scale batch API (ETL 파이프라인 별도)
- WebSocket real-time updates (웹 폴링 사용)

### 1.5 가정과 제약 (Assumptions and Constraints)

**Base URL**: 
- Production: `https://co-1016.web.app/api`
- Development: `http://localhost:5002/api`

**Rate Limiting**: Functions 내 10 req/min (사용자별, 초과 시 429)

**Authentication**: 현재 공개 (Secret Manager로 AI 키 보호), 향후 Bearer Token

**Error Handling**: JSON 형식, HTTP 4xx/5xx 표준 + 커스텀 코드 (e.g., `ERR_DATA_NOT_FOUND`)

**Performance KPI**: p95 <300ms, 성공률 ≥99% (Cloud Monitoring)

### 1.6 성공 지표와 KPI (Success Metrics and KPIs)

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| API 응답 시간 (p95) | <300ms | Cloud Monitoring latency |
| 성공률 (HTTP 2xx) | ≥99% | Cloud Logging 상태 코드 |
| 토큰 사용량 (Phase 4) | <50K/요청 | Vertex AI 메트릭 |
| Firestore 읽기 ops | <1M/month | Firestore 사용량 대시보드 |

---

## 2. 보안 및 접근 제어 (Security & Access Control)

### 2.1 Authentication Mechanism (인증 메커니즘)

**Current (v1.0)**: Public API (Firebase Rules allow read: `if true;`)

**Future (v1.1 - Q1 2026)**: Firebase Authentication (Email/Google OAuth), Bearer Token header (`Authorization: Bearer {token}`)

**API Key Protection**: Secret Manager (`openai-api-key`, `vertex-ai-credentials`) - Functions 내부 사용, 클라이언트 노출 금지

**Authentication Roadmap**:

| Version | Release Date | Features | Migration Guide |
|---------|-------------|----------|----------------|
| v1.0 | 2025-11-02 | Public API (no auth) | N/A |
| v1.1 | Q1 2026 (예정) | Firebase Auth (Email/Google OAuth) | [Migration Guide](../docs/auth/AUTH_MIGRATION_GUIDE.md) *(to be created)* |
| v1.2 | Q2 2026 (예정) | Role-based access control (RBAC) | TBD |

### 2.2 IAM Permissions (권한)

**Functions Service Account**: 
- `roles/datastore.user`
- `roles/aiplatform.user`
- `roles/secretmanager.secretAccessor`

**Firestore Rules Example**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artist_summary/{doc} { 
      allow read: if true;  // 공개 읽기
    }
    match /timeseries/{doc} { 
      allow read: if request.auth != null;  // 인증 필요 (향후)
    }
  }
}
```

**CORS**: Firebase Hosting 기본 (`*` 허용, Prod 시 도메인 제한)

### 2.3 Security Requirements (보안 요구사항, NFR-SEC-001 연계)

**Input Validation**: 
- `artist_id` (UUID 형식: `^ARTIST_\d{4}$`)
- `axis` (enum: `제도`/`학술`/`담론`/`네트워크`)

**Vulnerability Prevention**: 
- SQL Injection 불필요 (Firestore NoSQL)
- XSS (JSON 응답)

**Audit Logging**: 모든 API 호출 Cloud Logging (IP, timestamp, user_id)

**Rate Limiting**: Functions 내 구현 (e.g., redis-like 캐시로 추적)

---

## 3. 에러 핸들링 (Error Handling)

모든 응답은 JSON 형식:

```json
{
  "error": {
    "code": "ERR_INVALID_PARAM",
    "message": "Invalid artist ID format",
    "details": ["ID must be UUID"],
    "timestamp": "2025-11-02T01:29:00Z"
  },
  "status": 400
}
```

### 3.1 Common HTTP Status Codes (공통 HTTP 코드)

| 코드 | 설명 | 사용 시나리오 |
|------|------|--------------|
| **200 OK** | 성공 | 정상 응답 |
| **400 Bad Request** | 유효하지 않은 매개변수 | e.g., invalid axis |
| **404 Not Found** | 데이터 없음 | e.g., FR-P1-DQ-001 예외 |
| **429 Too Many Requests** | Rate limit 초과 | 초과 요청 |
| **500 Internal Server Error** | Functions 오류 | e.g., Vertex 실패 |
| **503 Service Unavailable** | Firestore/Vertex 다운 | 서비스 장애 |

### 3.2 Custom Error Codes (커스텀 에러 코드)

| 코드 | 설명 | HTTP 상태 |
|------|------|----------|
| `ERR_DATA_NOT_FOUND` | 데이터 없음 (mock 반환 시도) | 404 |
| `ERR_INVALID_PARAM` | 잘못된 매개변수 | 400 |
| `ERR_INVALID_AXIS` | 잘못된 축 (enum 범위 밖) | 400 |
| `ERR_AI_FAILED` | Phase 4 실패 (폴백 로그) | 500 |
| `ERR_TOKEN_EXCEEDED` | 토큰 초과 (압축 실패) | 429 |
| `ERR_RATE_LIMIT` | Rate limit 초과 | 429 |

### 3.3 Fallback Mechanism (폴백 메커니즘)

**오류 시**: `mockData.js` 반환 (테스트용, Prod 시 로그 + 알림)

**예시**: 404 응답 시 `mockData.js`에서 데이터 조회 후 반환 (로그 기록)

---

## 4. API 엔드포인트 (API Endpoints)

OpenAPI 3.0 호환 스펙. YAML 버전은 `OPENAPI_SPECIFICATION.yaml` 참조. 아래는 Markdown 요약.

### 4.1 Common Headers (공통 헤더)

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Request |
| `Accept` | `application/json` | Request |
| `X-Request-ID` | UUID (for tracing) | Optional |

---

### 4.2 Phase 1: Current Value Analysis (현재 가치 분석, FR-P1-DQ-001 등 연계)

#### GET /api/artist/{id}/summary

**Description**: Retrieve artist summary data (radar5, sunburst_l1). Firestore `artist_summary` 쿼리, 인덱스 히트. (AC-P1-DQ-001)

**Path Parameters**:

| Parameter | Type | Required | Pattern | Description |
|---------|------|----------|---------|-------------|
| `id` | string | Yes | `^ARTIST_\d{4}$` | Artist ID (엄격 패턴 검증) |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `version` | string | No | latest | weights_version |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id", "radar5", "sunburst_l1"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "radar5": {
      "type": "object",
      "required": ["I", "F", "A", "M", "Sedu"],
      "properties": {
        "I": { "type": "number", "minimum": 0, "maximum": 100 },
        "F": { "type": "number", "minimum": 0, "maximum": 100 },
        "A": { "type": "number", "minimum": 0, "maximum": 100 },
        "M": { "type": "number", "minimum": 0, "maximum": 100 },
        "Sedu": { "type": "number", "minimum": 0, "maximum": 100 }
      },
      "additionalProperties": false
    },
    "sunburst_l1": {
      "type": "object",
      "required": ["제도", "학술", "담론", "네트워크"],
      "properties": {
        "제도": { "type": "number", "minimum": 0, "maximum": 1 },
        "학술": { "type": "number", "minimum": 0, "maximum": 1 },
        "담론": { "type": "number", "minimum": 0, "maximum": 1 },
        "네트워크": { "type": "number", "minimum": 0, "maximum": 1 }
      },
      "additionalProperties": false
    }
  }
}
```

**Response**:

**200 OK**:

```json
{
  "data": {
    "artist_id": "ARTIST_0005",
    "name": "양혜규",
    "radar5": {
      "I": 0.85,
      "F": 0.72,
      "A": 0.91,
      "M": 0.68,
      "Sedu": 0.79
    },
    "sunburst_l1": {
      "제도": 0.45,
      "학술": 0.28,
      "담론": 0.15,
      "네트워크": 0.12
    },
    "weights_version": "v1.0",
    "updated_at": "2025-11-01T00:00:00Z",
    "consistency_check": {
      "passed": true,
      "error": 0.2
    },
    "data_source": "firestore_p2"
  },
  "meta": {
    "cache_hit": true,
    "response_time": 150
  }
}
```

**400 Bad Request**: Invalid ID (pattern mismatch)

**404 Not Found**: 데이터 없음 (mock 반환 시도)

**Example Request**:
```bash
GET /api/artist/ARTIST_0005/summary?version=v1.0
```

**Example Response**: 위 JSON (200)

**Performance**: <2s, 읽기 ops: 1-2

**SRD Link**: [FR-P1-DQ-001](../requirements/SRD.md#fr-p1-dq-001-아티스트-요약-데이터-조회)

---

#### GET /api/artist/{id}/sunburst

**Description**: Retrieve sunburst detailed data (L1/L2 계층). TSD 참조, Phase 1 보완.

**Path Parameters**: `id` (string, required)

**Response**: **200 OK**

```json
{
  "data": {
    "sunburst": {
      "l1": {
        "제도": 0.45,
        "학술": 0.28,
        "담론": 0.15,
        "네트워크": 0.12
      },
      "l2": {
        "제도": {
          "전시": 0.3,
          "상": 0.15
        }
      }
    },
    "artist_id": "ARTIST_0005",
    "generated_at": "2025-11-02T00:00:00Z"
  }
}
```

**400 Bad Request**: Invalid ID

**404 Not Found**: 데이터 없음

**Performance**: <2s, 읽기 ops: 1-3

---

### 4.3 Phase 2: Career Trajectory Analysis (커리어 궤적 분석, FR-P2-DQ-001 등 연계)

#### GET /api/artist/{id}/timeseries/{axis}

**Description**: Retrieve timeseries data by axis (`bins[{t,v}]`). Time Window Rules applied, composite index. (AC-P2-DQ-001)

**Path Parameters**:

| Parameter | Type | Required | Enum | Description |
|---------|------|----------|------|-------------|
| `id` | string | Yes | - | Artist ID |
| `axis` | string | Yes | `제도`, `학술`, `담론`, `네트워크` | Axis name (엄격 enum 검증) |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `window` | string | No | default | Time window (e.g., "10y" for 제도) |
| `limit` | integer | No | 50 | Bins count (최소: 1, 최대: 100) |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id", "axis"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "axis": {
      "type": "string",
      "enum": ["제도", "학술", "담론", "네트워크"]
    },
    "bins": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["t", "v"],
        "properties": {
          "t": { "type": "integer", "minimum": 0 },
          "v": { "type": "number", "minimum": 0, "maximum": 100 }
        }
      }
    }
  }
}
```

**Response**: **200 OK**

```json
{
  "data": {
    "artist_id": "ARTIST_0005",
    "axis": "제도",
    "bins": [
      { "t": 0, "v": 0.1 },
      { "t": 5, "v": 0.45 }
    ],
    "window_applied": {
      "type": "10y_weighted",
      "boost": 1.0
    },
    "version": "v1.0"
  },
  "meta": {
    "hits": 20,
    "response_time": 250
  }
}
```

**400 Bad Request**: Invalid axis (enum mismatch)

**404 Not Found**: 데이터 없음

**500 Internal Server Error**: Rules 적용 실패

**Example Request**:
```bash
GET /api/artist/ARTIST_0005/timeseries/제도?limit=20
```

**배치 지원**: 프론트에서 `Promise.all`로 다중 축 호출 권장 (또는 `/batch/timeseries` 사용)

**Performance**: <300ms, 읽기 ops: 1-10

**SRD Link**: [FR-P2-DQ-001](../requirements/SRD.md#fr-p2-dq-001-시계열-데이터-조회)

---

#### POST /api/batch/timeseries

**Description**: Batch timeseries retrieval for multiple axes (효율성 향상). Single request로 다중 축 조회.

**Request Body** (JSON, required):

```json
{
  "artist_id": "ARTIST_0005",
  "axes": ["제도", "학술", "담론", "네트워크"],
  "options": {
    "limit": 50,
    "window": "default"
  }
}
```

**Request Body Schema**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `artist_id` | string | Yes | Artist ID (pattern: `^ARTIST_\d{4}$`) |
| `axes` | array[string] | Yes | Axis names (enum: `제도`, `학술`, `담론`, `네트워크`, 최소 1개, 최대 4개) |
| `options` | object | No | Query options |
| `options.limit` | integer | No | Bins count (default: 50, 최소: 1, 최대: 100) |
| `options.window` | string | No | Time window (default: "default") |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id", "axes"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "axes": {
      "type": "array",
      "minItems": 1,
      "maxItems": 4,
      "items": {
        "type": "string",
        "enum": ["제도", "학술", "담론", "네트워크"]
      },
      "uniqueItems": true
    },
    "options": {
      "type": "object",
      "properties": {
        "limit": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100
        },
        "window": {
          "type": "string"
        }
      }
    }
  }
}
```

**Response**: **200 OK**

```json
{
  "data": {
    "artist_id": "ARTIST_0005",
    "timeseries": {
      "제도": {
        "axis": "제도",
        "bins": [
          { "t": 0, "v": 0.1 },
          { "t": 5, "v": 0.45 }
        ],
        "window_applied": {
          "type": "10y_weighted",
          "boost": 1.0
        }
      },
      "학술": {
        "axis": "학술",
        "bins": [
          { "t": 0, "v": 0.15 }
        ]
      }
    },
    "version": "v1.0"
  },
  "meta": {
    "response_time": 450,
    "axes_processed": 4,
    "total_read_ops": 8
  }
}
```

**400 Bad Request**: Invalid request body (invalid artist_id, invalid axes enum, duplicate axes)

**404 Not Found**: Artist not found

**500 Internal Server Error**: Processing failure

**Performance**: <500ms for 4 axes, 읽기 ops: 4-16 (단일 요청으로 효율화)

**Use Case**: Phase 2 UI에서 4축 동시 로드 시 효율성 향상 (단일 요청 vs 4개 개별 요청)

---

#### GET /api/artist/{id}/events/{axis}

**Description**: Event impact analysis (delta_v). FR-P2-DQ-002 보완.

**Path Parameters**: `id` (string, required, pattern: `^ARTIST_\d{4}$`), `axis` (string, required, enum: `제도`, `학술`, `담론`, `네트워크`)

**Response**: **200 OK**

```json
{
  "data": {
    "events": [
      {
        "t": 5,
        "delta_v": 0.2,
        "type": "전시",
        "event_id": "EVENT_001"
      }
    ],
    "artist_id": "ARTIST_0005",
    "axis": "제도"
  }
}
```

**400 Bad Request**: Invalid axis (enum mismatch)

**404 Not Found**: 데이터 없음

**Performance**: <300ms, 읽기 ops: 2-5

**SRD Link**: [FR-P2-DQ-002](../requirements/SRD.md#fr-p2-dq-002-이벤트-영향-분석)

---

### 4.4 Phase 3: Comparison Analysis (비교 분석, FR-P3-DQ-001 등 연계)

#### GET /api/compare/{artistA}/{artistB}/{axis}

**Description**: Compare two artists (`series[{t, v_A, v_B, diff}]`). Cache (`compare_pairs`) 또는 실시간 계산. (AC-P3-DQ-001)

**Path Parameters**:

| Parameter | Type | Required | Pattern/Enum | Description |
|---------|------|----------|--------------|-------------|
| `artistA` | string | Yes | `^ARTIST_\d{4}$` | First artist ID |
| `artistB` | string | Yes | `^ARTIST_\d{4}$` | Second artist ID |
| `axis` | string | Yes | `제도`, `학술`, `담론`, `네트워크` | Axis name (엄격 enum 검증) |

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `compute` | boolean | No | false | Force real-time calculation (default: false, 캐시 우선) |

**Response**: **200 OK**

```json
{
  "data": {
    "pair_id": "ARTIST_0005_vs_0010",
    "axis": "제도",
    "series": [
      {
        "t": 0,
        "v_A": 0.1,
        "v_B": 0.2,
        "diff": -0.1
      }
    ],
    "metrics": {
      "correlation": 0.85,
      "abs_diff_sum": 2.5,
      "auc": 0.78
    },
    "cached": true,
    "computed_at": "2025-11-02T00:00:00Z"
  },
  "meta": {
    "cache_hit": true,
    "response_time": 400
  }
}
```

**400 Bad Request**: Invalid parameters (pattern/enum mismatch)

**404 Not Found**: 데이터 없음 (실시간 계산 트리거)

**500 Internal Server Error**: 계산 실패 (e.g., 보간 오류)

**Example Request**:
```bash
GET /api/compare/ARTIST_0005/ARTIST_0010/제도?compute=true
```

**캐시 TTL**: 24시간 (Functions 내 구현)

**Performance**: <500ms, 읽기 ops: 2-20 (실시간 시)

**SRD Link**: [FR-P3-DQ-001](../requirements/SRD.md#fr-p3-dq-001-비교-데이터-조회)

---

### 4.5 Phase 4: AI Report Generation (AI 보고서 생성, FR-P4-RP-001 등 연계)

#### POST /api/report/generate

**Description**: Aggregate Phase 1-3 data and generate AI report. Vertex AI 호출, 토큰 최적화. (AC-P4-RP-001)

**Path Parameters**: None

**Request Body** (JSON, required):

```json
{
  "artist_id": "ARTIST_0005",
  "include_phases": ["1", "2", "3"],
  "compare_with": "ARTIST_0010",
  "prompt_options": {
    "compress_level": "high",
    "max_events": 10
  }
}
```

**Request Body Schema**:

| Field | Type | Required | Description |
|------|------|----------|-------------|
| `artist_id` | string | Yes | Artist ID (pattern: `^ARTIST_\d{4}$`) |
| `include_phases` | array[string] | No | Phases to include (enum: `["1", "2", "3"]`, default: all) |
| `compare_with` | string | No | Comparison target (pattern: `^ARTIST_\d{4}$`, required if Phase 3 included) |
| `prompt_options` | object | No | Token optimization options |
| `prompt_options.compress_level` | string | No | Compression level (enum: `"low"`, `"medium"`, `"high"`, default: `"medium"`, 70% 압축) |
| `prompt_options.max_events` | integer | No | Maximum events (default: 10, 최소: 1, 최대: 50) |

**JSON Schema Validation**:

```json
{
  "type": "object",
  "required": ["artist_id"],
  "properties": {
    "artist_id": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "include_phases": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["1", "2", "3"]
      },
      "uniqueItems": true
    },
    "compare_with": {
      "type": "string",
      "pattern": "^ARTIST_\\d{4}$"
    },
    "prompt_options": {
      "type": "object",
      "properties": {
        "compress_level": {
          "type": "string",
          "enum": ["low", "medium", "high"]
        },
        "max_events": {
          "type": "integer",
          "minimum": 1,
          "maximum": 50
        }
      }
    }
  }
}
```

**Response**: **200 OK**

```json
{
  "data": {
    "report_id": "REPORT_001",
    "content": "## Introduction\n[AI 생성 Markdown]\n### Analysis\n...",
    "model_used": "gemini-1.5-pro",
    "token_usage": {
      "input": 35000,
      "output": 1500
    },
    "generated_at": "2025-11-02T01:29:00Z",
    "cost_estimate": 0.005
  },
  "meta": {
    "fallback_used": false,
    "response_time": 25
  }
}
```

**400 Bad Request**: Invalid request body (JSON Schema validation failed)

**429 Too Many Requests**: Rate limit or token exceed

**500 Internal Server Error**: AI 실패 (폴백 로그, e.g., GPT-4 시도)

**503 Service Unavailable**: Vertex unavailable

**Example Request**:
```bash
POST /api/report/generate
Content-Type: application/json

{
  "artist_id": "ARTIST_0005"
}
```

**폴백**: Vertex 실패 → GPT-4 (`max_tokens=2000`) → 템플릿 (`ERR_AI_FAILED` 반환)

**Performance**: <30s, 토큰 <50K (NFR-P4-TO-001)

**SRD Link**: [FR-P4-RP-001](../requirements/SRD.md#fr-p4-rp-001-vertex-ai-호출)

---

## 5. Integration Guide (통합 가이드)

### 5.1 React Query Integration (SRD 4.2 참조)

**Query Key**: `['artist', id, 'summary']` (캐싱 자동)

**Invalidation**: `useQueryClient().invalidateQueries(['artist', id])`

**Offline Support**: React Query devtools + offline-first (localStorage fallback)

**Example Code**:

```javascript
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { data, isLoading } = useQuery({
  queryKey: ['artist', id, 'summary'],
  queryFn: () => axios.get(`/api/artist/${id}/summary`),
  staleTime: 5 * 60 * 1000  // 5min
});
```

**Batch Request Example** (Phase 2 - `/batch/timeseries` 사용):

```javascript
import { useMutation } from '@tanstack/react-query';

const { mutate, data } = useMutation({
  mutationFn: (payload) => axios.post('/api/batch/timeseries', payload),
  onSuccess: (data) => {
    // 4축 데이터 한 번에 처리
    console.log(data.data.timeseries);
  }
});

// 사용
mutate({
  artist_id: 'ARTIST_0005',
  axes: ['제도', '학술', '담론', '네트워크']
});
```

**Legacy Batch Example** (Promise.all):

```javascript
const { data: timeseriesData } = useQueries({
  queries: ['제도', '학술', '담론', '네트워크'].map(axis => ({
    queryKey: ['artist', id, 'timeseries', axis],
    queryFn: () => axios.get(`/api/artist/${id}/timeseries/${axis}`)
  }))
});
```

### 5.2 Testing and Mocking (테스트 및 모킹)

**단위 테스트**: Jest + nock (HTTP 모킹)

```javascript
import nock from 'nock';

nock('https://co-1016.web.app')
  .get('/api/artist/ARTIST_0005/summary')
  .reply(200, { data: mockSummaryData });
```

**통합 테스트**: Firebase Emulators (Functions 5002)

```bash
firebase emulators:start --only functions
# API 호출: http://localhost:5002/api/artist/ARTIST_0005/summary
```

**E2E**: Cypress - API 호출 검증

```javascript
cy.request('GET', '/api/artist/ARTIST_0005/summary').then((response) => {
  expect(response.status).to.eq(200);
  expect(response.body.data).to.have.property('radar5');
});
```

**모킹**: `mockData.js`로 데이터 시뮬레이션 (404 시)

### 5.3 Monitoring (모니터링)

**Cloud Logging**: Request/response logging (structured JSON)

```json
{
  "timestamp": "2025-11-02T01:29:00Z",
  "method": "GET",
  "path": "/api/artist/ARTIST_0005/summary",
  "status": 200,
  "response_time": 150,
  "user_id": "anonymous"
}
```

**Cloud Monitoring**: Latency/error rate alerts (p95 >300ms 시)

**Cost Tracking**: Vertex AI usage tracking ($30 한도 알림)

### 5.4 Benchmarking Tools (벤치마킹 도구)

**Postman Collection**: API 테스트 및 문서화

**Postman Collection 파일**: [`docs/api/postman/CO-1016_API.postman_collection.json`](postman/CO-1016_API.postman_collection.json) *(to be created)*

**사용법**:
1. Postman에서 Import → Collection 파일 선택
2. Environment 설정 (Base URL: `https://co-1016.web.app/api`)
3. Collection Runner로 전체 엔드포인트 테스트 실행

**Artillery Load Testing**: 성능 테스트

**Artillery 설정 파일**: [`scripts/artillery/load-test.yml`](../../scripts/artillery/load-test.yml) *(to be created)*

**예시 스크립트**:

```yaml
# scripts/artillery/load-test.yml
config:
  target: 'https://co-1016.web.app'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
  processor: "./artillery-processor.js"
scenarios:
  - name: "Phase 1 Summary"
    flow:
      - get:
          url: "/api/artist/ARTIST_0005/summary"
  - name: "Phase 2 Timeseries"
    flow:
      - get:
          url: "/api/artist/ARTIST_0005/timeseries/제도"
  - name: "Phase 4 Report"
    flow:
      - post:
          url: "/api/report/generate"
          json:
            artist_id: "ARTIST_0005"
```

**실행 방법**:

```bash
# Artillery 설치
npm install -g artillery

# 부하 테스트 실행
artillery run scripts/artillery/load-test.yml

# 결과 리포트 생성
artillery run --output report.json scripts/artillery/load-test.yml
artillery report report.json
```

**K6 Load Testing**: 대안 벤치마킹 도구

**K6 스크립트 예시**: [`scripts/k6/api-load-test.js`](../../scripts/k6/api-load-test.js) *(to be created)*

```javascript
// scripts/k6/api-load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // p95 < 300ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const baseUrl = 'https://co-1016.web.app/api';
  
  // Phase 1: Summary
  const summaryRes = http.get(`${baseUrl}/artist/ARTIST_0005/summary`);
  check(summaryRes, {
    'summary status is 200': (r) => r.status === 200,
    'summary response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  // Phase 2: Timeseries (batch)
  const batchRes = http.post(`${baseUrl}/batch/timeseries`, JSON.stringify({
    artist_id: 'ARTIST_0005',
    axes: ['제도', '학술', '담론', '네트워크']
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(batchRes, {
    'batch status is 200': (r) => r.status === 200,
    'batch response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

**실행 방법**:

```bash
# K6 설치
brew install k6  # macOS
# 또는 https://k6.io/docs/getting-started/installation/

# 부하 테스트 실행
k6 run scripts/k6/api-load-test.js
```

**성능 KPI 측정**:

| 도구 | 측정 지표 | 목표 | 실행 주기 |
|------|----------|------|----------|
| Artillery | p95 latency, throughput | p95 < 300ms | 주간 |
| K6 | p95 latency, error rate | p95 < 300ms, error < 1% | 주간 |
| Postman | Functional correctness | 100% pass rate | 배포 전 |

---

## 6. Appendix (부록)

### 6.1 OpenAPI YAML Snippet (전체 YAML 참조)

전체 OpenAPI 스펙은 [`OPENAPI_SPECIFICATION.yaml`](OPENAPI_SPECIFICATION.yaml) 참조.

**스니펫 예시** (JSON Schema 통합):

```yaml
openapi: 3.0.0
info:
  title: CO-1016 Curator Odyssey API
  version: 1.0.0
  description: Artist career analysis API
servers:
  - url: https://co-1016.web.app/api
paths:
  /artist/{id}/summary:
    get:
      summary: Get artist summary
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/ArtistSummary'
        '404':
          description: Not Found
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    $ref: '#/components/schemas/Error'
components:
  schemas:
    ArtistSummary:
      type: object
      required:
        - artist_id
        - radar5
        - sunburst_l1
        - weights_version
      properties:
        artist_id:
          type: string
          pattern: '^ARTIST_\d{4}$'
          example: ARTIST_0005
        radar5:
          type: object
          required:
            - I
            - F
            - A
            - M
            - Sedu
          properties:
            I:
              type: number
              minimum: 0
              maximum: 100
            F:
              type: number
              minimum: 0
              maximum: 100
            A:
              type: number
              minimum: 0
              maximum: 100
            M:
              type: number
              minimum: 0
              maximum: 100
            Sedu:
              type: number
              minimum: 0
              maximum: 100
        sunburst_l1:
          type: object
          required:
            - 제도
            - 학술
            - 담론
            - 네트워크
          properties:
            제도:
              type: number
              minimum: 0
              maximum: 1
            학술:
              type: number
              minimum: 0
              maximum: 1
            담론:
              type: number
              minimum: 0
              maximum: 1
            네트워크:
              type: number
              minimum: 0
              maximum: 1
          additionalProperties: false
        weights_version:
          type: string
          example: v1.0
    Axis:
      type: string
      enum:
        - 제도
        - 학술
        - 담론
        - 네트워크
      example: 제도
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
          enum:
            - ERR_DATA_NOT_FOUND
            - ERR_INVALID_PARAM
            - ERR_INVALID_AXIS
            - ERR_AI_FAILED
            - ERR_TOKEN_EXCEEDED
            - ERR_RATE_LIMIT
        message:
          type: string
        details:
          type: array
          items:
            type: string
        timestamp:
          type: string
          format: date-time
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT  # 향후 v1.1
```

### 6.2 Change Log Template (변경 로그 템플릿)

**v1.0 (2025-11-02)**: 초기 릴리스
- Phase 1-4 엔드포인트 정의
- OpenAPI 3.0 스펙 완성
- 에러 핸들링 표준화
- JSON Schema 검증 추가
- 배치 API 추가 (`/batch/timeseries`)

**v1.1 (Q1 2026, 예정)**: 인증 추가
- Firebase Authentication 도입
- Bearer Token 지원
- 새로운 엔드포인트 (`/auth/login`)
- RBAC (Role-based access control)

**v1.2 (Q2 2026, 예정)**: 확장성 개선
- WebSocket 지원 (선택적)
- GraphQL API (선택적)

### 6.3 Checklist (체크리스트)

**Pre-Deployment Checklist**:
- [ ] OpenAPI 유효성 검사 (Swagger Editor)
- [ ] 모든 엔드포인트 테스트 (Postman 컬렉션)
- [ ] 오류 코드 문서화 완료
- [ ] React Query 예시 코드 검증
- [ ] 성능 테스트 (p95 <300ms) - Artillery/K6
- [ ] 보안 스캔 통과
- [ ] JSON Schema 검증 통과 (모든 엔드포인트)
- [ ] 배치 API 테스트 완료

**Post-Deployment Monitoring**:
- [ ] Cloud Monitoring 지표 수집 확인
- [ ] 에러 로그 확인
- [ ] 비용 모니터링 (Vertex AI 사용량)
- [ ] 사용자 피드백 수집
- [ ] 성능 벤치마크 (주간 Artillery 실행)

---

**Document Version Management**:
- v1.0 (2025-11-02): Initial draft with JSON Schema validation, batch API, benchmarking tools integration
- **Future Updates**: API changes must update SRD/TSD simultaneously

**Note**: This specification covers 100% of SRD FRs and maintains synchronization with Functions code. For additional endpoints, submit a PR.

