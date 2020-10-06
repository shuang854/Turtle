const IFRAME_HEADERS = ['content-security-policy', 'x-frame-options'];
const isFirefox = navigator.userAgent.includes('Firefox');

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    details.responseHeaders.forEach((header, index, headers) => {
      // Modify samesite property for cookies
      if (header.name.toLowerCase() === 'set-cookie') {
        let cookies = header.value.split('\n');
        cookies.forEach((cookie, i, allCookies) => {
          cookie = cookie.replace(/SameSite=Lax/i, 'SameSite=None');
          if (cookie.search(/SameSite/i) === -1) {
            cookie += '; SameSite=None';
          }
          if (cookie.search(/Secure/i) === -1) {
            cookie += '; Secure';
          }

          allCookies[i] = cookie;
        });

        header.value = '';
        for (let i = 0; i < cookies.length; i++) {
          header.value += cookies[i];
          if (i !== cookies.length - 1) {
            header.value += '\n';
          }
        }

        headers[index].value = header.value;
      }
    });

    // Return stripped headers
    return {
      responseHeaders: details.responseHeaders.filter((header) => !IFRAME_HEADERS.includes(header.name.toLowerCase())),
    };
  },
  { urls: ['https://www.netflix.com/*', 'http://localhost/*', 'https://turtletv.app/*'] },
  isFirefox ? ['blocking', 'responseHeaders'] : ['blocking', 'responseHeaders', 'extraHeaders']
);
