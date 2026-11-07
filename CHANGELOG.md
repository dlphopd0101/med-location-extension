# CHANGELOG

## 0.2.1（未 commit）— C-003
- 新增：「重新整理」按鈕（略過 10 分鐘快取）、更新時間旁顯示本地「取得 HH:MM」。
- 驗證：20 項測試通過（新增 `formatClock`，先失敗後通過）；本機預覽（模擬 storage.session）：新鮮快取不重打、按鈕觸發重打、更新中停用、完成後恢復。

## 0.2.0（未 commit）— C-002
- 新增：接 `gas-query` 的 `?format=json`（`src/data-source.js`）、載入／錯誤／重試狀態、10 分鐘 session 快取、`endpoint.example.js`（本機網址檔 gitignore）。
- 驗證：19 項測試通過（含各錯誤碼、版控無部署 ID）；刻意拿掉驗證邏輯使測試失敗；本機預覽對線上端點載入 1482 筆、無效網址顯示錯誤與重試。

## 0.1.0（未 commit）— C-001
- 新增：MV3 骨架、popup 搜尋與結果卡片、右鍵「查詢儲位」、搜尋核心（複製自 PWA）、OpenEvidence 開關（預設關）與外傳前檢查、虛構測試資料。
- 驗證：`node --test tests/extension.test.mjs` 14 項通過；刻意破壞搜尋核心與加入 innerHTML 皆使測試失敗（證明測試非空）；popup 本機預覽渲染正常。
