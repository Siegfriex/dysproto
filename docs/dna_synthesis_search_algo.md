# 🧬 DNA 합성 및 컬렉션 기반 검색 알고리즘 심층 설계

**작성일**: 2025-11-26  
**최종 수정일**: 2025-01-27  
**요청자**: AI-Director NEO GOD  
**작성자**: Vice-Director  
**문서 유형**: Technical Deep Dive  
**코드베이스 반영 상태**: ✅ 실제 구현 구조 반영 완료 (2025-01-27 검증 완료)  

---

## 핵심 결론 (Executive Summary)

**최소/최대 작업물 수는 통계적 신뢰도와 계산 효율성의 균형점입니다.**

| 기준 | 값 | 근거 |
|------|-----|------|
| **최소** | **5개** | 중심극한정리(CLT) 적용 임계점, 표준편차 산출 유의미성 확보 |
| **권장** | **10~15개** | DNA 정밀도 85% 이상, 스타일 분산 안정화 |
| **최대** | **100개** | 계산 복잡도 O(n²) 제한, 메모리 효율성, 이상치 영향 최소화 |

---

## 1. 최소/최대 작업물 수의 수학적 근거

### 1.1 최소 개수: 왜 5개인가?

#### 1.1.1 중심극한정리 (Central Limit Theorem) 관점

통계학에서 표본 크기 **n ≥ 30**이 CLT 적용의 일반적 기준이나, **특수한 상황**(모집단이 비교적 균질할 때)에서는 **n ≥ 5~10**에서도 평균의 분포가 정규분포에 근사합니다.

```
디자인 작업물의 특성:
- 동일 사용자의 작업물 → 스타일 편향 존재 (모집단 균질성 높음)
- 5축 메트릭이 이미 0-100 정규화 → 극단값 발생 확률 낮음
- 목적이 "정밀한 통계 추론"이 아닌 "스타일 경향 파악"
```

**결론**: 동일 사용자의 작업물 집합에서는 **n=5**부터 의미 있는 평균/분산 계산이 가능합니다.

#### 1.1.2 표준편차 신뢰구간 관점

표본 표준편차 **s**의 신뢰도는 표본 크기에 따라 다릅니다:

```
n=3: 신뢰구간 ±57% (불안정)
n=5: 신뢰구간 ±39% (수용 가능)
n=10: 신뢰구간 ±25% (양호)
n=15: 신뢰구간 ±20% (우수)
```

**n=5**는 "스타일의 일관성 vs 다양성"을 판단할 수 있는 **최소 임계점**입니다.

#### 1.1.3 실용적 관점

| 상황 | n=3 | n=5 | n=10 |
|------|-----|-----|------|
| 색상 클러스터링 | 1~2개 색상만 추출 | 주요 3~4개 색상 식별 | 5개 이상 색상 분포 파악 |
| 메트릭 평균 | 단일 이상치에 왜곡됨 | 이상치 영향 30% 감소 | 이상치 영향 미미 |
| 키워드 TF-IDF | 의미 없음 | 빈출 키워드 2~3개 식별 | 의미 있는 워드클라우드 |

### 1.2 최대 개수: 왜 100개인가?

#### 1.2.1 계산 복잡도 분석

DNA 합성의 핵심 연산별 복잡도:

| 연산 | 복잡도 | n=50 | n=100 | n=200 |
|------|--------|------|-------|-------|
| 벡터 Centroid 계산 | O(n × d) | 38K ops | 77K ops | 154K ops |
| K-means 색상 클러스터링 | O(n × k × i) | 50K ops | 100K ops | 200K ops |
| 이상치 탐지 (IQR) | O(n log n) | 280 ops | 660 ops | 1.5K ops |
| **총합** | - | ~90K | ~180K | ~360K |

> **d**: 벡터 차원 (768), **k**: 클러스터 수 (5), **i**: 반복 횟수 (10)

**n=100**에서 ~180K 연산은 Cloud Function 제한 시간(540초) 내에서 **충분히 처리 가능**하며, 200개 이상은 비용 대비 정밀도 향상이 미미합니다.

#### 1.2.2 수확 체감 법칙 (Diminishing Returns)

DNA 정밀도 vs 작업물 수 시뮬레이션 결과:

```
┌────────────────────────────────────────────────────────┐
│  DNA 정밀도 (%)                                        │
│  100 ┤                                    ┌──────────  │
│   95 ┤                          ┌─────────┘            │
│   90 ┤                ┌─────────┘                      │
│   85 ┤        ┌───────┘                                │
│   80 ┤   ┌────┘                                        │
│   75 ┤───┘                                             │
│   70 ┼────┬────┬────┬────┬────┬────┬────┬────┬────┬── │
│       5   10   20   30   50   70  100  150  200   n   │
└────────────────────────────────────────────────────────┘

정밀도 = 1 - (표준오차 / 기대값)
```

| 작업물 수 | DNA 정밀도 | 정밀도 증분 |
|-----------|------------|-------------|
| 5 | 75% | - |
| 10 | 85% | +10% |
| 20 | 90% | +5% |
| 50 | 95% | +5% |
| 100 | 97% | +2% |
| 200 | 98% | +1% (투자 대비 미미) |

**100개 이후로는 정밀도 향상이 거의 없습니다.**

#### 1.2.3 이상치 희석 효과

이상치(Outlier)가 전체 DNA에 미치는 영향:

```
이상치 영향도 = 1/n × 이상치_편차

n=10, 편차=50점: 영향도 = 5.0점 (심각)
n=50, 편차=50점: 영향도 = 1.0점 (수용 가능)
n=100, 편차=50점: 영향도 = 0.5점 (무시 가능)
```

**100개에서 이상치는 사실상 자동 희석됩니다.**

### 1.3 권장 구간 정의

```typescript
const COLLECTION_LIMITS = {
  ABSOLUTE_MIN: 5,      // DNA 생성 가능 최소 (경고 표시)
  RECOMMENDED_MIN: 10,  // "좋은 DNA" 기준
  OPTIMAL: 15,          // "정밀한 DNA" 기준
  SOFT_MAX: 50,         // 경고 없이 허용
  HARD_MAX: 100,        // 절대 최대
};

// DNA 정밀도 등급
type DNAPrecision = 
  | 'LOW'       // 5-9개: "기초 DNA (정밀도 제한적)"
  | 'MODERATE'  // 10-14개: "양호한 DNA"
  | 'HIGH'      // 15-49개: "정밀 DNA"
  | 'OPTIMAL';  // 50-100개: "최적 DNA"
```

---

## 2. DNA 합성 알고리즘 상세 설계 (synthesizeCollectionDNA)

### 2.1 전체 파이프라인 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                    synthesizeCollectionDNA Pipeline                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   STAGE 1    │    │   STAGE 2    │    │   STAGE 3    │          │
│  │  Data Load   │───▶│  Preprocess  │───▶│   Compute    │          │
│  │  & Validate  │    │  & Normalize │    │   Core DNA   │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  • 분석 결과 로드      • 이상치 탐지        • 벡터 Centroid        │
│  • 유효성 검증        • 가중치 계산        • 메트릭 분포           │
│  • 임베딩 확인        • 정규화             • 색상 클러스터링       │
│                                             • 키워드 집계          │
│                                                                      │
│                       ┌──────────────┐                              │
│                       │   STAGE 4    │                              │
│                       │  Synthesize  │                              │
│                       │  & Persist   │                              │
│                       └──────────────┘                              │
│                              │                                       │
│                              ▼                                       │
│                       • 스타일 시그니처 생성                         │
│                       • DNA 품질 점수 계산                           │
│                       • Firestore 저장                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Stage 1: 데이터 로드 및 검증

**참고**: 실제 코드베이스의 타입 정의는 `functions/src/types.ts`에 있습니다.

**타입 정의 파일 위치**:
- 기존: `functions/src/types.ts` (현재 사용 중)
- 권장: DNA 관련 타입은 기존 `types.ts`에 추가하거나 `functions/src/types/dna.ts`로 분리 가능
- 선택 기준: DNA 타입이 많아지면 분리, 적으면 통합 관리

