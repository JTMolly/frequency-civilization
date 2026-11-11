/* 部落格讀者回饋區（可重複使用）：一鍵回饋、分享、悄悄話。由 _build_feedback.py 產生，改文案請改產生程式。
   用法：<div class="fb" data-slug="文章slug"></div> ＋ 這支 js ＋ blog-feedback.css
   資料庫：post_reactions（總數，公開可讀）、post_whispers（悄悄話，前台讀不到）；寫入只走函式 bump_post_reaction、submit_whisper。 */
(function () {
  var SUPA_URL = 'https://ssqozzkhkqxdbqmqamee.supabase.co';
  var SUPA_KEY = 'sb_publishable_3QsVK0QyO9SWOPTo84QZzQ_EDVaNagP';   /* 公開金鑰，設計上可放進網頁（和 fc.js 同一把） */
  var STR = {
 "zh-Hant": {
  "title": "看完之後，想留點什麼嗎？",
  "hint": "按一下就好。不用登入，我們也看不出是誰按的。",
  "resonate": "有共鳴",
  "helpful": "這篇對我有幫助",
  "pressed": "已按過",
  "shareTitle": "傳給可能需要的人",
  "line": "LINE",
  "facebook": "臉書",
  "threads": "Threads",
  "copy": "複製連結",
  "copied": "已複製連結",
  "copyFail": "複製沒有成功，請從網址列自行複製。",
  "whisperTitle": "悄悄話",
  "whisperNote": "這裡的話只有頻率文明團隊看得到，不會公開。如果需要有人幫忙，可以尋找專業的協助單位。",
  "placeholder": "想說的話，可以寫在這裡。不用留名字，也不用留聯絡方式。",
  "label": "悄悄話內容",
  "send": "送出",
  "sending": "送出中…",
  "ok": "收到了，謝謝你願意說",
  "empty": "請先寫幾個字再送出。",
  "wait": "剛剛才送出一則，請過 30 秒再寫下一則。",
  "busy": "現在寫的人比較多，請稍後再試。",
  "fail": "沒有送出去，請稍後再試一次。",
  "reactFail": "沒有按成功，請再試一次。",
  "shareName": "分享這篇文章"
 },
 "zh-Hans": {
  "title": "看完之后，想留点什么吗？",
  "hint": "按一下就好。不用登入，我们也看不出是谁按的。",
  "resonate": "有共鸣",
  "helpful": "这篇对我有帮助",
  "pressed": "已按过",
  "shareTitle": "传给可能需要的人",
  "line": "LINE",
  "facebook": "脸书",
  "threads": "Threads",
  "copy": "复制连结",
  "copied": "已复制连结",
  "copyFail": "复制没有成功，请从网址列自行复制。",
  "whisperTitle": "悄悄话",
  "whisperNote": "这里的话只有频率文明团队看得到，不会公开。如果需要有人帮忙，可以寻找专业的协助单位。",
  "placeholder": "想说的话，可以写在这里。不用留名字，也不用留联络方式。",
  "label": "悄悄话内容",
  "send": "送出",
  "sending": "送出中…",
  "ok": "收到了，谢谢你愿意说",
  "empty": "请先写几个字再送出。",
  "wait": "刚刚才送出一则，请过 30 秒再写下一则。",
  "busy": "现在写的人比较多，请稍后再试。",
  "fail": "没有送出去，请稍后再试一次。",
  "reactFail": "没有按成功，请再试一次。",
  "shareName": "分享这篇文章"
 },
 "en": {
  "title": "After reading, would you like to leave something?",
  "hint": "One tap is enough. No login, and we can't tell who tapped.",
  "resonate": "This resonated",
  "helpful": "This post helped me",
  "pressed": "Already tapped",
  "shareTitle": "Send it to someone who might need it",
  "line": "LINE",
  "facebook": "Facebook",
  "threads": "Threads",
  "copy": "Copy link",
  "copied": "Link copied",
  "copyFail": "Couldn't copy. Please copy the address from your browser.",
  "whisperTitle": "A quiet word",
  "whisperNote": "Only the Frequency Civilization team can see what you write here. It will never be made public. If you need someone to help, you can reach out to a professional support service.",
  "placeholder": "Write whatever you'd like to say here. No name or contact details needed.",
  "label": "Your quiet word",
  "send": "Send",
  "sending": "Sending…",
  "ok": "Received. Thank you for being willing to say it.",
  "empty": "Please write a few words first.",
  "wait": "You just sent one. Please wait 30 seconds before the next.",
  "busy": "Many people are writing right now. Please try again in a moment.",
  "fail": "It didn't go through. Please try again later.",
  "reactFail": "That didn't go through. Please try again.",
  "shareName": "Share this post"
 }
};
  var ICON = {"line": "M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314", "facebook": "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z", "threads": "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"};
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);   /* 本機預覽只讀、不寫入正式資料庫、不送 GA */
  var htmlLang = (document.documentElement.getAttribute('lang') || 'zh-Hant');
  var L = /^en/i.test(htmlLang) ? 'en' : (/Hans/i.test(htmlLang) ? 'zh-Hans' : 'zh-Hant');
  var T = STR[L];
  var WAIT_MS = 30000, MAX = 500;

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  function cid() {   /* 瀏覽器隨機代碼：只用來避免同一個瀏覽器重複計數，和測驗用的 fc_sid 分開，不能對到任何人 */
    var c = ls('fc_fb_cid');
    if (!c) {
      c = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); });
      ls('fc_fb_cid', c);
    }
    return c;
  }
  function ga(name, params) {
    if (LOCAL) { try { console.info('[本機預覽] 不送 GA', name, params); } catch (e) {} return; }
    try { if (window.gtag) window.gtag('event', name, params); } catch (e) {}
  }
  function api(path, opt) {
    opt = opt || {};
    var h = { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY };
    if (opt.body) h['Content-Type'] = 'application/json';
    return fetch(SUPA_URL + '/rest/v1/' + path, { method: opt.method || 'GET', headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pageUrl() { var c = document.querySelector('link[rel="canonical"]'); return (c && c.href) || (location.origin + location.pathname); }
  function pageTitle() { var h = document.querySelector('h1'); return (h && h.textContent.trim()) || document.title; }

  function build(root) {
    var slug = root.getAttribute('data-slug') || '';
    if (!/^[a-z0-9][a-z0-9-]{0,78}$/.test(slug)) return;
    var share = [
      { id: 'line', label: T.line, color: '#06C755', svg: ICON.line, href: function () { return 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(pageUrl()); } },
      { id: 'facebook', label: T.facebook, color: '#0866FF', svg: ICON.facebook, href: function () { return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl()); } },
      { id: 'threads', label: T.threads, color: '#000000', svg: ICON.threads, href: function () { return 'https://www.threads.com/intent/post?text=' + encodeURIComponent(pageTitle()) + '&url=' + encodeURIComponent(pageUrl()); } }
    ];
    var shareHtml = share.map(function (s) {
      return '<a class="fb-soc" href="#" data-share="' + s.id + '" target="_blank" rel="noopener" style="--brand:' + s.color + '" aria-label="' + esc(T.shareName + ' · ' + s.label) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + s.svg + '"/></svg><span>' + esc(s.label) + '</span></a>';
    }).join('') +
      '<button type="button" class="fb-soc" data-share="copy_link" style="--brand:#a07c3e" aria-label="' + esc(T.copy) + '"><svg viewBox="0 0 24 24" aria-hidden="true" class="fb-stroke"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg><span>' + esc(T.copy) + '</span></button>';

    root.innerHTML =
      '<section class="fb-card" aria-labelledby="fb-t-' + slug + '">' +
      '<h2 class="fb-h" id="fb-t-' + slug + '">' + esc(T.title) + '</h2>' +
      '<div class="fb-react">' +
      '<button type="button" class="fb-btn" data-r="resonate" aria-pressed="false"><span class="fb-lab">' + esc(T.resonate) + '</span><span class="fb-n" data-n="resonate" aria-live="polite">–</span></button>' +
      '<button type="button" class="fb-btn" data-r="helpful" aria-pressed="false"><span class="fb-lab">' + esc(T.helpful) + '</span><span class="fb-n" data-n="helpful" aria-live="polite">–</span></button>' +
      '</div>' +
      '<p class="fb-hint">' + esc(T.hint) + '</p><p class="fb-msg" data-msg="react" role="status" aria-live="polite"></p>' +
      '<div class="fb-sep"></div>' +
      '<h3 class="fb-h3">' + esc(T.shareTitle) + '</h3>' +
      '<div class="fb-share">' + shareHtml + '</div><p class="fb-msg" data-msg="share" role="status" aria-live="polite"></p>' +
      '<div class="fb-sep"></div>' +
      '<h3 class="fb-h3">' + esc(T.whisperTitle) + '</h3>' +
      '<p class="fb-note">' + esc(T.whisperNote) + '</p>' +
      '<label class="fb-sr" for="fb-w-' + slug + '">' + esc(T.label) + '</label>' +
      '<textarea class="fb-ta" id="fb-w-' + slug + '" maxlength="' + MAX + '" rows="5" placeholder="' + esc(T.placeholder) + '"></textarea>' +
      '<input class="fb-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="fb-foot"><span class="fb-cnt">0 / ' + MAX + '</span><button type="button" class="fb-send">' + esc(T.send) + '</button></div>' +
      '<p class="fb-msg fb-ok" data-msg="whisper" role="status" aria-live="polite"></p>' +
      '</section>';

    var msg = function (k, text) { var e = root.querySelector('[data-msg="' + k + '"]'); if (e) e.textContent = text || ''; };

    /* ---- 一鍵回饋 ---- */
    var counts = { resonate: 0, helpful: 0 };
    var key = function (r) { return 'fc_fb_r_' + slug + '_' + r; };
    var paint = function (r) {
      var b = root.querySelector('.fb-btn[data-r="' + r + '"]');
      root.querySelector('[data-n="' + r + '"]').textContent = String(counts[r]);
      var on = ls(key(r)) === '1';
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.title = on ? T.pressed : '';
    };
    ['resonate', 'helpful'].forEach(paint);
    api('post_reactions?select=reaction,total&slug=eq.' + encodeURIComponent(slug))
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { rows.forEach(function (x) { if (x.reaction in counts) counts[x.reaction] = Number(x.total) || 0; }); ['resonate', 'helpful'].forEach(paint); })
      .catch(function () { ['resonate', 'helpful'].forEach(function (r) { root.querySelector('[data-n="' + r + '"]').textContent = '0'; }); });

    root.querySelectorAll('.fb-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = b.getAttribute('data-r');
        if (ls(key(r)) === '1') return;            /* 同一個瀏覽器每個按鈕一次 */
        ls(key(r), '1'); counts[r] += 1; paint(r); msg('react', '');
        ga('post_reaction', { content_type: 'blog_post', item_id: slug, reaction: r, lang: L });
        if (LOCAL) { console.info('[本機預覽] 不寫入 post_reactions', slug, r); return; }
        api('rpc/bump_post_reaction', { method: 'POST', body: { p_slug: slug, p_reaction: r, p_client: cid() } })
          .then(function (res) { if (!res.ok) throw new Error('rpc ' + res.status); return res.json(); })
          .then(function (n) { if (typeof n === 'number') { counts[r] = n; paint(r); } })
          .catch(function () { ls(key(r), null); counts[r] = Math.max(0, counts[r] - 1); paint(r); msg('react', T.reactFail); });
      });
    });

    /* ---- 分享 ---- */
    root.querySelectorAll('[data-share]').forEach(function (a) {
      var id = a.getAttribute('data-share');
      a.addEventListener('click', function (ev) {
        ga('share', { method: id, content_type: 'blog_post', item_id: slug, lang: L });
        if (id === 'copy_link') {
          ev.preventDefault();
          var url = pageUrl();
          var done = function (okk) { msg('share', okk ? T.copied : T.copyFail); };
          if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { done(true); }, function () { done(fallbackCopy(url)); }); }
          else done(fallbackCopy(url));
          return;
        }
        a.setAttribute('href', share.filter(function (s) { return s.id === id; })[0].href());   /* 點的當下才組網址，用目前頁面的網址 */
      });
      if (id !== 'copy_link') a.setAttribute('href', share.filter(function (s) { return s.id === id; })[0].href());
    });
    function fallbackCopy(text) {
      try { var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px'; document.body.appendChild(t); t.select(); var okk = document.execCommand('copy'); document.body.removeChild(t); return okk; } catch (e) { return false; }
    }

    /* ---- 悄悄話 ---- */
    var ta = root.querySelector('.fb-ta'), cnt = root.querySelector('.fb-cnt'), send = root.querySelector('.fb-send'), hp = root.querySelector('.fb-hp');
    ta.addEventListener('input', function () { cnt.textContent = ta.value.length + ' / ' + MAX; });
    var busy = false;
    send.addEventListener('click', function () {
      if (busy) return;
      var text = ta.value.replace(/^\s+|\s+$/g, '');
      msg('whisper', '');
      if (!text) { msg('whisper', T.empty); return; }
      var last = Number(ls('fc_fb_w_ts') || 0);
      if (Date.now() - last < WAIT_MS) { msg('whisper', T.wait); return; }   /* 同一台 30 秒內只能送一次 */
      busy = true; send.disabled = true; send.textContent = T.sending;
      var finish = function (okk, why) {
        busy = false; send.disabled = false; send.textContent = T.send;
        if (okk) { ls('fc_fb_w_ts', String(Date.now())); ta.value = ''; cnt.textContent = '0 / ' + MAX; msg('whisper', T.ok); ga('whisper_submit', { content_type: 'blog_post', item_id: slug, lang: L }); }
        else msg('whisper', why === 'busy' ? T.busy : T.fail);
      };
      if (LOCAL) { console.info('[本機預覽] 不寫入 post_whispers', slug, text.length + ' 字'); setTimeout(function () { finish(true); }, 300); return; }
      api('rpc/submit_whisper', { method: 'POST', body: { p_slug: slug, p_body: text, p_hp: hp.value || '' } })
        .then(function (res) { if (res.ok) return finish(true); return res.text().then(function (t) { finish(false, /rate_limited/.test(t) ? 'busy' : 'fail'); }); })
        .catch(function () { finish(false, 'fail'); });
    });
  }

  function init() { document.querySelectorAll('.fb[data-slug]').forEach(build); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
