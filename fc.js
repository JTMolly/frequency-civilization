/* ============================================================
   fc.js — 頻率文明資料層：Supabase 收數據 + email 解鎖 + 電子報
   Supabase publishable key 為公開金鑰，設計上可放進網頁。
   資料表建立 SQL 見 supabase_setup.sql（需在 Supabase 後台執行一次）。
   ============================================================ */
(function(){
  const SUPA_URL = 'https://ssqozzkhkqxdbqmqamee.supabase.co';
  const SUPA_KEY = 'sb_publishable_3QsVK0QyO9SWOPTo84QZzQ_EDVaNagP';

  function sid(){
    try{
      let s = localStorage.getItem('fc_sid');
      if(!s){ s = (crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(16).slice(2)); localStorage.setItem('fc_sid', s); }
      return s;
    }catch(e){ return 'anon'; }
  }

  /* 本機預覽（localhost）不寫入正式資料庫，避免測試資料混進統計 */
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function insert(table, row){
    if(LOCAL){ console.info('[本機預覽] 不寫入', table, row); return Promise.resolve(new Response(null, {status:201})); }
    return fetch(SUPA_URL + '/rest/v1/' + table, {
      method:'POST',
      headers:{
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    });
  }

  /* 呼叫資料庫函式（例如網格統計 grid_stats，只回傳人數統計） */
  function rpc(name, args){
    return fetch(SUPA_URL + '/rest/v1/rpc/' + name, {
      method:'POST',
      headers:{
        'apikey': SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args || {})
    }).then(function(r){ if(!r.ok) throw new Error('rpc ' + r.status); return r.json(); });
  }

  /* 測驗完成：匿名先收一筆（就算不留 email，數據也不會流失） */
  function trackResult(test, data){
    try{
      if(window.FC_CANON) data = window.FC_CANON(data);  /* 其他語言版本：結果代號一律存成繁體 */
      insert('test_results', {
        session_id: sid(),
        test: test,
        answers: data.answers || null,
        scores: data.scores || null,
        top_result: data.top || null,
        second_result: data.second || null,
        version: data.version || null,
        phrase_code: data.phrase || null,
        email: getEmail() || null,
        referrer: document.referrer || null,
        page: location.pathname,
        ua: navigator.userAgent.slice(0, 250)
      }).catch(()=>{});
    }catch(e){}
  }

  function getEmail(){ try{ return localStorage.getItem('fc_email') || ''; }catch(e){ return ''; } }
  function setEmail(v){ try{ localStorage.setItem('fc_email', v); }catch(e){} }

  function saveEmail(email, source, nickname){
    setEmail(email);
    return insert('subscribers', {
      email: email,
      nickname: nickname || null,
      source: source,
      session_id: sid(),
      consent: true
    });
  }

  /* email 解鎖門：gateBox＝表單容器、deep＝深度層容器 */
  function resultReady(test, data){
    trackResult(test, data);
    const gate = document.getElementById('gateBox');
    const deep = document.getElementById('deep');
    if(!gate || !deep) return;
    if(getEmail()){ deep.classList.remove('hidden'); gate.innerHTML=''; return; }
    gate.innerHTML =
      '<div class="gate">' +
      '<h3>解鎖你的完整解讀</h3>' +
      '<p>基本結果免費。留下 email，立即解鎖完整分數分佈與' + ({rootcode:'副語根', archetype:'第二原型', drive:'副動力'}[test] || '第二結果') + '的解讀。</p>' +
      '<form onsubmit="return FC._unlock(this, \'' + test + '\')">' +
      '<input type="text" name="nickname" placeholder="暱稱（選填）">' +
      '<input type="email" name="email" placeholder="你的 email" required>' +
      '<label class="consent"><input type="checkbox" required><span>我同意接收測驗結果與相關內容，並已閱讀<a href="privacy.html" target="_blank">隱私權政策</a>（隨時可取消訂閱）。</span></label>' +
      '<button class="btn solid" type="submit" style="letter-spacing:.2em">解鎖完整解讀</button>' +
      '<div class="gate-msg"></div>' +
      '</form></div>';
  }

  function _unlock(form, test){
    const email = form.email.value.trim();
    const nickname = form.nickname ? form.nickname.value.trim() : '';
    const msg = form.querySelector('.gate-msg');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ msg.textContent = 'email 格式看起來不對，再確認一下？'; return false; }
    msg.textContent = '解鎖中…';
    saveEmail(email, 'gate:' + test, nickname).finally(function(){
      const deep = document.getElementById('deep');
      const gate = document.getElementById('gateBox');
      if(deep) deep.classList.remove('hidden');
      if(gate) gate.innerHTML = '<p class="note" style="opacity:.8">已解鎖，謝謝你。</p>';
      if(deep) deep.scrollIntoView({behavior:'smooth', block:'start'});
    });
    return false;
  }

  /* 標了 data-live-total 的文字：3,906 筆（截至 2026/7）加上新版測驗的即時人數 */
  function liveTotals(){
    const els = document.querySelectorAll('[data-live-total]');
    if(!els.length) return;
    rpc('grid_stats').then(function(st){
      const n = st && st.people;
      if(!(n > 0)) return;
      const total = (3906 + n).toLocaleString('en-US');
      els.forEach(function(el){ el.innerHTML = el.innerHTML.replace('3,906', total); });
    }).catch(function(){});
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', liveTotals); else liveTotals();

  window.FC = { sid, insert, rpc, trackResult, saveEmail, getEmail, setEmail, resultReady, _unlock };
})();

/* footer 電子報訂閱 */
function fcNewsletter(form){
  const email = form.email.value.trim();
  const box = form.parentElement.querySelector('.nl-msg');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ if(box) box.textContent = 'email 格式看起來不對。'; return false; }
  if(box) box.textContent = '送出中…';
  FC.saveEmail(email, 'newsletter:' + location.pathname).then(function(res){
    if(res.ok || res.status === 409){ /* 409＝這個 email 已經訂閱過 */
      if(box) box.textContent = '訂閱成功，歡迎加入。';
      form.reset();
    }else{
      if(box) box.textContent = '暫時送不出去，請稍後再試一次。';
    }
  }).catch(function(){
    if(box) box.textContent = '網路好像不太穩，請稍後再試一次。';
  });
  return false;
}
