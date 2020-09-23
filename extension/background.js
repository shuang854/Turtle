const IFRAME_HEADERS = ['content-security-policy', 'x-frame-options'];
const isFirefox = navigator.userAgent.includes('Firefox');

chrome.webRequest.onHeadersReceived.addListener(
  (details) => ({
    responseHeaders: details.responseHeaders.filter((header) => !IFRAME_HEADERS.includes(header.name.toLowerCase())),
  }),
  { urls: ['<all_urls>'] },
  ['blocking', 'responseHeaders']
);
