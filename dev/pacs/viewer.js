import {getURLsFromKeyValueUri} from '../../src/utils/uri.js';

import {ViewerService} from './viewer.service.js';
import {ViewerUI} from './viewer.ui.js';
import {setupRenderTests} from './viewer.rendertest.js';

/**
 * Setup viewer.
 */
function viewerSetup() {
  // viewer service: creates the app
  const service = new ViewerService();
  service.registerListeners();

  // viewer UI (after app listeners: relies on rendered data at load)
  const viewerUI = new ViewerUI(service);
  viewerUI.setup();
  viewerUI.registerListeners();

  const uriOptions = {};
  // uriOptions.batchSize = 100;
  // special dicom web cookie
  if (document.cookie) {
    const cookies = document.cookie.split('; ');
    // accept
    const acceptItem = cookies.find((item) => item.startsWith('accept='));
    if (typeof acceptItem !== 'undefined') {
      // accept is encoded in dcmweb.js (allows for ';')
      const accept = decodeURIComponent(acceptItem.split('=')[1]);
      if (typeof accept !== 'undefined' && accept.length !== 0) {
        uriOptions.requestHeaders = [];
        uriOptions.requestHeaders.push({
          name: 'Accept',
          value: accept
        });
      }
      // clean up
      document.cookie = 'accept=';
    }
    // token
    const tokenItem = cookies.find((item) => item.startsWith('access_token='));
    if (typeof tokenItem !== 'undefined') {
      const token = tokenItem.split('=')[1];
      if (typeof token !== 'undefined' && token.length !== 0) {
        if (typeof uriOptions.requestHeaders === 'undefined') {
          uriOptions.requestHeaders = [];
        }
        uriOptions.requestHeaders.push({
          name: 'Authorization',
          value: `Bearer ${token}`
        });
      }
      // clean up
      document.cookie = 'access_token=';
    }
  }
  // optional load from window location
  const urls = getURLsFromKeyValueUri(window.location.href);
  if (typeof urls !== 'undefined') {
    service.loadURLs(urls, uriOptions);
  }

  // render tests
  setupRenderTests(service);
}

// ---------------------------------------------

// launch
viewerSetup();