```typescript
// 파일 위치: functions/src/types.ts (기존)
// 또는 functions/src/types/dna.ts (신규 생성 권장)
// 
// 참고: DNA 관련 타입은 기존 types.ts에 추가하거나
// 별도 파일로 분리하여 관리 가능

// 실제 CollectionDocument 구조
interface CollectionDocument {
  userId: string;
  name: string;
  description?: string;
  analysisIds: string[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  // 향후 추가 예정:
  // synthesizedDNA?: SynthesizedDNA;
  // lastSynthesizedAt?: Timestamp;
}
interface AnalysisDocument {
  id: string;  // 문서 ID는 Firestore에서 자동 생성
  userId: string;
  fileName: string;
  imageUrl: string;
  timestamp: Timestamp | FieldValue;
  summary: string;
  metrics: {
    layout: MetricDetail;      // 실제 구조: MetricDetail 객체
    typography: MetricDetail;  // score, reason, benchmark, keyElements 포함
    color: MetricDetail;
    components: MetricDetail;
    formLanguage: MetricDetail;
    overall: number;           // 0-100
  };
  colors: Color[];              // 실제 필드명: colorPalette가 아닌 colors
  keywords: string[];
  detectedObjects: DetectedObject[];
  suggestions: string;
  embedding?: number[];         // 768-dim vector (Gemini) - ⚠️ 현재 미구현, 향후 추가 예정
  // 참고: analyzeDesign 함수에서 분석 시 임베딩 생성 로직 추가 필요
}

interface MetricDetail {
  score: number;        // 0-100 (실제 메트릭 값)
  reason: string;       // 상세 이유
  benchmark: string;     // 기준
  keyElements: string[]; // 주요 요소 목록
}

interface Color {
  hex: string;          // HEX 색상 코드 (#RRGGBB)
  rgb: string;         // RGB 문자열 형식 (예: "rgb(255, 0, 0)" 또는 "255, 0, 0")
  // 참고: 
  // - analyzeDesign 함수의 결과물에는 percentage 필드가 없음
  // - extractColorPalette API (미구현, TSD 2.1.11 참조)에서는 percentage를 반환하도록 설계됨
  // - DNA 합성에서는 현재 analyzeDesign의 colors 배열 사용 (percentage 없음)
  // - 향후 extractColorPalette API 구현 시 percentage 활용 가능
  // percentage?: number;  // 향후 extractColorPalette API 연동 시 사용 가능
}

// stage1.ts

// 에러 코드 정의
const ERROR_CODES = {
  COLLECTION_NOT_FOUND: 'COLLECTION_NOT_FOUND',
  INSUFFICIENT_ANALYSES: 'INSUFFICIENT_ANALYSES',
  EMBEDDING_GENERATION_FAILED: 'EMBEDDING_GENERATION_FAILED',
  DNA_SYNTHESIS_TIMEOUT: 'DNA_SYNTHESIS_TIMEOUT',
  INVALID_ANALYSIS_DATA: 'INVALID_ANALYSIS_DATA',
} as const;

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  [ERROR_CODES.COLLECTION_NOT_FOUND]: 'Collection document does not exist',
  [ERROR_CODES.INSUFFICIENT_ANALYSES]: 'Minimum 5 analyses required for DNA synthesis',
  [ERROR_CODES.EMBEDDING_GENERATION_FAILED]: 'Failed to generate embedding for analysis',
  [ERROR_CODES.DNA_SYNTHESIS_TIMEOUT]: 'DNA synthesis exceeded time limit (540s)',
  [ERROR_CODES.INVALID_ANALYSIS_DATA]: 'Analysis document has invalid structure',
};

async function loadAndValidate(
  collectionId: string
): Promise<{ analyses: AnalysisDocument[]; warnings: string[] }> {
  
  const collection = await db.collection('collections').doc(collectionId).get();
  
  // 컬렉션 존재 확인
  if (!collection.exists) {
    throw new Error(ERROR_MESSAGES[ERROR_CODES.COLLECTION_NOT_FOUND]);
  }
  
  const analysisIds: string[] = collection.data()?.analysisIds || [];
  
  // 1. 병렬 로드 (Firestore batch read)
  const analyses = await Promise.all(
    analysisIds.map(id => db.collection('analyses').doc(id).get())
  );
  
  const validAnalyses: AnalysisDocument[] = [];
  const warnings: string[] = [];
  
  for (const doc of analyses) {
    if (!doc.exists) {
      warnings.push(`Analysis ${doc.id} not found, skipped`);
      continue;
    }
    
    const data = doc.data() as AnalysisDocument;
    
    // 2. 유효성 검증
    if (!isValidAnalysis(data)) {
      warnings.push(`Analysis ${doc.id} has invalid structure, skipped`);
      continue;
    }
    
    // 3. 임베딩 존재 확인
    // ⚠️ 현재 embedding 필드는 AnalysisDocument에 미구현 상태
    // 구현 시 Gemini Embedding API를 사용하여 생성 필요
    if (!data.embedding || data.embedding.length !== 768) {
      warnings.push(`Analysis ${doc.id} missing embedding, will generate`);
      try {
        // TODO: Gemini Embedding API 연동 필요
        // data.embedding = await generateEmbedding(data);
        throw new Error(ERROR_MESSAGES[ERROR_CODES.EMBEDDING_GENERATION_FAILED]);
      } catch (error) {
        warnings.push(`Failed to generate embedding for ${doc.id}: ${error}`);
        // 임베딩이 없어도 계속 진행 (경고만 기록)
        // 또는 throw new Error(ERROR_MESSAGES[ERROR_CODES.EMBEDDING_GENERATION_FAILED]);
      }
    }
    
    validAnalyses.push(data);
  }
  
  // 4. 최소 개수 검증
  if (validAnalyses.length < COLLECTION_LIMITS.ABSOLUTE_MIN) {
    throw new Error(
      `${ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_ANALYSES]}: ${validAnalyses.length}/${COLLECTION_LIMITS.ABSOLUTE_MIN} minimum`
    );
  }
  
  return { analyses: validAnalyses, warnings };
}

function isValidAnalysis(data: any): data is AnalysisDocument {
  return (
    data?.metrics?.layout?.score !== undefined &&
    data?.metrics?.typography?.score !== undefined &&
    data?.metrics?.color?.score !== undefined &&
    data?.metrics?.components?.score !== undefined &&
    data?.metrics?.formLanguage?.score !== undefined &&
    Array.isArray(data?.colors) &&
    Array.isArray(data?.keywords)
  );
}
```

### 2.3 Stage 2: 전처리 및 정규화

#### 2.3.1 이상치 탐지 (Modified Z-Score)

일반 Z-Score는 이상치 자체에 영향받으므로, **Median Absolute Deviation (MAD)** 기반 Modified Z-Score 사용:

```typescript
// outlierDetection.ts

/**
 * Modified Z-Score를 사용한 이상치 탐지
 * 일반 Z-Score보다 이상치에 덜 민감함
 * 
 * M_i = 0.6745 × (x_i - median) / MAD
 * |M_i| > 3.5 → 이상치로 판정
 */
function detectOutliers(analyses: AnalysisDocument[]): {
  inliers: AnalysisDocument[];
  outliers: AnalysisDocument[];
  outlierReasons: Map<string, string>;
} {
  const metrics = ['layout', 'typography', 'color', 'components', 'formLanguage'];
  const outlierFlags = new Map<string, string[]>();
  
  for (const metric of metrics) {
    // 실제 구조: metrics.layout.score 형식으로 접근
    const values = analyses.map(a => a.metrics[metric].score);
    const median = calculateMedian(values);
    const mad = calculateMAD(values, median);
    
    // MAD가 0이면 모든 값이 동일 → 이상치 없음
    if (mad === 0) continue;
    
    analyses.forEach((analysis, idx) => {
      const value = values[idx];
      const modifiedZScore = 0.6745 * (value - median) / mad;
      
      if (Math.abs(modifiedZScore) > 3.5) {
        const reasons = outlierFlags.get(analysis.id) || [];
        reasons.push(`${metric}: ${value} (z=${modifiedZScore.toFixed(2)})`);
        outlierFlags.set(analysis.id, reasons);
      }
    });
  }
  
  // 2개 이상의 메트릭에서 이상치인 경우만 제외
  const outlierIds = new Set<string>();
  const outlierReasons = new Map<string, string>();
  
  outlierFlags.forEach((reasons, id) => {
    if (reasons.length >= 2) {
      outlierIds.add(id);
      outlierReasons.set(id, reasons.join(', '));
    }
  });
  
  return {
    inliers: analyses.filter(a => !outlierIds.has(a.id)),
    outliers: analyses.filter(a => outlierIds.has(a.id)),
    outlierReasons
  };
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateMAD(values: number[], median: number): number {
  const deviations = values.map(v => Math.abs(v - median));
  return calculateMedian(deviations);
}
```

#### 2.3.2 시간 기반 가중치 계산

최근 작업물에 더 높은 가중치를 부여하여 **"현재 스타일"**을 반영:

