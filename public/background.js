// Background Service Worker for Chrome Extension
// Handles privileged operations and API calls

chrome.action.onClicked.addListener((tab) => {
  // Open side panel when extension icon is clicked
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Google Drive OAuth token cache
let cachedToken = null;
let tokenExpiry = null;

// Get OAuth token for Google Drive
async function getAuthToken(interactive = false) {
  console.log('🔐 Attempting to get auth token, interactive:', interactive);
  
  // Check if cached token is still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('✅ Using cached token');
    return cachedToken;
  }

  try {
    console.log('📡 Calling chrome.identity.getAuthToken...');
    const token = await chrome.identity.getAuthToken({ 
      interactive: interactive 
    });
    
    console.log('Token received:', token ? '✅ Success' : '❌ No token');
    
    if (token) {
      cachedToken = token;
      // Tokens typically expire in 1 hour, cache for 50 minutes to be safe
      tokenExpiry = Date.now() + (50 * 60 * 1000);
      console.log('✅ Token cached successfully');
      return token;
    } else {
      throw new Error('No token returned from identity API');
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Remove cached token (for logout or token refresh)
async function removeAuthToken() {
  if (cachedToken) {
    await chrome.identity.removeCachedAuthToken({ token: cachedToken });
    cachedToken = null;
    tokenExpiry = null;
  }
}

// Fetch files from Google Drive
async function fetchDriveFiles(query = '', pageToken = '', pageSize = 20) {
  const token = await getAuthToken(false);
  
  // Build query parameters
  const q = query 
    ? `trashed = false and (name contains '${query.replace(/'/g, "\\'")}')` 
    : 'trashed = false';
  
  const params = new URLSearchParams({
    pageSize: pageSize.toString(),
    fields: 'files(id,name,mimeType,modifiedTime,iconLink,thumbnailLink,webViewLink),nextPageToken',
    orderBy: 'modifiedTime desc',
    q: q
  });
  
  if (pageToken) {
    params.append('pageToken', pageToken);
  }
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.status === 401) {
    // Token expired, remove it and retry
    await removeAuthToken();
    throw new Error('AUTH_EXPIRED');
  }
  
  if (!response.ok) {
    throw new Error(`Drive API error: ${response.status}`);
  }
  
  return await response.json();
}

// Message handler for communication with side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  // Handle different message types here
  switch (message.type) {
    case 'PING':
      sendResponse({ success: true, message: 'pong' });
      break;
    
    case 'DRIVE_AUTH':
      // Authenticate with Google Drive
      console.log('🔑 DRIVE_AUTH request received');
      getAuthToken(true)
        .then(token => {
          console.log('✅ Auth successful, sending response');
          sendResponse({ success: true, token: token });
        })
        .catch(error => {
          console.error('❌ Auth failed:', error);
          sendResponse({ success: false, error: error.message || 'Authentication failed' });
        });
      return true; // Keep channel open for async response
    
    case 'DRIVE_LOGOUT':
      // Remove authentication
      removeAuthToken()
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true;
    
    case 'DRIVE_FETCH_FILES':
      // Fetch files from Drive
      fetchDriveFiles(message.query || '', message.pageToken || '', message.pageSize || 20)
        .then(data => {
          sendResponse({ success: true, data: data });
        })
        .catch(error => {
          if (error.message === 'AUTH_EXPIRED') {
            sendResponse({ success: false, error: 'AUTH_EXPIRED' });
          } else {
            sendResponse({ success: false, error: error.message });
          }
        });
      return true;
    
    // Add more message handlers as needed
    default:
      sendResponse({ success: false, message: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async responses
});

console.log('Background service worker initialized');

