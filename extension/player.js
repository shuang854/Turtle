var playerReady = false;
const NETFLIX_VID_URL = /https?:\/\/www\.netflix\.com\/watch\/([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

document.addEventListener('click', (e) => {
  if (!playerReady && window.location.toString().match(NETFLIX_VID_URL)) {
    let s = document.createElement('script');
    s.src = chrome.runtime.getURL('netflix.js');
    (document.head || document.documentElement).appendChild(s);
    playerReady = true;
  } else if (playerReady && !window.location.toString().match(NETFLIX_VID_URL)) {
    playerReady = false;
    window.parent.postMessage('video not ready', '*');
  }
});
