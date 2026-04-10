const openedWindows = new Map();

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'OPEN_POPUP') return;

  const { url } = msg.payload;

  // 이미 열려 있으면 포커스
  if (openedWindows.has(url)) {
    const { windowId } = openedWindows.get(url);
    chrome.windows.update(windowId, { focused: true });
    return;
  }

  chrome.windows.create({ url: 'about:blank', type: 'popup', width: 400, height: 700 }, (win) => {
    const tabId = win.tabs[0].id;

    chrome.debugger.attach({ tabId }, '1.3', () => {
      if (chrome.runtime.lastError) {
        console.error('attach 실패:', chrome.runtime.lastError.message);
        return;
      }

      // 필수 enable
      chrome.debugger.sendCommand({ tabId }, 'Network.enable');
      chrome.debugger.sendCommand({ tabId }, 'Page.enable');

      // 모바일 UA
      chrome.debugger.sendCommand({ tabId }, 'Network.setUserAgentOverride', {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      });

      chrome.debugger.sendCommand({ tabId }, 'Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 660,
        deviceScaleFactor: 3,
        mobile: true,
      });

      // 이제 실제 URL 로드
      chrome.tabs.update(tabId, { url });
    });

    openedWindows.set(url, { windowId: win.id, tabId });
  });
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
