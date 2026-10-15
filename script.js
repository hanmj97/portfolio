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
