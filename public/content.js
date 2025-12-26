// Content Script - Injects permission iframe
console.log('Content script loaded');

/**
 * Injects an invisible iframe to request microphone and camera permissions
 */
const injectMicrophonePermissionIframe = () => {
  // Check if iframe already exists
  if (document.getElementById('permissionsIFrame')) {
    console.log('Permission iframe already exists');
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('hidden', 'hidden');
  iframe.setAttribute('id', 'permissionsIFrame');
  iframe.setAttribute('allow', 'microphone; camera');
  iframe.style.display = 'none';
  iframe.src = chrome.runtime.getURL('permission.html');
  
  document.body.appendChild(iframe);
  console.log('Permission iframe injected');
};

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'PERMISSION_GRANTED') {
    console.log('Media permissions granted successfully');
  } else if (event.data.type === 'PERMISSION_DENIED') {
    console.error('Media permissions denied:', event.data.error);
  }
});

// Inject iframe when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectMicrophonePermissionIframe);
} else {
  injectMicrophonePermissionIframe();
}
