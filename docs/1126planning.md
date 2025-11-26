# 📅 1126 Planning: 미구현 기능 분석 및 향후 로드맵

## 1. 개요
현 코드베이스(`dysprototype`)는 핵심 기능(이미지 분석, AI 멘토링 채팅, 기본 검색, 마이페이지)의 프로토타이핑이 완료된 상태입니다. 본 문서는 현재 구현된 기능을 제외하고, 문서상에는 존재하나 아직 구현되지 않은 **고급 기능(Advanced Features)**들을 식별하고, 이를 실현하기 위한 구체적인 기술 전략과 로드맵을 수립합니다.

## 2. 핵심 미구현 기능 상세 분석 (Deep Dive)

### 2.1 고급 검색 및 추천 시스템 (Advanced Search & Recommendation)
- **현재 상태**: Google Custom Search API를 활용한 키워드/이미지 매칭 검색만 구현됨.
- **미구현 사항**:
    - **Vector Search**: 디자인의 시각적 특징(DNA)을 벡터 임베딩으로 변환하여 "스타일이 유사한" 레퍼런스를 찾는 기능.
    - **Neo4j 그래프 분석**: 디자인 요소 간의 관계망 분석.
- **기술적 인사이트**:
    - **Vector Search 도입**: Firebase Extensions의 `Vector Search with Firestore`를 활용하거나, Vertex AI Vector Search를 직접 연동하는 방안이 있습니다. 현재 프로토타입 단계에서는 비용 효율적인 **PostgreSQL (pgvector)** 또는 **Pinecone** 같은 외부 벡터 DB를 가볍게 연동하는 것을 추천합니다.
    - **임베딩 생성**: 현재 사용 중인 Gemini 1.5 Pro의 멀티모달 임베딩 기능을 활용하여 업로드된 이미지의 벡터값을 추출하고, 이를 `analyses` 컬렉션에 저장해야 합니다.

### 2.2 데이터 시각화 및 성장 리포트 (Data Visualization & Growth Report)
- **현재 상태**:
    - `RadarChart`: 5축 메트릭의 평균값 표시 (정적).
    - `Style Timeline`: 단순 리스트 형태의 최근 기록 표시.
- **미구현 사항**:
    - **Time Series Chart**: 주간/월간 단위의 점수 변화 추이를 보여주는 꺾은선 그래프.
    - **Compare Styles**: 두 개의 디자인(예: 수정 전/후)을 나란히 놓고 메트릭 차이를 시각적으로 비교하는 기능.
    - **Growth Report**: "지난달 대비 타이포그래피 점수가 15% 상승했습니다"와 같은 인사이트 생성.
- **기술적 인사이트**:
    - **Recharts 활용**: 현재 설치된 `recharts` 라이브러리를 활용하여 `LineChart` (시계열), `BarChart` (비교) 컴포넌트를 추가 구현합니다.
    - **데이터 집계**: 프론트엔드에서 계산하기보다, Cloud Functions에서 `generateGrowthReport` 함수를 구현하여 집계된 데이터를 JSON으로 내려주는 것이 성능상 유리합니다.

### 2.3 배치 처리 및 인사이트 도출 (Batch Processing & Insights)
- **현재 상태**: 전무함. 실시간 트리거만 존재.
- **미구현 사항**:
    - **Feedback Aggregation**: 매일 새벽 사용자 피드백을 집계하여 AI 모델 성능을 평가.
    - **Global Trend Analysis**: 전체 사용자의 디자인 데이터를 분석하여 "이번 달 유행하는 컬러/스타일" 도출.
- **기술적 인사이트**:
    - **Cloud Scheduler**: Firebase Cloud Scheduler를 설정하여 주기적인 함수 실행(`aggregateFeedback`)을 구현해야 합니다.
    - **BigQuery 연동**: 데이터가 쌓일 것을 대비해 Firestore 데이터를 BigQuery로 미러링(Firebase Extension 활용)하여 대용량 분석 기반을 마련해야 합니다.

### 2.4 디자인 법칙 기반 정량 평가 (Quantitative Evaluation)
- **현재 상태**: LLM의 "주관적 판단"에 의존한 점수 산출.
- **미구현 사항**:
    - **알고리즘 기반 평가**: WCAG 명암비 계산, 텍스트 크기 가독성 수식 대입 등 "절대적 기준"에 의한 평가.
- **기술적 인사이트**:
    - **OpenCV / Canvas API**: 클라이언트 또는 서버 사이드에서 이미지의 픽셀 데이터를 직접 분석하여 색상 대비율을 계산하는 로직을 추가해야 합니다. LLM의 평가와 알고리즘 평가를 `7:3` 정도로 가중치 합산하면 신뢰도를 높일 수 있습니다.

## 3. 단계별 구현 로드맵 (Phased Implementation Plan)

### Phase 1: 데이터 시각화 고도화 (즉시 실행 가능)
- **목표**: 사용자가 자신의 성장을 체감할 수 있도록 시각적 피드백 강화.
- **Task**:
    1. `MyPage.tsx`에 `TimeSeriesChart` 컴포넌트 추가.
    2. `CompareAnalysis.tsx` 페이지 신설 및 비교 로직 구현.
    3. `generateGrowthReport` Cloud Function 구현.

### Phase 2: 검색 시스템 업그레이드 (1-2개월 내)
- **목표**: 단순 검색을 넘어선 "영감(Inspiration)" 제공.
- **Task**:
    1. Gemini Embedding API 연동.
    2. Firestore에 벡터 필드 추가 및 인덱싱.
    3. 유사도 기반 검색 로직(`searchSimilarStyles`) 구현.

### Phase 3: 배치 처리 및 자동화 (장기 과제)
- **목표**: 데이터 기반의 서비스 개선 선순환 구조 확립.
- **Task**:
    1. Cloud Scheduler 설정.
    2. BigQuery 연동 및 데이터 웨어하우스 구축.
    3. 글로벌 트렌드 리포트 생성 파이프라인 구축.

## 4. 결론
현재 `dysprototype`은 핵심 가치를 전달하는 MVP로서 훌륭한 상태입니다. 다음 단계로는 **"데이터의 가치"**를 사용자에게 돌려주는 **시각화(Phase 1)**와 **추천(Phase 2)**에 집중하는 것이 서비스의 락인(Lock-in) 효과를 극대화하는 길입니다.
