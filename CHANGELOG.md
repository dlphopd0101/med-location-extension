# CHANGELOG

## 0.1.0（未 commit）— C-001
- 新增：MV3 骨架、popup 搜尋與結果卡片、右鍵「查詢儲位」、搜尋核心（複製自 PWA）、OpenEvidence 開關（預設關）與外傳前檢查、虛構測試資料。
- 驗證：`node --test tests/extension.test.mjs` 14 項通過；刻意破壞搜尋核心與加入 innerHTML 皆使測試失敗（證明測試非空）；popup 本機預覽渲染正常。