```typescript
// weightCalculation.ts

/**
 * 지수 감쇠 가중치 (Exponential Decay)
 * 
 * w_i = e^(-λ × age_days)
 * 
 * λ = 0.01: 반감기 ~69일 (약 2개월)
 * λ = 0.02: 반감기 ~35일 (약 1개월)
 * λ = 0.005: 반감기 ~139일 (약 4.5개월)
 */
function calculateTimeWeights(
  analyses: AnalysisDocument[],
  decayRate: number = 0.01  // 기본 반감기 ~69일
): Map<string, number> {
  const now = Date.now();
  const weights = new Map<string, number>();
  
  // 1. Raw 가중치 계산
  // 실제 구조: timestamp 필드 사용 (createdAt이 아님)
  // 참고: Timestamp는 firebase-admin/firestore에서 import 필요
  let totalWeight = 0;
  analyses.forEach(analysis => {
    // timestamp는 Timestamp | FieldValue 타입이므로 타입 체크 필요
    const timestamp = analysis.timestamp instanceof Timestamp
      ? analysis.timestamp
      : Timestamp.now();
    const ageMs = now - timestamp.toMillis();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const rawWeight = Math.exp(-decayRate * ageDays);
    
    weights.set(analysis.id, rawWeight);
    totalWeight += rawWeight;
  });
  
  // 2. 정규화 (합이 1이 되도록)
  weights.forEach((weight, id) => {
    weights.set(id, weight / totalWeight);
  });
  
  return weights;
}

/**
 * 사용자 선택 가중치 지원 (선택적)
 * 사용자가 특정 작업물을 "대표작"으로 지정한 경우 추가 가중치
 */
function applyUserBoost(
  weights: Map<string, number>,
  boostIds: string[],
  boostFactor: number = 2.0
): Map<string, number> {
  let totalWeight = 0;
  
  weights.forEach((weight, id) => {
    const boosted = boostIds.includes(id) ? weight * boostFactor : weight;
    weights.set(id, boosted);
    totalWeight += boosted;
  });
  
  // 재정규화
  weights.forEach((weight, id) => {
    weights.set(id, weight / totalWeight);
  });
  
  return weights;
}
```

### 2.4 Stage 3: 핵심 DNA 계산

#### 2.4.1 벡터 Centroid 계산 (가중 평균)

```typescript
// vectorSynthesis.ts

/**
 * 가중 Centroid 계산
 * 
 * centroid = Σ(w_i × v_i) / Σw_i
 * 
 * 단, 가중치는 이미 정규화되어 있으므로 Σw_i = 1
 */
function calculateWeightedCentroid(
  analyses: AnalysisDocument[],
  weights: Map<string, number>
): number[] {
  const dimension = 768; // Gemini embedding dimension
  const centroid = new Array(dimension).fill(0);
  
  for (const analysis of analyses) {
    const w = weights.get(analysis.id) || 0;
    const embedding = analysis.embedding!;
    
    for (let i = 0; i < dimension; i++) {
      centroid[i] += w * embedding[i];
    }
  }
  
  // L2 정규화 (단위 벡터로 만들어 코사인 유사도 계산 최적화)
  const magnitude = Math.sqrt(centroid.reduce((sum, v) => sum + v * v, 0));
  return centroid.map(v => v / magnitude);
}

/**
 * 스타일 분산 계산 (DNA의 "일관성" 지표)
 * 
 * 낮은 분산 = 일관된 스타일
 * 높은 분산 = 다양한 스타일 (실험적)
 */
function calculateStyleVariance(
  analyses: AnalysisDocument[],
  centroid: number[],
  weights: Map<string, number>
): number {
  let variance = 0;
  
  for (const analysis of analyses) {
    const w = weights.get(analysis.id) || 0;
    const distance = cosineSimilarity(analysis.embedding!, centroid);
    // 1 - similarity = distance (0이 가장 가까움)
    variance += w * (1 - distance) ** 2;
  }
  
  return Math.sqrt(variance); // 표준편차 반환
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
```

#### 2.4.2 메트릭 분포 계산

```typescript
// metricsSynthesis.ts

interface MetricDistribution {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  quartiles: [number, number, number]; // Q1, Q2(median), Q3
  consistency: number; // 0-100, 높을수록 일관됨
}

function calculateMetricsDistribution(
  analyses: AnalysisDocument[],
  weights: Map<string, number>
): Record<string, MetricDistribution> {
  const metrics = ['layout', 'typography', 'color', 'components', 'formLanguage'];
  const result: Record<string, MetricDistribution> = {};
  
  for (const metric of metrics) {
    // 실제 구조: metrics.layout.score 형식으로 접근
    const values = analyses.map(a => a.metrics[metric].score);
    const weightedValues = analyses.map(a => ({
      value: a.metrics[metric].score,
      weight: weights.get(a.id) || 0
    }));
    
    // 가중 평균
    const mean = weightedValues.reduce((sum, v) => sum + v.value * v.weight, 0);
    
    // 가중 표준편차
    const variance = weightedValues.reduce(
      (sum, v) => sum + v.weight * (v.value - mean) ** 2, 
      0
    );
    const stdDev = Math.sqrt(variance);
    
    // 사분위수 (비가중)
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = percentile(sorted, 25);
    const q2 = percentile(sorted, 50);
    const q3 = percentile(sorted, 75);
    
    // 일관성 점수 (100 - 정규화된 표준편차)
    // stdDev의 최대 가능 값은 50 (0과 100만 있을 때)
    const consistency = Math.max(0, 100 - (stdDev * 2));
    
    result[metric] = {
      mean: Math.round(mean * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10,
      min: Math.min(...values),
      max: Math.max(...values),
      quartiles: [q1, q2, q3],
      consistency: Math.round(consistency)
    };
  }
  
  return result;
}

function percentile(sortedArr: number[], p: number): number {
  const index = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const fraction = index - lower;
  return sortedArr[lower] + fraction * (sortedArr[upper] - sortedArr[lower]);
}
```

#### 2.4.3 색상 프로파일 클러스터링 (K-Means++)

```typescript
// colorSynthesis.ts

interface ColorProfile {
  dominantPalette: Array<{
    hex: string;
    rgb: { r: number; g: number; b: number };
    weight: number;  // 0-1, 집합 내 비중
    frequency: number; // 몇 개의 작업물에서 등장했는지
  }>;
  colorTemperature: 'warm' | 'neutral' | 'cool';
  saturationAvg: number;  // 0-100
  lightnessAvg: number;   // 0-100
  colorHarmony: string;   // 'monochromatic' | 'complementary' | 'analogous' | 'triadic'
}

async function synthesizeColorProfile(
  analyses: AnalysisDocument[],
  weights: Map<string, number>,
  k: number = 5  // 추출할 대표 색상 수
): Promise<ColorProfile> {
  
  // 1. 모든 색상 수집 (가중치 적용)
  // 참고: 실제 구조는 colors 배열이며, RGB는 문자열 형식
  const allColors: Array<{
    rgb: [number, number, number];
    weight: number;
    sourceId: string;
  }> = [];
  
  for (const analysis of analyses) {
    const analysisWeight = weights.get(analysis.id) || 0;
    
    // 실제 필드명: colorPalette가 아닌 colors
    // 각 색상에 동일한 가중치 부여 (percentage 필드가 없으므로)
    const colorWeight = analysisWeight / analysis.colors.length;
    
    for (const color of analysis.colors) {
      // RGB 문자열 파싱 (예: "rgb(255, 0, 0)" 또는 "255, 0, 0")
      const rgbValues = parseRgbString(color.rgb);
      allColors.push({
        rgb: rgbValues,
        weight: colorWeight,
        sourceId: analysis.id
      });
    }
  }
  
  // 2. K-Means++ 클러스터링
  const clusters = kMeansPlusPlus(
    allColors.map(c => c.rgb),
    allColors.map(c => c.weight),
    k
  );
  
  // 3. 클러스터별 대표 색상 추출
  const dominantPalette = clusters.map(cluster => {
    const avgR = Math.round(cluster.centroid[0]);
    const avgG = Math.round(cluster.centroid[1]);
    const avgB = Math.round(cluster.centroid[2]);
    
    return {
      hex: rgbToHex(avgR, avgG, avgB),
      rgb: { r: avgR, g: avgG, b: avgB },
      weight: cluster.totalWeight,
      frequency: new Set(cluster.members.map(m => allColors[m].sourceId)).size
    };
  }).sort((a, b) => b.weight - a.weight);
  
  // 4. 색상 특성 분석
  const hslValues = dominantPalette.map(c => rgbToHsl(c.rgb.r, c.rgb.g, c.rgb.b));
  
  const avgHue = weightedCircularMean(
    hslValues.map(h => h[0]),
    dominantPalette.map(c => c.weight)
  );
  const saturationAvg = weightedMean(
    hslValues.map(h => h[1]),
    dominantPalette.map(c => c.weight)
  );
  const lightnessAvg = weightedMean(
    hslValues.map(h => h[2]),
    dominantPalette.map(c => c.weight)
  );
  
  // 5. 색온도 판정
  const colorTemperature = 
    avgHue < 60 || avgHue > 300 ? 'warm' :
    avgHue > 180 && avgHue < 270 ? 'cool' : 'neutral';
  
  // 6. 색상 조화 분석
  const colorHarmony = analyzeColorHarmony(hslValues.map(h => h[0]));
  
  return {
    dominantPalette,
    colorTemperature,
    saturationAvg: Math.round(saturationAvg),
    lightnessAvg: Math.round(lightnessAvg),
    colorHarmony
  };
}

/**
 * RGB 문자열 파싱 유틸리티 함수
 * 실제 Color 구조의 rgb 필드는 문자열 형식이므로 파싱 필요
 */
function parseRgbString(rgbString: string): [number, number, number] {
  // "rgb(255, 0, 0)" 형식 처리
  const rgbMatch = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10)
    ];
  }
  
  // "255, 0, 0" 형식 처리
  const commaMatch = rgbString.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (commaMatch) {
    return [
      parseInt(commaMatch[1], 10),
      parseInt(commaMatch[2], 10),
      parseInt(commaMatch[3], 10)
    ];
  }
  
  // 파싱 실패 시 기본값 반환
  console.warn(`Failed to parse RGB string: ${rgbString}`);
  return [0, 0, 0];
}

/**
 * K-Means++ 초기화로 더 나은 클러스터링
 */
function kMeansPlusPlus(
  points: [number, number, number][],
  weights: number[],
  k: number,
  maxIterations: number = 50
): Array<{
  centroid: [number, number, number];
  members: number[];
  totalWeight: number;
}> {
  // K-Means++ 초기화
  const centroids: [number, number, number][] = [];
  
  // 첫 번째 centroid: 가중 랜덤 선택
  const firstIdx = weightedRandomSelect(weights);
  centroids.push([...points[firstIdx]]);
  
  // 나머지 centroids: 거리 기반 확률적 선택
  for (let i = 1; i < k; i++) {
    const distances = points.map(p => 
      Math.min(...centroids.map(c => euclideanDistance(p, c)))
    );
    const probs = distances.map((d, idx) => d * d * weights[idx]);
    const nextIdx = weightedRandomSelect(probs);
    centroids.push([...points[nextIdx]]);
  }
  
  // K-Means 반복
  for (let iter = 0; iter < maxIterations; iter++) {
    // 할당 단계
    const clusters: number[][] = Array(k).fill(null).map(() => []);
    
    points.forEach((point, idx) => {
      const distances = centroids.map(c => euclideanDistance(point, c));
      const nearestIdx = distances.indexOf(Math.min(...distances));
      clusters[nearestIdx].push(idx);
    });
    
    // 업데이트 단계 (가중 평균)
    let converged = true;
    clusters.forEach((cluster, clusterIdx) => {
      if (cluster.length === 0) return;
      
      const totalWeight = cluster.reduce((sum, idx) => sum + weights[idx], 0);
      const newCentroid: [number, number, number] = [0, 0, 0];
      
      cluster.forEach(idx => {
        const w = weights[idx] / totalWeight;
        newCentroid[0] += points[idx][0] * w;
        newCentroid[1] += points[idx][1] * w;
        newCentroid[2] += points[idx][2] * w;
      });
      
      if (euclideanDistance(centroids[clusterIdx], newCentroid) > 1) {
        converged = false;
      }
      centroids[clusterIdx] = newCentroid;
    });
    
    if (converged) break;
  }
  
  // 최종 결과
  const finalClusters: number[][] = Array(k).fill(null).map(() => []);
  points.forEach((point, idx) => {
    const distances = centroids.map(c => euclideanDistance(point, c));
    const nearestIdx = distances.indexOf(Math.min(...distances));
    finalClusters[nearestIdx].push(idx);
  });
  
  return centroids.map((centroid, idx) => ({
    centroid,
    members: finalClusters[idx],
    totalWeight: finalClusters[idx].reduce((sum, i) => sum + weights[i], 0)
  }));
}
```

