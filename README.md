# 儲位查找擴充套件

Chrome 擴充套件：在任何網頁選取藥品關鍵字 → 右鍵「查詢儲位」，或點工具列圖示手動輸入，查 P1／P2／P3／藥庫儲位。結果卡片版型與手機 PWA 一致。**不取代**既有手機網頁 app。

## 安裝

需求：Chrome（或 Edge 等 Chromium 瀏覽器）。不需要 Node.js，也不需要打包。

### 1. 下載
```bash
git clone https://github.com/dlphopd0101/med-location-extension.git
```
沒有安裝 git：在 GitHub 頁面按 **Code → Download ZIP**，解壓縮到固定位置（資料夾刪掉或移動後，擴充套件會失效）。

### 2. 載入到瀏覽器
1. 網址列開 `chrome://extensions`（Edge 為 `edge://extensions`）。
2. 右上角開啟「開發人員模式」。
3. 按「載入未封裝項目」，選擇**有 `manifest.json` 的那層資料夾**（就是 clone 下來的資料夾本身）。
4. 到瀏覽器工具列的拼圖圖示，把「藥品儲位查詢」釘選出來。

此時只會看到**虛構測試資料**（批價碼 `TEST001`…），畫面上會註明「測試資料」。

### 3. 連接真實資料（選用）
擴充套件的資料來自一個唯讀的 JSON 端點（Google Apps Script Web App，網址結尾 `/exec`，以 `?format=json` 取得 `{ cols, rows, updatedAt }`）。端點網址不放在 repo 裡，需自行設定：

1. 複製 `src/endpoint.example.js`，存成 `src/endpoint.local.js`（此檔已被 gitignore，不會被提交）。
2. 把裡面的網址改成你的 Web App 網址。
3. 回 `chrome://extensions`，按該擴充套件卡片上的**重新整理圖示**。

沒有這個檔或網址留空時，會一直使用測試資料。

### 4. 更新
```bash
git pull
```
然後到 `chrome://extensions` 按擴充套件的重新整理圖示。`src/endpoint.local.js` 不會被 `git pull` 覆蓋。

### 使用
- 點工具列圖示，輸入藥名、儲位碼、批價碼、物編或 ATC碼（空白分隔，全部符合）。
- 在任何網頁選取文字 → 右鍵「查詢儲位」，會帶入 popup。若 popup 沒自動打開，圖示上會出現徽章「1」，手動點圖示即可。
- 資料快取 10 分鐘；改過資料後按 popup 內的「重新整理」可立即更新。

### 疑難排解
| 現象 | 處理 |
|---|---|
| 載入時顯示錯誤 | 確認選的是有 `manifest.json` 的資料夾 |
| 一直顯示「測試資料」 | 沒有建立 `src/endpoint.local.js`，或建好後沒按重新整理圖示 |
| 顯示「無法連線」 | 檢查網路與端點網址是否正確（結尾要 `/exec`） |
| 第一次載入很慢 | Google Apps Script 冷啟動，約 8 秒；之後 10 分鐘內有快取 |

## 隱私與權限
- manifest 只要求 `contextMenus` 與 `storage`，**不要求任何網站權限**，不讀取網頁內容。
- 查詢在本機比對，查詢字串與選取文字不外傳、不寫入歷史。
- 資料表快取只放在瀏覽器記憶體（`storage.session`），關閉瀏覽器即清除。
- OpenEvidence 按鈕預設關閉（`src/config.js`），開啟前請確認所屬單位的外傳政策。

## 測試
```bash
node --test tests/extension.test.mjs
```
需要 Node.js。其中一項測試會把 `src/search-core.js` 與 PWA 的 `index.html` 逐字比對；找不到該檔時顯示 skip（不算通過），可用環境變數 `PWA_INDEX_HTML` 指定路徑。

## 重要路徑
- `manifest.json`：權限（僅 `contextMenus`、`storage`）
- `src/search-core.js`：搜尋規則（PWA 的逐字複本）
- `src/popup/`：介面；`src/background/service-worker.js`：右鍵選單
- `src/data-source.js`：端點讀取、錯誤處理與快取判斷
- `src/fake-data.js`：測試資料；`src/query-guard.js`：OpenEvidence 外傳前檢查
- 規格與決策：`SPEC.md`、`docs/develog.md`
