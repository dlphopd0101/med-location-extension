// <search-core>
// 比對規則：關鍵字以空白分隔，每個關鍵字都必須符合（AND）；不分大小寫。
// 代碼類欄位（批價碼、物編、ATC碼、各儲位）：完全相符 > 開頭相符；藥名：包含即可（開頭相符較前）。
var CODE_FIELDS = ['批價碼', '物編', 'ATC碼', 'P1儲位', 'P2儲位', 'P3儲位', '藥庫'];

function prepare(row) {
  row._l = {};
  CODE_FIELDS.forEach(function (f) { row._l[f] = String(row[f] || '').toLowerCase(); });
  row._name = String(row['藥名'] || '').toLowerCase();
  return row;
}

// 分數越小越前面；Infinity 代表不符合
function tokenScore(row, t) {
  var best = Infinity;
  for (var i = 0; i < CODE_FIELDS.length; i++) {
    var v = row._l[CODE_FIELDS[i]];
    if (!v) continue;
    if (v === t) best = Math.min(best, 0);
    else if (v.indexOf(t) === 0) best = Math.min(best, 1);
  }
  var p = row._name.indexOf(t);
  if (p === 0) best = Math.min(best, 2);
  else if (p > 0) best = Math.min(best, 3);
  return best;
}

function byNameThenCode(a, b) {
  return a._name < b._name ? -1 : a._name > b._name ? 1 : (a['批價碼'] < b['批價碼'] ? -1 : 1);
}

function search(rows, query) {
  var tokens = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return rows.slice().sort(byNameThenCode);
  var hits = [];
  rows.forEach(function (row) {
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var s = tokenScore(row, tokens[i]);
      if (s === Infinity) return;
      total += s;
    }
    hits.push({ row: row, score: total });
  });
  hits.sort(function (a, b) { return a.score - b.score || byNameThenCode(a.row, b.row); });
  return hits.map(function (h) { return h.row; });
}

// 英文名在前、括號外第一個中日韓字元起為中文／規格；只影響顯示，不影響比對
// 括號內的中文（如「(COVID 專用)」「《公費》」）不算，避免把標記切成兩半
var CJK = /[㐀-䶿一-鿿]/;
function splitName(name) {
  var depth = 0;
  for (var i = 0; i < name.length; i++) {
    var c = name.charAt(i);
    if ('([（【《［'.indexOf(c) >= 0) depth++;
    else if (')]）】》］'.indexOf(c) >= 0) depth = Math.max(0, depth - 1);
    else if (depth === 0 && CJK.test(c)) {
      if (i === 0) break;
      return { main: name.slice(0, i).trim(), sub: name.slice(i).trim() };
    }
  }
  return { main: name, sub: '' };
}

function isControlled(name) { return /管\s*[1-4]/.test(name); }
function isCold(row) {
  return ['P1儲位', 'P2儲位', 'P3儲位', '藥庫'].some(function (f) { return String(row[f] || '').indexOf('凍') === 0; });
}
// </search-core>
