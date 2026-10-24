"""上方選單的單一來源。

build.py 會用這裡的內容改寫全站繁中頁的 <div class="nav-links">；簡體頁由繁中轉出，
英文頁由 en_build.py 呼叫 render('en', …) 產生。選單要改什麼，只改這個檔，再執行：

    python3 tools/i18n/build.py

新增一篇世界觀：在 WORLDVIEW 加一行（檔名、編號、繁中名稱、英文名稱），再加一份該頁的英文翻譯檔。
"""
import os, re

# 世界觀下拉：「世界觀」本身連到第一項（總覽），旁邊的小箭頭展開全部
WORLDVIEW = [  # (檔名, 編號, 繁中名稱, 英文名稱)
    ('worldview.html', '00', '世界觀總覽', 'Worldview overview'),
    ('worldview-01.html', '01', '劇本與課題', 'Script and Lessons'),
    ('worldview-02.html', '02', '一句話，怎麼寫出現實', 'One Sentence, and How It Writes Reality'),
]

LABELS = {  # 檔名: (繁中, 英文)
    'about.html': ('關於我們', 'About'),
    'worldview.html': ('世界觀', 'Worldview'),
    'roots.html': ('語根系統', 'Root Codes'),
    'tests.html': ('語根測驗', 'Root Code Test'),
    'resources.html': ('免費資源', 'Free Resources'),
    'glow.html': ('今日點燈', 'Daily Glow'),
    'pair.html': ('雙人配對卡', 'Pair Card'),
    'updates.html': ('網站更新紀錄', 'Site updates'),
    'join.html': ('加入我們', 'Join us'),
}
BEFORE = ['about.html']                       # 世界觀之前
AFTER = ['roots.html', 'tests.html']          # 世界觀之後
MORE = ['resources.html', 'glow.html', 'pair.html', 'updates.html']
MORE_LABEL = ('更多', 'More')
WV_ARIA = ('展開世界觀選單', 'Open the Worldview menu')

NAV_RE = re.compile(r'<div class="nav-links">.*?</div>', re.S)


def parse_on(block):
    """從現有選單讀出哪些連結標了 class="on"（回傳去掉 ../ 的檔名集合）。"""
    out = set()
    for m in re.finditer(r'<a\b([^>]*)>', block):
        attrs = m.group(1)
        cls = re.search(r'class="([^"]*)"', attrs)
        href = re.search(r'href="((?:\.\./)*)([^"]+)"', attrs)
        if cls and href and 'on' in cls.group(1).split():
            out.add(href.group(2))
    return out


def render(lang, up, on, cur=''):
    """產生選單。lang：'zh' 或 'en'；up：到網站根目錄的 ../ 前綴；on：已標 on 的檔名集合；cur：這一頁的檔名。"""
    i = 0 if lang == 'zh' else 1
    here = set(on) | ({cur} if cur else set())

    def a(h):
        return f'<a href="{up}{h}"' + (' class="on"' if h in here else '') + f'>{LABELS[h][i]}</a>'

    wv_on = cur in {h for h, *_ in WORLDVIEW}
    wv_cls = ' on' if wv_on else ''
    wv_sub = ''.join(
        f'<a href="{up}{h}"' + (' class="on"' if h == cur else '') + f'><i>{n}</i>{zh if i == 0 else en}</a>'
        for h, n, zh, en in WORLDVIEW)
    wv = (f'<span class="nav-dd nav-wv"><a class="nav-wv-link{wv_cls}" href="{up}{WORLDVIEW[0][0]}">{LABELS["worldview.html"][i]}</a>'
          f'<button type="button" class="nav-wv-btn{wv_cls}" aria-haspopup="true" aria-expanded="false" aria-label="{WV_ARIA[i]}"></button>'
          f'<span class="nav-sub">{wv_sub}</span></span>')
    more_on = any(h in here for h in MORE)
    join_label = LABELS['join.html'][i]
    sub = ''.join(a(h) for h in MORE) + f'<a class="nav-sub-join{" on" if "join.html" in here else ""}" href="{up}join.html">{join_label}</a>'
    more = (f'<span class="nav-dd nav-more"><button type="button" class="nav-more-btn{" on" if more_on else ""}" aria-haspopup="true">{MORE_LABEL[i]}</button>'
            f'<span class="nav-sub">{sub}</span></span>')
    cta = 'nav-cta on' if 'join.html' in here else 'nav-cta'
    items = [a(h) for h in BEFORE] + [wv] + [a(h) for h in AFTER] + [more]
    return ('<div class="nav-links">\n      ' + '\n      '.join(items) +
            f'\n      <a class="{cta}" href="{up}join.html">{join_label}</a>\n    </div>')


def sync(pages):
    """把全站繁中頁的選單改成 render('zh', …) 的結果；沒有選單的獨立頁不動。回傳有改動的頁數。"""
    n = 0
    for p in pages:
        src = open(p, encoding='utf-8').read()
        m = NAV_RE.search(src)
        if not m:
            continue
        up = '../' * p.count('/')
        new = render('zh', up, parse_on(m.group(0)), os.path.basename(p))
        if new != m.group(0):
            open(p, 'w', encoding='utf-8').write(src[:m.start()] + new + src[m.end():])
            n += 1
    return n
