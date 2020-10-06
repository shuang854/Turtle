const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
const playerSessionId = videoPlayer.getAllPlayerSessionIds()[0];
const netflixPlayer = videoPlayer.getVideoPlayerBySessionId(playerSessionId);
const player = document.getElementsByTagName('video')[0];
window.parent.postMessage('video ready', '*');

// Subscribe listeners on client-side actions
player.addEventListener('play', (ev) => {
  window.parent.postMessage({ type: 'play', time: player.currentTime }, '*');
});
player.addEventListener('pause', (ev) => {
  window.parent.postMessage({ type: 'pause', time: player.currentTime }, '*');
});

// Listen for syncing requests
window.addEventListener('message', (ev) => {
  let type = ev.data.type;

  // Handle status request event
  if (ev.data.toString() === 'fetch current status') {
    ev.ports[0].postMessage({ isPlaying: player.paused, time: player.currentTime });
  }

  // Handle seeking event
  if (type === 'seek') {
    netflixPlayer.seek(Number(ev.data.currentTime * 1000)); // Netflix Player object is needed to seek
  }

  // Handle playing event
  if (type === 'playing') {
    if (ev.data.playing && player.paused) {
      player.play();
    }
    if (!ev.data.playing && !player.paused) {
      player.pause();
    }
  }
});

// Disable keyboard shortcuts
window.addEventListener(
  'keydown',
  (e) => {
    e.stopPropagation();
  },
  true
);
