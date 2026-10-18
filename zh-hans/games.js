/* ============================================================
   games.js — 今日点灯、双人配对卡（共用资料与画面）
   - 语根的「稳定时／失衡时／调整的关键」逐字取自 roots/*.html，不另外编写
   - 关系表：12 语根关系图谱初版（2025/10），标示「初版，持续验证中」
   - 所有纪录只存在浏览器（localStorage）：fc_glow（点灯）、fc_pair_pending（朋友的配对连结）
     不需要账号，不上传，不收任何个人资料
   ============================================================ */
(function(){
const ROOTS = {
  "Sa'karan":{code:"SK",name:"建构者",color:"#b8892b",slug:"sakaran",
    hi:"条理分明、行动有序，能把混乱化为可执行的秩序，成为团队可依靠的结构者。",
    lo:"控制欲变强、过度理性、失去弹性——系统开始僵化，创造力跟着受限。",
    key:"从「控制」转为「承载」：让结构服务目标，而不是让人服务结构。"},
  "Elariah":{code:"EL",name:"情绪引导者",color:"#e8806f",slug:"elariah",
    hi:"能拥抱情绪、聆听他人，把感受转化为理解——你是情绪场里让人安心的存在。",
    lo:"被他人情绪淹没、过度共感、自我模糊，长期下来精神疲倦、容易崩溃。",
    key:"从「吸收」转为「流动」：感受可以经过你，不必留在你身上。"},
  "Thaleon":{code:"TH",name:"洞察转化者",color:"#5b3fa0",slug:"thaleon",
    hi:"敢直面困难，能在低谷中提炼出智慧，成为别人改变的触媒。",
    lo:"沉溺在痛苦里、反复内耗、掉进「都是我不好／都是别人害的」的剧本。",
    key:"把「挫折是惩罚」改写成「挫折是材料」——你最擅长的本来就是重写剧本。"},
  "Auri'kai":{code:"AU",name:"直觉洞察者",color:"#5aa9c9",slug:"aurikai",
    hi:"灵感清晰、判断敏锐，能比别人早一步看见重点，并把模糊的讯息翻译成大家听得懂的语言。",
    lo:"讯息过载、难以分辨哪些是直觉哪些是焦虑，容易疲倦涣散、心神不定。",
    key:"从「被动接收」转为「主动筛选」：你可以决定频道什么时候开、什么时候关。"},
  "Rohen'dal":{code:"RO",name:"行动推动者",color:"#e2562b",slug:"rohendal",
    hi:"积极行动、勇于表达，能在混乱中带出方向与节奏，是团队的推进器。",
    lo:"冲动行事、带着情绪推进、听不进别人——消耗自己，也制造误会。",
    key:"从「反应」转为「回应」：先确认方向，再全速前进。"},
  "Zae'rah":{code:"ZA",name:"稳定支持者",color:"#3fa98f",slug:"zaerah",
    hi:"平静、有包容力，能稳住波动的场面——你是团队的定锚。",
    lo:"压抑感觉、回避冲突、假性平静——把自己关起来，身体僵硬、关系疏离。",
    key:"分清「麻木」与「安定」：稳定不是没有感觉，是有感觉仍然站得住。"},
  "Valtara":{code:"VA",name:"集体整合者",color:"#2a46b8",slug:"valtara",
    hi:"促进合作、善于倾听，能整合多方观点，让团队的协作顺畅、成果加倍。",
    lo:"过度讨好、害怕冲突、迷失在别人的需求里——精神耗竭、越来越不知道自己要什么。",
    key:"从「取悦每个人」转为「对齐共同目标」：合作不是牺牲，是一起变强。"},
  "Kuthari":{code:"KU",name:"系统记录者",color:"#c5ccd8",slug:"kuthari",
    hi:"观察入微、表达清晰，能用文字与语言建立秩序，把散落的经验变成可传承的知识。",
    lo:"过度分析、停在思考层、害怕行动——知识一直堆叠，却迟迟派不上用场。",
    key:"从「分析」转为「见证」：先记录真实，再追求完美。"},
  "Mei'hara":{code:"ME",name:"关系共振者",color:"#c98a7a",slug:"meihara",
    hi:"能深度共感又不迷失，在爱里保持界线——你身边的人会因为你而变得柔软。",
    lo:"过度付出、依附或被依附、情绪界线模糊——容易焦虑、倦怠、失去自我。",
    key:"从「情绪同步」转为「理解对方、保有自己」：爱不是拯救，是一起看见真实。"},
  "Xon'teh":{code:"XO",name:"技术对接者",color:"#1f5fbf",slug:"xonteh",
    hi:"精准、专注、有整合创新的能力，能让不同的系统与工具协同运作。",
    lo:"过度理性、与感受断线——做出来的东西精准却冰冷，没有人想用。",
    key:"从「控制」转为「协作」：工具是为人服务的，效率也可以有温度。"},
  "Nael'tu":{code:"NA",name:"领航创造者",color:"#e6e1d3",slug:"naeltu",
    hi:"愿景清晰、能鼓舞他人，把想法变成大家愿意跟随的方向。",
    lo:"控制欲强、孤傲、过度承担——压力堆在自己身上，越领导越孤单。",
    key:"从「带领」转为「启动」：最好的领导，是让每个人记得自己的方向。"},
  "Ori'shan":{code:"OR",name:"节奏带动者",color:"#b5357f",slug:"orishan",
    hi:"律动自然、表达流畅，能用节奏与行动把现场带活——你在，场子就是活的。",
    lo:"身体僵硬、表达受限、情绪卡在身体里——容易焦虑、倦怠。",
    key:"从「控制身体」转为「倾听身体」：节奏回来了，状态就回来了。"}
};

const REL = {
  SK:{co:["EL", "VA", "XO", "NA"],cp:["NA"],cm:["EL"]},
  EL:{co:["SK", "ME", "TH"],cp:["ZA"],cm:["SK"]},
  TH:{co:["EL", "AU", "ME"],cp:["ZA"],cm:["SK"]},
  AU:{co:["TH", "NA", "KU"],cp:["VA"],cm:["XO"]},
  RO:{co:["SK", "NA", "VA"],cp:["EL"],cm:["ME"]},
  ZA:{co:["TH", "EL", "VA"],cp:["AU"],cm:["RO"]},
  VA:{co:["SK", "ZA", "RO"],cp:["KU"],cm:["NA"]},
  KU:{co:["AU", "VA", "OR"],cp:["XO"],cm:["TH"]},
  ME:{co:["EL", "TH", "OR"],cp:["SK"],cm:["RO"]},
  XO:{co:["SK", "KU", "NA"],cp:["RO"],cm:["AU"]},
  NA:{co:["SK", "RO", "XO"],cp:["SK"],cm:["VA"]},
  OR:{co:["ME", "KU", "AU"],cp:["ZA"],cm:["SK"]}
};
const KEYS = Object.keys(ROOTS);
const BY_CODE = {}; KEYS.forEach(k=>{ BY_CODE[ROOTS[k].code] = k; });

/* 画面文字（英文版由翻译表替换） */
const T = {
  needTest: '先做语根测验，才知道你的主语根。',
  needTestSub: '24 题情境选择、约 5 分钟。做完回到这一页就能开始。',
  doTest: '开始语根测验',
  myRoot: '你的主语根',
  ask: '今天的你，比较像？',
  askSub: '凭感觉点一个就好。点了会在下面的小日历亮一颗光点，今天之内都可以改。',
  states: {stable:'稳定', tense:'紧绷', drained:'没电', messy:'心很乱'},
  todayIs: '今天：{state}',
  stableHead: '你今天在稳定的一边。',
  otherHead: '今天{state}，也没关系。',
  hiLab: '{name}稳定时',
  loLab: '{name}失衡时，可能会这样',
  keyLab: '回到稳定的关键',
  keepLab: '记得这个方向',
  more: '深入认识 {root} →',
  secMore: '也看看副语根 {root} 回到稳定的关键',
  calHead: '最近 30 天',
  calNote: '这里只记录你点过的日子。不计分、不算连续天数、不跟别人比，空着的日子也没有关系。',
  calEmpty: '还没有点过灯',
  care: '如果长期很难回到稳定，找信任的人或专业的人聊聊。',
  privacy: '点灯纪录只存在这支手机的浏览器里，我们看不到，也不会上传。清除浏览器资料就会一起消失。',
  clear: '清除我的点灯纪录',
  clearAsk: '要清除这支手机上的点灯纪录吗？',
  toPair: '跟朋友配对，看看你们怎么一起运作 →',
  /* 配对卡 */
  relCo: '合作顺手', relCp: '互补平衡', relCm: '需要多沟通',
  descCo: '做事上互相支援，适合一起完成任务。',
  descCp: '补上彼此缺的那一块。',
  descCm: '容易误读彼此，相处比较耗能，但也最能让人成长。',
  both: '同一个人可能同时是「合作顺手」和「需要多沟通」：做事上合作得很顺，相处上会互相挑战。',
  dir: '从{a}的角度，{b}是：',
  dirNone: '从{a}的角度，初版关系表没有特别标记{b}。',
  same: '你们的主语根一样，用很像的方式运作。初版关系表没有同一个语根的配对说明。',
  none: '初版关系表没有特别标记这一组。可以从彼此稳定时的样子开始认识对方。',
  friend: '朋友', you: '你',
  mainLab: '主语根', secLab: '副语根',
  motto: '合作让事情完成，互补让人完整，需要多沟通的那一位，最能让你长大。',
  draft: '初版，持续验证中',
  draftNote: '这张关系表是 2025/10 的初版，由语根的运作模式推演而来，还没有用资料验证过。只供彼此认识参考，不适合用来评价或筛选任何人。',
  invited: '朋友邀请你一起看你们的双人配对卡。',
  invitedSub: '两个人都要自己做完语根测验，才会配对。先做测验（24 题、约 5 分钟），做完回到这个连结，就能看到你们的关系卡。',
  invitedSaved: '这支手机记住了朋友的配对连结。做完测验后，结果页也会出现「回到朋友的配对卡」。',
  ownLink: '这是你自己的配对连结。把它传给朋友，等他做完测验，就能一起看你们的关系卡。',
  makeHead: '产生我的配对连结',
  makeSub: '连结里只有你的主语根和副语根代号，没有名字和任何个人资料。',
  share: '分享连结', copy: '复制连结', copied: '已复制',
  shareText: '我做了频率文明的语根测验，想跟你一起看我们的双人配对卡：',
  shareBack: '也把你的连结传回给朋友',
  pairNeedTest: '先做语根测验，才能产生你的配对连结。',
  toGlow: '每天回来点灯，看看今天的自己 →'
};
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => o[k] != null ? o[k] : m);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const label = k => `${k}・${ROOTS[k].name}`;
const base = () => location.pathname.indexOf('/roots/') >= 0 ? '../' : '';

function getResult(){
  try{ const r = JSON.parse(localStorage.getItem('fc_result_root') || 'null'); return r && ROOTS[r.top] ? r : null; }catch(e){ return null; }
}
function store(k, v){ try{ if(v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
function read(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }

/* ===== 今日点灯 ===== */
const STATE_KEYS = ['stable', 'tense', 'drained', 'messy'];
function dkey(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function glowLog(){ try{ const o = JSON.parse(read('fc_glow') || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } }

function glow(elId){
  const el = document.getElementById(elId); if(!el) return;
  const r = getResult(), b = base();
  if(!r){
    el.innerHTML = `<div class="gm-card gm-center"><p class="gm-lead">${T.needTest}</p><p class="gm-sub">${T.needTestSub}</p>
      <a class="btn solid" href="${b}test.html">${T.doTest}</a></div>`;
    return;
  }
  const R = ROOTS[r.top], today = dkey(new Date());
  let showSec = false;
  function draw(){
    const log = glowLog(), st = log[today];
    let h = `<div class="gm-card"><div class="gm-me"><i style="--c:${R.color}"></i>${T.myRoot}：<a href="${b}roots/${R.slug}.html">${esc(label(r.top))}</a></div>
      <p class="gm-lead">${T.ask}</p><p class="gm-sub">${T.askSub}</p>
      <div class="gm-states">${STATE_KEYS.map(s => `<button class="gm-st${st===s?' on':''}" data-s="${s}">${T.states[s]}</button>`).join('')}</div>`;
    if(st){
      const head = st === 'stable' ? T.stableHead : fill(T.otherHead, {state: T.states[st]});
      h += `<div class="gm-out" style="--c:${R.color}"><div class="gm-today">${fill(T.todayIs, {state: T.states[st]})}</div><h3>${head}</h3>`;
      if(st === 'stable'){
        h += `<div class="gm-blk"><b>${fill(T.hiLab, {name: R.name})}</b><p>${esc(R.hi)}</p></div>
              <div class="gm-blk key"><b>${T.keepLab}</b><p>${esc(R.key)}</p></div>`;
      }else{
        h += `<div class="gm-blk"><b>${fill(T.loLab, {name: R.name})}</b><p>${esc(R.lo)}</p></div>
              <div class="gm-blk key"><b>${T.keyLab}</b><p>${esc(R.key)}</p></div>
              <div class="gm-blk"><b>${fill(T.hiLab, {name: R.name})}</b><p>${esc(R.hi)}</p></div>`;
      }
      if(r.sec && ROOTS[r.sec]){
        const S = ROOTS[r.sec];
        h += showSec ? `<div class="gm-blk key" style="--c:${S.color}"><b>${fill(T.secMore, {root: esc(label(r.sec))})}</b><p>${esc(S.key)}</p></div>`
                     : `<button class="gm-link" id="gmSec">${fill(T.secMore, {root: esc(label(r.sec))})}</button>`;
      }
      h += `<a class="gm-more" href="${b}roots/${R.slug}.html">${fill(T.more, {root: esc(label(r.top))})}</a></div>`;
    }
    h += `<p class="gm-care">${T.care}</p></div>`;
    /* 30 天小日历 */
    const days = [];
    for(let i = 29; i >= 0; i--){ const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const lit = days.filter(d => log[dkey(d)]).length;
    h += `<div class="gm-card"><div class="gm-cal-h">${T.calHead}</div><div class="gm-cal">` + days.map(d => {
      const k = dkey(d), s = log[k];
      return `<span class="gm-day${s?' lit':''}${k===today?' today':''}" style="--c:${R.color}" title="${d.getMonth()+1}/${d.getDate()}${s?'・'+T.states[s]:''}"><i></i><em>${d.getDate()}</em></span>`;
    }).join('') + `</div>${lit ? '' : `<p class="gm-sub gm-center">${T.calEmpty}</p>`}<p class="gm-sub">${T.calNote}</p>
      <p class="gm-sub">${T.privacy}</p><button class="gm-link" id="gmClear">${T.clear}</button></div>
      <p class="gm-center"><a class="gm-more" href="${b}pair.html">${T.toPair}</a></p>`;
    el.innerHTML = h;
    el.querySelectorAll('.gm-st').forEach(btn => btn.onclick = () => {
      const log2 = glowLog(); log2[today] = btn.dataset.s; store('fc_glow', JSON.stringify(log2)); draw();
      const o = document.querySelector('.gm-out'); if(o) o.scrollIntoView({behavior:'smooth', block:'nearest'});
    });
    const sb = document.getElementById('gmSec'); if(sb) sb.onclick = () => { showSec = true; draw(); };
    const cb = document.getElementById('gmClear'); if(cb) cb.onclick = () => { if(confirm(T.clearAsk)){ store('fc_glow', null); draw(); } };
  }
  draw();
}

/* ===== 双人配对卡 ===== */
function parseWith(v){
  const m = /^([A-Z]{2})-([A-Z]{2})$/.exec(String(v || '').toUpperCase());
  if(!m || !BY_CODE[m[1]] || !BY_CODE[m[2]] || m[1] === m[2]) return null;
  return {top: BY_CODE[m[1]], sec: BY_CODE[m[2]]};
}
function linkOf(r){ return location.origin + location.pathname.replace(/[^/]*$/, '') + 'pair.html?with=' + ROOTS[r.top].code + '-' + ROOTS[r.sec].code; }
function relOf(a, b){ /* 从 a 的主语根看 b 的主语根 */
  const t = REL[ROOTS[a].code], c = ROOTS[b].code, out = [];
  if(t.co.includes(c)) out.push('co'); if(t.cp.includes(c)) out.push('cp'); if(t.cm.includes(c)) out.push('cm');
  return out;
}
const RL = {co: () => T.relCo, cp: () => T.relCp, cm: () => T.relCm};
const RD = {co: () => T.descCo, cp: () => T.descCp, cm: () => T.descCm};

function badge(who, r){
  const P = ROOTS[r.top], S = ROOTS[r.sec];
  return `<div class="pc-p" style="--c:${P.color}"><div class="pc-who">${who}</div><div class="pc-dot"></div>
    <div class="pc-code">${esc(r.top)}</div><div class="pc-name">${esc(P.name)}</div>
    <div class="pc-sec">${T.secLab}：${esc(label(r.sec))}</div></div>`;
}
function card(friend, me){
  const fn = ROOTS[friend.top].name, mn = ROOTS[me.top].name;
  let h = `<div class="pc"><div class="pc-tag">${T.draft}</div><div class="pc-pair">${badge(T.friend, friend)}<div class="pc-x">×</div>${badge(T.you, me)}</div>`;
  if(friend.top === me.top){
    h += `<p class="pc-none">${T.same}</p>`;
  }else{
    const ab = relOf(friend.top, me.top), ba = relOf(me.top, friend.top);
    const all = [...new Set([...ab, ...ba])];
    if(!all.length){
      h += `<p class="pc-none">${T.none}</p>`;
    }else{
      h += `<div class="pc-rels">${['co','cp','cm'].filter(k => all.includes(k)).map(k => `<div class="pc-rel ${k}"><b>${RL[k]()}</b><span>${RD[k]()}</span></div>`).join('')}</div>`;
      const line = (a, b, rs) => rs.length ? `<p class="pc-dir">${fill(T.dir, {a: esc(a), b: esc(b)})}<b>${rs.map(k => RL[k]()).join('、')}</b></p>` : `<p class="pc-dir">${fill(T.dirNone, {a: esc(a), b: esc(b)})}</p>`;
      h += line(fn, mn, ab) + line(mn, fn, ba);
      if((ab.includes('co') && ab.includes('cm')) || (ba.includes('co') && ba.includes('cm')) || (all.includes('co') && all.includes('cm'))) h += `<p class="pc-both">${T.both}</p>`;
    }
  }
  h += `<div class="pc-hi"><div style="--c:${ROOTS[friend.top].color}"><b>${fill(T.hiLab, {name: esc(fn)})}</b><p>${esc(ROOTS[friend.top].hi)}</p></div>
        <div style="--c:${ROOTS[me.top].color}"><b>${fill(T.hiLab, {name: esc(mn)})}</b><p>${esc(ROOTS[me.top].hi)}</p></div></div>
        <p class="pc-motto">${T.motto}</p><p class="pc-note">${T.draftNote}</p></div>`;
  return h;
}
function shareBox(r, head){
  const url = linkOf(r);
  return `<div class="gm-card gm-center"><p class="gm-lead">${head}</p><p class="gm-sub">${T.makeSub}</p>
    <div class="pc-url" id="pcUrl">${esc(url)}</div>
    <div class="gm-btns"><button class="btn solid" id="pcShare">${T.share}</button><button class="btn" id="pcCopy">${T.copy}</button></div></div>`;
}
function bindShare(r){
  const url = linkOf(r);
  const cp = document.getElementById('pcCopy'), sh = document.getElementById('pcShare');
  if(cp) cp.onclick = () => { const done = () => { cp.textContent = T.copied; setTimeout(() => cp.textContent = T.copy, 1800); };
    if(navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => {}); else { const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); done(); }catch(e){} t.remove(); } };
  if(sh){ if(navigator.share) sh.onclick = () => navigator.share({text: T.shareText, url}).catch(() => {}); else sh.style.display = 'none'; }
}
function pair(elId){
  const el = document.getElementById(elId); if(!el) return;
  const b = base(), me = getResult();
  const q = new URLSearchParams(location.search).get('with');
  let friend = parseWith(q);
  if(friend) store('fc_pair_pending', ROOTS[friend.top].code + '-' + ROOTS[friend.sec].code);
  else if(!q) friend = parseWith(read('fc_pair_pending'));
  const mine = me && me.sec && ROOTS[me.sec] ? me : null;
  let h = '';
  if(friend && mine && friend.top === mine.top && friend.sec === mine.sec && q){
    h = `<div class="gm-card gm-center"><p class="gm-lead">${T.ownLink}</p></div>` + shareBox(mine, T.makeHead);
  }else if(friend && mine){
    h = card(friend, mine) + shareBox(mine, T.shareBack);
  }else if(friend){
    h = `<div class="gm-card gm-center"><p class="gm-lead">${T.invited}</p><p class="gm-sub">${T.invitedSub}</p>
      <a class="btn solid" href="${b}test.html">${T.doTest}</a><p class="gm-sub" style="margin-top:14px">${T.invitedSaved}</p></div>`;
  }else if(mine){
    h = shareBox(mine, T.makeHead);
  }else{
    h = `<div class="gm-card gm-center"><p class="gm-lead">${T.pairNeedTest}</p><p class="gm-sub">${T.needTestSub}</p><a class="btn solid" href="${b}test.html">${T.doTest}</a></div>`;
  }
  if(mine) h += `<p class="gm-center"><a class="gm-more" href="${b}glow.html">${T.toGlow}</a></p>`;
  el.innerHTML = h;
  if(mine) bindShare(mine);
}

window.FCG = {glow, pair, ROOTS, REL, relOf, parseWith};
})();
