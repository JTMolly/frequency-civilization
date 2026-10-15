/* (comment translated from Chinese source) */
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

  /* (comment translated from Chinese source) */
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function insert(table, row){
    if(LOCAL){ console.info('[local preview] not saved', table, row); return Promise.resolve(new Response(null, {status:201})); }
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

  /* (comment translated from Chinese source) */
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

  /* (comment translated from Chinese source) */
  function trackResult(test, data){
    try{
      if(window.FC_CANON) data = window.FC_CANON(data);  /* (comment translated from Chinese source) */
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

  /* (comment translated from Chinese source) */
  function resultReady(test, data){
    trackResult(test, data);
    const gate = document.getElementById('gateBox');
    const deep = document.getElementById('deep');
    if(!gate || !deep) return;
    if(getEmail()){ deep.classList.remove('hidden'); gate.innerHTML=''; return; }
    gate.innerHTML =
      '<div class="gate">' +
      '<h3>Unlock your full reading</h3>' +
      '<p>Your basic result is free. Leave your email to unlock the full score breakdown and your ' + ({rootcode:'Secondary Root', archetype:'second archetype', drive:'second drive'}[test] || 'second result') + ' reading.</p>' +
      '<form onsubmit="return FC._unlock(this, \'' + test + '\')">' +
      '<input type="text" name="nickname" placeholder="Nickname (optional)">' +
      '<input type="email" name="email" placeholder="Your email" required>' +
      '<label class="consent"><input type="checkbox" required><span>I agree to receive my results and related content, and I have read the <a href="privacy.html" target="_blank">Privacy Policy</a> (unsubscribe any time).</span></label>' +
      '<button class="btn solid" type="submit" style="letter-spacing:.08em">Unlock my full reading</button>' +
      '<div class="gate-msg"></div>' +
      '</form></div>';
  }

  function _unlock(form, test){
    const email = form.email.value.trim();
    const nickname = form.nickname ? form.nickname.value.trim() : '';
    const msg = form.querySelector('.gate-msg');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ msg.textContent = 'That email doesn\'t look right. Could you check it?'; return false; }
    msg.textContent = 'Unlocking…';
    saveEmail(email, 'gate:' + test, nickname).finally(function(){
      const deep = document.getElementById('deep');
      const gate = document.getElementById('gateBox');
      if(deep) deep.classList.remove('hidden');
      if(gate) gate.innerHTML = '<p class="note" style="opacity:.8">Unlocked. Thank you.</p>';
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

/* (comment translated from Chinese source) */
function fcNewsletter(form){
  const email = form.email.value.trim();
  const box = form.parentElement.querySelector('.nl-msg');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ if(box) box.textContent = 'That email doesn\'t look right.'; return false; }
  if(box) box.textContent = 'Sending…';
  FC.saveEmail(email, 'newsletter:' + location.pathname).then(function(res){
    if(res.ok || res.status === 409){ /* (comment translated from Chinese source) */
      if(box) box.textContent = 'You\'re subscribed. Welcome.';
      form.reset();
    }else{
      if(box) box.textContent = 'Couldn\'t send right now. Please try again later.';
    }
  }).catch(function(){
    if(box) box.textContent = 'The connection seems unstable. Please try again later.';
  });
  return false;
}
