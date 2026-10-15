#!/usr/bin/env python3
"""多語系建置：繁體中文（根目錄，原稿）→ 簡體中文（/zh-hans/，自動轉換）＋ 英文（/en/，翻譯表）。

用法（在網站根目錄執行）：
    python3 tools/i18n/build.py

需要：pip install opencc-python-reimplemented
做的事：
  1. 在每個繁中頁面放上語言切換與 hreflang（可重複執行，不會重複插入）
  2. 把全站繁中頁面與含中文的共用 JS 轉成簡體，輸出到 zh-hans/
  3. 若 tools/i18n/en/ 有該頁的翻譯檔，輸出英文頁到 en/（見 en_build.py）
"""
import json, os, re, subprocess, sys
from opencc import OpenCC

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.chdir(ROOT)
BASE = 'https://frequency-civilization.com/'
CC = OpenCC('tw2s')

# 共用 JS 裡有中文顯示文字的，簡體版另外輸出一份
JS_WITH_TEXT = ['fc.js', 'flow.js', 'card.js', 'assets/phrases144.js', 'games.js']

# 測驗結果裡用中文當代號的值（原型、動力）：資料一律存繁體，簡體頁只在顯示時轉換
CANON_TERMS = ['行動者', '療癒者', '教導者', '感應者', '洞見者', '鏡面者',
               '療癒', '探索', '服務', '守護', '突破', '創造', '傳遞', '共鳴']


def pages():
    out = subprocess.run(['git', 'ls-files', '*.html'], capture_output=True, text=True).stdout.split()
    extra = [p for p in ('voices.html', 'notes.html') if os.path.exists(p)]
    extra += sorted('notes/' + f for f in os.listdir('notes') if f.endswith('.html')) if os.path.isdir('notes') else []
    allp = sorted(set(out + extra))
    return [p for p in allp if not p.startswith(('zh-hans/', 'en/', '_old_site/', 'tools/')) and p != 'builders.html']


def en_exists(p):
    return os.path.exists(os.path.join('en', p))


def url_of(lang, p):
    p = '' if p == 'index.html' else p
    return BASE + {'zh-Hant': '', 'zh-Hans': 'zh-hans/', 'en': 'en/'}[lang] + p


# ---------- 語言切換與 hreflang ----------
SWITCH_CSS = ('<style>.lang-switch{display:flex;gap:2px;align-items:center;font-size:12.5px;letter-spacing:.08em;white-space:nowrap}'
              '.lang-switch a{padding:3px 7px;border-radius:99px;color:inherit;opacity:.6;text-decoration:none}'
              '.lang-switch a.on{opacity:1;border:1px solid currentColor}'
              'nav .nav-in{position:relative}.nav-in>.lang-switch{margin-left:auto}.nav-in>.lang-switch+.back{margin-left:18px}'
              '@media(max-width:960px){nav .lang-switch{position:absolute;right:12px;top:9px}nav .logo{max-width:calc(100% - 120px)}'
              'nav .nav-in:has(>.back) .lang-switch{position:static}nav .nav-in:has(>.back) .logo{max-width:none}}'
              '@media(max-width:600px){nav .nav-in:has(>.back) .back{font-size:0;margin-left:8px}nav .nav-in:has(>.back) .back::before{content:"←";font-size:20px}nav .nav-in:has(>.back) .logo{font-size:12px;letter-spacing:.08em}}'
              '</style>')


def head_block(lang, p):
    alts = [('zh-Hant', url_of('zh-Hant', p)), ('zh-Hans', url_of('zh-Hans', p))]
    if en_exists(p):
        alts.append(('en', url_of('en', p)))
    alts.append(('x-default', url_of('zh-Hant', p)))
    links = ''.join(f'<link rel="alternate" hreflang="{h}" href="{u}">' for h, u in alts)
    en_css = ('<style>html[lang=en] body{letter-spacing:.01em}html[lang=en] h1,html[lang=en] h2,html[lang=en] h3,html[lang=en] .qtext,html[lang=en] .lead{letter-spacing:.01em}'
              'html[lang=en] .btn{letter-spacing:.06em}html[lang=en] .nav-links,html[lang=en] .logo{letter-spacing:.05em}</style>') if lang == 'en' else ''
    return f'<!-- i18n-head -->{links}{SWITCH_CSS}{en_css}<!-- /i18n-head -->'


def switch_html(lang, p):
    depth = p.count('/') + (0 if lang == 'zh-Hant' else 1)
    up = '../' * depth
    def href(target_lang):
        prefix = {'zh-Hant': '', 'zh-Hans': 'zh-hans/', 'en': 'en/'}[target_lang]
        if target_lang == 'en' and not en_exists(p):
            return up + 'en/index.html'
        return up + prefix + p
    items = [('zh-Hant', '繁中'), ('zh-Hans', '简中'), ('en', 'EN')]
    a = ''.join(f'<a href="{href(l)}" hreflang="{l}" lang="{l}"' + (' class="on"' if l == lang else '') + f'>{t}</a>' for l, t in items)
    return f'<!-- i18n-switch --><div class="lang-switch" aria-label="Language">{a}</div><!-- /i18n-switch -->'


