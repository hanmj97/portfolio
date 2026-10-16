# 한민재 | Technical Portfolio

**DBA · Data Engineering · Backend Development**

MSSQL·MySQL 라이브 서비스 운영, 성능 튜닝, 데이터 정합성 관리 및 백엔드 개발 경험을 소개하는 반응형 포트폴리오 홈페이지입니다. 미니멀 화이트 + 데이터 대시보드 콘셉트로 제작했으며 5가지 테마 전환을 지원합니다.

🌐 **[포트폴리오 홈페이지 바로가기](https://hanmj97.github.io/portfolio/)**

## 프로젝트 소개

- **경력** — 위메이드(DBA / 데이터 운영), 로젠소프트(Web Developer)
- **데이터 분야** — 라이브 DB 성능 튜닝, 데이터 보정·정합성 검증, [DataOps Pipeline](https://github.com/hanmj97/DataOpsPipeline)
- **개발 분야** — [Blackjack Web Service](https://github.com/hanmj97/Black-jack-React)
- **문서 연결** — Notion 이력서, 이력서 PDF, 포트폴리오 PDF, 경력기술서 PDF
- **UI** — 반응형 레이아웃, 프로젝트 필터(전체/데이터/개발), 5가지 컬러 테마 및 선택 테마 브라우저 저장

## 기술 스택

`HTML` `CSS` `JavaScript` `GitHub Pages` `Google Analytics 4` `Cloudflare Web Analytics` `Cloudflare Workers` `Cloudflare D1` `SQL`

## 방문자 분석 시스템 (Analytics)

포트폴리오에 **방문 흐름 분석 + 날짜별 누적 방문 카운터**를 구축했습니다.

| 구성 | 기능 |
| --- | --- |
| **Google Analytics 4** | 최근 5분·30분 활성 사용자, 유입 경로 및 방문 환경 분석 |
| **Cloudflare Web Analytics** | 페이지 조회 및 방문 추이 분석 |
| **Cloudflare Worker** | 방문 기록 수신 API, 입력 검사 및 중복 처리 |
| **Cloudflare D1 (SQLite)** | 방문 기록 저장, 날짜별 인덱스 및 SQL 집계 |
| **관리자 대시보드** | 인증 후 오늘/누적 방문 횟수 조회, 약 5초마다 갱신 |

### 데이터 흐름

```text
Portfolio Website (GitHub Pages)
        │
        ├── Google Analytics 4 → 실시간 트래픽 분석
        ├── Cloudflare Web Analytics → 페이지 방문/조회 분석
        │
        └── JavaScript (sessionStorage UUID)
                │ POST /visit
                ▼
            Cloudflare Worker
                │ INSERT OR IGNORE
                ▼
            Cloudflare D1
                │
                └── 관리자 인증 → /stats → 오늘/누적 방문 횟수
```

**[분석 시스템 상세 구현 기록 및 설정 안내](./analytics/README.md)** · **[D1 테이블/인덱스 SQL](./analytics/schema.sql)**

> 자체 카운터는 브라우저 탭의 세션 기준 방문 이벤트를 기록합니다. 실제 고유 인원수 또는 정확한 동시 접속자 수가 아닙니다. 방문자 이름·이메일·IP는 애플리케이션 D1 테이블에 저장하지 않습니다. 관리자 인증용 `ADMIN_TOKEN`은 Cloudflare Secret으로만 관리합니다.

## 주요 파일

```text
portfolio/
├── index.html           # 메인 페이지 / GA4 / Cloudflare Web Analytics
├── style.css            # 반응형 레이아웃 및 5가지 테마
├── script.js            # 프로젝트 필터, 테마 설정, 방문 이벤트 전송
├── analytics/
│   ├── README.md        # Worker + D1 방문 분석 구조 및 운영 문서
│   └── schema.sql       # D1 데이터베이스 스키마 및 조회 예시
└── README.md
```

## 배포 및 운영

- 호스팅: **GitHub Pages** (public 저장소, `main` 브랜치 / `(root)`)
- 홈페이지: [hanmj97.github.io/portfolio](https://hanmj97.github.io/portfolio/)
- Worker API 및 D1 데이터베이스는 **Cloudflare에서 별도로 운영**합니다. GitHub에 웹페이지 코드를 변경해도 Worker가 자동 배포되지는 않습니다.
- GA4/Cloudflare 대시보드 및 관리자 통계 화면은 사이트 방문자에게 기본적으로 공개되지 않으며, 통계 API는 관리자 인증이 필요합니다.
- Google Drive로 연결된 문서는 별도 공개 권한 설정이 필요합니다.

## 변경 이력

## V4 수정 내용
- 모든 제목의 장식용 마침표 제거, DEVELOPMENT 1년으로 교체
- MSSQL 및 MySQL 실무 운영 명시, 경력 설명 보강
- 기술 스택의 부가 경력 라벨 제거, 전체 칩 강조색 통일
- 문서 순서: Notion → 이력서 → 포트폴리오 → 경력기술서
- Notion URL 갱신

## V5 수정 내용
- 히어로 영역 두 번째 버튼을 Notion 이력서로 변경
- 경력과 주요 업무 섹션 오른쪽 소개 문구 간결화
- DataOps Pipeline 완료 표시 및 GitHub 저장소 연결: https://github.com/hanmj97/DataOpsPipeline

## V6 수정 내용
- SELECTED WORK 필터를 전체(04) / 데이터(03) / 개발(01)로 변경
- 데이터: DataOps Pipeline, 라이브 DB 성능 튜닝, 데이터 정합성 관리
- 개발: Blackjack Web Service
- 기존 5가지 테마 및 외부 링크 유지

## 방문 분석 시스템 추가 (2026.10)

- GitHub Pages 홈페이지에 GA4 측정 코드 추가 및 Cloudflare Web Analytics 유지
- `script.js`에서 Cloudflare Worker `/visit` 엔드포인트로 세션 기준 방문 기록 전송
- D1 `portfolio_visits` 테이블 및 날짜 인덱스 구성
- Worker 관리자 인증 및 오늘/누적 방문 집계 화면 연결
- [상세 설계 문서](./analytics/README.md), [SQL 스키마](./analytics/schema.sql) 저장


## 방문 분석 V4 업데이트 (2026.10)

기존 Google Analytics 4 및 Cloudflare Web Analytics를 유지하면서 **Cloudflare Worker + D1 관리자 대시보드 V4**에 프론트엔드 이벤트 수집을 연동했습니다.

- 일별·주별·월별 방문 추이, 기존 지역 지도 및 방문 시각
- **문서·프로젝트 링크 클릭 집계** (\`/event\` API, 실제 문서 열람 여부는 알 수 없음)
- **유입 도메인** 구분 (채용 사이트/검색/직접 접속/외부 링크)
- **PC·모바일 및 브라우저** 집계
- **최근 30일 기준 신규·재방문 브라우저 세션 추정**
- **내 브라우저 D1 집계 제외/재개** (GA4 및 Cloudflare 기본 분석에는 별도 적용)
- **관리자 인증 후 CSV 집계 다운로드**

구성: \`script.js\` → Worker \`/visit\`, \`/event\` → D1 \`portfolio_visits\`, \`portfolio_events\` → Worker 관리자 대시보드.

- [상세 아키텍처와 V4 운영 주의사항](./analytics/README.md)
- [V4 D1 마이그레이션 SQL](./analytics/migrate-v3-to-v4.sql)

관리자 인증용 \`ADMIN_TOKEN\` Secret은 GitHub에 저장하지 않습니다. 기존 방문 기록은 보존되며 새 클릭/유입/접속 환경 정보는 V4 도입 이후부터 수집됩니다.
