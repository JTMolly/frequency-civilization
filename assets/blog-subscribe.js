/* 部落格文章結尾的電子報訂閱框（共用元件）。
   文字、寫入方式都沿用首頁的電子報區塊（fc.js 的 fcNewsletter）：同一張 subscribers 表、source 寫 'newsletter:' + 頁面路徑、
   送出即表示同意（首頁沒有勾選框，這裡一樣）。繁中、簡中、英文各用首頁對應語言的字。
   用法：文章頁面載入這支 js 就會自己掛在回饋區（.fb）下面；沒有回饋區就掛在 .bl-nav 前面。頁面不用放任何標籤。
   本機預覽（localhost）不寫入正式資料庫，跟 fc.js 一樣。 */
(function () {
  var SUPA_URL = 'https://ssqozzkhkqxdbqmqamee.supabase.co';
  var SUPA_KEY = 'sb_publishable_3QsVK0QyO9SWOPTo84QZzQ_EDVaNagP';   // publishable key，設計上可放進網頁（同 fc.js）
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var L = document.documentElement.getAttribute('lang') || 'zh-Hant';
  var lang = /^en/i.test(L) ? 'en' : /hans/i.test(L) ? 'hans' : 'hant';
  var T = {
    hant: { h: '收到新的文章、工具與活動消息', ph: '你的 email', btn: '訂閱', n1: '送出即表示你同意我們的', priv: '隱私權政策', n2: '，隨時可以取消訂閱。',
            bad: 'email 格式看起來不對。', send: '送出中…', ok: '訂閱成功，歡迎加入。', fail: '暫時送不出去，請稍後再試一次。', net: '網路好像不太穩，請稍後再試一次。' },
    hans: { h: '收到新的文章、工具与活动消息', ph: '你的 email', btn: '订阅', n1: '送出即表示你同意我们的', priv: '隐私权政策', n2: '，随时可以取消订阅。',
            bad: 'email 格式看起来不对。', send: '送出中…', ok: '订阅成功，欢迎加入。', fail: '暂时送不出去，请稍后再试一次。', net: '网络好像不太稳，请稍后再试一次。' },
    en: { h: 'Get new articles, tools and event news', ph: 'Your email', btn: 'Subscribe', n1: 'By subscribing you agree to our ', priv: 'Privacy Policy', n2: '. You can unsubscribe any time.',
          bad: "That email doesn't look right.", send: 'Sending…', ok: "You're subscribed. Welcome.", fail: "Couldn't send right now. Please try again later.", net: 'The connection seems unstable. Please try again later.' }
  }[lang];

  var CSS =
    '.nl-blog{margin:56px 0 8px}' +
    '.nl-blog .nlb-card{border:1px solid var(--card-border,#e6dcc8);border-radius:12px;background:#fff;box-shadow:var(--shadow,0 6px 24px rgba(120,90,40,.08));padding:30px 28px 26px}' +
    '.nl-blog .nlb-k{margin:0 0 12px;font-size:12.5px;line-height:1.6;letter-spacing:.34em;color:var(--gold,#a07c3e)}' +
    '.nl-blog .nlb-h{margin:0 0 20px;font-family:"Noto Serif TC",serif;font-weight:500;font-size:clamp(19px,2.3vw,23px);line-height:1.6;letter-spacing:.06em;color:var(--text,#2b2620);scroll-margin-top:0}' +
    '.nl-blog .nlb-form{display:flex;gap:10px;flex-wrap:wrap;margin:0}' +
    '.nl-blog .nlb-in{flex:1 1 220px;min-width:0;min-height:48px;padding:0 16px;border:1px solid var(--card-border,#e6dcc8);border-radius:8px;background:#fffdf8;color:var(--text,#2b2620);font:inherit;font-size:16px;letter-spacing:.04em}' +
    '.nl-blog .nlb-in:focus{outline:none;border-color:var(--gold,#a07c3e);box-shadow:0 0 0 3px rgba(160,124,62,.15)}' +
    '.nl-blog .nlb-btn{flex:0 0 auto;min-height:48px;min-width:110px;padding:0 28px;border:1px solid var(--gold,#a07c3e);border-radius:99px;background:var(--gold,#a07c3e);color:#fff;font:inherit;font-size:15px;letter-spacing:.2em;cursor:pointer;transition:.25s}' +
    '.nl-blog .nlb-btn:hover{background:var(--gold-soft,#7c5f2c);border-color:var(--gold-soft,#7c5f2c)}' +
    '.nl-blog .nlb-btn:disabled{opacity:.55;cursor:default}' +
    '.nl-blog .nlb-msg{min-height:1.5em;margin:12px 0 0;font-size:14px;line-height:1.8;color:var(--gold-soft,#7c5f2c)}' +
    '.nl-blog .nlb-msg:empty{min-height:0;margin:0}' +
    '.nl-blog .nlb-note{margin:10px 0 0;font-size:12.5px;line-height:1.9;color:var(--muted,#8a8070)}' +
    '@media(max-width:480px){.nl-blog .nlb-card{padding:26px 20px 22px}.nl-blog .nlb-btn{flex:1 1 100%}}';

  function ga(name, params) { try { if (window.gtag) window.gtag('event', name, params); } catch (e) {} }
  function sid() {
    try {
      var s = localStorage.getItem('fc_sid');
      if (!s) { s = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2); localStorage.setItem('fc_sid', s); }
      return s;
    } catch (e) { return 'anon'; }
  }
  function saveEmail(email) {   // 跟 fc.js 的 saveEmail／insert 一樣：同一張表、同樣的欄位
    try { localStorage.setItem('fc_email', email); } catch (e) {}
    var row = { email: email, nickname: null, source: 'newsletter:' + location.pathname, session_id: sid(), consent: true };
    if (LOCAL) { if (window.console) console.info('[本機預覽] 不寫入 subscribers', row); return Promise.resolve({ ok: true, status: 201 }); }
    return fetch(SUPA_URL + '/rest/v1/subscribers', {
      method: 'POST',
      headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(row)
    });
  }

  function mount() {
    if (document.querySelector('.nl-blog')) return;
    // 頁首（標題）和文章本文各有一個 .article：選含有回饋區或結尾按鈕的那一個，都沒有就用最後一個
    var arts = document.querySelectorAll('.article'), art = null;
    for (var i = 0; i < arts.length; i++) { if (arts[i].querySelector('.fb, .bl-nav')) { art = arts[i]; break; } }
    if (!art && arts.length) art = arts[arts.length - 1];
    if (!art) return;
    var st = document.createElement('style'); st.id = 'nlb-css'; st.textContent = CSS; document.head.appendChild(st);
    var box = document.createElement('section');
    box.className = 'nl-blog';
    box.setAttribute('aria-labelledby', 'nlb-h');
    box.innerHTML =
      '<div class="nlb-card">' +
      '<div class="nlb-k">NEWSLETTER</div>' +
      '<h2 class="nlb-h" id="nlb-h">' + T.h + '</h2>' +
      '<form class="nlb-form"><input class="nlb-in" type="email" name="email" placeholder="' + T.ph + '" aria-label="' + T.ph + '" autocomplete="email" required>' +
      '<button class="nlb-btn" type="submit">' + T.btn + '</button></form>' +
      '<div class="nlb-msg" role="status" aria-live="polite"></div>' +
      '<p class="nlb-note">' + T.n1 + '<a href="../privacy.html">' + T.priv + '</a>' + T.n2 + '</p>' +
      '</div>';
    var fb = art.querySelector('.fb'), nav = art.querySelector('.bl-nav');
    if (fb) fb.parentNode.insertBefore(box, fb.nextSibling);
    else if (nav) nav.parentNode.insertBefore(box, nav);
    else art.appendChild(box);

    var form = box.querySelector('form'), msg = box.querySelector('.nlb-msg'), btn = box.querySelector('.nlb-btn');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = form.email.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg.textContent = T.bad; return; }
      msg.textContent = T.send; btn.disabled = true;
      saveEmail(email).then(function (res) {
        if (res.ok || res.status === 409) {   // 409＝這個 email 已經訂閱過
          msg.textContent = T.ok; form.reset();
          ga('newsletter_subscribe', { content_type: 'blog_post', item_id: location.pathname, lang: lang });
        } else { msg.textContent = T.fail; }
      }).catch(function () { msg.textContent = T.net; }).then(function () { btn.disabled = false; });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
