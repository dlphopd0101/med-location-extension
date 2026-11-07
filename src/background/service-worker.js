// 右鍵「查詢儲位」：使用者明確點選後，把選取文字交給 popup。
// 文字只暫存在 storage.session（瀏覽器關閉即清除），popup 讀到後立刻刪除；不寫 local／sync、不記 log。
var MENU_ID = 'lookup-location';

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({ id: MENU_ID, title: '查詢儲位', contexts: ['selection'] });
});

chrome.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId !== MENU_ID) return;
  var text = typeof info.selectionText === 'string' ? info.selectionText.trim().slice(0, 160) : '';
  if (!text) return;
  chrome.storage.session.set({ pendingQuery: text }).then(function () {
    return chrome.action.openPopup();
  }).catch(function () {
    // 無法自動開啟 popup 時，用徽章提示使用者自己點工具列圖示
    chrome.action.setBadgeText({ text: '1' });
  });
});
