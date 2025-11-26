# EXTERNAL DATA PIPELINE (Met / AIC / Artsy → Firestore)

## 1) 목적
- mockData.js 기반 로컬 프로토타입을 실제 데이터 파이프라인으로 점진 전환
- 외부 API(메트로폴리탄 미술관, 시카고 미술관, Artsy)에서 수집 → 정제 → Firestore 적재
- 폴백 전략: 외부 소스 실패 시 mockData.js 유지 (가용성 우선)

## 2) 전반 아키텍처
- Cloud Scheduler (cron)
  → fnEtlExtract (원본 수집, Storage/raw 저장)
  → fnEtlTransform (정제/정규화, 중복 제거, 스키마 매핑)
  → Firestore (entities/events/measures/artist_summary/timeseries)
  → (옵션) BigQuery 적재 및 분석 레이어

## 3) 외부 API 개요
- Met Museum API: https://collectionapi.metmuseum.org/
  - 주요 엔드포인트: /public/collection/v1/objects?departmentIds=...
  - 스로틀링: 80 req/min 권장, 429 시 지수적 백오프
- Art Institute of Chicago API: https://api.artic.edu/docs/#introduction
  - /api/v1/artworks?fields=...  (pagination)
  - rate limit 정책 준수, ETag/If-Modified-Since 활용
- Artsy API: https://developers.artsy.net/
  - OAuth 토큰 필요, GraphQL/REST 혼재, 상업적 이용 정책 확인

## 4) 보안/키 관리
- Secret Manager: `external-apis/met-api-key`, `aic-api-key`, `artsy-client-id/secret`
- functions/src/services/configLoader.js에서 안전하게 로드
- 키 회전 주기/권한(roles/secretmanager.secretAccessor) 최소화

## 5) 스키마 매핑 (예시)
### 5.1 entities (작가/기관)
- entity_id: 해시(출처+외부ID)
- identity_type: 'artist' | 'institution'
- names_ko/en: 원문/번역 필드 병합
- debut_year: 최초 전시/작품 연도 추정치(없으면 null)

### 5.2 events (전시/수상 등)
- event_id: yyyy-mm-dd+org+title (정규화)
- title, org, start_date, end_date, venue_id, type
- source: { provider: 'met'|'aic'|'artsy', source_url }

### 5.3 measures (지표 값)
- measure_id: hash(entity_id+axis+metric_code+time_window)
- axis: 제도/학술/담론/네트워크 (axis_map 규칙으로 분류)
- metric_code: 출처별 필드→표준 코드 매핑 테이블 사용
- value_raw/value_normalized: normalizationSpecs 파이프라인 적용
- time_window: ISO 구간(yyyy-mm to yyyy-mm)

### 5.4 artist_summary / timeseries
- fnBatch* 파이프라인 결과를 서빙 스키마로 집계
- ±0.5p 일관성 검증(DataQualityValidator) 강제

## 6) 변환 규칙 (핵심)
- 중복/정규화: 동일 전시/수상 다중 출처 합치 (우선순위: 1차문서 > 보도자료 > 신뢰매체)
- axis_map: 
  - "최근 빈도 → 제도", "누적 이력/관계 → 네트워크" 원칙
  - 담론=24개월, 제도=10년(5/5 가중), 학술=누적+최근5년 30% 가산, 네트워크=누적
- ER 매핑: 한/영/별칭, 외부 식별자 병합(entities.external_ids)

## 7) 성능/쿼터
- 요청 스로틀링: 각 API 가이드 상한의 70%로 제한
- 지수적 백오프(200ms~10s), 재시도 최대 3회
- 증분 수집: updated_since 파라미터/헤더로 부분 동기화

## 8) 오류/폴백
- 외부 API 4xx/5xx: 로그 + Dead Letter(재시도 큐) + mockData 폴백
- 부분 실패 허용(최소 기능 유지) → 추후 배치 재처리

## 9) BigQuery 분석(옵션)
- Firestore 변경 스트림 → Dataflow(또는 Export) → BigQuery
- 모델링: entities/events/measures 스타 스키마, 파티션/클러스터링
- Looker Studio 대시보드로 운영/분석 시각화

## 10) 샘플 페이로드/매핑 (간략)
```json
{
  "met_object": {
    "objectID": 123,
    "artistDisplayName": "Haegue Yang",
    "objectBeginDate": 2003,
    "objectEndDate": 2003,
    "department": "Modern Art"
  },
  "mapping": {
    "entity_id": "met:artist:haegue_yang",
    "event": {"title":"Group Exhibition","org":"MET","start_date":"2003-05-01"},
    "axis_map": "제도",
    "metric_code": "INSTITUTION_SHOW",
    "time_window": "2003-05 to 2003-06"
  }
}
```

## 11) 배포/스케줄 권장안
- Cloud Scheduler: 매일 03:00 JST, job 별 provider 분리
- fnEtlExtract/fnEtlTransform: 타임아웃 540s, 메모리 1GB
- 관측성: 처리 건수/오류율/대기열 메트릭 수집

## 12) 롤아웃 계획
- 단계 1: mockData 유지 + 각 provider 샘플 50건 적재
- 단계 2: 2주간 증분 수집/품질 검증(±0.5p 합치)
- 단계 3: Phase 1/2 UI를 Firestore 우선으로 전환(폴백 유지)

