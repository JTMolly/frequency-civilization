/* ============================================================
   flow.js — 完整测验：三关串在一起（语根 → 内在原型 → 内在动力）
   进度存在浏览器里，中途离开，同一支手机回来可以接着做。
   ============================================================ */
(function(){
  const STAGES = [
    {key:'fc_result_root',      url:'test.html',           name:'语根测验',     meta:'24 题・约 5 分钟', ask:'我是什么运作模式'},
    {key:'fc_result_archetype', url:'test-archetype.html', name:'内在原型测验', meta:'10 题・约 3 分钟', ask:'我在人群中是什么角色'},
    {key:'fc_result_drive',     url:'test-drive.html',     name:'内在动力测验', meta:'24 题・约 5 分钟', ask:'什么在推动我'}
  ];
  function has(k){ try{ return !!localStorage.getItem(k); }catch(e){ return false; } }
  function base(){ return location.pathname.indexOf('/roots/') >= 0 || location.pathname.indexOf('/blog/') >= 0 || location.pathname.indexOf('/notes/') >= 0 ? '../' : ''; }
  function doneList(){ return STAGES.map(s=>has(s.key)); }
  function nextStage(){ const d = doneList(); const i = d.indexOf(false); return i < 0 ? null : i; }

  function dots(d){
    return '<div class="flow-dots">' + STAGES.map((s,i)=>
      `<span class="${d[i]?'on':''}"><i>${i+1}</i>${s.name.replace('测验','')}</span>`).join('') + '</div>';
  }

  /* 测验结果页：这一关完成，接下一关 */
  function renderNext(elId, currentKey){
    const el = document.getElementById(elId); if(!el) return;
    const d = doneList(), n = d.filter(Boolean).length, cur = STAGES.findIndex(s=>s.key===currentKey);
    const nx = nextStage(), b = base();
    let html = `<div class="flow-box"><div class="flow-kicker">完整测验・${n} / 3 关完成</div>${dots(d)}`;
    if(nx === null){
      html += `<p class="flow-lead">三关都完成了。你的完整报告已经可以看，你在 6,336 种组合里的那一格也亮起来了。</p>
        <div class="flow-btns"><a class="btn solid" href="${b}report.html">看我的完整报告</a><a class="btn" href="${b}grid.html">看频率网格</a></div>`;
    } else {
      const s = STAGES[nx];
      html += `<p class="flow-lead">${cur>=0 ? '第 '+(cur+1)+' 关完成。' : ''}下一关：<b>${s.name}</b>——${s.ask}（${s.meta}）</p>
        <div class="flow-btns"><a class="btn solid" href="${b}${s.url}">继续第 ${nx+1} 关</a></div>
        <p class="flow-note">想晚点再做也可以，用同一支手机回来，会从这一关接着开始。</p>`;
    }
    el.innerHTML = html + '</div>';
  }

  /* 测验开头：标出这是第几关 */
  function introBadge(elId, currentKey){
    const el = document.getElementById(elId); if(!el) return;
    const cur = STAGES.findIndex(s=>s.key===currentKey), d = doneList();
    el.innerHTML = `<div class="flow-badge">完整测验・第 ${cur+1} 关 / 共 3 关</div>${dots(d)}`;
  }

  /* 首页、三大测验页：一个入口；做到一半的人显示「接着做」 */
  function entry(elId){
    const el = document.getElementById(elId); if(!el) return;
    const d = doneList(), n = d.filter(Boolean).length, nx = nextStage(), b = base();
    let btn;
    if(n === 0) btn = `<a class="btn solid" href="${b}${STAGES[0].url}">开始完整测验</a>`;
    else if(nx === null) btn = `<a class="btn solid" href="${b}report.html">看我的完整报告</a>`;
    else btn = `<a class="btn solid" href="${b}${STAGES[nx].url}">接着做第 ${nx+1} 关：${STAGES[nx].name}</a>`;
    el.innerHTML = `<div class="flow-entry">${n>0 ? dots(d) : ''}${btn}
      <p class="flow-note">${n===0 ? '3 关、约 13 分钟。每做完一关就先看到那一关的结果，中途离开也可以回来接着做。' : `已完成 ${n} / 3 关。`}</p></div>`;
  }

  window.FCFlow = { STAGES, renderNext, introBadge, entry, doneList };
})();
