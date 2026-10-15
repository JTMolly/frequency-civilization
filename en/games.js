/* ============================================================
   games.js — 今日點燈、雙人配對卡（共用資料與畫面）
   - 語根的「穩定時／失衡時／調整的關鍵」逐字取自 roots/*.html，不另外編寫
   - 關係表：12 語根關係圖譜初版（2025/10），標示「初版，持續驗證中」
   - 所有紀錄只存在瀏覽器（localStorage）：fc_glow（點燈）、fc_pair_pending（朋友的配對連結）
     不需要帳號，不上傳，不收任何個人資料
   ============================================================ */
(function(){
const ROOTS = {
  "Sa'karan":{code:"SK",name:"The Architect",color:"#b8892b",slug:"sakaran",
    hi:"Clear and orderly in thought and action. You turn chaos into workable order and become the structure a team can lean on.",
    lo:"The urge to control grows, you get overly rational and lose flexibility. The system stiffens, and creativity shrinks with it.",
    key:"Move from controlling to holding: let structure serve the goal, instead of making people serve the structure."},
  "Elariah":{code:"EL",name:"The Empath",color:"#e8806f",slug:"elariah",
    hi:"You can hold emotions, listen to others, and turn feelings into understanding. In an emotional room, you are the presence that makes people feel safe.",
    lo:"You get flooded by other people's emotions, over-empathize and lose track of yourself. Over time you become worn out and fragile.",
    key:"Move from absorbing to letting it flow: feelings can pass through you without staying in you."},
  "Thaleon":{code:"TH",name:"The Transformer",color:"#5b3fa0",slug:"thaleon",
    hi:"You face difficulty head-on, draw wisdom out of low points, and become the spark for other people's change.",
    lo:"You sink into pain, wear yourself out going in circles, and fall into the script of \"it's all my fault\" or \"it's all their fault\".",
    key:"Rewrite \"setbacks are punishment\" as \"setbacks are material\". Rewriting the script is what you do best."},
  "Auri'kai":{code:"AU",name:"The Intuitive",color:"#5aa9c9",slug:"aurikai",
    hi:"Clear inspiration, sharp judgment. You see the point early and translate vague signals into language everyone can follow.",
    lo:"Overloaded with input, you struggle to tell intuition from anxiety, and you get tired, scattered and unsettled.",
    key:"Move from passively receiving to actively filtering: you get to decide when the channel is open and when it's closed."},
  "Rohen'dal":{code:"RO",name:"The Mover",color:"#e2562b",slug:"rohendal",
    hi:"Active and outspoken, you bring direction and pace out of chaos. You are the team's engine.",
    lo:"You act on impulse, push forward on emotion and stop listening, which drains you and creates misunderstandings.",
    key:"Move from reacting to responding: check the direction first, then go full speed."},
  "Zae'rah":{code:"ZA",name:"The Stabilizer",color:"#3fa98f",slug:"zaerah",
    hi:"Calm and accepting, you steady rough moments. You are the team's anchor.",
    lo:"You suppress feelings, avoid conflict and fake calm. You shut yourself in, your body tenses, and relationships drift.",
    key:"Tell numbness apart from steadiness: being steady doesn't mean feeling nothing; it means feeling and still standing."},
  "Valtara":{code:"VA",name:"The Integrator",color:"#2a46b8",slug:"valtara",
    hi:"You foster collaboration, listen well and bring different views together, so teamwork runs smoothly and results multiply.",
    lo:"You people-please, fear conflict and get lost in other people's needs, until you're exhausted and less and less sure what you want.",
    key:"Move from pleasing everyone to aligning on a shared goal: collaboration isn't sacrifice; it's getting stronger together."},
  "Kuthari":{code:"KU",name:"The Recorder",color:"#c5ccd8",slug:"kuthari",
    hi:"You observe closely and express things clearly, creating order with words and turning scattered experience into knowledge that can be passed on.",
    lo:"You over-analyze, stay in your head and hesitate to act. Knowledge piles up but never gets used.",
    key:"Move from analyzing to witnessing: record what's true first, and perfect it later."},
  "Mei'hara":{code:"ME",name:"The Mirror",color:"#c98a7a",slug:"meihara",
    hi:"You feel deeply without losing yourself and keep boundaries in love. The people around you soften because of you.",
    lo:"You over-give, cling or get clung to, and your emotional boundaries blur. You get anxious, burned out and lose yourself.",
    key:"Move from syncing emotions to understanding the other while keeping yourself: love isn't rescuing; it's seeing what's real together."},
  "Xon'teh":{code:"XO",name:"The Connector",color:"#1f5fbf",slug:"xonteh",
    hi:"Precise, focused and inventive at integration, you get different systems and tools working in concert.",
    lo:"Overly rational and cut off from feeling, you build things that are precise but cold, and no one wants to use them.",
    key:"Move from controlling to collaborating: tools serve people, and efficiency can be warm."},
  "Nael'tu":{code:"NA",name:"The Navigator",color:"#e6e1d3",slug:"naeltu",
    hi:"Your vision is clear and you inspire others, turning ideas into a direction people want to follow.",
    lo:"You become controlling and aloof and take on too much. The pressure piles up on you, and the more you lead, the lonelier it gets.",
    key:"Move from leading to igniting: the best leadership helps everyone remember their own direction."},
  "Ori'shan":{code:"OR",name:"The Rhythm Keeper",color:"#b5357f",slug:"orishan",
    hi:"Natural rhythm and fluent expression. You bring a room to life through rhythm and action; when you're there, the room is alive.",
    lo:"Your body stiffens, expression gets blocked and emotions get stuck in your body. You become anxious and worn out.",
    key:"Move from controlling your body to listening to it: when the rhythm comes back, so do you."}
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

/* 畫面文字（英文版由翻譯表替換） */
const T = {
  needTest: 'Take the Root Code Test first, so we know your Primary Root.',
  needTestSub: '24 scenario questions, about 5 minutes. Come back to this page when you\'re done.',
  doTest: 'Start the Root Code Test',
  myRoot: 'Your Primary Root',
  ask: 'How are you today?',
  askSub: 'Just tap the one that feels closest. It lights a dot on the little calendar below, and you can change it any time today.',
  states: {stable:'Steady', tense:'Tense', drained:'Drained', messy:'Unsettled'},
  todayIs: 'Today: {state}',
  stableHead: 'You\'re on the steady side today.',
  otherHead: '{state} today, and that\'s okay.',
  hiLab: '{name} when steady',
  loLab: '{name} off balance may look like this',
  keyLab: 'The key to getting back to steady',
  keepLab: 'Keep this direction in mind',
  more: 'Get to know {root} →',
  secMore: 'Also see the key for your Secondary Root, {root}',
  calHead: 'Last 30 days',
  calNote: 'This only shows the days you tapped. No scores, no streaks, no comparing with anyone, and empty days are fine.',
  calEmpty: 'No lights yet',
  care: 'If it stays hard to get back to steady for a long time, talk with someone you trust or a professional.',
  privacy: 'Your lights are stored only in this browser on this device. We can\'t see them and nothing is uploaded. Clearing your browser data removes them.',
  clear: 'Clear my lights',
  clearAsk: 'Clear the lights stored on this device?',
  toPair: 'Pair with a friend and see how you work together →',
  /* 配對卡 */
  relCo: 'Easy to work with', relCp: 'Balancing each other', relCm: 'Needs more communication',
  descCo: 'You support each other in getting things done and work well on tasks together.',
  descCp: 'Each of you fills in what the other is missing.',
  descCm: 'You can misread each other and it takes more energy, but this is also where you grow the most.',
  both: 'The same person can be both "easy to work with" and "needs more communication": you get things done smoothly together, and still challenge each other when you spend time together.',
  dir: 'From {a}\'s side, {b} is: ',
  dirNone: 'From {a}\'s side, the first version of the table doesn\'t mark {b}.',
  same: 'You share the same Primary Root and operate in similar ways. The first version of the table has no notes for pairs with the same root.',
  none: 'The first version of the table doesn\'t mark this pair. A good place to start is how each of you looks when steady.',
  friend: 'Friend', you: 'You',
  mainLab: 'Primary Root', secLab: 'Secondary Root',
  motto: 'Working well together gets things done, balance makes us whole, and the one you need to talk with most helps you grow the most.',
  draft: 'First version, still being validated',
  draftNote: 'This relationship table is a first version from October 2025. It was worked out from how each root operates and hasn\'t been validated with data yet. Use it to get to know each other, not to judge or select anyone.',
  invited: 'A friend invited you to see your Pair Card together.',
  invitedSub: 'Both of you need to take the Root Code Test yourselves before you can pair. Take the test first (24 questions, about 5 minutes), then come back to this link to see your card.',
  invitedSaved: 'This device remembers your friend\'s link. After the test, your result page will also show "Back to my friend\'s Pair Card".',
  ownLink: 'This is your own pairing link. Send it to a friend; once they finish the test, you can see your card together.',
  makeHead: 'Create my pairing link',
  makeSub: 'The link only contains your Primary and Secondary Root codes. No name, no personal data.',
  share: 'Share link', copy: 'Copy link', copied: 'Copied',
  shareText: 'I took the Frequency Civilization Root Code Test. Want to see our Pair Card together?',
  shareBack: 'Send your link back to your friend too',
  pairNeedTest: 'Take the Root Code Test first to create your pairing link.',
  toGlow: 'Come back daily to light up and check in with yourself →'
};
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (m, k) => o[k] != null ? o[k] : m);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const label = k => `${k} · ${ROOTS[k].name}`;
const base = () => location.pathname.indexOf('/roots/') >= 0 ? '../' : '';

function getResult(){
  try{ const r = JSON.parse(localStorage.getItem('fc_result_root') || 'null'); return r && ROOTS[r.top] ? r : null; }catch(e){ return null; }
}
function store(k, v){ try{ if(v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
function read(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }

/* ===== 今日點燈 ===== */
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
    let h = `<div class="gm-card"><div class="gm-me"><i style="--c:${R.color}"></i>${T.myRoot}: <a href="${b}roots/${R.slug}.html">${esc(label(r.top))}</a></div>
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
    /* 30 天小日曆 */
    const days = [];
    for(let i = 29; i >= 0; i--){ const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const lit = days.filter(d => log[dkey(d)]).length;
    h += `<div class="gm-card"><div class="gm-cal-h">${T.calHead}</div><div class="gm-cal">` + days.map(d => {
      const k = dkey(d), s = log[k];
      return `<span class="gm-day${s?' lit':''}${k===today?' today':''}" style="--c:${R.color}" title="${d.getMonth()+1}/${d.getDate()}${s?' · '+T.states[s]:''}"><i></i><em>${d.getDate()}</em></span>`;
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

/* ===== 雙人配對卡 ===== */
function parseWith(v){
  const m = /^([A-Z]{2})-([A-Z]{2})$/.exec(String(v || '').toUpperCase());
  if(!m || !BY_CODE[m[1]] || !BY_CODE[m[2]] || m[1] === m[2]) return null;
  return {top: BY_CODE[m[1]], sec: BY_CODE[m[2]]};
}
function linkOf(r){ return location.origin + location.pathname.replace(/[^/]*$/, '') + 'pair.html?with=' + ROOTS[r.top].code + '-' + ROOTS[r.sec].code; }
function relOf(a, b){ /* 從 a 的主語根看 b 的主語根 */
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
    <div class="pc-sec">${T.secLab}: ${esc(label(r.sec))}</div></div>`;
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
      const line = (a, b, rs) => rs.length ? `<p class="pc-dir">${fill(T.dir, {a: esc(a), b: esc(b)})}<b>${rs.map(k => RL[k]()).join(', ')}</b></p>` : `<p class="pc-dir">${fill(T.dirNone, {a: esc(a), b: esc(b)})}</p>`;
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
