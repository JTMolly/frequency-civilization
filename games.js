/* ============================================================
   games.js — 今日點燈、雙人配對卡（共用資料與畫面）
   - 語根的「穩定時／失衡時／調整的關鍵」逐字取自 roots/*.html，不另外編寫
   - 關係表：12 語根關係圖譜初版（2025/10），標示「初版，持續驗證中」
   - 所有紀錄只存在瀏覽器（localStorage）：fc_glow（點燈）、fc_pair_pending（朋友的配對連結）
     不需要帳號，不上傳，不收任何個人資料
   ============================================================ */
(function(){
const ROOTS = {
  "Sa'karan":{code:"SK",name:"建構者",color:"#b8892b",slug:"sakaran",
    hi:"條理分明、行動有序，能把混亂化為可執行的秩序，成為團隊可依靠的結構者。",
    lo:"控制慾變強、過度理性、失去彈性——系統開始僵化，創造力跟著受限。",
    key:"從「控制」轉為「承載」：讓結構服務目標，而不是讓人服務結構。"},
  "Elariah":{code:"EL",name:"情緒引導者",color:"#e8806f",slug:"elariah",
    hi:"能擁抱情緒、聆聽他人，把感受轉化為理解——你是情緒場裡讓人安心的存在。",
    lo:"被他人情緒淹沒、過度共感、自我模糊，長期下來精神疲倦、容易崩潰。",
    key:"從「吸收」轉為「流動」：感受可以經過你，不必留在你身上。"},
  "Thaleon":{code:"TH",name:"洞察轉化者",color:"#5b3fa0",slug:"thaleon",
    hi:"敢直面困難，能在低谷中提煉出智慧，成為別人改變的觸媒。",
    lo:"沉溺在痛苦裡、反覆內耗、掉進「都是我不好／都是別人害的」的劇本。",
    key:"把「挫折是懲罰」改寫成「挫折是材料」——你最擅長的本來就是重寫劇本。"},
  "Auri'kai":{code:"AU",name:"直覺洞察者",color:"#5aa9c9",slug:"aurikai",
    hi:"靈感清晰、判斷敏銳，能比別人早一步看見重點，並把模糊的訊息翻譯成大家聽得懂的語言。",
    lo:"訊息過載、難以分辨哪些是直覺哪些是焦慮，容易疲倦渙散、心神不定。",
    key:"從「被動接收」轉為「主動篩選」：你可以決定頻道什麼時候開、什麼時候關。"},
  "Rohen'dal":{code:"RO",name:"行動推動者",color:"#e2562b",slug:"rohendal",
    hi:"積極行動、勇於表達，能在混亂中帶出方向與節奏，是團隊的推進器。",
    lo:"衝動行事、帶著情緒推進、聽不進別人——消耗自己，也製造誤會。",
    key:"從「反應」轉為「回應」：先確認方向，再全速前進。"},
  "Zae'rah":{code:"ZA",name:"穩定支持者",color:"#3fa98f",slug:"zaerah",
    hi:"平靜、有包容力，能穩住波動的場面——你是團隊的定錨。",
    lo:"壓抑感覺、迴避衝突、假性平靜——把自己關起來，身體僵硬、關係疏離。",
    key:"分清「麻木」與「安定」：穩定不是沒有感覺，是有感覺仍然站得住。"},
  "Valtara":{code:"VA",name:"集體整合者",color:"#2a46b8",slug:"valtara",
    hi:"促進合作、善於傾聽，能整合多方觀點，讓團隊的協作順暢、成果加倍。",
    lo:"過度討好、害怕衝突、迷失在別人的需求裡——精神耗竭、越來越不知道自己要什麼。",
    key:"從「取悅每個人」轉為「對齊共同目標」：合作不是犧牲，是一起變強。"},
  "Kuthari":{code:"KU",name:"系統記錄者",color:"#c5ccd8",slug:"kuthari",
    hi:"觀察入微、表達清晰，能用文字與語言建立秩序，把散落的經驗變成可傳承的知識。",
    lo:"過度分析、停在思考層、害怕行動——知識一直堆疊，卻遲遲派不上用場。",
    key:"從「分析」轉為「見證」：先記錄真實，再追求完美。"},
  "Mei'hara":{code:"ME",name:"關係共振者",color:"#c98a7a",slug:"meihara",
    hi:"能深度共感又不迷失，在愛裡保持界線——你身邊的人會因為你而變得柔軟。",
    lo:"過度付出、依附或被依附、情緒界線模糊——容易焦慮、倦怠、失去自我。",
    key:"從「情緒同步」轉為「理解對方、保有自己」：愛不是拯救，是一起看見真實。"},
  "Xon'teh":{code:"XO",name:"技術對接者",color:"#1f5fbf",slug:"xonteh",
    hi:"精準、專注、有整合創新的能力，能讓不同的系統與工具協同運作。",
    lo:"過度理性、與感受斷線——做出來的東西精準卻冰冷，沒有人想用。",
    key:"從「控制」轉為「協作」：工具是為人服務的，效率也可以有溫度。"},
  "Nael'tu":{code:"NA",name:"領航創造者",color:"#e6e1d3",slug:"naeltu",
    hi:"願景清晰、能鼓舞他人，把想法變成大家願意跟隨的方向。",
    lo:"控制慾強、孤傲、過度承擔——壓力堆在自己身上，越領導越孤單。",
    key:"從「帶領」轉為「啟動」：最好的領導，是讓每個人記得自己的方向。"},
  "Ori'shan":{code:"OR",name:"節奏帶動者",color:"#b5357f",slug:"orishan",
    hi:"律動自然、表達流暢，能用節奏與行動把現場帶活——你在，場子就是活的。",
    lo:"身體僵硬、表達受限、情緒卡在身體裡——容易焦慮、倦怠。",
    key:"從「控制身體」轉為「傾聽身體」：節奏回來了，狀態就回來了。"}
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
  needTest: '先做語根測驗，才知道你的主語根。',
  needTestSub: '24 題情境選擇、約 5 分鐘。做完回到這一頁就能開始。',
  doTest: '開始語根測驗',
  myRoot: '你的主語根',
  ask: '今天的你，比較像？',
  askSub: '憑感覺點一個就好。點了會在下面的小日曆亮一顆光點，今天之內都可以改。',
  states: {stable:'穩定', tense:'緊繃', drained:'沒電', messy:'心很亂'},
  todayIs: '今天：{state}',
  stableHead: '你今天在穩定的一邊。',
  otherHead: '今天{state}，也沒關係。',
  hiLab: '{name}穩定時',
  loLab: '{name}失衡時，可能會這樣',
  keyLab: '回到穩定的關鍵',
  keepLab: '記得這個方向',
  more: '深入認識 {root} →',
  secMore: '也看看副語根 {root} 回到穩定的關鍵',
  calHead: '最近 30 天',
  calNote: '這裡只記錄你點過的日子。不計分、不算連續天數、不跟別人比，空著的日子也沒有關係。',
  calEmpty: '還沒有點過燈',
  care: '如果長期很難回到穩定，找信任的人或專業的人聊聊。',
  privacy: '點燈紀錄只存在這支手機的瀏覽器裡，我們看不到，也不會上傳。清除瀏覽器資料就會一起消失。',
  clear: '清除我的點燈紀錄',
  clearAsk: '要清除這支手機上的點燈紀錄嗎？',
  toPair: '跟朋友配對，看看你們怎麼一起運作 →',
  /* 配對卡 */
  relCo: '合作順手', relCp: '互補平衡', relCm: '需要多溝通',
  descCo: '做事上互相支援，適合一起完成任務。',
  descCp: '補上彼此缺的那一塊。',
  descCm: '容易誤讀彼此，相處比較耗能，但也最能讓人成長。',
  both: '同一個人可能同時是「合作順手」和「需要多溝通」：做事上合作得很順，相處上會互相挑戰。',
  dir: '從{a}的角度，{b}是：',
  dirNone: '從{a}的角度，初版關係表沒有特別標記{b}。',
  same: '你們的主語根一樣，用很像的方式運作。初版關係表沒有同一個語根的配對說明。',
  none: '初版關係表沒有特別標記這一組。可以從彼此穩定時的樣子開始認識對方。',
  friend: '朋友', you: '你',
  mainLab: '主語根', secLab: '副語根',
  motto: '合作讓事情完成，互補讓人完整，需要多溝通的那一位，最能讓你長大。',
  draft: '初版，持續驗證中',
  draftNote: '這張關係表是 2025/10 的初版，由語根的運作模式推演而來，還沒有用資料驗證過。只供彼此認識參考，不適合用來評價或篩選任何人。',
  invited: '朋友邀請你一起看你們的雙人配對卡。',
  invitedSub: '兩個人都要自己做完語根測驗，才會配對。先做測驗（24 題、約 5 分鐘），做完回到這個連結，就能看到你們的關係卡。',
  invitedSaved: '這支手機記住了朋友的配對連結。做完測驗後，結果頁也會出現「回到朋友的配對卡」。',
  ownLink: '這是你自己的配對連結。把它傳給朋友，等他做完測驗，就能一起看你們的關係卡。',
  makeHead: '產生我的配對連結',
  makeSub: '連結裡只有你的主語根和副語根代號，沒有名字和任何個人資料。',
  share: '分享連結', copy: '複製連結', copied: '已複製',
  shareText: '我做了頻率文明的語根測驗，想跟你一起看我們的雙人配對卡：',
  shareBack: '也把你的連結傳回給朋友',
  pairNeedTest: '先做語根測驗，才能產生你的配對連結。',
  toGlow: '每天回來點燈，看看今天的自己 →'
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
    /* 30 天小日曆 */
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
