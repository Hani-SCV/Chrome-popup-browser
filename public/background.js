const openedWindows = new Map();

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'OPEN_POPUP') {
    const { url } = msg.payload;

    // 이미 열린 창 있으면 focus
    if (openedWindows.has(url)) {
      chrome.windows.update(openedWindows.get(url), { focused: true });
      return;
    }

    chrome.windows.create(
      {
        url,
        type: 'popup',
        width: 400,
        height: 700,
      },
      (win) => {
        openedWindows.set(url, win.id);
      }
    );
  }
});

// 창 닫히면 Map에서 제거
chrome.windows.onRemoved.addListener((windowId) => {
  for (const [url, id] of openedWindows.entries()) {
    if (id === windowId) {
      openedWindows.delete(url);
      break;
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
