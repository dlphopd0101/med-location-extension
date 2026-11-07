# PROGRESS

更新：2026-11-07

## 已完成
- C-001：MV3 骨架（popup、右鍵選單、搜尋核心、OpenEvidence 開關預設關、外傳檢查），假資料；14 項單元／靜態測試通過；popup 以本機 http 預覽驗證渲染（未在真實 Chrome 擴充套件環境驗證）。

- C-002：接真實端點（`data-source.js`、錯誤處理、重試、10 分鐘 session 快取）；主專案 `?format=json` 已部署為版本 5。19 項測試通過；本機預覽對線上端點驗證通過（未 commit）。

## 進行中
- 無

## 下一步
1. 使用者在 Chrome 重新載入擴充套件，實測真實資料（需先建立 `src/endpoint.local.js`，已在本機建好）。**待確認：擴充套件環境下 fetch 不需 host 權限（curl 顯示有 CORS 標頭，但未在擴充套件環境實測）；若失敗再加 host 權限。**
2. 已由使用者在真實 Chrome 載入 unpacked 並回報「測試正常」（2026-11-07，我未獨立驗證；未逐項確認右鍵帶入是自動開 popup 或需點徽章）。

## 注意事項
- `src/search-core.js` 須與 PWA 逐字同步。
- 未經使用者確認不 commit、不 push。
