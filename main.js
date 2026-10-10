/* 進場動畫：滑到哪、亮到哪 */
(function(){
  const targets = document.querySelectorAll('.pillar,.root,.test-card,.event,.post,.stat,section h2,section .sec-kicker,section .sec-lead,.about-grid p');
  targets.forEach((el,i)=>{ el.classList.add('reveal'); el.style.transitionDelay = (i%4)*0.08+'s'; });
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.12});
  targets.forEach(el=>io.observe(el));
})();
