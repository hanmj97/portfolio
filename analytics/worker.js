// Portfolio analytics V4: Cloudflare Worker + D1; preserves V3 /visit /stats /admin API
// Database binding: DB -> portfolio-analytics
// Secret variable: ADMIN_TOKEN (never put its value into GitHub)
// Public website origin: https://hanmj97.github.io

const PORTFOLIO_ORIGIN = 'https://hanmj97.github.io';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function koreanDate() {
  // Korea does not use daylight saving time (UTC+09:00).
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function json(body, status = 200, moreHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...moreHeaders,
    },
  });
}

function cors() {
  return {
    'Access-Control-Allow-Origin': PORTFOLIO_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const ADMIN_HTML = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="color-scheme" content="light">
  <title>포트폴리오 방문 통계 | 관리자</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous">
  <style>
    :root{font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif;color:#202e3e;background:#f5f7fb;font-synthesis:none}
    *{box-sizing:border-box}
    body{margin:0;padding:30px 16px 52px}
    main{max-width:1120px;margin:12px auto}
    header{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}
    .eyebrow{color:#43786f;letter-spacing:.15em;font-size:11px;font-weight:800;margin-bottom:9px}
    h1{font-size:clamp(24px,3.5vw,32px);letter-spacing:-.06em;margin:0 0 9px}
    .sub{color:#718096;font-size:13px;line-height:1.6}
    .pill{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:999px;background:#e8f5ef;color:#207057;font-size:12px;font-weight:700}
    .dot{width:7px;height:7px;border-radius:50%;background:#37a880}
    .panel,.card{background:#fff;border:1px solid #e4e9ef;border-radius:18px;box-shadow:0 5px 22px rgba(23,38,61,.025)}
    .auth{padding:20px 24px;display:flex;align-items:center;flex-wrap:wrap;gap:15px;margin-bottom:20px}
    .auth label{font-weight:750;font-size:13px}
    form{display:flex;gap:8px;flex:1;max-width:480px}
    input{flex:1;min-width:0;padding:12px 13px;border:1px solid #cfd9df;border-radius:10px;font-size:14px;color:inherit;background:#fff}
    input:focus{outline:2px solid #a9d8cf;outline-offset:1px}
    button{padding:12px 20px;border:0;border-radius:10px;color:#fff;background:#1d7669;font-size:13px;font-weight:750;cursor:pointer}
    button:hover{background:#145c52}
    button:focus-visible{outline:3px solid #7cbeb1;outline-offset:2px}
    .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:16px}
    .card{padding:23px 21px;min-width:0}
    .label{color:#6e7d8b;font-size:13px;font-weight:650}
    .number{font-size:clamp(30px,3vw,43px);font-weight:800;letter-spacing:-.045em;margin-top:10px;font-variant-numeric:tabular-nums}
    .note{font-size:11px;color:#8694a1;margin-top:8px}
    .card.highlight{border-color:#cfe5db;background:linear-gradient(135deg,#ffffff,#f0f8f4)}
    .panels{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(270px,1fr);gap:16px}
    .panel{padding:23px;min-width:0}
    .panel h2{font-size:16px;margin:0 0 5px;letter-spacing:-.02em}
    .panel .hint{font-size:12px;color:#81909d;margin-bottom:16px}
    .chart-wrap{height:260px;position:relative;display:flex;align-items:end;border-bottom:1px solid #d9e2e9;
      background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),#eef2f5 calc(25% - 1px),#eef2f5 25%)}
    .chart{width:100%;height:100%;display:flex;align-items:end;gap:clamp(2px,.55vw,7px);padding:10px 0 0;position:relative}
    .bar-cell{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative}
    .bar-fill{min-height:0;width:100%;max-width:30px;background:linear-gradient(0deg,#187d6a,#8dcaba);border-radius:5px 5px 0 0;transition:height .3s ease}
    .bar-cell:hover .bar-fill{background:linear-gradient(0deg,#146653,#62b39f)}
    .bar-cell:focus-visible{outline:2px solid #177b71;outline-offset:2px}
    .hour-labels{display:flex;gap:clamp(2px,.55vw,7px);height:25px;margin-top:7px}
    .hour-label{flex:1;min-width:0;text-align:center;color:#8292a0;font-size:10px;white-space:nowrap}
    .chart-foot{margin-top:14px;color:#73828f;font-size:12px;display:flex;justify-content:space-between;gap:8px}
    .geo-panels{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(280px,1fr);gap:16px;margin-top:16px}
    .geo-title-line{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:10px}
    .geo-title-line h2{margin:0}
    .geo-select{display:flex;align-items:center;gap:8px;color:#586b78;font-size:12px;font-weight:700}
    .geo-select select{background:#fff;color:#20313e;padding:9px 10px;border:1px solid #d8e2e9;border-radius:9px;font:inherit}
    #geoMap{height:380px;width:100%;position:relative;overflow:hidden;isolation:isolate;border-radius:12px;background:#e7f0ee;z-index:0}
    .map-notice{margin-top:12px;color:#768795;font-size:11px;line-height:1.6}
    .geo-list{display:flex;flex-direction:column;gap:16px;margin:15px 0 0}
    .geo-item{display:flex;flex-direction:column;gap:7px}
    .geo-item-row{display:flex;gap:8px;justify-content:space-between;align-items:center;color:#253746;font-size:13px}
    .geo-count{font-variant-numeric:tabular-nums;color:#547467;font-size:12px;font-weight:700}
    .geo-track{height:8px;background:#e8f0ee;border-radius:6px;overflow:hidden}
    .geo-fill{background:linear-gradient(90deg,#1f897a,#9ed8cb);height:100%;border-radius:6px;transition:width .2s ease}
    .geo-unknown{margin-top:12px;border-top:1px solid #ecf0f4;padding-top:12px;color:#738591;font-size:12px}
    .recent-location{color:#708193;font-size:11px;margin-left:auto;text-align:right}
    .recent{max-height:320px;overflow:auto;margin:0;padding:0;list-style:none}
    .recent li{padding:11px 0;border-bottom:1px solid #edf1f5;display:flex;gap:10px;align-items:center;font-size:13px}
    .recent li:last-child{border-bottom:0}
    .recent .index{display:inline-flex;justify-content:center;align-items:center;min-width:25px;height:25px;border-radius:8px;background:#eef7f3;color:#3c8070;font-size:11px;font-weight:750}
    .recent time{font-variant-numeric:tabular-nums}
    .empty{color:#9aa7b2;font-size:13px;padding:16px 0}
    .message{font-size:12px;min-height:20px;margin:12px 0 0;color:#577064}
    .warning{color:#bc4848}
    footer{color:#8592a0;font-size:12px;line-height:1.7;margin-top:18px}

    .section-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 15px}
    .v4-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:16px}
    .v4-wide{grid-column:1 / -1}
    .compact-select{background:#fff;border:1px solid #d8e2e9;border-radius:9px;padding:8px 10px;color:#20313e;font-size:12px}
    .daily-chart{height:180px;display:flex;align-items:flex-end;gap:3px;border-bottom:1px solid #d9e2e9;background:repeating-linear-gradient(to top,transparent 0,transparent calc(25% - 1px),#eef2f5 calc(25% - 1px),#eef2f5 25%);margin:6px 0 12px}
    .daily-bar{min-width:2px;flex:1;border-radius:3px 3px 0 0;background:linear-gradient(0deg,#177d6b,#99d8c6)}
    .summary-list{display:flex;flex-direction:column;gap:12px;margin-top:14px}
    .summary-row{display:flex;flex-direction:column;gap:5px;font-size:12px}
    .summary-head{display:flex;justify-content:space-between;gap:8px;min-width:0}
    .summary-head span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .summary-track{height:7px;background:#e8f0ee;border-radius:9px;overflow:hidden}
    .summary-track span{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#197e6d,#91d0be)}
    .actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .soft-button{background:#ebf5f0;color:#286b5e;font-size:12px;padding:9px 13px;text-decoration:none;border-radius:9px;display:inline-flex;align-items:center;font-weight:700}
    .soft-button:hover{background:#d7ebe2;color:#1b574d}
    .admin-info{font-size:11px;color:#718096;line-height:1.7}
    .empty-small{color:#91a0ad;font-size:12px;padding:13px 0}
    @media(max-width:800px){.v4-grid{grid-template-columns:1fr}.v4-wide{grid-column:auto}}
    [hidden]{display:none!important}
    @media(max-width:900px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.panels,.geo-panels{grid-template-columns:1fr}}
    @media(max-width:480px){#geoMap{height:320px}.recent li{flex-wrap:wrap}.recent-location{width:100%;margin-left:35px;text-align:left}.metrics{gap:9px}.card{padding:17px 14px}.auth{padding:17px}.auth form{max-width:none;width:100%;flex:unset}.panel{padding:17px}.number{font-size:30px}.bar-cell:nth-child(odd) .hour-label{display:none}}
  </style>
</head>
<body>
<main>
  <header>
    <div>
      <div class="eyebrow">PORTFOLIO / ANALYTICS</div>
      <h1>방문자 분석 대시보드</h1>
      <div class="sub">한국 시간(KST) 기준 표시 · 5초 간격 자동 갱신</div>
    </div>
    <span class="pill"><span class="dot"></span> LIVE DASHBOARD</span>
  </header>
  <section class="auth panel" aria-label="관리자 인증">
    <label for="secret">관리자 인증</label>
    <form id="login">
      <input id="secret" type="password" autocomplete="off" placeholder="관리자 비밀번호" required aria-label="관리자 비밀번호">
      <button type="submit">통계 보기</button>
    </form>
    <span class="sub" id="authStatus">로그인이 필요합니다.</span>
  </section>
  <section id="dashboard" hidden>
    <div class="metrics" aria-live="polite">
      <div class="card"><div class="label">최근 30분</div><div class="number" id="last30m">—</div><div class="note">직전 30분 동안의 방문 횟수</div></div>
      <div class="card highlight"><div class="label">최근 24시간</div><div class="number" id="last24h">—</div><div class="note">현재 시점부터 지난 24시간</div></div>
      <div class="card"><div class="label">오늘 방문 (KST)</div><div class="number" id="today">—</div><div class="note">오늘 00:00부터</div></div>
      <div class="card"><div class="label">전체 누적</div><div class="number" id="total">—</div><div class="note">집계 기능 도입 이후 전체</div></div>
    </div>
    <div class="panels">
      <section class="panel" aria-label="시간대별 방문 그래프">
        <h2>시간대별 방문 그래프</h2>
        <div class="hint">최근 24개 시간대 · 한국 시간 기준 · 시간별 방문 횟수</div>
        <div class="chart-wrap"><div id="hourlyChart" class="chart" role="img" aria-label="최근 24개 시간대 방문 횟수"></div></div>
        <div id="hourlyLabels" class="hour-labels" aria-hidden="true"></div>
        <div class="chart-foot"><span>과거 ←</span><span id="hourlySummary">합계 —회</span><span>→ 현재</span></div>
      </section>
      <section class="panel" aria-label="최근 방문 시각">
        <h2>최근 방문 시각</h2>
        <div class="hint">최신 15건 · 한국 시간(KST) 표시 · 실제 사용자 식별 정보 없음</div>
        <ol class="recent" id="recentVisits"><li class="empty">로그인하면 방문 시각을 조회합니다.</li></ol>
      </section>
    </div>
    <div class="geo-panels" aria-label="지역별 방문 현황">
      <section class="panel" aria-label="지도 위 방문 지역">
        <div class="geo-title-line"><h2>방문 지역 지도</h2>
          <label class="geo-select" for="geoPeriod">조회 기간
            <select id="geoPeriod">
              <option value="30m">최근 30분</option>
              <option value="24h" selected>최근 24시간</option>
              <option value="7d">최근 7일</option>
              <option value="all">전체 누적</option>
            </select>
          </label>
        </div>
        <div id="geoMap" role="img" aria-label="방문자의 추정 도시 위치를 표시하는 인터랙티브 지도"></div>
        <div class="map-notice" id="geoMapNotice">위치는 IP 기반 도시 수준 추정값(약 0.1도 단위)입니다. 방문자의 실제 위치와 다를 수 있습니다.</div>
      </section>
      <section class="panel" aria-label="지역별 방문 막대 그래프">
        <h2>지역별 방문 그래프</h2>
        <div class="hint">선택 기간 · 지역별 방문 횟수 상위 10곳</div>
        <div id="geoBars" class="geo-list" aria-live="polite"><p class="empty">로그인하면 지역 통계를 표시합니다.</p></div>
        <div id="geoUnknown" class="geo-unknown"></div>
      </section>
    </div>

    <div class="v4-grid">
      <section class="panel v4-wide" aria-label="일별 방문 추이">
        <div class="section-top">
          <div><h2>일별 방문 추이</h2><div class="hint">한국 시간 기준 · 일별 방문 횟수 · 전일 대비 비교</div></div>
          <div class="actions">
            <label class="geo-select">집계 <select id="trendGroup" class="compact-select"><option value="day">일별</option><option value="week">주별</option><option value="month">월별</option></select></label>
            <label class="geo-select">기간 <select id="trendDays" class="compact-select"><option value="7">최근 7일</option><option value="30" selected>최근 30일</option><option value="90">최근 90일</option></select></label>
          </div>
        </div>
        <div class="actions"><strong id="trendTotal">—</strong><span id="trendCompare" class="sub">전일 대비 —</span></div>
        <div class="daily-chart" id="dailyChart" role="img" aria-label="일별 방문 횟수 그래프"></div>
        <div class="chart-foot"><span id="trendStart">—</span><span>막대에 마우스를 올려 날짜별 방문 확인</span><span id="trendEnd">—</span></div>
      </section>
      <section class="panel" aria-label="문서 및 프로젝트 클릭 통계">
        <h2>문서·프로젝트 링크 클릭</h2><div class="hint">포트폴리오 내 외부 링크 클릭 수 · V4 적용 이후</div>
        <div id="clickStats" class="summary-list"></div>
      </section>
      <section class="panel" aria-label="유입 경로 분석">
        <h2>유입 경로</h2><div class="hint">브라우저가 전달한 유입 정보 기준 · 미확인 접속은 Direct/Unknown</div>
        <div id="sourceStats" class="summary-list"></div>
      </section>
      <section class="panel" aria-label="접속 기기 및 브라우저 통계">
        <h2>기기 및 브라우저</h2><div class="hint">정확한 기종이나 원본 User-Agent는 저장하지 않습니다.</div>
        <h3 class="label">기기 유형</h3><div id="deviceStats" class="summary-list"></div>
        <h3 class="label" style="margin-top:20px">브라우저</h3><div id="browserStats" class="summary-list"></div>
      </section>
      <section class="panel" aria-label="신규 및 재방문 브라우저 분석">
        <h2>신규 / 재방문 브라우저</h2><div class="hint">동일 브라우저의 30일 내 로컬 표시 여부 기준 · 사람 단위 추적 아님</div>
        <div id="returnStats" class="summary-list"></div>
        <div class="admin-info" style="margin-top:16px">방문자별 고정 식별자를 전송하지 않습니다. 차단된 저장소에서는 '미확인'으로 분류됩니다.</div>
      </section>
      <section class="panel v4-wide" aria-label="내 방문 제외 및 CSV 다운로드">
        <div class="section-top"><div><h2>운영 관리 · 데이터 내보내기</h2><div class="hint">비밀번호 인증 후 집계 CSV만 다운로드할 수 있습니다.</div></div></div>
        <div class="actions">
          <a class="soft-button" href="https://hanmj97.github.io/portfolio/?analytics_optout=1" rel="noopener noreferrer" target="_blank">내 브라우저의 D1 방문 집계 제외</a>
          <a class="soft-button" href="https://hanmj97.github.io/portfolio/?analytics_optout=0" rel="noopener noreferrer" target="_blank">내 브라우저의 D1 방문 집계 재개</a>
          <select id="csvKind" class="compact-select" aria-label="CSV 항목"><option value="daily">날짜별 방문</option><option value="locations">도시별 방문</option><option value="sources">유입 경로</option><option value="devices">기기 / 브라우저</option><option value="clicks">문서 / 프로젝트 클릭</option></select>
          <button id="downloadCsv" type="button">CSV 다운로드</button>
          <button id="testDiscord" type="button">🔔 디스코드 알림 테스트</button>
        </div>
        <p class="admin-info">새로운 방문이 D1에 처음 저장될 때만 디스코드 채널에 알림을 보냅니다. 기존 방문 중복 요청은 알림을 보내지 않습니다. Webhook 주소는 Cloudflare Secret으로만 관리합니다.</p>
        <p class="admin-info">방문 제외는 <strong>링크를 연 브라우저</strong>에만 저장되며, 다음 방문부터 Worker/D1 전송만 건너뜁니다. GA4·Cloudflare Web Analytics에는 별도 제외 설정이 필요합니다. 데이터에는 IP 원본이나 이름이 포함되지 않습니다.</p>
      </section>
    </div>
  </section>
  <div id="message" class="message" role="status" aria-live="polite">비밀번호를 입력하면 통계가 표시됩니다.</div>
  <footer>브라우저 탭 세션 기준 방문 횟수입니다. 실제 고유 방문자 수나 현재 동시 접속자 수가 아닙니다. 방문자의 이름, 이메일, IP 원본은 D1 테이블에 저장하지 않습니다. 접속 국가·지역·도시 및 약 0.1도 단위 좌표, 범주화한 방문 유입 경로·기기·브라우저만 기록합니다. 클릭 횟수와 재방문 여부는 브라우저 단위의 추정치입니다. 기존 V2 기록에는 지역 정보가 없습니다.</footer>
</main>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="anonymous"></script>
<script>
  // Password is held only in this page's memory, not localStorage or URL.
  let adminToken = '';
  let refreshTimer = null;
  let inFlight = false;
  let geoMap = null;
  let geoMarkers = null;
  let geoLastBoundsSignature = '';
  const $ = (id) => document.getElementById(id);
  const formatCount = (n) => Number(n || 0).toLocaleString('ko-KR');
  function asKst(utcValue) {
    // D1 CURRENT_TIMESTAMP is stored as 'YYYY-MM-DD HH:MM:SS' in UTC.
    const d = new Date(String(utcValue).replace(' ', 'T') + 'Z');
    if (Number.isNaN(d.getTime())) return String(utcValue);
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(d);
  }
  function drawChart(hours) {
    const chart = $('hourlyChart');
    const labels = $('hourlyLabels');
    chart.replaceChildren();
    labels.replaceChildren();
    const max = Math.max(1, ...hours.map((x) => Number(x.visits) || 0));
    let sum = 0;
    hours.forEach((hour, i) => {
      const value = Math.max(0, Number(hour.visits) || 0);
      sum += value;
      const cell = document.createElement('div');
      cell.className = 'bar-cell';
      cell.tabIndex = 0;
      cell.title = hour.label + ': ' + value + '회';
      cell.setAttribute('aria-label', cell.title);
      const bar = document.createElement('div');
      bar.className = 'bar-fill';
      bar.style.height = value ? Math.max(3, value / max * 95) + '%' : '0';
      cell.appendChild(bar);
      chart.appendChild(cell);
      const tick = document.createElement('span');
      tick.className = 'hour-label';
      tick.textContent = (i % 4 === 0 || i === hours.length - 1) ? hour.shortLabel : '';
      labels.appendChild(tick);
    });
    $('hourlySummary').textContent = '합계 ' + formatCount(sum) + '회';
    chart.setAttribute('aria-label', '최근 24개 시간대 방문 횟수. 합계 ' + sum + '회. 막대에 마우스를 올리거나 탭으로 이동하면 각 시간의 방문 수를 확인할 수 있습니다.');
  }
  function drawRecent(recent) {
    const root = $('recentVisits');
    root.replaceChildren();
    if (!recent.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = '아직 기록된 방문이 없습니다.';
      root.appendChild(li);
      return;
    }
    recent.forEach((record, i) => {
      const timestamp = typeof record === 'string' ? record : record.visited_at;
      const li = document.createElement('li');
      const index = document.createElement('span');
      index.className = 'index';
      index.textContent = String(i + 1).padStart(2, '0');
      const time = document.createElement('time');
      time.textContent = asKst(timestamp);
      const location = document.createElement('span');
      location.className = 'recent-location';
      location.textContent = typeof record === 'string' ? '기존 기록' : placeName(record);
      li.append(index, time, location);
      root.appendChild(li);
    });
  }
  function placeName(record) {
    if (!record || !record.country) return '지역 미기록';
    const name = [record.city, record.region].filter(Boolean).join(', ');
    return name ? name + ' · ' + record.country : record.country;
  }
  function initializeMap() {
    if (geoMap || !window.L) return;
    geoMap = L.map('geoMap', {scrollWheelZoom:false, zoomControl:true, worldCopyJump:true});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 17,
      crossOrigin: true,
    }).addTo(geoMap);
    geoMarkers = L.layerGroup().addTo(geoMap);
    geoMap.setView([36.4, 127.8], 6);
  }
  function drawGeo(locations, totalVisits) {
    const bars = $('geoBars');
    bars.replaceChildren();
    const rows = Array.isArray(locations) ? locations : [];
    const max = Math.max(1, ...rows.map((item) => Number(item.visits) || 0));
    const visible = rows.slice(0, 10);
    if (!visible.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '선택 기간에 지역 기록이 없습니다.';
      bars.appendChild(empty);
    }
    visible.forEach((item) => {
      const outer = document.createElement('div');
      outer.className = 'geo-item';
      const row = document.createElement('div');
      row.className = 'geo-item-row';
      const label = document.createElement('span');
      label.textContent = placeName(item);
      const count = document.createElement('span');
      count.className = 'geo-count';
      count.textContent = formatCount(item.visits) + '회';
      row.append(label, count);
      const track = document.createElement('div');
      track.className = 'geo-track';
      const fill = document.createElement('div');
      fill.className = 'geo-fill';
      fill.style.width = (Number(item.visits) / max * 100) + '%';
      track.appendChild(fill);
      outer.append(row, track);
      bars.appendChild(outer);
    });
    const recorded = rows.reduce((s, r) => s + (Number(r.visits) || 0), 0);
    const unknown = Math.max(0, Number(totalVisits || 0) - recorded);
    $('geoUnknown').textContent = '위치 미기록 또는 상위 50개 지역 외: ' + formatCount(unknown) + '회';
    if (!window.L) {
      $('geoMapNotice').textContent = '지도 라이브러리를 불러오지 못했습니다. 지역별 그래프는 계속 확인할 수 있습니다.';
      return;
    }
    initializeMap();
    if (!geoMap) return;
    geoMarkers.clearLayers();
    const points = [];
    rows.forEach((item) => {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);
      if (item.latitude === null || item.longitude === null || !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
          latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return;
      const count = Math.max(0, Number(item.visits) || 0);
      const circle = L.circleMarker([latitude, longitude], {
        radius: Math.min(21, 5 + Math.sqrt(count) * 2.7),
        weight:2, color:'#156e62', fillColor:'#32a28b', fillOpacity:0.65
      });
      // Never interpret external geographic data as HTML.
      const popup = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = placeName(item);
      const metric = document.createElement('p');
      metric.textContent = '방문 ' + formatCount(count) + '회 · 도시 수준 추정';
      metric.style.margin = '6px 0 0';
      popup.append(strong, metric);
      circle.bindPopup(popup);
      circle.addTo(geoMarkers);
      points.push([latitude, longitude]);
    });
    const period = $('geoPeriod').value;
    const signature = period + ':' + points.map((p) => p.join(',')).sort().join(';');
    if (geoLastBoundsSignature !== signature) {
      geoLastBoundsSignature = signature;
      if (points.length === 1) geoMap.setView(points[0], 8);
      else if (points.length > 1) geoMap.fitBounds(points, {padding:[35,35], maxZoom:8});
      else geoMap.setView([36.4, 127.8], 6);
    }
    $('geoMapNotice').textContent = points.length
      ? '지도에 ' + formatCount(points.length) + '개 지역 표시 · IP 기반 도시 단위 추정값으로 실제 방문 위치와 다를 수 있습니다.'
      : '지도에 표시할 위치 기록이 아직 없습니다. V3 배포 이후의 새 방문부터 표시됩니다.';
    geoMap.invalidateSize();
  }
  async function refresh() {
    if (!adminToken || inFlight) return;
    inFlight = true;
    try {
      const response = await fetch('/stats?period=' + encodeURIComponent($('geoPeriod').value) + '&trendDays=' + encodeURIComponent($('trendDays').value), {
        headers: { Authorization: 'Bearer ' + adminToken }, cache: 'no-store'
      });
      if (!response.ok) {
        if (response.status === 401) adminToken = '';
        throw new Error(response.status === 401 ? '관리자 비밀번호를 확인해 주세요.' : '조회 실패 (HTTP ' + response.status + ')');
      }
      const data = await response.json();
      ['last30m', 'last24h', 'today', 'total'].forEach((id) => {
        $(id).textContent = formatCount(data[id]);
      });
      drawChart(Array.isArray(data.hourly) ? data.hourly : []);
      drawRecent(Array.isArray(data.recent) ? data.recent : []);
      drawDaily(data.daily);
      renderSummary('clickStats',data.clicks);
      renderSummary('sourceStats',data.sources);
      renderSummary('deviceStats',data.devices);
      renderSummary('browserStats',data.browsers);
      renderSummary('returnStats',data.returning);
      $('dashboard').hidden = false;
      drawGeo(Array.isArray(data.locations) ? data.locations : [], data.geoTotal);
      $('authStatus').textContent = '인증 완료';
      $('message').classList.remove('warning');
      $('message').textContent = '마지막 갱신: ' + new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(new Date()) + ' (KST)';
    } catch (err) {
      $('message').textContent = err.message;
      $('message').classList.add('warning');
      if (!adminToken && refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
        $('dashboard').hidden = true;
        $('authStatus').textContent = '로그인이 필요합니다.';
      }
    } finally { inFlight = false; }
  }

  function renderSummary(id, rows, labelKey = 'label') {
    const root = $(id);
    root.replaceChildren();
    const data = Array.isArray(rows) ? rows : [];
    if (!data.length) {const x=document.createElement('div');x.className='empty-small';x.textContent='집계된 데이터가 없습니다.';root.appendChild(x);return;}
    const max=Math.max(1,...data.map(x=>Number(x.count)||0));
    data.slice(0,10).forEach(item=>{
      const row=document.createElement('div');row.className='summary-row';
      const head=document.createElement('div');head.className='summary-head';
      const name=document.createElement('span');name.textContent=String(item[labelKey]||'미확인');name.title=name.textContent;
      const number=document.createElement('strong');number.textContent=formatCount(item.count)+'회';
      head.append(name,number);
      const track=document.createElement('div');track.className='summary-track';
      const bar=document.createElement('span');bar.style.width=(Number(item.count||0)/max*100)+'%';
      track.appendChild(bar);row.append(head,track);root.appendChild(row);
    });
  }
  function drawDaily(data) {
    const dates=Array.isArray(data)?data:[];
    const group=$('trendGroup').value;
    const grouped=new Map();
    dates.forEach(d=>{
      let key=d.date;
      if(group==='month') key=d.date.slice(0,7);
      if(group==='week') {
        const dt=new Date(d.date+'T00:00:00Z');
        const weekday=(dt.getUTCDay()+6)%7;
        dt.setUTCDate(dt.getUTCDate()-weekday);
        key=dt.toISOString().slice(0,10)+' 주';
      }
      grouped.set(key,(grouped.get(key)||0)+Number(d.visits||0));
    });
    const rows=Array.from(grouped,([date,visits])=>({date,visits}));
    const root=$('dailyChart');root.replaceChildren();
    const max=Math.max(1,...rows.map(d=>Number(d.visits)||0));
    rows.forEach(d=>{
      const bar=document.createElement('div');bar.className='daily-bar';
      const n=Number(d.visits)||0;bar.style.height=(n?Math.max(2,n/max*98):0)+'%';
      bar.title=d.date+': '+formatCount(n)+'회';bar.setAttribute('aria-label',bar.title);bar.tabIndex=0;
      root.appendChild(bar);
    });
    $('trendStart').textContent=rows.length?rows[0].date:'—';
    $('trendEnd').textContent=rows.length?rows[rows.length-1].date:'—';
    $('trendTotal').textContent='기간 합계 '+formatCount(rows.reduce((s,d)=>s+Number(d.visits||0),0))+'회';
    const cur=rows.length?Number(rows[rows.length-1].visits||0):0;
    const prev=rows.length>1?Number(rows[rows.length-2].visits||0):0;
    const prior=group==='day'?'전일':group==='week'?'전주':'전월';
    $('trendCompare').textContent=prior+' 대비 '+(cur-prev>=0?'+':'')+(cur-prev)+'회 (현재 기간 진행 중)';
  }
  async function downloadCsv() {
    if(!adminToken)return;
    const btn=$('downloadCsv');btn.disabled=true;
    try {
      const kind=$('csvKind').value;
      const response=await fetch('/export?kind='+encodeURIComponent(kind)+'&days=90',{
        headers:{Authorization:'Bearer '+adminToken},cache:'no-store'});
      if(!response.ok)throw new Error('CSV 요청 실패 (HTTP '+response.status+')');
      const blob=await response.blob();
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');link.href=url;link.download='portfolio-'+kind+'-last90days.csv';
      document.body.append(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(err){ $('message').textContent=err.message;$('message').classList.add('warning'); }
    finally{btn.disabled=false;}
  }
  $('testDiscord').addEventListener('click', async () => {
    if (!adminToken) { $('message').textContent='먼저 관리자 비밀번호로 로그인해 주세요.'; return; }
    const button=$('testDiscord');button.disabled=true;
    $('message').textContent='디스코드 테스트 메시지 전송 중...';
    try {
      const r=await fetch('/admin/test-notification',{
        method:'POST',headers:{Authorization:'Bearer '+adminToken},cache:'no-store',
      });
      const data=await r.json();
      if(!r.ok||!data.ok)throw new Error(data.error||('HTTP '+r.status));
      $('message').classList.remove('warning');
      $('message').textContent='디스코드 테스트 메시지를 전송했습니다. Discord 앱에서 채널을 확인해 주세요.';
    } catch(err) {
      $('message').classList.add('warning');
      $('message').textContent='디스코드 테스트 오류: '+err.message;
    } finally {button.disabled=false;}
  });
    $('downloadCsv').addEventListener('click',downloadCsv);
  $('trendDays').addEventListener('change',()=>refresh());
  $('trendGroup').addEventListener('change',()=>refresh());
  $('geoPeriod').addEventListener('change', () => { geoLastBoundsSignature = ''; refresh(); });
  $('login').addEventListener('submit', (event) => {
    event.preventDefault();
    adminToken = $('secret').value;
    $('secret').value = '';
    if (refreshTimer) clearInterval(refreshTimer);
    refresh();
    refreshTimer = setInterval(refresh, 5000);
  });
</script>
</body>
</html>`;

// Cloudflare request.cf is IP-derived approximation, not GPS. Avoid storing full IPs
// or raw coordinates; round approximate coordinates to one decimal (~11 km latitude).
function placeField(value) {
  if (typeof value !== 'string') return null;
  const valueClean = value.replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 80);
  return valueClean || null;
}
function coarseCoordinate(value, lower, upper) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= lower && n <= upper ? Math.round(n * 10) / 10 : null;
}
function approximateGeo(cf) {
  const code = cf?.country;
  const country = typeof code === 'string' && /^[A-Za-z]{2}$/.test(code) ? code.toUpperCase() : null;
  return {
    country,
    region: placeField(cf?.region),
    city: placeField(cf?.city),
    latitude: coarseCoordinate(cf?.latitude, -90, 90),
    longitude: coarseCoordinate(cf?.longitude, -180, 180),
  };
}
// SQL templates only come from this trusted fixed whitelist, never raw user input.
const GEO_PERIODS = {
  '30m': "WHERE datetime(visited_at) >= datetime('now', '-30 minutes')",
  '24h': "WHERE datetime(visited_at) >= datetime('now', '-24 hours')",
  '7d': "WHERE datetime(visited_at) >= datetime('now', '-7 days')",
  all: '',
};


const SOURCE_TYPES = new Set(['direct','job','search','social','referral','unknown']);
const VISITOR_TYPES = new Set(['new','returning','unknown']);
const TRACKED_TARGETS = {
  notion_resume: 'document', resume_pdf: 'document', portfolio_pdf: 'document', career_pdf: 'document',
  dataops_github: 'project', blackjack_github: 'project', blackjack_demo: 'project',
  github_profile: 'project', tech_blog: 'project', email_contact: 'contact', project_section: 'navigation',
};
function cleanSource(host, type) {
  const source_type = SOURCE_TYPES.has(type) ? type : 'unknown';
  // Host only, no URL path, query, or fragment; limits data collection.
  const source_host = typeof host === 'string' && /^[a-z0-9.-]{1,128}$/i.test(host) && !host.includes('..')
    ? host.toLowerCase() : null;
  return {source_type,source_host};
}
function deviceInfo(ua) {
  const v=String(ua||'').slice(0,500);
  const device_type=/ipad|tablet|android(?!.*mobile)/i.test(v)?'tablet':/mobi|iphone|ipod/i.test(v)?'mobile':'desktop';
  let browser_name='Other';
  if(/edg\//i.test(v)) browser_name='Edge';
  else if(/firefox\//i.test(v)) browser_name='Firefox';
  else if(/chrome\//i.test(v)) browser_name='Chrome';
  else if(/safari\//i.test(v)) browser_name='Safari';
  return {device_type,browser_name};
}
function dateKstOffset(offset) {
  return new Date(Date.now()+9*3600000+offset*86400000).toISOString().slice(0,10);
}
function csvSafe(value) {
  const cleaned=String(value??'').replace(/[\x00-\x1f\x7f]/g,' ').trim();
  // Neutralize spreadsheet formula execution and escape CSV double quotes.
  const safe=/^[=+@\-]/.test(cleaned)?"'"+cleaned:cleaned;
  return '"'+safe.replace(/"/g,'""')+'"';
}
function csvResponse(headers,rows,name) {
  const body='﻿'+[headers,...rows].map(row=>row.map(csvSafe).join(',')).join('\r\n');
  return new Response(body,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="'+name+'"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
function isAuthorized(request,env) {
  return !!env.ADMIN_TOKEN && request.headers.get('Authorization') === 'Bearer '+env.ADMIN_TOKEN;
}
function analyticsCors(request) {
  return request.headers.get('Origin') === PORTFOLIO_ORIGIN;
}
const LABELS = { notion_resume:'Notion 이력서', resume_pdf:'이력서 PDF', portfolio_pdf:'포트폴리오 PDF', career_pdf:'경력기술서 PDF',
  dataops_github:'DataOps GitHub', blackjack_github:'Blackjack GitHub', blackjack_demo:'Blackjack 데모', github_profile:'GitHub 프로필',
  tech_blog:'기술 블로그', email_contact:'이메일', project_section:'프로젝트 섹션' };

// Discord notifications use a server-side Cloudflare Secret only.
// Do not include webhook URLs in GitHub Pages code, exported statistics, or public logs.
function discordWebhookConfigured(env) {
  const v = env.DISCORD_WEBHOOK_URL;
  if (typeof v !== 'string' || !v.trim()) return false;
  try {
    const u = new URL(v.trim());
    // Restrict outbound destination to the official Discord webhook API.
    return u.protocol === 'https:' && u.hostname === 'discord.com' &&
      /^\/api(?:\/v\d+)?\/webhooks\/\d+\/[A-Za-z0-9_-]+\/?$/.test(u.pathname);
  } catch (_) { return false; }
}

function safeLocation(value) {
  // Cloudflare geo is untrusted input; don't allow mentions, markdown or newlines.
  return typeof value === 'string' ? value.replace(/[^\p{L}\p{N} .,()\-_]/gu, '').slice(0, 80) : '';
}

function discordNoticeEmbed(geo, count, isTest = false) {
  const when = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(new Date());
  const city = [geo?.city, geo?.region, geo?.country].map(safeLocation).filter(Boolean).join(', ') || '지역 미확인';
  return {
    title: isTest ? '✅ 디스코드 알림 연결 테스트' : '🔔 포트폴리오 신규 방문',
    description: isTest ? '관리자 인증과 Discord Webhook 전송이 정상적으로 동작합니다.'
      : '포트폴리오에 새로운 방문 기록이 저장되었습니다.',
    color: isTest ? 0x4b83b6 : 0x259b84,
    fields: isTest ? [
      {name: '테스트 시각 (KST)', value: when, inline: false},
    ] : [
      {name: '방문 시각 (KST)', value: when, inline: false},
      {name: '추정 지역', value: city, inline: false},
      {name: '오늘 방문', value: count === null ? '집계 확인 중' : String(count) + '회', inline: true},
    ],
    url: 'https://portfolio-counter.hanmj97.workers.dev/admin',
    footer: {text: 'Portfolio Analytics · IP 기반 지역 추정, 실제 위치와 다를 수 있음'},
  };
}

async function sendDiscordNotification(env, embed) {
  if (!discordWebhookConfigured(env)) return {ok:false, error:'DISCORD_WEBHOOK_URL Secret is not configured or invalid.'};
  const u = new URL(env.DISCORD_WEBHOOK_URL.trim());
  u.searchParams.set('wait','true'); // Receive acknowledgement when a message was actually created.
  let response;
  try {
    response = await fetch(u.toString(), {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        username:'Portfolio Analytics',
        allowed_mentions:{parse:[]},
        embeds:[embed],
      }),
    });
  } catch (_) {return {ok:false,error:'Discord Webhook network request failed.'};}
  if (!response.ok) {
    // Do not disclose webhook URL or response body (both can contain sensitive values).
    return {ok:false,error:'Discord Webhook returned HTTP '+response.status+'.'};
  }
  return {ok:true};
}

async function notifyDiscordOnVisit(env, date, geo) {
  let todayCount = null;
  try {
    const r=await env.DB.prepare('SELECT COUNT(*) AS total FROM portfolio_visits WHERE visit_date = ?').bind(date).first();
    todayCount=Number(r?.total ?? 0);
  } catch (_) {
    // Notification failure cannot affect the successfully inserted visit row.
  }
  const result=await sendDiscordNotification(env,discordNoticeEmbed(geo,todayCount));
  if (!result.ok) console.warn('Portfolio Discord notice failed:',result.error);
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === '/health' && request.method === 'GET') {
      try {
        await env.DB.prepare('SELECT 1 AS ok').first();
        return json({ ok: true, database: 'connected' });
      } catch {
        return json({ ok: false, database: 'unavailable' }, 503);
      }
    }

    if (pathname === '/admin' && request.method === 'GET') {
      return new Response(ADMIN_HTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'X-Frame-Options': 'DENY',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline' https://unpkg.com; script-src 'unsafe-inline' https://unpkg.com; img-src data: https://tile.openstreetmap.org; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
        },
      });
    }

    if (pathname === '/stats' && request.method === 'GET') {
      if (!env.ADMIN_TOKEN) return json({ error: 'Admin secret not configured' }, 503);
      if (request.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
        return json({ error: 'Unauthorized' }, 401);
      }
      try {
        const date = koreanDate();
        // The first two rolling windows use SQLite's UTC clock, not the Korean calendar day.
        // The hourly series uses 24 KST-labeled hourly buckets ending at the current hour.
        const thisHourUtc = Math.floor(Date.now() / 3600000) * 3600000;
        const firstHourUtc = thisHourUtc - 23 * 3600000;
        const firstHourUtcSql = new Date(firstHourUtc).toISOString().slice(0, 19).replace('T', ' ');
        const params = new URL(request.url).searchParams;
        const period = params.get('period') || '24h';
        const trendDays=Number(params.get('trendDays')||30);
        if(![7,30,90].includes(trendDays))return json({error:'Invalid trendDays'},400);
        if (!Object.prototype.hasOwnProperty.call(GEO_PERIODS, period)) return json({ error: 'Invalid period' }, 400);
        const where = GEO_PERIODS[period];
        const geoWhere = where ? where + ' AND country IS NOT NULL' : 'WHERE country IS NOT NULL';
        const [summary, byHour, latest, geoRows, geoCount, dayRows, clickRows, sourceRows, deviceRows, browserRows, cohortRows] = await Promise.all([
          env.DB.prepare(`SELECT COUNT(*) AS total,
             COALESCE(SUM(CASE WHEN visit_date = ? THEN 1 ELSE 0 END), 0) AS today,
             COALESCE(SUM(CASE WHEN datetime(visited_at) >= datetime('now', '-30 minutes') THEN 1 ELSE 0 END), 0) AS last30m,
             COALESCE(SUM(CASE WHEN datetime(visited_at) >= datetime('now', '-24 hours') THEN 1 ELSE 0 END), 0) AS last24h
           FROM portfolio_visits`).bind(date).first(),
          env.DB.prepare(`SELECT strftime('%Y-%m-%d %H:00:00', visited_at) AS hour_utc,
             COUNT(*) AS visits FROM portfolio_visits
             WHERE visited_at >= ?
             GROUP BY hour_utc ORDER BY hour_utc`).bind(firstHourUtcSql).all(),
          env.DB.prepare(`SELECT visited_at, country, region, city FROM portfolio_visits
             ORDER BY visited_at DESC LIMIT 15`).all(),
          env.DB.prepare(`SELECT country, region, city,
               ROUND(AVG(latitude_approx), 1) AS latitude,
               ROUND(AVG(longitude_approx), 1) AS longitude,
               COUNT(*) AS visits FROM portfolio_visits ${geoWhere}
               GROUP BY country, region, city ORDER BY visits DESC LIMIT 50`).all(),
          env.DB.prepare(`SELECT COUNT(*) AS count FROM portfolio_visits ${where}`).first(),
          env.DB.prepare('SELECT visit_date AS date,COUNT(*) AS visits FROM portfolio_visits WHERE visit_date >= ? GROUP BY visit_date ORDER BY visit_date').bind(dateKstOffset(-89)).all(),
          env.DB.prepare('SELECT target_key, COUNT(*) AS count FROM portfolio_events GROUP BY target_key ORDER BY count DESC LIMIT 10').all(),
          env.DB.prepare('SELECT source_type,source_host,COUNT(*) AS count FROM portfolio_visits WHERE source_type IS NOT NULL GROUP BY source_type,source_host ORDER BY count DESC LIMIT 10').all(),
          env.DB.prepare('SELECT device_type,COUNT(*) AS count FROM portfolio_visits WHERE device_type IS NOT NULL GROUP BY device_type ORDER BY count DESC').all(),
          env.DB.prepare('SELECT browser_name,COUNT(*) AS count FROM portfolio_visits WHERE browser_name IS NOT NULL GROUP BY browser_name ORDER BY count DESC').all(),
          env.DB.prepare('SELECT visitor_type,COUNT(*) AS count FROM portfolio_visits WHERE visitor_type IS NOT NULL GROUP BY visitor_type ORDER BY count DESC').all(),
        ]);
        const countByHour = new Map(
          (byHour.results || []).map(row => [row.hour_utc, Number(row.visits) || 0])
        );
        const hourly = [];
        const fmtHour = new Intl.DateTimeFormat('ko-KR', {
          timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit',
          hour: '2-digit', hour12: false, hourCycle: 'h23',
        });
        const fmtShort = new Intl.DateTimeFormat('ko-KR', {
          timeZone: 'Asia/Seoul', hour: '2-digit', hour12: false, hourCycle: 'h23',
        });
        for (let i = 0; i < 24; i++) {
          const hourMs = firstHourUtc + i * 3600000;
          const hourDate = new Date(hourMs);
          const key = hourDate.toISOString().slice(0, 13).replace('T', ' ') + ':00:00';
          hourly.push({
            label: fmtHour.format(hourDate),
            shortLabel: fmtShort.format(hourDate),
            visits: countByHour.get(key) || 0,
          });
        }
        const recent = (latest.results || []).map(row => ({
          visited_at: row.visited_at, country: row.country, region: row.region, city: row.city,
        }));
        const locations = (geoRows.results || []).map(row => ({
          country: row.country, region: row.region, city: row.city,
          latitude: row.latitude, longitude: row.longitude,
          visits: Number(row.visits) || 0,
        }));
        const dailyMap=new Map((dayRows.results||[]).map(x=>[x.date,Number(x.visits)||0]));
        const daily=[];
        for(let i=trendDays-1;i>=0;i--){const d=dateKstOffset(-i);daily.push({date:d,visits:dailyMap.get(d)||0});}
        const clicks=(clickRows.results||[]).map(x=>({label:LABELS[x.target_key]||x.target_key,count:Number(x.count)||0}));
        const sources=(sourceRows.results||[]).map(x=>({label:(x.source_type||'unknown') + (x.source_host?' · '+x.source_host:''),count:Number(x.count)||0}));
        const devices=(deviceRows.results||[]).map(x=>({label:x.device_type,count:Number(x.count)||0}));
        const browsers=(browserRows.results||[]).map(x=>({label:x.browser_name,count:Number(x.count)||0}));
        const returning=(cohortRows.results||[]).map(x=>({label:x.visitor_type==='new'?'첫 방문 브라우저':x.visitor_type==='returning'?'재방문 브라우저':'미확인',count:Number(x.count)||0}));
        return json({
          daily, clicks, sources, devices, browsers, returning,
          date, today: Number(summary?.today || 0), total: Number(summary?.total || 0),
          last30m: Number(summary?.last30m || 0), last24h: Number(summary?.last24h || 0),
          hourly, recent, locations, geoPeriod: period, geoTotal: Number(geoCount?.count || 0),
        });
      } catch {
        return json({ error: 'Database query failed' }, 500);
      }
    }


    // Admin-only test: sends a Discord message without incrementing the visit counter.
    if (pathname === '/admin/test-notification' && request.method === 'POST') {
      if (!env.ADMIN_TOKEN) return json({error:'Admin secret not configured'},503);
      if (!isAuthorized(request,env)) return json({error:'Unauthorized'},401);
      const sent=await sendDiscordNotification(env,discordNoticeEmbed(null,null,true));
      return sent.ok ? json({ok:true,message:'Discord test message sent.'})
        : json({ok:false,error:sent.error},502);
    }

    if (pathname === '/event') {
      if (!analyticsCors(request)) return json({error:'Forbidden origin'},403);
      if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors()});
      if (request.method !== 'POST') return json({error:'Method not allowed'},405,cors());
      if (!(request.headers.get('Content-Type')||'').startsWith('application/json')) return json({error:'Expected JSON'},415,cors());
      try {
        const raw=await request.text();
        if(raw.length>300)return json({error:'Payload too large'},413,cors());
        const payload=JSON.parse(raw);
        const target=payload.target;
        if(typeof target!=='string' || !Object.prototype.hasOwnProperty.call(TRACKED_TARGETS,target) ||
          typeof payload.eventId!=='string' || !UUID_V4.test(payload.eventId))return json({error:'Invalid event'},400,cors());
        const date=koreanDate();
        const result=await env.DB.prepare('INSERT OR IGNORE INTO portfolio_events (event_id,event_date,target_key,target_group) VALUES (?,?,?,?)')
          .bind(payload.eventId,date,target,TRACKED_TARGETS[target]).run();
        return json({ok:true,counted:(result.meta?.changes??0)>0},200,cors());
      }catch{return json({error:'Unable to save event'},500,cors());}
    }

    if (pathname === '/export' && request.method === 'GET') {
      if (!env.ADMIN_TOKEN)return json({error:'Admin secret not configured'},503);
      if (!isAuthorized(request,env))return json({error:'Unauthorized'},401);
      const u=new URL(request.url);const kind=u.searchParams.get('kind');
      const days=Number(u.searchParams.get('days')||90);
      if(!Number.isInteger(days)||days<1||days>90)return json({error:'Invalid days'},400);
      const cutoff=dateKstOffset(-(days-1));
      try {
        const allowed=['daily','locations','sources','devices','clicks'];
        if(!allowed.includes(kind))return json({error:'Invalid CSV category'},400);
        let headers,rows;
        if(kind==='daily') {
          headers=['날짜(KST)','방문횟수'];
          const r=await env.DB.prepare('SELECT visit_date AS date,COUNT(*) AS count FROM portfolio_visits WHERE visit_date >= ? GROUP BY visit_date ORDER BY visit_date').bind(cutoff).all();
          rows=(r.results||[]).map(x=>[x.date,x.count]);
        } else if(kind==='locations') {
          headers=['국가','지역','도시','방문횟수'];
          const r=await env.DB.prepare('SELECT country,region,city,COUNT(*) AS count FROM portfolio_visits WHERE visit_date>=? AND country IS NOT NULL GROUP BY country,region,city ORDER BY count DESC LIMIT 500').bind(cutoff).all();
          rows=(r.results||[]).map(x=>[x.country,x.region,x.city,x.count]);
        } else if(kind==='sources') {
          headers=['유입유형','유입도메인','방문횟수'];
          const r=await env.DB.prepare('SELECT source_type,source_host,COUNT(*) AS count FROM portfolio_visits WHERE visit_date>=? GROUP BY source_type,source_host ORDER BY count DESC LIMIT 500').bind(cutoff).all();
          rows=(r.results||[]).map(x=>[x.source_type||'미기록',x.source_host||'',x.count]);
        } else if(kind==='devices') {
          headers=['기기유형','브라우저','방문횟수'];
          const r=await env.DB.prepare('SELECT device_type,browser_name,COUNT(*) AS count FROM portfolio_visits WHERE visit_date>=? GROUP BY device_type,browser_name ORDER BY count DESC').bind(cutoff).all();
          rows=(r.results||[]).map(x=>[x.device_type||'미기록',x.browser_name||'미기록',x.count]);
        } else {
          headers=['클릭유형','대상','클릭횟수'];
          const r=await env.DB.prepare('SELECT target_group,target_key,COUNT(*) AS count FROM portfolio_events WHERE event_date>=? GROUP BY target_group,target_key ORDER BY count DESC').bind(cutoff).all();
          rows=(r.results||[]).map(x=>[x.target_group,LABELS[x.target_key]||x.target_key,x.count]);
        }
        return csvResponse(headers,rows,'portfolio-'+kind+'.csv');
      }catch {return json({error:'Unable to export CSV'},500);}
    }

    if (pathname === '/visit') {
      // Origin checks protect normal browser requests, not forged server-to-server requests.
      if (request.headers.get('Origin') !== PORTFOLIO_ORIGIN) {
        return json({ error: 'Forbidden origin' }, 403);
      }
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: cors() });
      }
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors());
      if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) {
        return json({ error: 'Expected JSON' }, 415, cors());
      }
      try {
        const raw = await request.text();
        if (raw.length > 700) return json({ error: 'Payload too large' }, 413, cors());
        const payload = JSON.parse(raw);
        if (typeof payload.visitId !== 'string' || !UUID_V4.test(payload.visitId)) {
          return json({ error: 'Invalid session identifier' }, 400, cors());
        }
        const date = koreanDate();
        // Each session is counted at most once per Korean calendar day.
        const uniqueKey = `${date}:${payload.visitId.toLowerCase()}`;
        const geo = approximateGeo(request.cf);
        const source=cleanSource(payload.sourceHost,payload.sourceType);
        const device=deviceInfo(request.headers.get('User-Agent'));
        const visitorType=VISITOR_TYPES.has(payload.visitorType)?payload.visitorType:'unknown';
        const result = await env.DB.prepare(
          'INSERT OR IGNORE INTO portfolio_visits (visit_id, visit_date, country, region, city, latitude_approx, longitude_approx, source_type, source_host, device_type, browser_name, visitor_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(uniqueKey, date, geo.country, geo.region, geo.city, geo.latitude, geo.longitude, source.source_type, source.source_host, device.device_type, device.browser_name, visitorType).run();
        const counted=(result.meta?.changes ?? 0)>0;
        // Notify exactly once for a newly inserted D1 visit, not on reloads / duplicate keys.
        if (counted && discordWebhookConfigured(env)) {
          ctx.waitUntil(notifyDiscordOnVisit(env,date,geo).catch(() => {
            console.warn('Portfolio Discord notice failed unexpectedly.');
          }));
        }
        return json({ok:true,counted},200,cors());
      } catch {
        return json({ error: 'Unable to save visit' }, 500, cors());
      }
    }

    return json({ error: 'Not found' }, 404);
  },
};