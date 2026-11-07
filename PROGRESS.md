# PROGRESS

更新：2026-11-07

## 已完成
- C-001：MV3 骨架（popup、右鍵選單、搜尋核心、OpenEvidence 開關預設關、外傳檢查），假資料；14 項單元／靜態測試通過；popup 以本機 http 預覽驗證渲染（未在真實 Chrome 擴充套件環境驗證）。

## 進行中
- 無

## 下一步
1. 主專案 `?format=json`（C-013）需 `clasp push` ＋ `clasp deploy -i <部署ID>` 才會生效（須使用者確認）。
2. 切片 2：接真實端點（加 host 權限、載入錯誤處理）。
3. 在真實 Chrome 載入 unpacked，驗證右鍵 → `chrome.action.openPopup()` 帶入文字（尚未實測；`openPopup` 需較新 Chrome，失敗時會以徽章「1」提示）。

## 注意事項
- `src/search-core.js` 須與 PWA 逐字同步。
- 未經使用者確認不 commit、不 push。