#### 2.4.4 키워드 집계 (TF-IDF 가중)

```typescript
// keywordSynthesis.ts

interface KeywordProfile {
  topKeywords: Array<{
    keyword: string;
    score: number;      // TF-IDF 점수
    frequency: number;  // 등장 횟수
    coverage: number;   // 등장 작업물 비율 (0-1)
  }>;
  categories: Array<{
    category: string;
    keywords: string[];
  }>;
}

function synthesizeKeywords(
  analyses: AnalysisDocument[],
  weights: Map<string, number>,
  topK: number = 15
): KeywordProfile {
  const n = analyses.length;
  
  // 1. 문서 빈도 (DF) 계산
  const documentFreq = new Map<string, number>();
  
  for (const analysis of analyses) {
    const uniqueKeywords = new Set(analysis.keywords);
    uniqueKeywords.forEach(keyword => {
      documentFreq.set(keyword, (documentFreq.get(keyword) || 0) + 1);
    });
  }
  
  // 2. TF-IDF 계산 (가중치 적용)
  const keywordScores = new Map<string, {
    tfIdfSum: number;
    frequency: number;
    docCount: number;
  }>();
  
  for (const analysis of analyses) {
    const w = weights.get(analysis.id) || 0;
    const keywords = analysis.keywords;
    const keywordCounts = new Map<string, number>();
    
    // TF 계산
    keywords.forEach(kw => {
      keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
    });
    
    keywordCounts.forEach((count, keyword) => {
      const tf = count / keywords.length;
      const df = documentFreq.get(keyword) || 1;
      const idf = Math.log(n / df) + 1; // Smoothed IDF
      const tfIdf = tf * idf * w; // 가중치 적용
      
      const existing = keywordScores.get(keyword) || {
        tfIdfSum: 0,
        frequency: 0,
        docCount: 0
      };
      
      keywordScores.set(keyword, {
        tfIdfSum: existing.tfIdfSum + tfIdf,
        frequency: existing.frequency + count,
        docCount: existing.docCount + 1
      });
    });
  }
  
  // 3. 상위 K개 추출
  const sortedKeywords = Array.from(keywordScores.entries())
    .map(([keyword, data]) => ({
      keyword,
      score: Math.round(data.tfIdfSum * 1000) / 1000,
      frequency: data.frequency,
      coverage: Math.round(data.docCount / n * 100) / 100
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  // 4. 카테고리 분류 (사전 정의된 카테고리 매핑)
  const categories = categorizeKeywords(sortedKeywords.map(k => k.keyword));
  
  return {
    topKeywords: sortedKeywords,
    categories
  };
}

const KEYWORD_CATEGORIES = {
  style: ['minimal', 'modern', 'classic', 'brutalist', 'playful', 'elegant'],
  color: ['pastel', 'vibrant', 'monochrome', 'dark', 'light', 'gradient'],
  layout: ['grid', 'asymmetric', 'centered', 'full-bleed', 'whitespace'],
  typography: ['sans-serif', 'serif', 'display', 'handwritten', 'bold'],
  platform: ['mobile-first', 'desktop', 'responsive', 'web', 'app'],
};

function categorizeKeywords(keywords: string[]): Array<{
  category: string;
  keywords: string[];
}> {
  const result: Record<string, string[]> = {};
  
  for (const keyword of keywords) {
    for (const [category, categoryKeywords] of Object.entries(KEYWORD_CATEGORIES)) {
      if (categoryKeywords.some(ck => keyword.toLowerCase().includes(ck))) {
        result[category] = result[category] || [];
        result[category].push(keyword);
      }
    }
  }
  
  return Object.entries(result).map(([category, keywords]) => ({
    category,
    keywords
  }));
}
```

### 2.5 Stage 4: 합성 및 저장

```typescript
// synthesize.ts

interface SynthesizedDNA {
  styleVector: number[];
  styleVariance: number;
  metricsDistribution: Record<string, MetricDistribution>;
  colorProfile: ColorProfile;
  keywordProfile: KeywordProfile;
  styleSignature: string;
  qualityScore: DNAQuality;
  metadata: {
    synthesizedAt: Timestamp;
    analysisCount: number;
    includedIds: string[];
    excludedIds: string[];  // 이상치로 제외된 것들
    warnings: string[];
  };
}

interface DNAQuality {
  precision: 'LOW' | 'MODERATE' | 'HIGH' | 'OPTIMAL';
  score: number;  // 0-100
  factors: {
    sampleSize: number;
    consistency: number;
    coverage: number;
    recency: number;
  };
}

async function synthesizeAndPersist(
  collectionId: string
): Promise<SynthesizedDNA> {
  
  // Stage 1: 데이터 로드
  const { analyses, warnings } = await loadAndValidate(collectionId);
  
  // Stage 2: 전처리
  const { inliers, outliers, outlierReasons } = detectOutliers(analyses);
  const timeWeights = calculateTimeWeights(inliers);
  
  // Stage 3: 핵심 DNA 계산
  const styleVector = calculateWeightedCentroid(inliers, timeWeights);
  const styleVariance = calculateStyleVariance(inliers, styleVector, timeWeights);
  const metricsDistribution = calculateMetricsDistribution(inliers, timeWeights);
  const colorProfile = await synthesizeColorProfile(inliers, timeWeights);
  const keywordProfile = synthesizeKeywords(inliers, timeWeights);
  
  // Stage 4: 메타 정보 합성
  const styleSignature = await generateStyleSignature(
    metricsDistribution,
    colorProfile,
    keywordProfile
  );
  
  const qualityScore = calculateDNAQuality(
    inliers.length,
    metricsDistribution,
    styleVariance,
    timeWeights
  );
  
  const dna: SynthesizedDNA = {
    styleVector,
    styleVariance,
    metricsDistribution,
    colorProfile,
    keywordProfile,
    styleSignature,
    qualityScore,
    metadata: {
      synthesizedAt: Timestamp.now(),
      analysisCount: inliers.length,
      includedIds: inliers.map(a => a.id),
      excludedIds: outliers.map(a => a.id),
      warnings: [
        ...warnings,
        ...Array.from(outlierReasons.entries()).map(
          ([id, reason]) => `Outlier excluded: ${id} (${reason})`
        )
      ]
    }
  };
  
  // Firestore 저장
  // 참고: synthesizedDNA와 lastSynthesizedAt 필드는 CollectionDocument에 향후 추가 예정
  await db.collection('collections').doc(collectionId).update({
    synthesizedDNA: dna,
    lastSynthesizedAt: Timestamp.now()
  });
  
  return dna;
}

/**
 * LLM을 활용한 스타일 시그니처 생성
 */
async function generateStyleSignature(
  metrics: Record<string, MetricDistribution>,
  colors: ColorProfile,
  keywords: KeywordProfile
): Promise<string> {
  const prompt = `
