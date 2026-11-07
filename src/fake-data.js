// 明顯虛構的測試資料（形狀同 gas-query 的 ?format=json：{ cols, rows, updatedAt }）。
// 本切片只用這份；接真實端點是下一切片。儲位一律文字，空字串＝無儲位。
var FAKE_DATA = {
  cols: ['批價碼', '物編', '藥名', 'P1儲位', 'P2儲位', 'P3儲位', '藥庫', 'ATC碼'],
  rows: [
    ['TEST001', 'MAT900', 'Testdrug Alpha 5mg/tab 測試藥甲', '054', '944', '', 'A-01', 'Z99AA01'],
    ['TEST002', 'MAT900', 'Testdrug Alpha 10mg/tab 測試藥甲', '055', '', '', 'A-02', 'Z99AA01'],
    ['TEST003', '', 'Testdrug Beta inj 測試藥乙 管2', '', '', '', 'B-07', 'Z99BB02'],
    ['TEST004', 'MAT901', 'Testdrug Gamma vaccine 測試疫苗', '凍1', '', '', '', 'Z99CC03'],
    ['TEST005', 'MAT902', '(COVID 專用)Testdrug Delta 測試藥丁', '', '', 'P3-9', '', ''],
    ['TEST006', 'MAT903', 'Testdrug Epsilon 測試藥戊', '', '', '', '', ''],
  ],
  updatedAt: '(測試資料)',
};
