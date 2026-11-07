# 專案規則：儲位查找擴充套件

## 技術
- Chrome Manifest V3 擴充套件，純 JavaScript，無打包工具、無 npm 依賴。測試用 `node --test`。
- 資料來源：既有 `儲位查找新版` repo 的查詢專案（`gas-query`）新增的唯讀端點 `?format=json`。本 repo 不放任何 GAS 程式碼。
- 儲位碼一律當**文字**處理，不得轉數字（`054` ≠ `54`）。

## 安全與隱私
- 只給使用者自己 unpacked 載入；不上架、不做企業部署。
- 不要求網站權限：manifest 不得有 `host_permissions`、`<all_urls>`、`content_scripts`。理由：GAS 端點兩段回應（`script.google.com` 302 → `script.googleusercontent.com`）curl 實測皆帶 `Access-Control-Allow-Origin: *`，一般 CORS fetch 即可。**前提：若 Google 日後移除該標頭，fetch 會失敗，此時才加該兩個 origin 的 host 權限**（`https://script.google.com/macros/s/*`、`https://script.googleusercontent.com/macros/echo*`）。
- 部署 ID（Web App 網址）放 `src/endpoint.local.js`（gitignore），測試會掃描版控內不得出現 `AKfycb…`。
- 所有輸出一律 `textContent`；禁 `innerHTML`、`eval`、遠端程式碼。
- 查詢字串、選取文字、查詢結果不寫入 local／sync storage、不輸出 console、不外傳。右鍵帶入的文字只暫存 `storage.session`，popup 讀到即刪。藥品資料表快取（整張表，非查詢紀錄）只放 `storage.session`（記憶體、瀏覽器關閉即清），TTL 10 分鐘。
- OpenEvidence 外傳未經院內核准前，`CONFIG.OPENEVIDENCE_ENABLED` 必須為 `false`；開啟時每次都要使用者確認，且通過 `isPhiLike` 檢查。
- GAS 的 Sheet ID、scriptId、部署網址（若視為不公開）不進版控。

## 搜尋規則（兩份，須逐字同步）
- `src/search-core.js` 是 PWA `gas-query/index.html` 內 `<search-core>` 區塊的**逐字複本**。要改搜尋規則，先改 PWA，再複製過來；`tests/extension.test.mjs` 會逐字比對（找不到 PWA 檔時該測試顯示 skip，不算通過）。

## 協作
- 未經使用者確認不 commit、不 push。
- commit 格式：`C-### docs|feat|fix|chore: 說明`；編號與主專案連續。
