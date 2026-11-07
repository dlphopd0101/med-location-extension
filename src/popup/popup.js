// popup：所有輸出一律 textContent（不解析 HTML），查詢與結果只在本機記憶體。
(function () {
  var hasChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.session;
  var q = document.getElementById('q');
  var listEl = document.getElementById('list');
  var stateEl = document.getElementById('state');
  var metaEl = document.getElementById('meta');
  var oeBox = document.getElementById('oe');
  var oeBtn = document.getElementById('oe-btn');
  var oeErr = document.getElementById('oe-err');
  var rows = [];

  function toRows(data) {
    return data.rows.map(function (r) {
      var o = {};
      data.cols.forEach(function (c, i) { o[c] = r[i]; });
      return prepare(o);
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function cell(label, value, vault) {
    var c = el('div', 'cell' + (vault ? ' vault' : ''));
    c.appendChild(el('div', 'lab', label));
    c.appendChild(el('div', 'val', value || '—'));
    return c;
  }

  function card(row) {
    var parts = splitName(String(row['藥名'] || ''));
    var c = el('div', 'card');
    var name = el('div', 'name', parts.main);
    if (isControlled(row['藥名'] || '')) name.appendChild(el('span', 'tag', '管制'));
    if (isCold(row)) name.appendChild(el('span', 'tag', '冷藏(凍)'));
    c.appendChild(name);
    if (parts.sub) c.appendChild(el('div', 'sub', parts.sub));
    c.appendChild(el('div', 'code', [row['批價碼'], row['物編'], row['ATC碼']].filter(Boolean).join(' · ')));
    var g = el('div', 'grid');
    g.appendChild(cell('P1', row['P1儲位']));
    g.appendChild(cell('P2', row['P2儲位']));
    g.appendChild(cell('P3', row['P3儲位']));
    g.appendChild(cell('藥庫', row['藥庫'], true));
    c.appendChild(g);
    return c;
  }

  function render() {
    var text = q.value.trim();
    listEl.textContent = '';
    oeErr.textContent = '';
    if (CONFIG.OPENEVIDENCE_ENABLED) oeBox.hidden = !text;
    if (!text) { stateEl.textContent = '請輸入關鍵字'; return; }
    var hits = search(rows, text);
    if (!hits.length) { stateEl.textContent = '查無符合品項'; return; }
    var shown = hits.slice(0, CONFIG.MAX_SHOWN);
    stateEl.textContent = '符合 ' + hits.length + ' 件' + (hits.length > shown.length ? '（顯示前 ' + shown.length + ' 件）' : '');
    shown.forEach(function (r) { listEl.appendChild(card(r)); });
  }

  function openEvidence() {
    var text = q.value.trim();
    oeErr.textContent = '';
    if (!text) return;
    if (isPhiLike(text)) { oeErr.textContent = '內容疑似含個人資料，請只保留藥品名稱／規格。'; return; }
    if (!window.confirm('將把下列文字放入外部網站 OpenEvidence 的查詢網址：\n\n' + text + '\n\n確定要開啟嗎？')) return;
    chrome.tabs.create({ url: buildOpenEvidenceUrl(text) });
  }

  q.addEventListener('input', render);
  if (CONFIG.OPENEVIDENCE_ENABLED) oeBtn.addEventListener('click', openEvidence);

  rows = toRows(FAKE_DATA);
  metaEl.textContent = FAKE_DATA.updatedAt ? '資料更新：' + FAKE_DATA.updatedAt : '';
  render();
  q.focus();

  // 右鍵選單帶入的文字：讀到後立刻刪除
  if (hasChrome) {
    chrome.storage.session.get('pendingQuery').then(function (v) {
      if (v && typeof v.pendingQuery === 'string' && v.pendingQuery) {
        q.value = v.pendingQuery;
        render();
      }
      return chrome.storage.session.remove('pendingQuery');
    }).catch(function () {});
    if (chrome.action) chrome.action.setBadgeText({ text: '' });
  }
})();