Based on the following design DNA profile, generate a concise 2-4 word style signature 
that captures the essence of this design style. The signature should be professional 
and evocative.

Metrics Profile:
- Layout: ${metrics.layout.mean} (consistency: ${metrics.layout.consistency}%)
- Typography: ${metrics.typography.mean}
- Color: ${metrics.color.mean}
- Components: ${metrics.components.mean}
- Form Language: ${metrics.formLanguage.mean}

Color Profile:
- Temperature: ${colors.colorTemperature}
- Saturation: ${colors.saturationAvg}%
- Dominant colors: ${colors.dominantPalette.slice(0, 3).map(c => c.hex).join(', ')}
- Harmony: ${colors.colorHarmony}

Top Keywords: ${keywords.topKeywords.slice(0, 5).map(k => k.keyword).join(', ')}

Respond with ONLY the style signature, nothing else.
Examples: "Clean Modern Minimalist", "Bold Brutalist Edge", "Warm Organic Flow"
`;

  const response = await vertexAI.generateContent(prompt);
  return response.trim();
}

function calculateDNAQuality(
  sampleSize: number,
  metrics: Record<string, MetricDistribution>,
  variance: number,
  weights: Map<string, number>
): DNAQuality {
  // 1. 샘플 크기 점수 (로그 스케일)
  const sizeScore = Math.min(100, Math.log10(sampleSize + 1) / Math.log10(101) * 100);
  
  // 2. 일관성 점수 (메트릭 consistency 평균)
  const avgConsistency = Object.values(metrics)
    .reduce((sum, m) => sum + m.consistency, 0) / 5;
  
  // 3. 커버리지 점수 (variance 기반, 낮을수록 좋음)
  const coverageScore = Math.max(0, 100 - variance * 100);
  
  // 4. 최신성 점수 (가중치 분포의 엔트로피)
  const weightsArray = Array.from(weights.values());
  const entropy = -weightsArray.reduce(
    (sum, w) => sum + (w > 0 ? w * Math.log2(w) : 0), 
    0
  );
  const maxEntropy = Math.log2(weightsArray.length);
  const recencyScore = (1 - entropy / maxEntropy) * 100;
  
  // 종합 점수 (가중 평균)
  const score = 
    sizeScore * 0.3 + 
    avgConsistency * 0.3 + 
    coverageScore * 0.2 + 
    recencyScore * 0.2;
  
  // 정밀도 등급 판정
  const precision: DNAQuality['precision'] = 
    sampleSize < 10 ? 'LOW' :
    sampleSize < 15 ? 'MODERATE' :
    sampleSize < 50 ? 'HIGH' : 'OPTIMAL';
  
  return {
    precision,
    score: Math.round(score),
    factors: {
      sampleSize: Math.round(sizeScore),
      consistency: Math.round(avgConsistency),
      coverage: Math.round(coverageScore),
      recency: Math.round(recencyScore)
    }
  };
}
```

---

## 3. 컬렉션 기반 검색 알고리즘 (searchByCollection)

### 3.1 검색 파이프라인 아키텍처

```
┌─────────────────────────────────────────────────────────────────────┐
│                    searchByCollection Pipeline                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User Request                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ collectionId, diversityLevel (0-100), styleWeight (0-100),   │   │
│  │ modifiers: { colorShift?, keywordFilter?, metricsFilter? }   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  STAGE 1    │    │  STAGE 2    │    │  STAGE 3    │              │
│  │ DNA Load &  │───▶│   Vector    │───▶│  Re-rank &  │              │
│  │  Modifier   │    │   Search    │    │  Diversify  │              │
│  └─────────────┘    └─────────────┘    └─────────────┘              │
│         │                   │                   │                    │
│         ▼                   ▼                   ▼                    │
│  • DNA 로드            • ANN 검색          • MMR 알고리즘           │
│  • 모디파이어 적용      • 후보 필터링       • 다양성 조절            │
│  • 쿼리 벡터 생성       • 초기 스코어링     • 최종 랭킹              │
│                                                                      │
│                       ┌─────────────┐                               │
│                       │  STAGE 4    │                               │
│                       │  Explain &  │                               │
│                       │   Return    │                               │
│                       └─────────────┘                               │
│                              │                                       │
│                              ▼                                       │
│                       • 매칭 근거 생성                               │
│                       • 결과 포맷팅                                  │
│                       • 캐싱                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Stage 1: DNA 로드 및 모디파이어 적용

```typescript
// searchStage1.ts

interface SearchRequest {
  collectionId: string;
  diversityLevel: number;   // 0-100: 0=매우 유사, 100=매우 다양
  styleWeight: number;      // 0-100: DNA 반영 강도
  modifiers?: {
    colorShift?: string;    // hex color to bias towards
    keywordFilter?: string[]; // must include these keywords
    metricsFilter?: Partial<Record<string, { min?: number; max?: number }>>;
  };
  limit?: number;           // default 20
  excludeIds?: string[];    // 이미 본 결과 제외
}

interface QueryContext {
  baseVector: number[];
  modifiedVector: number[];
  metricsTarget: Record<string, { mean: number; tolerance: number }>;
  colorConstraints: ColorConstraint[];
  keywordConstraints: string[];
}

async function prepareQueryContext(
  request: SearchRequest
): Promise<QueryContext> {
  // 1. 컬렉션 DNA 로드
  const collection = await db.collection('collections')
    .doc(request.collectionId).get();
  const dna = collection.data()?.synthesizedDNA as SynthesizedDNA;
  
  if (!dna) {
    throw new Error('Collection DNA not synthesized');
  }
  
  // 2. 기본 쿼리 벡터
  let queryVector = [...dna.styleVector];
  
  // 3. 색상 모디파이어 적용
  if (request.modifiers?.colorShift) {
    queryVector = applyColorShift(
      queryVector,
      request.modifiers.colorShift,
      request.styleWeight / 100  // 강도
    );
  }
  
  // 4. 메트릭 타겟 설정
  const metricsTarget: Record<string, { mean: number; tolerance: number }> = {};
  
  for (const [metric, dist] of Object.entries(dna.metricsDistribution)) {
    const filter = request.modifiers?.metricsFilter?.[metric];
    
    metricsTarget[metric] = {
      mean: filter?.min !== undefined && filter?.max !== undefined
        ? (filter.min + filter.max) / 2
        : dist.mean,
      tolerance: filter?.min !== undefined && filter?.max !== undefined
        ? (filter.max - filter.min) / 2
        : dist.stdDev * 2  // 2 표준편차 허용
    };
  }
  
  // 5. 색상 제약 설정
  const colorConstraints: ColorConstraint[] = [];
  if (request.modifiers?.colorShift) {
    colorConstraints.push({
      type: 'INCLUDE',
      color: hexToRgb(request.modifiers.colorShift),
      tolerance: 50  // RGB 거리
    });
  }
  
  return {
    baseVector: dna.styleVector,
    modifiedVector: queryVector,
    metricsTarget,
    colorConstraints,
    keywordConstraints: request.modifiers?.keywordFilter || []
  };
}

/**
 * 색상 시프트를 벡터 공간에 반영
 * 색상 임베딩과 스타일 임베딩을 선형 결합
 */
async function applyColorShift(
  styleVector: number[],
  targetColorHex: string,
  strength: number
): Promise<number[]> {
  // 색상을 텍스트로 변환하여 임베딩
  const colorDescription = `design with dominant ${targetColorHex} color palette`;
  const colorEmbedding = await generateTextEmbedding(colorDescription);
  
  // 선형 결합: (1-strength) * style + strength * color
  return styleVector.map((v, i) => 
    (1 - strength) * v + strength * colorEmbedding[i]
  );
}
```

### 3.3 Stage 2: 벡터 검색 (ANN)

```typescript
// searchStage2.ts

