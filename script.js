const filters=document.querySelectorAll('.filter');const projects=document.querySelectorAll('.project');filters.forEach(btn=>btn.addEventListener('click',()=>{const category=btn.dataset.filter;filters.forEach(item=>{const selected=item===btn;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected))});projects.forEach(project=>project.hidden=category!=='all'&&project.dataset.category!==category)}));const menu=document.querySelector('#menu');const nav=document.querySelector('#nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰'}));

// Save the selected visual theme on this browser, without any server interaction.
const themePicker=document.getElementById('themeSelect');
const availableThemes=['white','lavender','sage','dark','slate'];
let selectedTheme='white';
try { const saved=localStorage.getItem('hanminjae-theme'); if(availableThemes.includes(saved))selectedTheme=saved; }catch(e){}
document.documentElement.dataset.theme=selectedTheme;
themePicker.value=selectedTheme;
themePicker.addEventListener('change',()=>{
  const theme=availableThemes.includes(themePicker.value)?themePicker.value:'white';
  document.documentElement.dataset.theme=theme;
  document.querySelector('meta[name="theme-color"]').setAttribute('content',getComputedStyle(document.body).backgroundColor);
  try{localStorage.setItem('hanminjae-theme',theme)}catch(e){}
});

// Portfolio Analytics V4 browser integration.
// Replaces the V3 visit-counter IIFE; existing portfolio UI remains unchanged.
(function portfolioAnalyticsV4() {
  'use strict';
  const base = 'https://portfolio-counter.hanmj97.workers.dev';
  const OPT_OUT_KEY = 'hm-analytics-opt-out-v4';
  const SEEN_AT_KEY = 'hm-analytics-seen-at-v4';
  const SESSION_ID_KEY = 'hanminjae-portfolio-visit-session';
  const SESSION_TYPE_KEY = 'hm-analytics-session-type-v4';
  const SESSION_SOURCE_KEY = 'hm-analytics-session-source-v4';
  const MONTH_MS = 30 * 86400000;
  const query = new URLSearchParams(location.search);
  const requestedOptOut = query.get('analytics_optout');
  if (requestedOptOut === '1' || requestedOptOut === '0') {
    try {
      if (requestedOptOut === '1') localStorage.setItem(OPT_OUT_KEY, '1');
      else localStorage.removeItem(OPT_OUT_KEY);
    } catch (_) {}
    try {
      const clean = new URL(location.href);
      clean.searchParams.delete('analytics_optout');
      history.replaceState(null, '', clean.pathname + clean.search + clean.hash);
    } catch (_) {}
    window.alert(requestedOptOut === '1'
      ? '이 브라우저의 자체 방문/클릭 집계를 제외했습니다. GA4 및 Cloudflare Web Analytics는 별도 설정이 필요합니다.'
      : '이 브라우저의 자체 방문/클릭 집계를 다시 시작합니다.');
  }
  try {
    if (localStorage.getItem(OPT_OUT_KEY) === '1') return;
  } catch (_) {}
  if (!window.crypto || !window.crypto.randomUUID) return;

  function source() {
    try {
      const ref = document.referrer;
      if (!ref) return {sourceType:'direct',sourceHost:null};
      const u = new URL(ref);
      if (!['http:','https:'].includes(u.protocol)) return {sourceType:'unknown',sourceHost:null};
      const host = u.hostname.toLowerCase();
      if (host === location.hostname.toLowerCase()) return {sourceType:'direct',sourceHost:null};
      if (/^(www\.)?(saramin\.co\.kr|wanted\.co\.kr|jobkorea\.co\.kr|jumpit\.co\.kr|rocketpunch\.com)$/.test(host) ||
          host.endsWith('.greetinghr.com')) return {sourceType:'job',sourceHost:host};
      if (/^(www\.)?(google\.[a-z.]+|naver\.com|bing\.com|daum\.net)$/.test(host)) return {sourceType:'search',sourceHost:host};
      if (/^(www\.)?(linkedin\.com|instagram\.com|facebook\.com|twitter\.com|x\.com)$/.test(host)) return {sourceType:'social',sourceHost:host};
      return {sourceType:'referral',sourceHost:host.slice(0,128)};
    } catch (_) { return {sourceType:'unknown',sourceHost:null}; }
  }
  function getSession() {
    let visitId = null;
    try { visitId = sessionStorage.getItem(SESSION_ID_KEY); } catch (_) {}
    if (!visitId) {
      visitId = crypto.randomUUID();
      try { sessionStorage.setItem(SESSION_ID_KEY, visitId); } catch (_) {}
    }
    let visitorType = 'unknown';
    try {
      visitorType = sessionStorage.getItem(SESSION_TYPE_KEY) || '';
      if (!visitorType) {
        const last = Number(localStorage.getItem(SEEN_AT_KEY) || 0);
        visitorType = last > 0 && Date.now() - last <= MONTH_MS ? 'returning' : 'new';
        sessionStorage.setItem(SESSION_TYPE_KEY, visitorType);
      }
    } catch (_) { visitorType='unknown'; }
    let visitSource = source();
    try {
      const saved = sessionStorage.getItem(SESSION_SOURCE_KEY);
      if (saved) visitSource = JSON.parse(saved);
      else sessionStorage.setItem(SESSION_SOURCE_KEY, JSON.stringify(visitSource));
    } catch (_) {}
    return {visitId,visitorType,...visitSource};
  }
  function post(path, payload) {
    return fetch(base + path, {
      method:'POST',mode:'cors',credentials:'omit',keepalive:true,
      headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),
    });
  }
  post('/visit', getSession()).then(resp => {
    if (resp.ok) {
      try { localStorage.setItem(SEEN_AT_KEY,String(Date.now())); } catch (_) {}
    }
  }).catch(() => {});

  const DRIVE_DOCS = {
    '1VDA9ZqMNFXLLyi2STuDHcvRfPqcU9I7C':'resume_pdf',
    '1giuo45NZbRBVW2oVXLtYZ396r_KoQRz_':'portfolio_pdf',
    '1Wxlui-kZ2fSewwNRSyikrvZ_xIX_03Ss':'career_pdf',
  };
  function classifyLink(anchor) {
    const raw=anchor.getAttribute('href');
    if (raw === '#projects') return 'project_section';
    if (!raw) return null;
    try {
      const u = new URL(raw, location.href);
      if (u.protocol === 'mailto:') return 'email_contact';
      const h=u.hostname.toLowerCase();
      if (h.endsWith('.notion.site')) return 'notion_resume';
      if (h === 'drive.google.com') {
        const id=u.pathname.split('/d/')[1]?.split('/')[0];
        return DRIVE_DOCS[id] || null;
      }
      if (h === 'github.com') {
        if (u.pathname.startsWith('/hanmj97/DataOpsPipeline')) return 'dataops_github';
        if (u.pathname.startsWith('/hanmj97/Black-jack-React')) return 'blackjack_github';
        if (u.pathname.replace(/\/$/,'') === '/hanmj97') return 'github_profile';
      }
      if (h === 'hanmj97.github.io' && u.pathname.startsWith('/Black-jack-React')) return 'blackjack_demo';
      if (h === 'blog.naver.com' && u.pathname.includes('/hanmj97')) return 'tech_blog';
    } catch (_) {}
    return null;
  }
  document.addEventListener('click', event => {
    const anchor=event.target?.closest?.('a[href]');
    if (!anchor) return;
    const target=classifyLink(anchor);
    if (!target) return;
    post('/event',{eventId:crypto.randomUUID(),target}).catch(() => {});
  }, {capture:true});
})();
