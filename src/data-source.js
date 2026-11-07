// 資料來源：gas-query 的唯讀端點（?format=json）。純函式，fetch 由呼叫端注入以便測試。
// 錯誤只用代碼表示，畫面訊息由 errorMessage 轉成人話；不把伺服端內容、網址、例外細節顯示出來。
var REQUIRED_COLS = ['批價碼', '物編', '藥名', 'P1儲位', 'P2儲位', 'P3儲位', '藥庫', 'ATC碼'];
var FETCH_TIMEOUT_MS = 20000;   // 實測冷啟動約 8 秒，留一倍以上餘裕
var CACHE_TTL_MS = 10 * 60 * 1000;

function DataError(code) { this.code = code; }

function validateData(j) {
  if (!j || typeof j !== 'object') throw new DataError('FORMAT');
  if (j.error) throw new DataError('SERVER');
  if (!Array.isArray(j.cols) || !Array.isArray(j.rows)) throw new DataError('FORMAT');
  for (var i = 0; i < REQUIRED_COLS.length; i++) {
    if (j.cols.indexOf(REQUIRED_COLS[i]) < 0) throw new DataError('FORMAT');
  }
  for (var r = 0; r < j.rows.length; r++) {
    if (!Array.isArray(j.rows[r]) || j.rows[r].length !== j.cols.length) throw new DataError('FORMAT');
  }
  return { cols: j.cols, rows: j.rows, updatedAt: typeof j.updatedAt === 'string' ? j.updatedAt : '' };
}

function fetchData(baseUrl, fetchImpl, timeoutMs) {
  var ctrl = new AbortController();
  var timedOut = false;
  var timer = setTimeout(function () { timedOut = true; ctrl.abort(); }, timeoutMs || FETCH_TIMEOUT_MS);
  return fetchImpl(baseUrl + '?format=json', { cache: 'no-store', credentials: 'omit', redirect: 'follow', signal: ctrl.signal })
    .then(function (res) {
      if (!res.ok) throw new DataError('HTTP');
      return res.text();
    })
    .then(function (text) {
      var j;
      try { j = JSON.parse(text); } catch (e) { throw new DataError('FORMAT'); }
      return validateData(j);
    })
    .catch(function (e) {
      if (e instanceof DataError) throw e;
      throw new DataError(timedOut ? 'TIMEOUT' : 'NETWORK');
    })
    .then(function (v) { clearTimeout(timer); return v; }, function (e) { clearTimeout(timer); throw e; });
}

function isFresh(entry, now) {
  return !!entry && typeof entry.at === 'number' && now - entry.at < CACHE_TTL_MS;
}

function errorMessage(code) {
  switch (code) {
    case 'TIMEOUT': return '資料讀取逾時，請稍後再試。';
    case 'NETWORK': return '無法連線，請檢查網路後再試。';
    case 'HTTP': return '資料服務暫時無法使用，請稍後再試。';
    case 'SERVER': return '資料暫時無法取得，請稍後再試。';
    default: return '收到的資料格式不正確，請稍後再試。';
  }
}
