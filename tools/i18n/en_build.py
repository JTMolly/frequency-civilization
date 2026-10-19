"""英文版：以繁中頁為底，用 tools/i18n/en/*.json 的對照表替換文字，輸出到 en/。

- HTML 文字節點與屬性：整段比對（翻譯表的 key 是繁中原文）
- <script> 與共用 JS：tools/i18n/en/js/<檔名>.json 的字串，按長度由長到短直接替換
- 翻不到的中文會列在輸出最後，方便補翻譯
"""
import json, os, re
from bs4 import BeautifulSoup, Comment, NavigableString

HERE = os.path.dirname(__file__)
EN_DIR = os.path.join(HERE, 'en')
ROOTS = 'sakaran elariah thaleon aurikai rohendal zaerah valtara kuthari meihara xonteh naeltu orishan'.split()
EN_PAGES = ['index.html', 'about.html', 'roots.html', 'tests.html', 'privacy.html', 'grid.html',
            'test.html', 'test-archetype.html', 'test-drive.html', 'report.html', 'voices.html', 'notes.html',
            'glow.html', 'pair.html', 'updates.html', 'star.html'] + \
           [f'roots/{r}.html' for r in ROOTS] + \
           sorted('notes/' + f for f in os.listdir('notes') if f.endswith('.html'))
EN_JS = ['fc.js', 'flow.js', 'card.js', 'assets/phrases144.js', 'games.js']
CJK = re.compile(r'[㐀-鿿　-〿！-～]')
ALLOWED_CJK = {'繁中', '简中', '/* email 解鎖門（深色版） */',
               # 商標標示：公司名稱刻意保留中文
               '頻率文明 Frequency Civilization® and 語根® are registered trademarks, operated by 頻率文明有限公司.',
               # 測驗結果的資料代號：刻意保留中文，畫面上另外顯示英文名稱
               '行動者', '療癒者', '教導者', '感應者', '洞見者', '鏡面者', '療癒', '探索', '服務', '守護', '突破', '創造', '傳遞', '共鳴',
               "const ARCH = ['行動者','療癒者','教導者','感應者','洞見者','鏡面者'];", "const DRIVE = ['療癒','探索','服務','守護','突破','創造','傳遞','共鳴'];"}

EN_NAV = '''<div class="nav-links">
      <a href="{up}index.html">Home</a>
      <span class="nav-dd"><a href="{up}about.html">About</a><span class="nav-sub"><a href="{up}updates.html">Site updates</a></span></span>
      <a href="{up}roots.html">Root Codes</a>
      <span class="nav-dd"><a href="{up}tests.html">Tests</a><span class="nav-sub"><a href="{up}glow.html">Daily Glow</a><a href="{up}pair.html">Pair Card</a></span></span>
      <a href="{up}notes.html">Frequency Notes</a>
      <a href="{up}grid.html">Frequency Grid</a>
    </div>'''


def strip_zh_only(html):
    """<!-- zh-only -->…<!-- /zh-only --> 之間的內容只留在繁中頁，簡體與英文版拿掉。"""
    return re.sub(r'[ \t]*<!-- zh-only -->.*?<!-- /zh-only -->[ \t]*\n?', '', html, flags=re.S)


def load(name):
    p = os.path.join(EN_DIR, name)
    return json.load(open(p)) if os.path.exists(p) else {}


def table_for(page):
    # 先放所有頁面的翻譯（同一句話在不同頁出現時共用），再用這一頁自己的翻譯覆蓋
    t = {}
    for f in sorted(os.listdir(EN_DIR)):
        if f.endswith('.json'):
            t.update(load(f))
    t.update(load('common.json'))
    key = page.replace('roots/', 'root_').replace('/', '_').replace('.html', '')
    t.update(load('roots_common.json') if page.startswith('roots/') else {})
    t.update(load(key + '.json'))
    return t


def js_table(name):
    return load(os.path.join('js', name.replace('/', '_') + '.json'))


def replace_js(code, table):
    for k in sorted(table, key=len, reverse=True):
        code = code.replace(k, table[k])
    return code


