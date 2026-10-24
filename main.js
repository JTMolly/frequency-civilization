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

/* 上方選單的下拉（世界觀、更多）：點箭頭或按鈕展開、再點一下收起，點旁邊或按 Esc 收起。
   桌機滑過或鍵盤移入時 CSS 會直接展開；Esc 或再點一下會暫時壓住（class esc），滑出或離開焦點後恢復。
   鍵盤：在「世界觀」連結或箭頭上按 ↓ 展開並移到第一項，選單裡 ↑↓ 移動。 */
(function(){
  var dds = [].slice.call(document.querySelectorAll('.nav-dd'));
  if(!dds.length) return;
  function setOpen(dd, on){
    var b = dd.querySelector('button');
    dd.classList.toggle('open', on);
    dd.classList.toggle('esc', !on);
    if(b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  function closeAll(except){ dds.forEach(function(d){ if(d !== except && (d.classList.contains('open'))) setOpen(d, false); }); }
  dds.forEach(function(dd){
    var btn = dd.querySelector('button'), sub = dd.querySelector('.nav-sub');
    if(!btn || !sub) return;
    var links = function(){ return [].slice.call(sub.querySelectorAll('a')); };
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var on = !dd.classList.contains('open');
      closeAll(dd);
      setOpen(dd, on);
    });
    dd.addEventListener('mouseleave', function(){ if(!dd.contains(document.activeElement)) dd.classList.remove('esc'); });
    dd.addEventListener('focusout', function(e){ if(!dd.contains(e.relatedTarget)) dd.classList.remove('esc'); });
    dd.addEventListener('keydown', function(e){
      var k = e.key, inSub = sub.contains(document.activeElement);
      if(k === 'ArrowDown' || k === 'ArrowUp'){
        var list = links(), i = list.indexOf(document.activeElement);
        if(!inSub && k === 'ArrowDown'){ e.preventDefault(); closeAll(dd); dd.classList.remove('esc'); dd.classList.add('open'); btn.setAttribute('aria-expanded','true'); list[0].focus(); }
        else if(inSub){ e.preventDefault(); list[(i + (k === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus(); }
      }else if(k === 'Escape' && (dd.classList.contains('open') || dd.contains(document.activeElement) || dd.matches(':hover'))){
        setOpen(dd, false);
        if(inSub) btn.focus();
      }
    });
  });
  document.addEventListener('click', function(e){ closeAll(null); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAll(null); });
})();
