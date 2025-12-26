// Background Service Worker for Chrome Extension
// Handles privileged operations and API calls

chrome.action.onClicked.addListener((tab) => {
  // Open side panel when extension icon is clicked
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Message handler for communication with side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  // Handle different message types here
  switch (message.type) {
    case 'PING':
      sendResponse({ success: true, message: 'pong' });
      break;
    
    // Add more message handlers as needed
    default:
      sendResponse({ success: false, message: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async responses
});

console.log('Background service worker initialized');
