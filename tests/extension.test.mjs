import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// 把純函式檔載入同一個 vm context（popup 以 classic script 載入，函式為全域）
function load(...files) {
  const ctx = {};
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(read(f), ctx);
  return ctx;
}
const core = load('src/search-core.js', 'src/query-guard.js', 'src/config.js', 'src/fake-data.js', 'src/data-source.js');
// data-source 需要的瀏覽器全域
Object.assign(core, { AbortController, setTimeout, clearTimeout, JSON });
const toRows = (d) => d.rows.map(r => core.prepare(Object.fromEntries(d.cols.map((c, i) => [c, r[i]]))));
const rows = toRows(core.FAKE_DATA);
const ids = (hits) => JSON.stringify(hits.map(r => r['批價碼']));

// ---- 搜尋規則 ----
test('搜尋：空白分隔 AND、不分大小寫', () => {
  assert.equal(ids(core.search(rows, 'alpha 10mg')), '["TEST002"]');
  assert.equal(ids(core.search(rows, 'ALPHA 10MG')), '["TEST002"]');
});

test('搜尋：儲位碼完全相符；同物編多批價碼要全部出現', () => {
  assert.equal(ids(core.search(rows, '944')), '["TEST001"]');
  // 同分時依藥名字串排序（PWA 既有行為），這裡只驗「都出現」，不驗順序
  assert.equal(JSON.stringify(core.search(rows, 'MAT900').map(r => r['批價碼']).sort()), '["TEST001","TEST002"]');
});

test('搜尋：前導 0 的儲位保持文字（054 不等於 54）', () => {
  assert.equal(ids(core.search(rows, '054')), '["TEST001"]');
  assert.equal(ids(core.search(rows, '54')), '[]');
});

test('搜尋：無儲位的欄位不會被空查詢以外的字串誤中', () => {
  assert.equal(ids(core.search(rows, 'zzzz')), '[]');
});

test('搜尋：管制藥與冷藏標記、名稱切分', () => {
  const by = Object.fromEntries(rows.map(r => [r['批價碼'], r]));
  assert.ok(core.isControlled(by.TEST003['藥名']));
  assert.ok(!core.isControlled(by.TEST001['藥名']));
  assert.ok(core.isCold(by.TEST004));
  assert.ok(!core.isCold(by.TEST001));
  assert.equal(core.splitName(by.TEST005['藥名']).main, '(COVID 專用)Testdrug Delta');
});

// 與 PWA 的搜尋規則是「兩份」：用逐字比對防止悄悄分歧。找不到 PWA 檔時明確跳過（不是通過）。
const PWA_INDEX = process.env.PWA_INDEX_HTML || 'D:/AI Project/儲位查找新版/gas-query/index.html';
test('搜尋核心與 PWA index.html 的 <search-core> 逐字相同', { skip: !fs.existsSync(PWA_INDEX) && `找不到 ${PWA_INDEX}（可用 PWA_INDEX_HTML 指定）` }, () => {
  const m = /\/\/ <search-core>[\s\S]*?\/\/ <\/search-core>/.exec(fs.readFileSync(PWA_INDEX, 'utf8'));
  assert.ok(m, 'PWA 缺少 <search-core> 標記');
  assert.equal(read('src/search-core.js').replace(/\r\n/g, '\n').trim(), m[0].replace(/\r\n/g, '\n').trim());
});

// ---- 外傳前檢查 ----
test('外傳檢查：擋明顯個資樣式', () => {
  for (const bad of ['病歷號 12345678', '0912345678', 'A123456789', 'a@b.com', '姓名 王小明 apixaban', '王小明 生日 1980']) {
    assert.ok(core.isPhiLike(bad), `應被擋：${bad}`);
  }
});

test('外傳檢查：藥名與短數字儲位碼不誤擋', () => {
  for (const ok of ['Apixaban 5 mg', '944', 'MAT900', 'TEST001', '胰島素 100u/ml']) {
    assert.ok(!core.isPhiLike(ok), `不應被擋：${ok}`);
  }
});

test('OpenEvidence 網址：query 正確編碼、只含該參數', () => {
  const u = new URL(core.buildOpenEvidenceUrl('  a b&c=1 中文 '));
  assert.equal(u.origin + u.pathname, 'https://www.openevidence.com/ask');
  assert.equal(u.searchParams.get('query'), 'a b&c=1 中文');
  assert.equal([...u.searchParams.keys()].join(','), 'query');
});

test('OpenEvidence 預設關閉（未核准前）', () => {
  assert.equal(core.CONFIG.OPENEVIDENCE_ENABLED, false);
});

// ---- manifest 最小權限 ----
test('manifest：只有 contextMenus、storage；無任何網站權限', () => {
  const m = JSON.parse(read('manifest.json'));
  assert.equal(m.manifest_version, 3);
  assert.deepEqual([...m.permissions].sort(), ['contextMenus', 'storage']);
  for (const k of ['host_permissions', 'optional_host_permissions', 'content_scripts', 'externally_connectable', 'web_accessible_resources']) {
    assert.ok(!(k in m), `不應出現 ${k}`);
  }
  assert.ok(!/<all_urls>|https?:\/\/\*|\*:\/\/\*/.test(JSON.stringify(m)));
  assert.ok(/script-src 'self'/.test(m.content_security_policy.extension_pages));
});

