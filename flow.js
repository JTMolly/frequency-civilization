/* ============================================================
   flow.js — 完整測驗：三關串在一起（語根 → 內在原型 → 內在動力）
   進度存在瀏覽器裡，中途離開，同一支手機回來可以接著做。
   ============================================================ */
(function(){
  const STAGES = [
    {key:'fc_result_root',      url:'test.html',           name:'語根測驗',     meta:'24 題・約 5 分鐘', ask:'我是什麼運作模式'},
    {key:'fc_result_archetype', url:'test-archetype.html', name:'內在原型測驗', meta:'10 題・約 3 分鐘', ask:'我在人群中是什麼角色'},
    {key:'fc_result_drive',     url:'test-drive.html',     name:'內在動力測驗', meta:'24 題・約 5 分鐘', ask:'什麼在推動我'}
  ];
  function has(k){ try{ return !!localStorage.getItem(k); }catch(e){ return false; } }
  function base(){ return location.pathname.indexOf('/roots/') >= 0 || location.pathname.indexOf('/blog/') >= 0 || location.pathname.indexOf('/notes/') >= 0 ? '../' : ''; }
  function doneList(){ return STAGES.map(s=>has(s.key)); }
  function nextStage(){ const d = doneList(); const i = d.indexOf(false); return i < 0 ? null : i; }

  function dots(d){
    return '<div class="flow-dots">' + STAGES.map((s,i)=>
      `<span class="${d[i]?'on':''}"><i>${i+1}</i>${s.name.replace('測驗','')}</span>`).join('') + '</div>';
  }

  /* 測驗結果頁：這一關完成，接下一關 */
  function renderNext(elId, currentKey){
    const el = document.getElementById(elId); if(!el) return;
    const d = doneList(), n = d.filter(Boolean).length, cur = STAGES.findIndex(s=>s.key===currentKey);
    const nx = nextStage(), b = base();
    let html = `<div class="flow-box"><div class="flow-kicker">完整測驗・${n} / 3 關完成</div>${dots(d)}`;
    if(nx === null){
      html += `<p class="flow-lead">三關都完成了。你的完整報告已經可以看，你在 6,336 種組合裡的那一格也亮起來了。</p>
        <div class="flow-btns"><a class="btn solid" href="${b}report.html">看我的完整報告</a><a class="btn" href="${b}grid.html">看頻率網格</a></div>`;
    } else {
      const s = STAGES[nx];
      html += `<p class="flow-lead">${cur>=0 ? '第 '+(cur+1)+' 關完成。' : ''}下一關：<b>${s.name}</b>——${s.ask}（${s.meta}）</p>
        <div class="flow-btns"><a class="btn solid" href="${b}${s.url}">繼續第 ${nx+1} 關</a></div>
        <p class="flow-note">想晚點再做也可以，用同一支手機回來，會從這一關接著開始。</p>`;
    }
    el.innerHTML = html + '</div>';
  }

  /* 測驗開頭：標出這是第幾關 */
  function introBadge(elId, currentKey){
    const el = document.getElementById(elId); if(!el) return;
    const cur = STAGES.findIndex(s=>s.key===currentKey), d = doneList();
    el.innerHTML = `<div class="flow-badge">完整測驗・第 ${cur+1} 關 / 共 3 關</div>${dots(d)}`;
  }

  /* 首頁、三大測驗頁：一個入口；做到一半的人顯示「接著做」 */
  function entry(elId){
    const el = document.getElementById(elId); if(!el) return;
    const d = doneList(), n = d.filter(Boolean).length, nx = nextStage(), b = base();
    let btn;
    if(n === 0) btn = `<a class="btn solid" href="${b}${STAGES[0].url}">開始完整測驗</a>`;
    else if(nx === null) btn = `<a class="btn solid" href="${b}report.html">看我的完整報告</a>`;
    else btn = `<a class="btn solid" href="${b}${STAGES[nx].url}">接著做第 ${nx+1} 關：${STAGES[nx].name}</a>`;
    el.innerHTML = `<div class="flow-entry">${n>0 ? dots(d) : ''}${btn}
      <p class="flow-note">${n===0 ? '3 關、約 13 分鐘。每做完一關就先看到那一關的結果，中途離開也可以回來接著做。' : `已完成 ${n} / 3 關。`}</p></div>`;
  }

  window.FCFlow = { STAGES, renderNext, introBadge, entry, doneList };
})();
