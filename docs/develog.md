# develog

## C-001（2026-11-07）MV3 骨架

### 決策（使用者）
- 查詢端維持匿名；院內無 Entra ID，不改 GAS 部署設定；現有 PWA 不受影響。
- 採 A：`gas-query` 新增唯讀 `?format=json`（主專案 C-013），擴充套件本地比對。
- 僅自用 unpacked；獨立 repo。
- 預設值（使用者同意）：查詢範圍同 PWA（藥名、儲位碼、批價碼、物編、ATC碼）；OpenEvidence 開關預設關；本切片用假資料。

### 設計取捨
- 搜尋規則複製 PWA `<search-core>` 為逐字複本，用測試逐字比對防分歧。理由：避免兩份規則悄悄不同；前提：PWA 檔案路徑可達，否則該測試 skip（不是 pass）。
- popup 內輸入即時比對（與 PWA 相同）：資料在本機，輸入不外傳，故不要求按鈕觸發；原規格「須點擊才查」是針對會送出網路請求的情況（前提：查詢仍為本機比對；若改為伺服端查詢，須回到按鈕觸發）。
- 右鍵帶入文字經 `storage.session`，popup 讀到即刪。前提：session storage 只在記憶體、瀏覽器關閉即清；若失敗，popup 不會帶入但不會報錯（靜默路徑，已列入待實機驗證）。
- 外傳檢查刻意不擋短數字（儲位碼如 944）。

### 驗證證據
- `node --test tests/extension.test.mjs`：14 通過、0 失敗、0 跳過（含 PWA 逐字比對）。
- 變異測試：search-core 尾端加一行 → 逐字比對失敗；popup.js 加 `innerHTML` → 靜態檢查失敗；還原後回到 14 通過。
- popup 以本機 http 預覽：`mat900` → 2 件；`zzzz` → 查無符合品項；`凍1` → 冷藏(凍)；`beta` → 管制；無橫向捲動；console 無訊息；OpenEvidence 區塊隱藏。

### 未驗證
- 在真實 Chrome 載入 unpacked、右鍵帶入、`chrome.action.openPopup()` 行為。
- 與真實資料（1482 筆）的效能與顯示。