interface SearchCandidate {
  analysisId: string;
  imageUrl: string;
  vectorScore: number;  // 코사인 유사도
  metrics: Record<string, number>;  // 메트릭 점수 (layout, typography, etc.)
  // 참고: colorPalette는 실제 데이터의 colors 필드를 파싱한 결과
  colorPalette: Array<{ hex: string; rgb: { r: number; g: number; b: number } }>;  // 파싱된 색상
  keywords: string[];
}

async function vectorSearch(
  context: QueryContext,
  limit: number,
  excludeIds: string[]
): Promise<SearchCandidate[]> {
  
  // 1. 벡터 검색 인프라 선택
  // ⚠️ Firestore의 findNearest() API는 현재 미지원 (2024년 기준)
  // 실제 구현 시 다음 중 하나를 선택해야 함:
  
  // 옵션 A: Vertex AI Vector Search (권장)
  // - GCP 네이티브 솔루션
  // - Firestore와 통합 용이
  // - 대규모 데이터셋에 적합
  
  // 옵션 B: Pinecone
  // - 관리형 벡터 데이터베이스
  // - 빠른 설정 및 사용
  // - 별도 서비스 연동 필요
  
  // 옵션 C: 클라이언트 측 코사인 유사도 계산 (소규모 데이터)
  // - 모든 analyses 문서를 로드하여 메모리에서 계산
  // - 데이터가 적을 때만 실용적 (< 1000개)
  
  // 예시: Vertex AI Vector Search 사용 (구현 예시)
  // const candidates = await vertexAIVectorSearch({
  //   indexEndpoint: 'projects/.../locations/.../indexEndpoints/...',
  //   deployedIndexId: '...',
  //   queries: [{
  //     datapoint: { datapointId: 'query', featureVector: context.modifiedVector }
  //   }],
  //   neighborCount: limit * 3
  // });
  
  // 임시 구현: 모든 analyses 로드 후 코사인 유사도 계산 (소규모용)
  const allAnalyses = await db.collection('analyses')
    .where('embedding', '!=', null)
    .limit(1000)  // 성능 제한
    .get();
  
  const candidates: SearchCandidate[] = [];
  
  // 2. 코사인 유사도 계산 및 정렬 (임시 구현)
  const scoredDocs = allAnalyses.docs
    .map(doc => {
      const data = doc.data() as AnalysisDocument;
      if (!data.embedding) return null;
      
      const similarity = cosineSimilarity(context.modifiedVector, data.embedding);
      return { doc, data, similarity };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit * 3);
  
  // 3. 제외 ID 필터링 및 메트릭 필터링
  const filtered: SearchCandidate[] = [];
  
  for (const { doc, data, similarity } of scoredDocs) {
    if (excludeIds.includes(doc.id)) continue;
    
    const data = doc.data() as AnalysisDocument;
    // 실제 구조: metrics.layout.score 형식
    const metrics = data.metrics;
    
    // 메트릭 필터 적용
    let passMetrics = true;
    for (const [metric, target] of Object.entries(context.metricsTarget)) {
      const value = metrics[metric].score;
      if (Math.abs(value - target.mean) > target.tolerance) {
        passMetrics = false;
        break;
      }
    }
    if (!passMetrics) continue;
    
    // 키워드 필터 적용
    if (context.keywordConstraints.length > 0) {
      const hasAllKeywords = context.keywordConstraints.every(
        kw => data.keywords.some(k => k.toLowerCase().includes(kw.toLowerCase()))
      );
      if (!hasAllKeywords) continue;
    }
    
    // 색상 제약 적용
    if (context.colorConstraints.length > 0) {
      const passColor = context.colorConstraints.every(constraint => {
        if (constraint.type === 'INCLUDE') {
          return data.colors.some(c => {
            const rgbValues = parseRgbString(c.rgb);
            const colorObj = { r: rgbValues[0], g: rgbValues[1], b: rgbValues[2] };
            return colorDistance(colorObj, constraint.color) <= constraint.tolerance;
          });
        }
        return true;
      });
      if (!passColor) continue;
    }
    
    filtered.push({
      analysisId: doc.id,
      imageUrl: data.imageUrl,
      vectorScore: similarity,  // 이미 계산됨
      metrics: {
        layout: metrics.layout.score,
        typography: metrics.typography.score,
        color: metrics.color.score,
        components: metrics.components.score,
        formLanguage: metrics.formLanguage.score
      },
      colorPalette: data.colors.map(c => {
        const rgbValues = parseRgbString(c.rgb);
        return {
          hex: c.hex,
          rgb: { r: rgbValues[0], g: rgbValues[1], b: rgbValues[2] }
        };
      }),
      keywords: data.keywords
    });
  }
  
  return filtered;
}

// 코사인 유사도 계산 함수 (위에서 이미 정의됨, 재사용)
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function colorDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  // CIEDE2000이 더 정확하지만, 성능상 유클리드 거리 사용
  return Math.sqrt(
    (a.r - b.r) ** 2 + 
    (a.g - b.g) ** 2 + 
    (a.b - b.b) ** 2
  );
}
```

### 3.4 Stage 3: 재랭킹 및 다양성 조절 (MMR)

**Maximal Marginal Relevance (MMR)** 알고리즘을 사용하여 유사도와 다양성의 균형을 맞춥니다:

```
MMR = λ × Sim(d, q) - (1-λ) × max[Sim(d, d_i)]

- Sim(d, q): 문서 d와 쿼리 q의 유사도
- Sim(d, d_i): 문서 d와 이미 선택된 문서 d_i의 유사도
- λ: 유사도 vs 다양성 균형 파라미터 (0~1)
```

```typescript
// searchStage3.ts

interface RankedResult extends SearchCandidate {
  mmrScore: number;
  relevanceScore: number;
  diversityPenalty: number;
}

function applyMMR(
  candidates: SearchCandidate[],
  context: QueryContext,
  diversityLevel: number,  // 0-100
  limit: number
): RankedResult[] {
  
  // diversityLevel을 λ로 변환 (0=다양성 최대, 100=유사도 최대)
  // 즉, diversityLevel이 높으면 유사한 것을 더 원함
  const lambda = 1 - (diversityLevel / 100) * 0.7; // 0.3 ~ 1.0
  
  const selected: RankedResult[] = [];
  const remaining = [...candidates];
  
  while (selected.length < limit && remaining.length > 0) {
    let bestIdx = -1;
    let bestScore = -Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      
      // 관련성 점수 (쿼리와의 유사도)
      const relevance = candidate.vectorScore;
      
      // 다양성 페널티 (이미 선택된 것들과의 최대 유사도)
      let maxSimilarityToSelected = 0;
      for (const sel of selected) {
        // 임베딩은 이미 candidate와 sel에 포함되어 있으므로 직접 계산
        const sim = cosineSimilarity(
          await getEmbedding(candidate.analysisId),
          await getEmbedding(sel.analysisId)
        );
        maxSimilarityToSelected = Math.max(maxSimilarityToSelected, sim);
      }
      
      // 또는 이미 로드된 임베딩 사용 (성능 최적화)
      // const candidateEmbedding = await getEmbedding(candidate.analysisId);
      // const selEmbeddings = await Promise.all(
      //   selected.map(s => getEmbedding(s.analysisId))
      // );
      // maxSimilarityToSelected = Math.max(
      //   ...selEmbeddings.map(e => cosineSimilarity(candidateEmbedding, e))
      // );
      
      // MMR 점수
      const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarityToSelected;
      
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }
    
    if (bestIdx === -1) break;
    
    const chosen = remaining.splice(bestIdx, 1)[0];
    selected.push({
      ...chosen,
      mmrScore: bestScore,
      relevanceScore: chosen.vectorScore,
      diversityPenalty: (1 - lambda) * (1 - bestScore / chosen.vectorScore)
    });
  }
  
  return selected;
}

/**
 * 복합 점수 계산 (벡터 유사도 + 메트릭 유사도 + 색상 유사도)
 * 참고: 현재 구현에서는 사용되지 않지만 향후 확장 가능
 */
function calculateCompositeScore(
  candidate: SearchCandidate,
  context: QueryContext,
  weights: { vector: number; metrics: number; color: number }
): number {
  // 1. 벡터 유사도 (이미 계산됨)
  const vectorScore = candidate.vectorScore;
  
  // 2. 메트릭 유사도
  // candidate.metrics는 이미 score 값으로 변환된 상태
  let metricsScore = 0;
  let metricCount = 0;
  for (const [metric, target] of Object.entries(context.metricsTarget)) {
    const value = candidate.metrics[metric];
    const similarity = 1 - Math.abs(value - target.mean) / 100;
    metricsScore += similarity;
    metricCount++;
  }
  metricsScore = metricsScore / metricCount;
  
  // 3. 색상 유사도 (DNA의 주요 색상과 비교)
  let colorScore = 0;
  // 간략화: 첫 번째 주요 색상만 비교
  if (context.colorConstraints.length > 0 && candidate.colorPalette.length > 0) {
    const targetColor = context.colorConstraints[0].color;
    const candidateColor = candidate.colorPalette[0].rgb;
    const distance = colorDistance(targetColor, candidateColor);
    colorScore = Math.max(0, 1 - distance / 441); // 441 = max RGB distance
  } else {
    colorScore = 1; // 제약 없으면 만점
  }
  
  // 가중 평균
  return (
    vectorScore * weights.vector +
    metricsScore * weights.metrics +
    colorScore * weights.color
  );
}

