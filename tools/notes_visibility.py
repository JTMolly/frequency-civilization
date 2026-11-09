#!/usr/bin/env python3
"""頻率筆記（notes.html 與 notes/n01–n19，繁中、簡中、英文）的隱藏與恢復。

隱藏（hide）：
  - 繁中原稿搬到 _hidden_notes/（GitHub Pages 的 Jekyll 不會發布底線開頭的資料夾，內容留在 repo 裡、網站上看不到）
  - 三種語言的 notes.html、notes/nXX.html 都換成轉址頁（noindex，轉到同語言的 blog.html，寫法同 worldview-04 的轉址頁）
  - blog.html 拿掉「頻率筆記」卡片、updates.html 拿掉連到 notes 的連結（文字保留）、sitemap.xml 拿掉 notes 網址
  - 只要 _hidden_notes/ 資料夾存在，tools/i18n/build.py 與 en_build.py 就會跳過 notes，不會又生回來

恢復（restore）：
  python3 tools/notes_visibility.py restore
  然後：python3 tools/i18n/build.py && git checkout -- worldview-04.html zh-hans/worldview-04.html
  （簡中與英文的筆記頁由 build 依繁中原稿與 tools/i18n/en/notes*.json 重新產生；轉址頁會被覆蓋）
  恢復完請確認：blog.html 有「頻率筆記」卡片、updates.html 的連結回來了、sitemap 有 notes 網址，再 commit 推上線。

用法：python3 tools/notes_visibility.py hide | restore | status
"""
import json, os, re, shutil, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)
HID = '_hidden_notes'
BASE = 'https://frequency-civilization.com/'

STUB = '''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{canonical}">
<title>{title}</title>
</head>
<body>
<p><a href="{target}">{title}</a></p>
<script>location.replace("{target}");</script>
</body>
</html>
'''
LANGS = [  # (資料夾前綴, lang, blog 網址前綴, 標題)
    ('', 'zh-Hant', '', 'Blog｜頻率文明 Frequency Civilization'),
    ('zh-hans/', 'zh-Hans', 'zh-hans/', 'Blog｜频率文明 Frequency Civilization'),
    ('en/', 'en', 'en/', 'Blog | Frequency Civilization'),
]


def note_names():
    src = os.path.join(HID, 'notes') if os.path.isdir(HID) else 'notes'
    return sorted(f for f in os.listdir(src) if re.match(r'n\d+\.html$', f))


def write_stubs(names):
    for prefix, lang, bp, title in LANGS:
        for rel, depth in [('notes.html', 0)] + [('notes/' + n, 1) for n in names]:
            target = ('../' * depth) + 'blog.html'
            path = prefix + rel
            os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
            open(path, 'w', encoding='utf-8').write(STUB.format(lang=lang, target=target, canonical=BASE + bp + 'blog.html', title=title))


