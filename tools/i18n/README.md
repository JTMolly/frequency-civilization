# 多語系

- 繁體中文是原稿，放在根目錄。
- 簡體中文由原稿自動轉換，輸出在 `zh-hans/`，不要手動改。
- 英文翻譯表在 `tools/i18n/en/`，輸出在 `en/`。

改完任何繁中頁面（包括由其他產生器重新產生的頁面）之後，在網站根目錄執行：

    pip install opencc-python-reimplemented
    python3 tools/i18n/build.py

它會：
- 重新放上語言切換與 hreflang；
- 重新產生 `zh-hans/` 與 `en/`；
- 更新 sitemap。

測驗結果裡的原型、動力名稱，在任何語言版本都一律存成繁體，網格與報告書才能對得起來。
