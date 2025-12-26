/**
 * Requests user permission for microphone and camera access.
 */
async function getUserPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    console.log('Microphone and camera access granted');
    stream.getTracks().forEach((track) => track.stop());
    window.parent.postMessage({ type: 'PERMISSION_GRANTED' }, '*');
  } catch (error) {
    console.error('Error requesting media permission', error);
    window.parent.postMessage({ type: 'PERMISSION_DENIED', error: error.message }, '*');
  }
}

getUserPermission();