def translate_html(src, page, table, jsmap):
    soup = BeautifulSoup(src, 'html.parser')
    for t in list(soup.find_all(string=True)):
        if isinstance(t, Comment):
            continue
        if t.parent.name == 'script' and t.parent.get('type') == 'application/ld+json':
            t.replace_with(NavigableString(replace_js(str(t), table)))
            continue
        if t.parent.name == 'script':
            if CJK.search(t):
                t.replace_with(NavigableString(replace_js(str(t), jsmap)))
            continue
        if t.parent.name == 'style':
            continue
        s = str(t)
        k = s.strip()
        if k in table:
            lead = s[:len(s) - len(s.lstrip())]
            trail = s[len(s.rstrip()):]
            t.replace_with(NavigableString(lead + table[k] + trail))
    for tag in soup.find_all(True):
        for a in ('alt', 'title', 'aria-label', 'placeholder', 'content'):
            v = tag.get(a)
            if isinstance(v, str) and v in table:
                tag[a] = table[v]
    if soup.title and soup.title.string and soup.title.string.strip() in table:
        soup.title.string = table[soup.title.string.strip()]
    return str(soup)


def has_translation(page):
    key = page.replace('roots/', 'root_').replace('/', '_').replace('.html', '')
    return os.path.exists(os.path.join(EN_DIR, key + '.json')) or bool(js_table(page))


def will_exist(target):
    if target in EN_PAGES:
        return has_translation(target)
    if target in EN_JS:
        return bool(js_table(target))
    return False


def fix_paths(s, page):
    def fix(m):
        attr, path = m.group(1), m.group(2)
        if re.match(r'(https?:|/|#|mailto:|data:|javascript:)', path):
            return m.group(0)
        clean = path.split('?')[0].split('#')[0]
        target = os.path.normpath(os.path.join(os.path.dirname(page), clean))
        if will_exist(target):
            return m.group(0)
        return f'{attr}../{path}"'
    return re.sub(r'((?:href|src)=")([^"]+)"', fix, s)


def build(inject, url_of):
    missing = {}
    for page in EN_PAGES:
        if not os.path.exists(page):
            continue
        key = page.replace('roots/', 'root_').replace('/', '_').replace('.html', '')
        if not has_translation(page):
            continue  # 這一頁還沒有翻譯檔，先不產生
        src = strip_zh_only(open(page).read())
        src = re.sub(r'<!-- i18n-head -->.*?<!-- /i18n-head -->', '', src, flags=re.S)
        src = re.sub(r'<!-- i18n-switch -->.*?<!-- /i18n-switch -->', '', src, flags=re.S)
        up = '../' * page.count('/')
        src = re.sub(r'<div class="nav-links">.*?</div>', EN_NAV.format(up=up), src, count=1, flags=re.S)
        out = translate_html(src, page, table_for(page), js_table(page))
        out = out.replace('<html lang="zh-Hant">', '<html lang="en">', 1)
        out = fix_paths(out, page)
        out = out.replace('assets/notes/n', 'assets/notes/en/n')  # 頻率筆記用英文封面
        out = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url_of('en', page), out)
        out = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url_of('en', page), out)
        dest = os.path.join('en', page)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, 'w').write(out)
        left = sorted(set(x.strip() for x in re.findall(r'[^<>"\n]*[㐀-鿿][^<>"\n]*', re.sub(r'<!--.*?-->', '', out, flags=re.S)) if x.strip() not in ALLOWED_CJK))
        if left:
            missing[page] = left
    for js in EN_JS:
        t = js_table(js)
        if not t:
            continue
        dest = os.path.join('en', js)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, 'w').write(replace_js(open(js).read(), t))
    # 英文頁產生後，再把語言切換放上去（各語言頁的 hreflang 也要知道英文頁存在）
    for page in EN_PAGES:
        dest = os.path.join('en', page)
        if os.path.exists(dest):
            html = open(dest).read()
            open(dest, 'w').write(inject(html, 'en', page))
    json.dump(missing, open(os.path.join(HERE, 'en_missing.json'), 'w'), ensure_ascii=False, indent=1)
    n = sum(len(v) for v in missing.values())
    print(f'en: untranslated strings remaining: {n} (see tools/i18n/en_missing.json)')
