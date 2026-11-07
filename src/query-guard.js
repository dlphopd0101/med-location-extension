// 外傳前檢查（只用在 OpenEvidence 按鈕；儲位查詢是本機比對，不外傳）。
// 這是降低誤傳的輔助防線，不是去識別化保證：只擋明顯的個資樣式。
// 刻意不擋短數字——儲位碼（如 944）、批價碼可能含數字。
var PHI_LABEL = /(姓名|病歷號|病例號|身分證|身份證|生日|出生|電話|手機|住址)/;

function isPhiLike(text) {
  var t = String(text || '');
  if (/\d{6,}/.test(t)) return true;                         // 連續 6 位以上數字（病歷號、電話）
  if (/[A-Za-z]\s?[12]\d{8}/.test(t)) return true;           // 台灣身分證字號樣式
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(t)) return true;       // email
  if (PHI_LABEL.test(t)) return true;                        // 欄位標籤
  return false;
}

function buildOpenEvidenceUrl(text) {
  return 'https://www.openevidence.com/ask?query=' + encodeURIComponent(String(text).trim());
}
