var currentVersion = chrome.runtime.getManifest().version;
window.addEventListener('message', (e) => {
  if (e.data.toString() === 'get extension version') {
    e.ports[0].postMessage({ version: currentVersion });
  }
});
