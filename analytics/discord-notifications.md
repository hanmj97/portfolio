# Portfolio Analytics V4.1 — Discord Webhook 방문 즉시 알림

기존 Cloudflare Worker **V4**의 통계·지도·클릭·유입·CSV·관리자 인증을 유지하면서, 방문 기록이 실제로 D1에 **새로 INSERT**된 경우에만 Discord 채널로 메시지를 전송합니다. 기존 V4.1 텔레그램 버전을 따로 적용할 필요는 없습니다.

## 1. Discord 웹훅 생성

1. Discord에서 본인이 관리하는 서버(권장: 개인 비공개 서버)를 만들거나 접속합니다.
2. 알림을 받을 텍스트 채널(예: `#portfolio-visits`)을 만들고, 개인만 볼 수 있게 채널 권한을 확인합니다.
3. **채널 편집 → 연동(Integrations) → 웹후크(Webhooks) → 새 웹후크**를 생성하고 이름을 `Portfolio Analytics`로 설정합니다. (서버/앱 UI 버전에 따라 **서버 설정 → 연동 → 웹후크**에 있을 수 있습니다.)
4. **웹후크 URL 복사**를 클릭합니다. **웹후크 URL은 비밀번호처럼 취급**하고 ChatGPT·GitHub에 붙여넣지 마세요. URL을 아는 사람은 채널에 메시지를 게시할 수 있습니다.

## 2. Cloudflare Secret 추가

Cloudflare → **Workers & Pages → portfolio-counter → Settings → Variables and Secrets → Add**

| Type | Variable name | Value |
| --- | --- | --- |
| Secret | `DISCORD_WEBHOOK_URL` | Discord에서 복사한 웹후크 전체 URL |

기존 D1 Binding `DB`, 관리자 Secret `ADMIN_TOKEN`은 그대로 유지합니다. 텔레그램용 Secret(`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)은 필요 없습니다.

## 3. Worker 배포

Cloudflare → `portfolio-counter` → **Edit Code** → 현재 V4 Worker 코드를 백업 → 압축파일의 **`worker.js` 전체**로 교체 → **Deploy**.

- **D1 마이그레이션 불필요:** 기존 `portfolio_visits`, `portfolio_events` 데이터 변경/삭제 없음.
- **GitHub Pages 수정 불필요:** 기존 `/visit` / `/event` 요청을 그대로 수신합니다.

## 4. 테스트

1. Worker `https://portfolio-counter.hanmj97.workers.dev/health`에서 D1 연결 상태가 정상인지 확인합니다.
2. `https://portfolio-counter.hanmj97.workers.dev/admin`에서 관리자 로그인 후 하단 **🔔 디스코드 알림 테스트** 버튼을 클릭해 새 메시지가 채널에 도착하는지 확인합니다. **이 테스트는 방문 카운트를 증가시키지 않습니다.**
3. 새 브라우저 세션(새 시크릿 창 등)에서 `https://hanmj97.github.io/portfolio/` 방문 → D1에 새 기록이 생기면 Discord로 방문 시각(KST), 추정 지역, 오늘 방문 횟수가 전송됩니다. 같은 탭에서 새로고침만 하면 중복 알림이 오지 않습니다.

**참고:** 브라우저에 내 방문 제외(`analytics_optout=1`)가 설정되어 있으면 Worker로 방문 요청을 보내지 않으므로 알림도 오지 않습니다. GA4·Cloudflare 기본 분석은 별도입니다.

## 보안·주의 사항

- Webhook URL은 **Cloudflare Secret**에만 보관하며 공개 HTML/JS, GitHub README, 로그에 남기지 않습니다.
- Discord 메시지에는 원본 IP·정확한 GPS 위치·방문자 이름이 들어가지 않습니다. 도시·광역지역·국가 등 **IP 기반 추정 위치**만 포함합니다. 방문 시각과 추정 위치도 개인정보가 될 수 있으므로 공개 사이트의 수집·외부 전송 고지를 검토하세요.
- Discord 웹훅이 네트워크 오류나 Discord의 전송 제한(HTTP 429)으로 실패하면 방문 집계는 정상 저장되지만 알림은 **누락될 수 있습니다**. 메시지 재시도/대기열은 구현하지 않았습니다.
- 모바일에서 푸시 알림을 받으려면 Discord 앱의 알림 허용, 서버 및 해당 채널의 알림 설정을 확인하세요. Discord의 알림 동작은 기기와 서버 설정에 따라 다릅니다.
- Origin 검증만으로 스팸이나 자동화된 가짜 방문을 완전히 막을 수 없습니다.
- 관리자 테스트 API: `POST /admin/test-notification`, 기존 `ADMIN_TOKEN` Bearer 인증 필수.

## 모바일 푸시 알림이 오지 않는 경우

Discord 앱에 메시지는 기록되지만 휴대폰에서 알림이 보이지 않는다면 다음을 확인하세요.

1. **PC Discord를 완전히 종료**한 뒤 휴대폰을 잠그고 테스트합니다. PC에서 Discord가 활성화된 동안 모바일 푸시가 억제될 수 있습니다. 창만 닫지 말고 시스템 트레이에서 종료합니다.
2. 휴대폰 시스템 설정에서 Discord 알림을 허용합니다.
3. Discord 서버와 알림 채널을 음소거하지 않고 메시지 알림을 허용합니다.
4. 휴대폰의 방해 금지 모드·집중 모드 및 Discord 앱 알림 설정을 확인합니다.

실제 사용 환경에서 **PC Discord를 종료한 후 휴대폰 푸시 알림이 정상 도착함을 확인**했습니다. 이 동작은 Discord 앱과 OS 설정에 따라 달라질 수 있습니다.

## GitHub 소스 위치

- Worker 전체 소스: [`analytics/worker.js`](./worker.js)
- V4 D1 마이그레이션 기록: [`analytics/migrate-v3-to-v4.sql`](./migrate-v3-to-v4.sql)
- 포트폴리오 브라우저 이벤트 코드: [`../script.js`](../script.js)

Cloudflare에서 실행하는 실제 Webhook URL과 `ADMIN_TOKEN` 값은 저장소에 두지 않고 Cloudflare Secret에서 관리합니다.

## 변경 요약

- Worker V4 → V4.1 Discord 버전으로 교체
- 신규 D1 컬럼/테이블 없음
- 신규 Secret: `DISCORD_WEBHOOK_URL`
- 신규 관리자 버튼: **디스코드 알림 테스트**
- D1 방문 INSERT 성공 후에만 비동기 Discord 메시지 전송 (`ctx.waitUntil`)