def hide():
    if os.path.isdir(HID):
        print('已經是隱藏狀態（_hidden_notes/ 存在）')
        return
    names = note_names()
    os.makedirs(os.path.join(HID, 'notes'))
    shutil.move('notes.html', os.path.join(HID, 'notes.html'))
    for n in names:
        shutil.move(os.path.join('notes', n), os.path.join(HID, 'notes', n))
    write_stubs(names)
    meta = {'notes': names}
    # blog.html：卡片
    b = open('blog.html', encoding='utf-8').read()
    m = re.search(r'      <a class="post" href="notes\.html">.*?</a>\n', b, re.S)
    assert m, 'blog.html 找不到頻率筆記卡片'
    meta['blog_card'] = m.group(0)
    open('blog.html', 'w', encoding='utf-8').write(b.replace(m.group(0), '', 1))
    # updates.html：連到 notes 的連結（文字保留）
    u = open('updates.html', encoding='utf-8').read()
    edits = []
    for old, new in [
        ('          <div class="up-links"><a href="notes.html">頻率筆記 →</a><a href="en/notes.html">English →</a></div>\n', ''),
        ('<a href="voices.html">大家寫給我們的話 →</a><a href="notes.html">頻率筆記 →</a>', '<a href="voices.html">大家寫給我們的話 →</a>'),
    ]:
        assert old in u, old[:50]
        before = u[:u.index(old)].rsplit('\n', 2)[-2] + '\n'   # 被整行拿掉時，恢復要接在這一行後面
        u = u.replace(old, new, 1)
        edits.append({'old': old, 'new': new, 'before': before})
    open('updates.html', 'w', encoding='utf-8').write(u)
    meta['updates'] = edits
    # sitemap.xml
    sm = open('sitemap.xml', encoding='utf-8').read().split('\n')
    keep, gone = [], []
    for ln in sm:
        (gone if re.search(r'frequency-civilization\.com/(?:zh-hans/|en/)?notes(?:\.html|/)', ln) else keep).append(ln)
    open('sitemap.xml', 'w', encoding='utf-8').write('\n'.join(keep))
    meta['sitemap'] = gone
    json.dump(meta, open(os.path.join(HID, 'restore.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(os.path.join(HID, 'README.md'), 'w', encoding='utf-8').write(
        '# 頻率筆記（已隱藏）\n\n繁中原稿在這個資料夾（notes.html、notes/n01–n19.html）。網站上的 notes.html、notes/nXX.html（繁中、簡中、英文）目前是轉到 blog.html 的轉址頁。\n\n'
        '恢復：\n\n```bash\npython3 tools/notes_visibility.py restore\npython3 tools/i18n/build.py\ngit checkout -- worldview-04.html zh-hans/worldview-04.html\n```\n\n'
        '恢復後檢查：blog.html 的「頻率筆記」卡片、updates.html 的連結、sitemap.xml 的 notes 網址都回來了；updates.html 加一筆「頻率筆記回來了」；再 commit、推上線、三種語言抽查。\n')
    print(f'已隱藏：{len(names)} 篇筆記＋筆記總覽，三種語言共 {3 * (len(names) + 1)} 頁改成轉址頁；sitemap 拿掉 {len(gone)} 行。')


def restore():
    if not os.path.isdir(HID):
        print('目前不是隱藏狀態')
        return
    meta = json.load(open(os.path.join(HID, 'restore.json'), encoding='utf-8'))
    names = meta['notes']
    shutil.move(os.path.join(HID, 'notes.html'), 'notes.html')
    for n in names:
        shutil.move(os.path.join(HID, 'notes', n), os.path.join('notes', n))
    for prefix, *_ in LANGS[1:]:   # 簡中、英文的轉址頁先刪掉，build 會重新產生
        for rel in ['notes.html'] + ['notes/' + n for n in names]:
            if os.path.exists(prefix + rel):
                os.remove(prefix + rel)
    b = open('blog.html', encoding='utf-8').read()
    first = re.search(r'      <a class="post" href=', b)
    open('blog.html', 'w', encoding='utf-8').write(b[:first.start()] + meta['blog_card'] + b[first.start():])
    u = open('updates.html', encoding='utf-8').read()
    for e in meta['updates']:
        if e['new']:
            assert e['new'] in u, e['new'][:40]
            u = u.replace(e['new'], e['old'], 1)
        else:   # 整行被拿掉的：接回原本前一行的後面
            assert e['before'] in u, e['before'][:40]
            u = u.replace(e['before'], e['before'] + e['old'], 1)
    open('updates.html', 'w', encoding='utf-8').write(u)
    sm = open('sitemap.xml', encoding='utf-8').read()
    sm = sm.replace('</urlset>', '\n'.join(meta['sitemap']) + '\n</urlset>', 1) if '</urlset>' in sm else sm
    open('sitemap.xml', 'w', encoding='utf-8').write(sm)
    shutil.rmtree(HID)
    print('已恢復。接著執行：python3 tools/i18n/build.py && git checkout -- worldview-04.html zh-hans/worldview-04.html')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if cmd == 'hide': hide()
    elif cmd == 'restore': restore()
    else: print('隱藏中' if os.path.isdir(HID) else '顯示中')
