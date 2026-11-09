# 頻率筆記（已隱藏）

繁中原稿在這個資料夾（notes.html、notes/n01–n19.html）。網站上的 notes.html、notes/nXX.html（繁中、簡中、英文）目前是轉到 blog.html 的轉址頁。

恢復：

```bash
python3 tools/notes_visibility.py restore
python3 tools/i18n/build.py
git checkout -- worldview-04.html zh-hans/worldview-04.html
```

恢復後檢查：blog.html 的「頻率筆記」卡片、updates.html 的連結、sitemap.xml 的 notes 網址都回來了；updates.html 加一筆「頻率筆記回來了」；再 commit、推上線、三種語言抽查。
