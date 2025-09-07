// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Optional: Set up side panel for specific sites or conditions
chrome.runtime.onInstalled.addListener(() => {
  // Side panel is available by default due to manifest configuration
  console.log('Waifu AI Side Panel extension installed');
});