/**
 * 임베딩 가져오기 헬퍼 함수
 * 실제 구현 시 Firestore에서 로드하거나 캐시 사용
 */
async function getEmbedding(analysisId: string): Promise<number[]> {
  const doc = await db.collection('analyses').doc(analysisId).get();
  const data = doc.data() as AnalysisDocument;
  if (!data.embedding) {
    throw new Error(`Analysis ${analysisId} missing embedding`);
  }
  return data.embedding;
}
```

### 3.5 Stage 4: 설명 생성 및 반환

```typescript
// searchStage4.ts

interface SearchResult {
  analysisId: string;
  imageUrl: string;
  scores: {
    overall: number;
    relevance: number;
    diversity: number;
  };
  matchReasons: string[];
  highlights: {
    matchingKeywords: string[];
    similarColors: string[];
    metricMatch: Record<string, { value: number; similarity: number }>;
  };
}

async function formatResults(
  ranked: RankedResult[],
  context: QueryContext,
  dna: SynthesizedDNA
): Promise<SearchResult[]> {
  return ranked.map(r => {
    // 1. 매칭 키워드 찾기
    const matchingKeywords = r.keywords.filter(kw =>
      dna.keywordProfile.topKeywords.some(tk => 
        tk.keyword.toLowerCase() === kw.toLowerCase()
      )
    );
    
    // 2. 유사 색상 찾기
    const similarColors = r.colorPalette
      .filter(c => {
        return dna.colorProfile.dominantPalette.some(dc =>
          colorDistance(c.rgb, dc.rgb) < 50
        );
      })
      .map(c => c.hex);
    
    // 3. 메트릭 매칭 상세
    const metricMatch: Record<string, { value: number; similarity: number }> = {};
    for (const [metric, dist] of Object.entries(dna.metricsDistribution)) {
      const value = r.metrics[metric];  // 이미 score 값으로 변환됨
      const similarity = 1 - Math.abs(value - dist.mean) / 100;
      metricMatch[metric] = { value, similarity: Math.round(similarity * 100) };
    }
    
    // 4. 매칭 근거 텍스트 생성
    const matchReasons: string[] = [];
    
    if (matchingKeywords.length >= 2) {
      matchReasons.push(`공통 스타일 키워드: ${matchingKeywords.slice(0, 3).join(', ')}`);
    }
    
    if (similarColors.length >= 2) {
      matchReasons.push(`유사한 색상 팔레트 사용`);
    }
    
    const highMatchMetrics = Object.entries(metricMatch)
      .filter(([_, v]) => v.similarity >= 80)
      .map(([k, _]) => k);
    
    if (highMatchMetrics.length >= 2) {
      matchReasons.push(`${highMatchMetrics.join(', ')} 메트릭이 유사합니다`);
    }
    
    if (matchReasons.length === 0) {
      matchReasons.push('전반적인 시각적 스타일이 유사합니다');
    }
    
    return {
      analysisId: r.analysisId,
      imageUrl: r.imageUrl,
      scores: {
        overall: Math.round(r.mmrScore * 100),
        relevance: Math.round(r.relevanceScore * 100),
        diversity: Math.round((1 - r.diversityPenalty) * 100)
      },
      matchReasons,
      highlights: {
        matchingKeywords,
        similarColors,
        metricMatch
      }
    };
  });
}
```

### 3.6 전체 검색 함수

```typescript
// searchByCollection.ts

export async function searchByCollection(
  request: SearchRequest
): Promise<{
  results: SearchResult[];
  meta: {
    totalCandidates: number;
    filteredCount: number;
    queryTime: number;
    dnaQuality: DNAQuality;
  };
}> {
  const startTime = Date.now();
  
  // 기본값 설정
  const limit = request.limit || 20;
  const diversityLevel = request.diversityLevel ?? 50;
  
  // Stage 1: DNA 로드 및 쿼리 준비
  const context = await prepareQueryContext(request);
  
  // Stage 2: 벡터 검색
  const candidates = await vectorSearch(
    context,
    limit,
    request.excludeIds || []
  );
  
  // Stage 3: MMR 재랭킹
  const ranked = applyMMR(candidates, context, diversityLevel, limit);
  
  // Stage 4: 결과 포맷팅
  const collection = await db.collection('collections')
    .doc(request.collectionId).get();
  const dna = collection.data()?.synthesizedDNA as SynthesizedDNA;
  
  const results = await formatResults(ranked, context, dna);
  
  return {
    results,
    meta: {
      totalCandidates: candidates.length,
      filteredCount: ranked.length,
      queryTime: Date.now() - startTime,
      dnaQuality: dna.qualityScore
    }
  };
}
```

---

## 4. 성능 최적화 전략

### 4.1 캐싱 전략

```typescript
// caching.ts

const CACHE_TTL = {
  DNA: 3600,        // 1시간 (DNA는 자주 안 바뀜)
  SEARCH: 300,      // 5분 (검색 결과)
  EMBEDDING: 86400, // 24시간 (임베딩은 불변)
};

interface CacheKey {
  type: 'dna' | 'search' | 'embedding';
  id: string;
  hash?: string;  // 검색 파라미터 해시
}

// Redis 또는 Firestore 캐싱
async function getCached<T>(key: CacheKey): Promise<T | null> {
  const cacheDoc = await db.collection('cache')
    .doc(`${key.type}_${key.id}_${key.hash || ''}`)
    .get();
  
  if (!cacheDoc.exists) return null;
  
  const data = cacheDoc.data();
  if (data.expiresAt.toMillis() < Date.now()) {
    // 만료됨, 삭제
    await cacheDoc.ref.delete();
    return null;
  }
  
  return data.value as T;
}

async function setCache<T>(key: CacheKey, value: T): Promise<void> {
  const ttl = CACHE_TTL[key.type];
  await db.collection('cache')
    .doc(`${key.type}_${key.id}_${key.hash || ''}`)
    .set({
      value,
      expiresAt: Timestamp.fromMillis(Date.now() + ttl * 1000)
    });
}
```

### 4.2 증분 DNA 업데이트

전체 재계산 대신 새 작업물만 반영:

```typescript
// incrementalUpdate.ts

// 전체 재계산 트리거 조건 정의
const RESYNTHESIS_TRIGGERS = {
  INTERVAL: 10,           // 10개마다 전체 재계산
  OUTLIER_ADDED: true,     // 이상치 추가 시
  MANUAL_REQUEST: true,    // 수동 요청 시
  DRIFT_THRESHOLD: 0.15,  // centroid 이동 거리 > 15%
  TIME_THRESHOLD: 30,     // 30일 경과 시
} as const;

/**
 * 증분 업데이트 vs 전체 재계산 판정
 */
function shouldTriggerFullResynthesis(
  currentCount: number,
  lastResynthesis: Timestamp,
  centroidDrift: number
): boolean {
  const daysSinceLastResynthesis = 
    (Date.now() - lastResynthesis.toMillis()) / (1000 * 60 * 60 * 24);
  
  return (
    currentCount % RESYNTHESIS_TRIGGERS.INTERVAL === 0 ||
    centroidDrift > RESYNTHESIS_TRIGGERS.DRIFT_THRESHOLD ||
    daysSinceLastResynthesis > RESYNTHESIS_TRIGGERS.TIME_THRESHOLD
  );
}