def inject(s, lang, p):
    s = re.sub(r'<!-- i18n-head -->.*?<!-- /i18n-head -->\n?', '', s, flags=re.S)
    s = re.sub(r'\n?[ \t]*<!-- i18n-switch -->.*?<!-- /i18n-switch -->', '', s, flags=re.S)
    s = s.replace('</head>', head_block(lang, p) + '\n</head>', 1)
    nav = re.search(r'<nav>.*?</nav>', s, re.S)
    if nav:
        n = nav.group(0)
        sw = switch_html(lang, p)
        if 'class="nav-links"' in n:
            n2 = re.sub(r'(<div class="nav-links">.*?</div>)', lambda m: m.group(1) + '\n    ' + sw, n, count=1, flags=re.S)
        else:
            n2 = n.replace('<a class="back"', sw + '\n  <a class="back"', 1)
        s = s.replace(n, n2, 1)
    return s


# ---------- 簡體 ----------
def canon_script():
    t = CANON_TERMS
    pairs = [(CC.convert(x), x) for x in t]
    js = json.dumps(pairs, ensure_ascii=True)
    return ('<script>(function(){var P=' + js + ';'
            'function s2t(v){P.forEach(function(p){v=v.split(p[0]).join(p[1]);});return v;}'
            'function t2s(v){P.forEach(function(p){v=v.split(p[1]).join(p[0]);});return v;}'
            'window.FC_CANON=function(o){return JSON.parse(s2t(JSON.stringify(o)));};'
            'window.FC_T2S=function(o){return JSON.parse(t2s(JSON.stringify(o)));};'
            'var S=Storage.prototype,g=S.getItem,st=S.setItem;'
            'S.getItem=function(k){var v=g.call(this,k);return (v&&/^fc_result_/.test(k))?t2s(v):v;};'
            'S.setItem=function(k,v){return st.call(this,k,/^fc_result_/.test(k)?s2t(String(v)):v);};'
            '})();</script>')


def to_hans(s, p):
    depth = p.count('/') + 1
    s = CC.convert(s)
    s = s.replace('<html lang="zh-Hant">', '<html lang="zh-Hans">', 1)
    # 頁面連結維持同一層（zh-hans 內也有同名頁）；其他資源（css、圖片、沒有中文的 js）回到上一層
    def fix(m):
        attr, path = m.group(1), m.group(2)
        if re.match(r'(https?:|/|#|mailto:|data:|javascript:)', path):
            return m.group(0)
        clean = path.split('?')[0].split('#')[0]
        target = os.path.normpath(os.path.join(os.path.dirname(p), clean))
        if clean.endswith('.html') or target in JS_WITH_TEXT:
            return m.group(0)
        return f'{attr}../{path}"'
    s = re.sub(r'((?:href|src)=")([^"]+)"', fix, s)
    s = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url_of('zh-Hans', p), s)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url_of('zh-Hans', p), s)
    s = inject(s, 'zh-Hans', p)
    s = s.replace('</head>', canon_script() + '\n</head>', 1)
    # 網格頁：資料庫回來的原型、動力名稱是繁體，顯示前轉成簡體
    s = re.sub(r'(<script src="(?:\.\./)*fc\.js[^"]*"></script>)',
               r'\1<script>if(window.FC&&window.FC_T2S){var _rpc=FC.rpc;FC.rpc=function(n,a){return _rpc(n,a).then(function(d){return FC_T2S(d);});};}</script>', s, count=1)
    return s


def main():
    allp = pages()
    # 英文先產生，繁中與簡中的 hreflang 才知道哪些頁有英文版
    sys.path.insert(0, os.path.dirname(__file__))
    import en_build
    en_build.build(inject, url_of)
    for p in allp:
        src = open(p).read()
        new = inject(src, 'zh-Hant', p)
        if new != src:
            open(p, 'w').write(new)
    for p in allp:
        out = os.path.join('zh-hans', p)
        os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
        open(out, 'w').write(to_hans(open(p).read(), p))
    for js in JS_WITH_TEXT:
        out = os.path.join('zh-hans', js)
        os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
        open(out, 'w').write(CC.convert(open(js).read()))
    sitemap(allp)
    print(f'zh-Hant pages: {len(allp)}, zh-hans written: {len(allp)}')


def sitemap(allp):
    sm = open('sitemap.xml').read()
    locs = re.findall(r'<url><loc>([^<]+)</loc><lastmod>([^<]+)</lastmod><priority>([^<]+)</priority></url>', sm)
    have = {l for l, _, _ in locs}
    add = []
    for loc, mod, pr in locs:
        if '/zh-hans/' in loc or '/en/' in loc:
            continue
        p = loc.replace(BASE, '') or 'index.html'
        for lang in ('zh-Hans', 'en'):
            if lang == 'en' and not en_exists(p):
                continue
            u = url_of(lang, p)
            if u not in have:
                add.append(f'  <url><loc>{u}</loc><lastmod>{mod}</lastmod><priority>{pr}</priority></url>\n'); have.add(u)
    if add:
        open('sitemap.xml', 'w').write(sm.replace('</urlset>', ''.join(add) + '</urlset>'))


if __name__ == '__main__':
    main()