// ---- 原始碼靜態檢查 ----
const srcFiles = [];
(function walk(d) {
  for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
    const p = d + '/' + e.name;
    if (e.isDirectory()) walk(p); else srcFiles.push(p);
  }
})('src');

test('原始碼：不用 innerHTML／eval／遠端程式碼', () => {
  const banned = /\b(innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval|new Function)\b|<script[^>]+src=["']https?:/;
  for (const f of srcFiles) {
    const hit = banned.exec(read(f));
    assert.ok(!hit, `${f} 含禁用寫法：${hit && hit[0]}`);
  }
});

test('原始碼：不直接呼叫網路 API（只有 data-source 的注入 fetchImpl）、不寫 local／sync storage、不輸出 console', () => {
  const banned = /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket)\s*\(|storage\.(local|sync)|console\./;
  for (const f of srcFiles.filter(f => f.endsWith('.js'))) {
    const hit = banned.exec(read(f));
    assert.ok(!hit, `${f} 含禁用呼叫：${hit && hit[0]}`);
  }
});

test('fake-data 全是明顯虛構（批價碼皆 TEST 開頭）', () => {
  assert.ok(core.FAKE_DATA.rows.every(r => /^TEST\d+$/.test(r[0])));
});

// ---- 資料來源 ----
const goodData = () => ({ cols: [...core.REQUIRED_COLS], rows: [['A1', '', '藥', '', '', '', '', '']], updatedAt: '11/05 09:29' });
const okRes = (body) => Promise.resolve({ ok: true, text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)) });
const code = (p) => p.then(() => 'no-error', (e) => e.code);

test('資料來源：成功時回傳 cols／rows／updatedAt，並以 ?format=json、不帶憑證請求', async () => {
  let seen;
  const d = await core.fetchData('https://example.test/exec', (u, o) => { seen = [u, o]; return okRes(goodData()); });
  assert.equal(seen[0], 'https://example.test/exec?format=json');
  assert.equal(seen[1].credentials, 'omit');
  assert.equal(seen[1].cache, 'no-store');
  assert.equal(JSON.stringify(Object.keys(d)), '["cols","rows","updatedAt"]');
  assert.equal(d.updatedAt, '11/05 09:29');
});

test('資料來源：各種失敗都對應明確代碼（不靜默）', async () => {
  const f = (impl) => code(core.fetchData('https://example.test/exec', impl, 50));
  assert.equal(await f(() => Promise.resolve({ ok: false, text: () => Promise.resolve('') })), 'HTTP');
  assert.equal(await f(() => okRes('<html>login</html>')), 'FORMAT');
  assert.equal(await f(() => okRes({ error: '資料暫時無法取得' })), 'SERVER');
  assert.equal(await f(() => okRes({ cols: ['批價碼'], rows: [] })), 'FORMAT');
  const badRow = goodData(); badRow.rows[0] = ['只有一格'];
  assert.equal(await f(() => okRes(badRow)), 'FORMAT');
  assert.equal(await f(() => Promise.reject(new TypeError('Failed to fetch'))), 'NETWORK');
  assert.equal(await f((u, o) => new Promise((_, rej) => o.signal.addEventListener('abort', () => rej(new Error('aborted'))))), 'TIMEOUT');
});

test('資料來源：錯誤訊息是人話，不含網址、SHEET_ID 或例外字樣', () => {
  for (const c of ['TIMEOUT', 'NETWORK', 'HTTP', 'SERVER', 'FORMAT', '???']) {
    const m = core.errorMessage(c);
    assert.ok(/[一-鿿]/.test(m));
    assert.ok(!/https?:|SHEET_ID|Error|undefined/.test(m), m);
  }
});

test('資料來源：快取新鮮度（10 分鐘）', () => {
  assert.ok(core.isFresh({ at: 1000 }, 1000 + 9 * 60 * 1000));
  assert.ok(!core.isFresh({ at: 1000 }, 1000 + 10 * 60 * 1000));
  assert.ok(!core.isFresh(null, 1));
  assert.ok(!core.isFresh({}, 1));
});

test('版控內不得出現部署 ID（endpoint.local.js 已被忽略）', () => {
  const hit = [];
  (function walk(d) {
    for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      const p = d ? d + '/' + e.name : e.name;
      if (e.isDirectory()) walk(p);
      else if (p !== 'src/endpoint.local.js' && /AKfycb[A-Za-z0-9_-]{20,}/.test(read(p))) hit.push(p);
    }
  })('');
  assert.deepEqual(hit, []);
  assert.ok(/^src\/endpoint\.local\.js$/m.test(read('.gitignore')));
});

test('取得時間顯示：本地時間 HH:MM，補零', () => {
  assert.equal(core.formatClock(new Date(2026, 10, 7, 9, 5).getTime()), '09:05');
  assert.equal(core.formatClock(new Date(2026, 10, 7, 23, 59).getTime()), '23:59');
  assert.equal(core.formatClock(undefined), '');
});