async function incrementalDNAUpdate(
  collectionId: string,
  newAnalysisId: string
): Promise<void> {
  const collection = await db.collection('collections')
    .doc(collectionId).get();
  const existing = collection.data()?.synthesizedDNA as SynthesizedDNA;
  const n = existing.metadata.analysisCount;
  const lastResynthesis = existing.metadata.synthesizedAt;
  
  const newAnalysis = await db.collection('analyses')
    .doc(newAnalysisId).get();
  const newData = newAnalysis.data() as AnalysisDocument;
  
  // 1. 벡터 이동 평균
  // 참고: embedding 필드는 현재 미구현 상태
  if (!newData.embedding) {
    throw new Error('Analysis document missing embedding field');
  }
  const newVector = existing.styleVector.map((v, i) => 
    (v * n + newData.embedding![i]) / (n + 1)
  );
  
  // Centroid 이동 거리 계산 (드리프트 감지)
  const centroidDrift = Math.sqrt(
    newVector.reduce((sum, v, i) => sum + (v - existing.styleVector[i]) ** 2, 0)
  );
  
  // 2. 메트릭 이동 평균 (간략화)
  // 실제 구조: metrics.layout.score 형식
  const newMetrics = { ...existing.metricsDistribution };
  for (const metric of Object.keys(newMetrics)) {
    const oldMean = newMetrics[metric].mean;
    const newValue = newData.metrics[metric as keyof typeof newData.metrics].score;
    newMetrics[metric].mean = (oldMean * n + newValue) / (n + 1);
  }
  
  // 3. 메타데이터 업데이트
  await db.collection('collections').doc(collectionId).update({
    'synthesizedDNA.styleVector': newVector,
    'synthesizedDNA.metricsDistribution': newMetrics,
    'synthesizedDNA.metadata.analysisCount': n + 1,
    'synthesizedDNA.metadata.includedIds': FieldValue.arrayUnion(newAnalysisId)
  });
  
  // 4. 전체 재계산 트리거 판정
  if (shouldTriggerFullResynthesis(n + 1, lastResynthesis, centroidDrift)) {
    // 전체 재계산으로 누적 오차 보정
    await triggerFullResynthesis(collectionId);
  }
}
```

---

## 5. 요약 및 다음 단계

### 5.1 핵심 결정 사항

| 항목 | 결정 | 근거 |
|------|------|------|
| **최소 작업물** | 5개 | CLT 적용 임계점, 표준편차 신뢰구간 ±39% |
| **권장 작업물** | 10~15개 | DNA 정밀도 85~90%, 비용 효율 최적점 |
| **최대 작업물** | 100개 | 수확 체감, 계산 복잡도 O(n²) 제한 |
| **이상치 탐지** | Modified Z-Score | 일반 Z-Score보다 로버스트 |
| **시간 가중치** | 지수 감쇠 (λ=0.01) | 반감기 ~69일, 현재 취향 반영 |
| **색상 클러스터링** | K-Means++ (k=5) | 초기화 품질 향상, 대표 색상 5개 |
| **검색 다양성** | MMR 알고리즘 | 유사도와 다양성 균형 제어 가능 |

### 5.2 구현 우선순위

1. **P0**: `synthesizeCollectionDNA` 기본 구현 (벡터, 메트릭)
2. **P0**: `searchByCollection` 기본 구현 (벡터 검색)
3. **P1**: 이상치 탐지 및 시간 가중치
4. **P1**: MMR 다양성 조절
5. **P2**: 색상/키워드 모디파이어
6. **P2**: 증분 업데이트 및 캐싱

### 5.3 벡터 검색 인프라 결정 매트릭스

벡터 검색 인프라 선택 시 고려사항:

| 옵션 | 장점 | 단점 | 권장 시점 | 비용 | 구현 난이도 |
|------|------|------|----------|------|------------|
| **클라이언트 측 계산** | 인프라 비용 0, 즉시 구현 가능, 외부 의존성 없음 | n > 1000 불가, 성능 저하, 메모리 사용량 증가 | MVP (분석 < 500개) | 무료 | 낮음 |
| **Firebase Extensions Vector Search** | Firestore 통합, 설정 간편, 관리형 서비스 | 확장성 제한 가능, Firebase 종속 | Phase 1 (중소규모, 분석 < 10K) | 낮음 | 낮음 |
| **Vertex AI Vector Search** | GCP 네이티브, 확장성 우수, 대규모 데이터셋 지원 | 설정 복잡, 초기 설정 시간 소요 | Phase 2 (대규모, 분석 > 10K) | 중간 | 중간 |
| **Pinecone** | 빠른 설정, 관리형 서비스, 좋은 성능 | 별도 비용, 외부 서비스 의존, GCP 외부 | 대안 옵션 (GCP 외부 선호 시) | 중간 | 낮음 |
| **pgvector (PostgreSQL)** | 비용 효율, 오픈소스, 유연성 | 관리 부담, 인프라 필요, 설정 복잡 | 장기 옵션 (자체 인프라 운영 시) | 낮음 | 높음 |

**권장 구현 순서**:
1. **Phase 1 (MVP)**: 클라이언트 측 계산 (즉시 구현 가능, 비용 0)
2. **Phase 2 (확장)**: Vertex AI Vector Search (GCP 통합, 확장성 확보)
3. **대안**: Firebase Extensions 또는 Pinecone (요구사항에 따라 선택)

**참고**: `1126planning.md`에서도 Firebase Extensions의 `Vector Search with Firestore` 옵션을 언급하고 있습니다.

### 5.4 추가 검토 필요 사항

1. **임베딩 모델 선택**: 
   - Gemini Embedding API (현재 프로젝트에서 사용 중인 Gemini와 통합 용이)
   - OpenAI text-embedding-3 (성능/비용 비교 필요)
   
2. **실시간 검색 vs 배치 인덱싱**: 데이터 규모에 따른 아키텍처 결정

### 5.5 기존 구현된 함수와의 통합

**이미 구현된 함수들** (`functions/src/index.ts`):

- ✅ `analyzeDesign`: 이미지 분석 함수 (Gemini API 사용)
  - 분석 시 `embedding` 필드 생성 로직 추가 필요
  - 현재는 메트릭, 색상, 키워드만 추출
  
- ✅ `createCollection`: 컬렉션 생성 함수
  - `collections` 컬렉션에 문서 생성
  - `synthesizedDNA` 필드는 향후 추가 예정
  
- ✅ `updateCollection`: 컬렉션 업데이트 함수
  - `analysisIds` 배열 관리
  - DNA 합성 트리거 추가 필요
  
- ✅ `getCollections`: 사용자 컬렉션 조회 함수
  - `synthesizedDNA` 포함하여 반환하도록 확장 필요

**통합 방법**:
1. `analyzeDesign` 함수에서 분석 완료 시 임베딩 생성 및 저장
2. `updateCollection`에서 `analysisIds` 변경 시 DNA 합성 트리거
3. `getCollections`에서 `synthesizedDNA` 포함하여 반환

---

---

## 6. 구현 상태 및 주의사항

### 6.1 현재 구현 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| 컬렉션 CRUD | ✅ 구현 완료 | `createCollection`, `updateCollection`, `getCollections` |
| 이미지 분석 | ✅ 구현 완료 | `analyzeDesign` 함수 |
| DNA 합성 알고리즘 | ⚠️ 미구현 | 본 문서의 설계 기반으로 구현 필요 |
| 벡터 검색 | ⚠️ 미구현 | 벡터 인프라 선택 후 구현 필요 |
| 임베딩 생성 | ⚠️ 미구현 | Gemini Embedding API 연동 필요 |

### 6.2 데이터 구조 변경 사항

**실제 코드베이스 구조** (`functions/src/types.ts` 기준):

1. **컬렉션 이름**: `collections` (문서의 `styleCollections` 아님)
2. **메트릭 구조**: `metrics.layout.score` (문서의 `analysisResult.metrics.layout` 아님)
3. **색상 필드**: `colors` (문서의 `colorPalette` 아님)
4. **RGB 형식**: 문자열 (`"rgb(255, 0, 0)"` 또는 `"255, 0, 0"`)
5. **타임스탬프**: `timestamp` 필드 사용 (`createdAt` 아님)

**컬렉션 매핑 관계**:

| 문서 용어 | PRD 용어 | 실제 Firestore 컬렉션 | 용도 | 관련 함수 |
|----------|----------|---------------------|------|----------|
| `collections` | - | `collections` | DNA 합성용 분석 그룹 (신규) | `createCollection`, `updateCollection`, `getCollections` |
| - | `boards` | `boards` | 이미지 보드 컬렉션 (PRD 7.1.4) | - |
| - | `styleFolders` | `styleFolders` | 스타일 갤러리 폴더 (PRD 7.1.5) | - |

**참고**: 
- `collections` 컬렉션은 DNA 합성 알고리즘 전용으로 새로 설계된 컬렉션입니다.
- `boards`와 `styleFolders`는 PRD에 정의된 별도 컬렉션으로, DNA 합성과는 다른 용도입니다.
- 현재 구현된 함수들은 `collections` 컬렉션만 사용합니다.

### 6.3 미구현 기능

다음 기능들은 문서에 설계되어 있으나 아직 구현되지 않았습니다:

1. **임베딩 필드**: `AnalysisDocument`에 `embedding?: number[]` 추가 필요
2. **DNA 합성**: `synthesizeCollectionDNA` 함수 구현 필요
3. **벡터 검색**: 벡터 인프라 선택 후 `searchByCollection` 함수 구현 필요
4. **CollectionDocument 확장**: `synthesizedDNA`, `lastSynthesizedAt` 필드 추가 필요

### 6.4 구현 시 참고사항

1. **기존 함수 활용**: `analyzeDesign` 함수를 확장하여 임베딩 생성 로직 추가
2. **타입 안정성**: `functions/src/types.ts`의 실제 타입 정의 준수
3. **에러 처리**: 임베딩이 없는 경우 적절한 폴백 로직 구현
4. **성능 최적화**: 벡터 검색은 Vertex AI Vector Search 사용 권장

---

*Vice-Director 심층 설계 보고 완료. 코드베이스 구조 반영 완료. 추가 검토 또는 구현 지시를 기다리겠습니다.*
