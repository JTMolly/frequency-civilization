/* ============================================================
   flow.js: the full test, three stages in a row (Root Code → Inner Archetype → Inner Drive).
   Progress is stored in the browser, so people can leave and come back on the same device.
   ============================================================ */
(function(){
  const STAGES = [
    {key:'fc_result_root',      url:'test.html',           name:'Root Code Test',     meta:'24 questions · about 5 min', ask:'how do I operate'},
    {key:'fc_result_archetype', url:'test-archetype.html', name:'Inner Archetype Test', meta:'10 questions · about 3 min', ask:'what role do I take in a group'},
    {key:'fc_result_drive',     url:'test-drive.html',     name:'Inner Drive Test', meta:'24 questions · about 5 min', ask:'what moves me'}
  ];
  function has(k){ try{ return !!localStorage.getItem(k); }catch(e){ return false; } }
  function base(){ return location.pathname.indexOf('/roots/') >= 0 || location.pathname.indexOf('/blog/') >= 0 || location.pathname.indexOf('/notes/') >= 0 ? '../' : ''; }
  function doneList(){ return STAGES.map(s=>has(s.key)); }
  function nextStage(){ const d = doneList(); const i = d.indexOf(false); return i < 0 ? null : i; }

  function dots(d){
    return '<div class="flow-dots">' + STAGES.map((s,i)=>
      `<span class="${d[i]?'on':''}"><i>${i+1}</i>${s.name.replace(' Test','')}</span>`).join('') + '</div>';
  }

  /* result page: this stage is done, link to the next */
  function renderNext(elId, currentKey){
    const el = document.getElementById(elId); if(!el) return;
    const d = doneList(), n = d.filter(Boolean).length, cur = STAGES.findIndex(s=>s.key===currentKey);
    const nx = nextStage(), b = base();
    let html = `<div class="flow-box"><div class="flow-kicker">Full test · ${n} of 3 done</div>${dots(d)}`;
    if(nx === null){
      html += `<p class="flow-lead">All three stages are done. Your full report is ready, and your cell among the 6,336 combinations is lit.</p>
        <div class="flow-btns"><a class="btn solid" href="${b}report.html">See my full report</a><a class="btn" href="${b}grid.html">See the Frequency Grid</a></div>`;
    } else {
      const s = STAGES[nx];
      html += `<p class="flow-lead">${cur>=0 ? 'Stage '+(cur+1)+' done. ' : ''}Next: <b>${s.name}</b>: ${s.ask} (${s.meta})</p>
        <div class="flow-btns"><a class="btn solid" href="${b}${s.url}">Continue to stage ${nx+1}</a></div>
        <p class="flow-note">You can also do it later. Come back on the same device and you'll pick up from this stage.</p>`;
    }
    el.innerHTML = html + '</div>' + games(b);
  }

  /* after the Root Code Test: Daily Glow and Pair Card; a friend's pairing link can be reopened after the test */
  function games(b){
    if(!has('fc_result_root')) return '';
    let pending = null;
    try{ pending = localStorage.getItem('fc_pair_pending'); }catch(e){}
    const back = pending && /^[A-Z]{2}-[A-Z]{2}$/.test(pending)
      ? `<a class="btn solid" href="${b}pair.html?with=${pending}">Back to my friend's Pair Card</a>` : '';
    return `<div class="flow-box" style="margin-top:18px"><div class="flow-kicker">Come back anytime</div>
      <p class="flow-lead">Tap how you are each day and remember how you get back to steady. You can also pair with a friend and see how you work together.</p>
      <div class="flow-btns">${back}<a class="btn" href="${b}glow.html">Daily Glow</a><a class="btn" href="${b}pair.html">Pair Card</a></div></div>`;
  }

  /* test intro: show which stage this is */
  function introBadge(elId, currentKey){
    const el = document.getElementById(elId); if(!el) return;
    const cur = STAGES.findIndex(s=>s.key===currentKey), d = doneList();
    el.innerHTML = `<div class="flow-badge">Full test · stage ${cur+1} of 3</div>${dots(d)}`;
  }

  /* home and tests pages: one entry; people halfway through see "continue" */
  function entry(elId){
    const el = document.getElementById(elId); if(!el) return;
    const d = doneList(), n = d.filter(Boolean).length, nx = nextStage(), b = base();
    let btn;
    if(n === 0) btn = `<a class="btn solid" href="${b}${STAGES[0].url}">Start the full test</a>`;
    else if(nx === null) btn = `<a class="btn solid" href="${b}report.html">See my full report</a>`;
    else btn = `<a class="btn solid" href="${b}${STAGES[nx].url}">Continue with stage ${nx+1}: ${STAGES[nx].name}</a>`;
    el.innerHTML = `<div class="flow-entry">${n>0 ? dots(d) : ''}${btn}
      <p class="flow-note">${n===0 ? '3 stages, about 13 minutes. You see each result as you go, and you can leave and come back.' : `${n} of 3 stages done.`}</p></div>`;
  }

  window.FCFlow = { STAGES, renderNext, introBadge, entry, doneList };
})();
