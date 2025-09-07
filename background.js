// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Tab spy functionality - broadcast tab changes to side panel
chrome.tabs.onActivated.addListener((activeInfo) => {
  notifySidePanel('tab_activated', { tabId: activeInfo.tabId });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    notifySidePanel('tab_updated', { 
      tabId, 
      url: tab.url, 
      title: tab.title 
    });
  }
});

// Helper function to send messages to side panel
async function notifySidePanel(type, data) {
  try {
    // Send message to all extension contexts (including side panel)
    chrome.runtime.sendMessage({
      type: 'TAB_SPY_EVENT',
      event: type,
      data: data
    }).catch(() => {
      // Side panel might not be open - that's okay
    });
  } catch (error) {
    // Extension contexts might not be ready - ignore
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('🌸 Waifu AI Side Panel extension installed with tab spy capabilities');
});
