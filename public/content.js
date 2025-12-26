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
  iframe.setAttribute('allow', 'microphone');
  iframe.style.display = 'none';
  iframe.src = chrome.runtime.getURL('permission.html');
  
  document.body.appendChild(iframe);
  console.log('Permission iframe injected');
};

/**
 * Renders a small floating prompt to let the user click and grant mic access
 */
const injectPermissionPrompt = () => {
  if (document.getElementById('mic-permission-prompt')) return;

  const container = document.createElement('div');
  container.id = 'mic-permission-prompt';
  container.style.position = 'fixed';
  container.style.bottom = '16px';
  container.style.right = '16px';
  container.style.zIndex = '2147483647';
  container.style.background = '#111827';
  container.style.color = '#f9fafb';
  container.style.padding = '12px 14px';
  container.style.borderRadius = '10px';
  container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
  container.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
  container.style.width = '260px';

  const title = document.createElement('div');
  title.textContent = 'Microphone access';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';
  title.style.marginBottom = '6px';

  const desc = document.createElement('div');
  desc.textContent = 'Click allow to enable mic for this extension.';
  desc.style.fontSize = '12px';
  desc.style.color = '#d1d5db';
  desc.style.marginBottom = '10px';

  const button = document.createElement('button');
  button.textContent = 'Allow microphone';
  button.style.width = '100%';
  button.style.padding = '10px 12px';
  button.style.background = '#3b82f6';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.borderRadius = '8px';
  button.style.cursor = 'pointer';
  button.style.fontWeight = '600';
  button.style.fontSize = '13px';

  const status = document.createElement('div');
  status.id = 'mic-permission-status';
  status.style.fontSize = '12px';
  status.style.marginTop = '8px';
  status.style.color = '#d1d5db';

  button.addEventListener('click', () => {
    const iframe = document.getElementById('permissionsIFrame');
    if (!iframe || !iframe.contentWindow) {
      status.textContent = 'Unable to initiate permission request.';
      return;
    }
    status.textContent = 'Requesting microphone access...';
    iframe.contentWindow.postMessage({ type: 'REQUEST_PERMISSION' }, '*');
  });

  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(button);
  container.appendChild(status);

  document.body.appendChild(container);
};

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) return;
  const statusEl = document.getElementById('mic-permission-status');

  if (event.data.type === 'PERMISSION_GRANTED') {
    console.log('Media permissions granted successfully');
    if (statusEl) statusEl.textContent = 'Microphone access granted.';
  } else if (event.data.type === 'PERMISSION_DENIED') {
    console.error('Media permissions denied:', event.data.error);
    if (statusEl) statusEl.textContent = `Denied: ${event.data.error}`;
  }
});

// Inject iframe when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectMicrophonePermissionIframe();
    injectPermissionPrompt();
  });
} else {
  injectMicrophonePermissionIframe();
  injectPermissionPrompt();
}
