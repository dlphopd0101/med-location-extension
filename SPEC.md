# SPEC

## 目標
在不取代、不改變既有手機 PWA 的前提下，提供瀏覽器擴充套件版的儲位查詢。

## 輸入
- 使用者在 popup 輸入，或在網頁選取文字後右鍵「查詢儲位」（使用者明確點選才觸發）。
- 資料：`gas-query` 的 `?format=json`（`{ cols, rows, updatedAt }`，排除停用、不含價格）。

## 輸出
- 結果卡片：藥名（英文在前、中文／規格在後）、批價碼／物編／ATC碼、P1／P2／P3／藥庫四格（無儲位顯示「—」）、管制與冷藏（凍）標籤、資料更新時間。

## 功能範圍
- 搜尋規則與 PWA 相同：空白分隔 AND、不分大小寫；代碼類完全相符 > 開頭相符；藥名包含。
- 查詢在本機比對，不外傳。
- OpenEvidence 按鈕：預設關閉；開啟時需使用者每次確認、通過個資樣式檢查，僅開新分頁，不讀取、不填寫其頁面。

## 範圍外
- 身分驗證（查詢端匿名，使用者 2026-11-07 決定）、Gateway、Groq／LLM、查詢歷史、自動填寫網頁欄位、交班訊息、上架或企業部署。

## 驗收條件
### 切片 1（骨架，假資料）【已驗證】
- manifest 僅 `contextMenus`、`storage`；無任何 host 權限、content script。
- 原始碼無 `innerHTML`／`eval`／遠端程式碼、無網路呼叫、無 console、不寫 local／sync storage。
- `src/search-core.js` 與 PWA `<search-core>` 逐字相同。
- popup：輸入 `mat900` 顯示 2 件；`zzzz` 顯示「查無符合品項」；`凍1` 出現「冷藏(凍)」；含 `管2` 的品項出現「管制」；無橫向捲動；OpenEvidence 區塊隱藏。
### 切片 2（真實資料，未做）
- 部署 `?format=json` 後，加入該端點 origin 的 host 權限；載入失敗時顯示可理解錯誤，不顯示內部細節。
- 實機（Chrome 載入 unpacked）驗證右鍵帶入 popup。
