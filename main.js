/* 進場動畫：滑到哪、亮到哪 */
(function(){
  const targets = document.querySelectorAll('.pillar,.root,.test-card,.event,.post,.stat,section h2,section .sec-kicker,section .sec-lead,.about-grid p,.h-layer,.h-row,.night-card,.emblem,.li,.h-quote .quote,.anthem,.story h3,.phrase');
  targets.forEach((el,i)=>{ el.classList.add('reveal'); el.style.transitionDelay = (i%4)*0.08+'s'; });
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.12});
  targets.forEach(el=>io.observe(el));
})();

/* YouTube 輕量嵌入：點了才載入播放器（頁面比較快，也不會先載入 YouTube 追蹤） */
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('.yt-lite');
  if(!b) return;
  var f = document.createElement('iframe');
  f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.id + '?autoplay=1&rel=0';
  f.title = b.getAttribute('aria-label') || 'YouTube';
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  f.allowFullscreen = true;
  b.replaceWith(f);
});

/* 上方選單：「更多」點一下展開、再點一下、點旁邊或按 Esc 收起 */
(function(){
  var more = document.querySelector('.nav-more');
  if(!more) return;
  var btn = more.querySelector('.nav-more-btn');
  btn.addEventListener('click', function(e){ e.stopPropagation(); more.classList.toggle('open'); btn.setAttribute('aria-expanded', more.classList.contains('open')); });
  document.addEventListener('click', function(e){ if(!more.contains(e.target)){ more.classList.remove('open'); btn.setAttribute('aria-expanded','false'); } });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'){ more.classList.remove('open'); btn.setAttribute('aria-expanded','false');} });
})();
