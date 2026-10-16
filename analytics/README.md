# Portfolio Analytics — 구현 기록

GitHub Pages 기반 정적 포트폴리오에 분석 및 방문 카운터를 추가한 구성입니다.

## 구조

```text
방문자 브라우저
  ├─ GitHub Pages (index.html + script.js)
  │    ├─ Google Analytics 4 (GA4): 실시간/유입 분석
  │    ├─ Cloudflare Web Analytics: 방문/페이지 조회 분석
  │    └─ POST /visit → Cloudflare Worker
  │                         └─ D1 Database (portfolio-analytics)
  │                              └─ portfolio_visits 테이블
  └─ 관리자 → Worker /admin → 인증 후 GET /stats → D1 집계
```

## 사용 기술과 역할

| 구성요소 | 기술 | 역할 |
| --- | --- | --- |
| 정적 웹사이트 | GitHub Pages / HTML / CSS / JavaScript | 반응형 포트폴리오 배포 |
| 유입 분석 | Google Analytics 4 | 실시간 보고서, 방문 경로, 기기 등 |
| 웹 트래픽 분석 | Cloudflare Web Analytics | 페이지 조회, 방문 추이 등 |
| 방문 기록 API | Cloudflare Workers | 브라우저 요청 검증, 중복 방문 처리 |
| 데이터베이스 | Cloudflare D1 (SQLite) | 날짜별 방문 이벤트 저장 및 집계 |
| 관리자 화면 | Worker /admin | 오늘/누적 방문 조회, 약 5초 간격 갱신 |

## D1 스키마

[`schema.sql`](./schema.sql) 파일에 테이블 및 인덱스 생성 쿼리를 보관했습니다.

- `visit_id`: 한국 날짜와 탭 세션의 임의 UUID로 구성된 중복 방지 키
- `visit_date`: 한국 시간 기준 YYYY-MM-DD
- `visited_at`: 데이터베이스가 기록한 UTC 생성 시각

## 방문 흐름

1. 방문자가 `https://hanmj97.github.io/portfolio/`에 접속합니다.
2. 프론트엔드 `script.js`가 `sessionStorage`에 임의 UUID를 저장하거나 재사용합니다.
3. `POST https://portfolio-counter.hanmj97.workers.dev/visit`로 `{ "visitId": "..." }`을 보냅니다.
4. Worker가 Origin, 요청 방식, 데이터 형식을 검사하고 D1에 `INSERT OR IGNORE`로 저장합니다.
5. 관리자 화면에서 `ADMIN_TOKEN`으로 인증한 후 `GET /stats` 조회로 오늘/누적 건수를 확인합니다.

같은 브라우저 탭의 동일 날짜 재방문은 중복 저장하지 않습니다. 다른 탭/세션에서는 새 방문으로 기록될 수 있으므로 **실제 고유 인원 수를 나타내는 지표는 아닙니다**. 브라우저 추적 차단, 네트워크, JavaScript 비활성화 등에 의해 일부 방문은 누락될 수 있습니다. 또한 통계는 정확한 동시 접속자 수가 아니라 방문 이벤트 집계입니다.

## 운영과 보안

- Cloudflare Worker의 D1 바인딩 변수는 `DB`, 데이터베이스는 `portfolio-analytics`입니다.
- 관리자 인증 값은 Cloudflare **Secret(`ADMIN_TOKEN`)** 으로만 설정합니다. GitHub 저장소에 비밀번호/인증 토큰을 커밋하지 않습니다.
- D1 애플리케이션 스키마에 방문자의 이름, 이메일, IP를 저장하지 않습니다.
- 브라우저 Origin 제한은 일반적인 브라우저 접근 제어일 뿐, 위조 요청·봇·중복 방문을 완전히 차단하지 못합니다.
- Cloudflare Worker는 Cloudflare 대시보드에서 별도로 배포/운영합니다. **GitHub Pages에 파일을 배포한다고 Worker 코드가 자동 배포되는 구조는 아닙니다.**
- Worker의 관리자 통계 경로는 인증을 필요로 합니다. GA4/Cloudflare 통계는 각 서비스의 대시보드에서 확인합니다.
- GA4 및 Cloudflare Web Analytics 코드가 사용되므로 공개 운영 시 개인정보 처리 고지와 해당 분석 서비스 설정을 검토합니다.

## 확인 절차

1. [홈페이지](https://hanmj97.github.io/portfolio/)가 정상 로드되는지 확인
2. Worker `/health`에서 `database: connected` 응답 확인
3. 새로운 탭 세션에서 포트폴리오 접속 후 관리자 `/admin`의 방문 집계 확인
4. D1 Console에서 `SELECT COUNT(*) FROM portfolio_visits;` 실행
5. Google Analytics 실시간 보고서 및 Cloudflare Web Analytics 대시보드 확인

> 위 문서는 구현 기록입니다. 운영 중인 Worker 소스는 Cloudflare에서 별도로 관리하며, 이 저장소에는 공개해도 되는 설정 및 데이터베이스 스키마만 기록했습니다.


## V4 확장: 유입·클릭·기기·재방문 분석 (2026-10)

GitHub Pages의 \`script.js\`를 V4 Worker API에 연동했습니다.

- **방문 추이**: 관리자 화면에서 일/주/월 단위 및 기간별 집계 조회
- **클릭 이벤트**: Notion, 이력서·포트폴리오·경력기술서 PDF, DataOps/Blackjack GitHub, 데모 등 링크 클릭 시 \`POST /event\` (파일 열람/다운로드 완료 여부와는 다름)
- **유입 분석**: 브라우저에서 보내는 \`document.referrer\`의 **도메인만** 분류하여 \`POST /visit\`에 전달. 경로·검색어·쿼리는 저장하지 않음
- **접속 환경**: Worker가 User-Agent로부터 기기 유형과 브라우저 이름만 분류하여 저장. 원문 User-Agent는 D1 테이블에 저장하지 않음
- **내 방문 제외**: 관리자 화면의 \`?analytics_optout=1\` 링크로 해당 브라우저의 **Worker/D1 집계만** 제외하며 \`?analytics_optout=0\`으로 다시 포함. GA4/Cloudflare Web Analytics에는 자동 반영되지 않음
- **신규·재방문 추정**: 브라우저 \`localStorage\`에 최근 접속 표시를 보관하여 30일 내 재방문 세션을 구분. 이는 고유 사용자 수가 아님
- **CSV**: Worker 관리자 인증 후 D1 집계 데이터 CSV 다운로드 (최대 최근 90일)

**[V4 D1 마이그레이션 SQL](./migrate-v3-to-v4.sql)** — 기존 테이블과 데이터를 유지하면서 \`portfolio_visits\`에 컬럼을 추가하고 \`portfolio_events\` 테이블을 생성합니다. 이미 적용한 SQL은 다시 실행하지 마세요. 운영 중 Worker V4 소스는 Cloudflare 대시보드에서 별도로 관리됩니다.

새 항목은 프론트엔드 V4 배포 이후부터 수집되므로 이전 기록에 해당 항목이 비어 있는 것은 정상입니다. 브라우저별 추적 차단 설정과 위치 추정 오차로 집계가 실제 접속과 다를 수 있습니다. 개인정보 처리 고지 및 분석 도구 설정은 공개 운영 환경에 맞춰 별도 검토가 필요합니다.
