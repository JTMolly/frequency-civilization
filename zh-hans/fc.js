/* ============================================================
   fc.js — 频率文明资料层：Supabase 收数据 + email 解锁 + 电子报
   Supabase publishable key 为公开金钥，设计上可放进网页。
   资料表建立 SQL 见 supabase_setup.sql（需在 Supabase 后台执行一次）。
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

  /* 本机预览（localhost）不写入正式资料库，避免测试资料混进统计 */
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function insert(table, row){
    if(LOCAL){ console.info('[本机预览] 不写入', table, row); return Promise.resolve(new Response(null, {status:201})); }
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

  /* 呼叫资料库函式（例如网格统计 grid_stats，只回传人数统计） */
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

  /* 测验完成：匿名先收一笔（就算不留 email，数据也不会流失） */
  function trackResult(test, data){
    try{
      if(window.FC_CANON) data = window.FC_CANON(data);  /* 其他语言版本：结果代号一律存成繁体 */
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

  /* email 解锁门：gateBox＝表单容器、deep＝深度层容器 */
  function resultReady(test, data){
    trackResult(test, data);
    const gate = document.getElementById('gateBox');
    const deep = document.getElementById('deep');
    if(!gate || !deep) return;
    if(getEmail()){ deep.classList.remove('hidden'); gate.innerHTML=''; return; }
    gate.innerHTML =
      '<div class="gate">' +
      '<h3>解锁你的完整解读</h3>' +
      '<p>基本结果免费。留下 email，立即解锁完整分数分布与' + ({rootcode:'副语根', archetype:'第二原型', drive:'副动力'}[test] || '第二结果') + '的解读。</p>' +
      '<form onsubmit="return FC._unlock(this, \'' + test + '\')">' +
      '<input type="text" name="nickname" placeholder="暱称（选填）">' +
      '<input type="email" name="email" placeholder="你的 email" required>' +
      '<label class="consent"><input type="checkbox" required><span>我同意接收测验结果与相关内容，并已阅读<a href="privacy.html" target="_blank">隐私权政策</a>（随时可取消订阅）。</span></label>' +
      '<button class="btn solid" type="submit" style="letter-spacing:.2em">解锁完整解读</button>' +
      '<div class="gate-msg"></div>' +
      '</form></div>';
  }

  function _unlock(form, test){
    const email = form.email.value.trim();
    const nickname = form.nickname ? form.nickname.value.trim() : '';
    const msg = form.querySelector('.gate-msg');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ msg.textContent = 'email 格式看起来不对，再确认一下？'; return false; }
    msg.textContent = '解锁中…';
    saveEmail(email, 'gate:' + test, nickname).finally(function(){
      const deep = document.getElementById('deep');
      const gate = document.getElementById('gateBox');
      if(deep) deep.classList.remove('hidden');
      if(gate) gate.innerHTML = '<p class="note" style="opacity:.8">已解锁，谢谢你。</p>';
      if(deep) deep.scrollIntoView({behavior:'smooth', block:'start'});
    });
    return false;
  }

  window.FC = { sid, insert, rpc, trackResult, saveEmail, getEmail, setEmail, resultReady, _unlock };
})();

/* footer 电子报订阅 */
function fcNewsletter(form){
  const email = form.email.value.trim();
  const box = form.parentElement.querySelector('.nl-msg');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ if(box) box.textContent = 'email 格式看起来不对。'; return false; }
  if(box) box.textContent = '送出中…';
  FC.saveEmail(email, 'newsletter:' + location.pathname).then(function(res){
    if(res.ok || res.status === 409){ /* 409＝这个 email 已经订阅过 */
      if(box) box.textContent = '订阅成功，欢迎加入。';
      form.reset();
    }else{
      if(box) box.textContent = '暂时送不出去，请稍后再试一次。';
    }
  }).catch(function(){
    if(box) box.textContent = '网路好像不太稳，请稍后再试一次。';
  });
  return false;
}
