# HAN MINJAE | Database & Backend Engineer

**DBA · Data Engineering · Backend Development**

MSSQL·MySQL 기반 라이브 서비스 데이터 운영, SQL 성능 분석 및 정합성 검증, Java/Spring 개발 경험과 개인 프로젝트를 정리한 포트폴리오입니다. 경력과 기술을 **실제 업무 사례 + 구현 결과물** 중심으로 소개합니다.

[**🌐 포트폴리오 웹사이트**](https://hanmj97.github.io/portfolio/) · [**📄 Notion 이력서**](https://three-list-53b.notion.site/DBA-Data-Engineer-8d7549dc581c82d6babc01a7d1f281fa) · [**💻 GitHub 프로필**](https://github.com/hanmj97)

> **문서 업데이트:** 2026-11-14  
> **현재 구성:** 반응형 단일 페이지 · 프로젝트 6개(데이터 5 / 개발 1) · 그라파이트 × 샴페인 골드 고정 테마

## 1. 포트폴리오 구성

| 섹션 | 주요 내용 |
| --- | --- |
| Home | 직무 소개, DBA·개발 경력 요약, 핵심 역량 |
| About | DB 운영 안정성, 성능 분석, 데이터·개발 연계 경험 |
| Experience | 위메이드 DBA / 데이터 운영, 로젠소프트 Developer |
| Selected Work | 프로젝트 및 업무 사례 6개, 전체/데이터/개발 필터 |
| Tech Stack | DBMS, 클라우드·데이터 도구, 백엔드 및 협업 도구 |
| Documents & Contact | Notion 이력서, PDF 문서, GitHub 및 연락처 |

### 경력 요약

- **위메이드 (2023.07–2025.08)** — MSSQL·MySQL 기반 게임 라이브 서비스 데이터베이스 운영, 정기 점검·장애 대응·데이터 보정 및 정합성 검증. Azure 모니터링·SQL 실행계획 분석과 복합 인덱스 개선을 통한 성능 문제 대응.
- **로젠소프트 (2021.10–2022.10)** — Java/Spring·Tibero 기반 환경안전관리 시스템 개발. 관리자 기능, 차트 시각화, 스케줄러 및 자동 이메일 발송 기능 구현.

## 2. 주요 프로젝트 및 업무 사례

사이트의 **SELECTED WORK** 섹션과 동일하게 구성했습니다.

| 분류 | 프로젝트 / 사례 | 핵심 내용 |
| --- | --- | --- |
| 데이터 | **[DBPulse](https://github.com/hanmj97/DBPulse)** | Windows 설치형 MSSQL 운영·성능 진단 도구. Blocking/Deadlock/Wait, Query Store, SQL 튜닝 진단 |
| 데이터 | **[SignalBridge](https://github.com/hanmj97/SignalBridge)** | 용인시 공식 채용 API·GitHub Releases 수집, PostgreSQL 변경 이력, Airflow 자동화, React/Spring Boot 웹 |
| 데이터 | **[DataOps Pipeline](https://github.com/hanmj97/DataOpsPipeline)** | MSSQL → Python ETL/UPSERT → PostgreSQL, Airflow 기반 실행 관리 |
| 데이터 | **라이브 DB 성능 튜닝** | 업데이트 직후 DB 부하 문제에 대해 Azure 지표와 실행계획 분석, 복합 인덱스 구조 개선 |
| 데이터 | **데이터 보정과 정합성 관리** | 라이브 서비스 데이터 오류 범위 식별 및 작업 전후 건수·키·상태값 검증 |
| 개발 | **[Blackjack Web Service](https://github.com/hanmj97/Black-jack-React)** | React·Node.js·MySQL 기반 로그인, 게임 로직, 데이터 저장 웹 서비스 |

### DBPulse 스크린샷 이미지

홈페이지 DBPulse 카드에는 `assets/dbpulse/01-overview.webp`를 대표 화면으로 사용하는 구성이 준비되어 있습니다. 파일이 실제 저장소에 올라오기 전에는 기존 아키텍처 요약을 그대로 보여주며, 이미지가 업로드되면 대표 화면이 자동 표시됩니다.

Notion에는 동일한 저장소의 4개 이미지를 사용하도록 계획되어 있습니다.

- `01-overview.webp` — DB 운영 개요 (홈페이지 + Notion)
- `02-query-store.webp` — Query Store / SQL 튜닝 진단 (Notion)
- `03-deadlock.webp` — Deadlock 이력 (Notion)
- `04-incident-analysis.webp` — Incident 원인 분석 (Notion)

이미지 소스는 사용자가 직접 실행한 로컬 테스트 DBPulse 캡처입니다. 이미지 업로드가 끝나야 Notion의 이미지 갤러리도 게시할 수 있습니다. 파일 업로드 방법은 [assets/dbpulse/README](./assets/dbpulse/README.md) 참고.

### DBPulse — 대표 프로젝트

- **공개 버전:** [v0.21.3 (Windows 릴리스)](https://github.com/hanmj97/DBPulse/releases/tag/v0.21.3)
- **목표:** 사용자가 자신의 MSSQL 서버를 등록해 모니터링·진단할 수 있는 로컬 설치형 도구
- **주요 기능:** DMV 기반 상태 수집, Blocking/Deadlock/Wait 진단, Query Store 이력·실행계획 분석, 저성능 SQL 진단
- **사이트 미리보기:** MSSQL → Spring Boot → SQLite 아키텍처 및 기능 요약
- **대표 기술:** MSSQL, Spring Boot, SQLite, React, WebView2

### SignalBridge

- 공식 API/릴리스 기반 데이터를 수집·정규화하고 변경 이력을 관리하는 청년정책·채용정보 통합 플랫폼 프로젝트
- 사이트에는 **용인시 공식 채용정보를 표시한 로컬 MVP 화면**이 포함됩니다. 이 이미지는 별도 SignalBridge 저장소의 공개 WebP 파일을 참조합니다.
- 관련 자료: [Architecture](https://github.com/hanmj97/SignalBridge/blob/feature/youth-policy-platform/docs/architecture.md) · [v0.2.0 릴리스](https://github.com/hanmj97/SignalBridge/releases/tag/v0.2.0)

## 3. UI/UX — 2026년 11월 리디자인

기존 **5개 테마 선택 기능은 제거**하고, 방문자 모두에게 일관된 단일 다크 테마를 제공합니다.

| 디자인 요소 | 색상 | HEX |
| --- | --- | --- |
| 사이트 배경 | 그라파이트 | `#1E222A` |
| 프로젝트 카드 배경 | 다크 그레이 | `#2A303B` |
| 기본 강조 / 데이터 프로젝트 | 샴페인 골드 | `#E9C98E` |
| 개발 프로젝트 강조 | 아이스 블루 | `#94C8E8` |

- **카테고리 중심 시각화:** PERSONAL PROJECT / WORK CASE STUDY 구분과 관계없이 데이터 5개 카드는 골드, 개발 1개 카드는 블루 계열로 표시
- **모든 프로젝트 카드 일관성:** 카테고리별 상단 테두리·은은한 배경 그라데이션·타이틀·상태/번호·호버 효과 적용
- **DBPulse 카드 레이아웃:** 하단의 불필요한 빈 공간을 줄이도록 아키텍처 미리보기 배치 개선
- **가독성:** 프로젝트 설명 글꼴 크기·줄 간격·명도 대비 개선
- **기술 스택 태그:** 카테고리별 톤 통일 및 프로젝트별 대표 기술(MSSQL, PostgreSQL, Python, T-SQL, React 등) 강조
- **사용성:** 전체/데이터/개발 필터, 모바일 내비게이션, 외부 프로젝트/문서 링크 유지
- **문구 개선 (2026-11-14):** 메인 소개·경력·업무 사례·프로젝트·문서 안내를 간결하고 구체적인 문장으로 정리. 히어로 아래 기술명 나열을 '라이브 DB 운영 / SQL 성능 최적화 / 데이터 정합성 검증 / 서비스 개발·배포' 핵심 역량 4개로 변경.
- **Contact (2026-11-14):** 상단 버튼/모바일 메뉴에서 `#contact` 섹션으로 이동. 실제 이메일 주소의 `mailto:` 링크는 연락처 섹션에 유지.
- **문서 접근성 (2026-11-14):** 메인 포트폴리오 PDF 대표 버튼과 Notion/프로젝트 보조 버튼, 경력 섹션의 Notion 안내, 프로젝트 섹션 하단 PDF 안내 및 문서 카드의 명확한 링크 문구 추가. 링크 대상과 Analytics 이벤트 수집 로직은 유지.

리디자인은 콘텐츠와 기존 분석 기능의 동작을 유지하는 **프론트엔드 UI 개선**입니다.

## 4. 구현 기술과 구조

| 영역 | 기술 / 서비스 | 용도 |
| --- | --- | --- |
| 웹 | HTML, CSS, Vanilla JavaScript | 정적 단일 페이지, 카드 필터링, 반응형 UI |
| 호스팅 | GitHub Pages | `main` 브랜치 루트 페이지 공개 |
| 트래픽 분석 | Google Analytics 4, Cloudflare Web Analytics | 방문 경향·유입 및 조회 분석 |
| 방문·클릭 이벤트 API | Cloudflare Workers | 브라우저 요청 검증, 방문·이벤트 저장 |
| 데이터 저장 | Cloudflare D1 (SQLite) | 방문/클릭 집계 및 통계 조회 |
| 알림 | Discord Webhook | 신규 방문 기록 생성 시 채널 알림 |

```text
Browser
  └── GitHub Pages (index.html / style.css / script.js)
       ├── Portfolio UI
       │    ├── Experience / Projects / Skills / Documents
       │    └── Project filters (All / Data / Development)
       ├── Google Analytics 4
       ├── Cloudflare Web Analytics
       └── POST /visit, POST /event
              └── Cloudflare Worker
                     ├── D1 (portfolio_visits / portfolio_events)
                     ├── Authenticated admin dashboard / CSV
                     └── Discord Webhook (new saved visit)
```

### Portfolio Analytics V4 / Discord 알림 V4.1

- 브라우저 탭 세션의 임의 UUID와 D1 중복 방지 로직을 이용한 방문 이벤트 집계
- 방문 추이, 유입 도메인 유형, 기기·브라우저 구분, 최근 30일 기준 신규·재방문 **브라우저 세션 추정**
- 일부 문서 및 프로젝트 링크 클릭 집계(`POST /event`). **클릭은 실제 열람·다운로드 완료를 뜻하지 않습니다.**
- 관리자 인증 후 통계 대시보드 및 CSV 조회
- D1에 새 방문 기록이 저장되면 Discord Webhook 알림 전송(시간·IP 기반 추정 지역·당일 방문 횟수)
- 본인 브라우저의 자체 Worker/D1 집계 제외·재개 지원(`analytics_optout=1` / `0`). GA4·Cloudflare 분석에는 별도 설정 필요

**주의:** 방문 이벤트는 고유한 실제 사람 수나 정확한 동시 접속자 수를 의미하지 않습니다. 추정 위치는 GPS가 아닌 IP 기반의 대략적인 정보이며, 네트워크/추적 방지/전송 오류에 따라 누락될 수 있습니다. Discord 알림도 전송을 보장하는 큐 기반 시스템은 아닙니다.

**현재 프론트엔드의 클릭 이벤트 분류 목록은 제한적입니다.** DBPulse·SignalBridge의 새 링크가 모두 자체 D1 클릭 이벤트로 집계되는 것은 아닙니다. 확대하려면 `script.js`의 링크 분류 및 Worker 허용 목록을 함께 수정·배포해야 합니다.

관련 문서:
- [Analytics 구조 및 운영 설명](./analytics/README.md)
- [Cloudflare Worker 소스](./analytics/worker.js)
- [D1 스키마](./analytics/schema.sql) · [V4 마이그레이션](./analytics/migrate-v3-to-v4.sql)
- [Discord 알림 설정·점검](./analytics/discord-notifications.md)

## 5. 저장소 구조

```text
portfolio/
├── index.html                   # 경력·프로젝트·기술·문서 및 분석 스크립트 연결
├── style.css                    # 그라파이트/샴페인 골드 고정 테마, 반응형 스타일
├── script.js                    # 프로젝트 필터·모바일 메뉴·방문 및 클릭 이벤트
├── analytics/
│   ├── README.md                # 방문 분석 시스템 운영 문서
│   ├── worker.js                # Worker V4.1 관리자 통계·Discord 알림 코드
│   ├── schema.sql               # D1 테이블 및 인덱스
│   ├── migrate-v3-to-v4.sql     # 방문/이벤트 분석용 D1 마이그레이션
│   └── discord-notifications.md # Discord 설정·테스트 안내
└── README.md
```

## 6. 배포 및 운영 참고

- **정적 사이트:** GitHub Pages → `main` 브랜치 → `/(root)`. 웹 파일 변경 후 Pages 배포가 완료되어야 반영됩니다.
- **스타일 갱신:** `index.html`은 CSS 파일에 버전 쿼리를 사용해 이전 스타일 캐시가 남는 문제를 줄입니다.
- **분석 백엔드:** GitHub Pages 변경은 Cloudflare Worker에 자동 적용되지 않습니다. Worker·D1 운영/배포는 Cloudflare에서 별도로 수행합니다.
- **비밀값:** `ADMIN_TOKEN`과 `DISCORD_WEBHOOK_URL` 등의 실제 값은 Cloudflare Secret으로 관리하며 저장소에 커밋하지 않습니다.
- **외부 문서:** Notion·Google Drive의 공개 여부는 해당 서비스의 공유 권한 설정에 따릅니다.
- **운영 주의:** 분석 도구 및 IP 기반 위치 추정을 사용할 경우 적절한 개인정보 고지와 서비스 설정을 검토합니다.

## 7. 변경 이력

| 날짜 | 주요 변경 |
| --- | --- |
| **2026-11-14** | DBPulse 실행 화면 대표 이미지 표시 코드 준비 (이미지 없을 때 기존 구조도 유지) |
| **2026-11-14** | 사이트 전반 문구를 실제 작업 중심으로 수정하고 기술 스택 띠를 핵심 역량 4개로 변경 |
| **2026-11-14** | 전체 CSS 텍스트 크기 약 1px 확대, 상단 Contact를 페이지 내 연락처 이동으로 변경·모바일 메뉴에 연락처 추가 |
| **2026-11-14** | 메인/경력/프로젝트/문서 섹션의 Notion 이력서 및 포트폴리오 PDF 연결 동선 개선 (기존 링크·집계 로직 유지) |
| **2026-11-13** | 그라파이트 × 샴페인 골드 고정 테마로 전환, 5개 테마 선택 UI 제거 |
| **2026-11-13** | 데이터(골드)/개발(아이스 블루) 프로젝트 시각 구분, 전체 6개 카드 강조 통일 |
| **2026-11-13** | DBPulse 카드 여백 개선, 프로젝트 설명 가독성·기술 스택 태그 디자인 개선 |
| **2026-10-22** | DBPulse v0.21.3 프로젝트 카드/Windows 공개 릴리스 링크 반영 |
| **2026-10** | SignalBridge 프로젝트 및 로컬 MVP 이미지, 관련 GitHub·아키텍처·릴리스 링크 추가 |
| **2026-10** | Analytics V4(유입·클릭·기기·신규/재방문·CSV)와 V4.1 Discord 신규 방문 알림 구현 |
| **2026-10** | DataOps Pipeline 완료 표시, 경력·문서 링크·포트폴리오 UI 정리 |

---

이 저장소는 **포트폴리오 사이트와 방문 분석 구현**을 관리합니다. 각 프로젝트의 실제 소스코드, 설치 방법, 실행 환경, 기술적 상세 설명은 위의 **개별 프로젝트 저장소**에서 확인할 수 있습니다.
