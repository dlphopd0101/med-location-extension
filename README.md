# 儲位查找擴充套件

Chrome 擴充套件：在任何網頁選取藥品關鍵字 → 右鍵「查詢儲位」，或點工具列圖示手動輸入，查 P1／P2／P3／藥庫儲位。結果卡片版型與手機 PWA 一致。**不取代**既有手機網頁 app。

## 使用者
只有作者本人（unpacked 載入）。

## 載入方式
1. Chrome 開 `chrome://extensions`，開啟「開發人員模式」。
2. 「載入未封裝項目」→ 選本資料夾。
3. 接正式資料：複製 `src/endpoint.example.js` 為 `src/endpoint.local.js`（已被 gitignore），填入查詢專案 Web App 網址（`/exec` 結尾）。沒有這個檔或留空時，會使用**虛構測試資料**（批價碼 `TEST001`…），畫面會註明「測試資料」。
4. 在 `chrome://extensions` 按該擴充套件的重新整理圖示。

## 測試
```bash
node --test tests/extension.test.mjs
```
可用環境變數 `PWA_INDEX_HTML` 指定 PWA 的 `index.html` 路徑（預設 `D:/AI Project/儲位查找新版/gas-query/index.html`）。

## 重要路徑
- `manifest.json`：權限（僅 `contextMenus`、`storage`）
- `src/search-core.js`：搜尋規則（PWA 的逐字複本）
- `src/popup/`：介面；`src/background/service-worker.js`：右鍵選單
- `src/fake-data.js`：測試資料；`src/query-guard.js`：OpenEvidence 外傳前檢查
- 規格與決策：`SPEC.md`、`docs/develog.md`；與原規格的落差：主專案 `docs/extension-gap-analysis.md`
