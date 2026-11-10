import {getURLsFromKeyValueUri} from '../../src/utils/uri.js';

import {DwvAppService} from './services/dwvApp.service.js';
import {ViewerUI} from './gui/viewerUI.js';
import {setupRenderTests} from './renderTest.js';

/**
 * Setup viewer.
 */
function viewerSetup() {
  // dwv app service: creates the app
  const dwvAppService = new DwvAppService();
  dwvAppService.registerListeners();

  // viewer UI (load events come from the dwvAppService, after its handling)
  const viewerUI = new ViewerUI(dwvAppService);
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
    dwvAppService.loadURLs(urls, uriOptions);
  }

  // render tests
  setupRenderTests(dwvAppService);
}

// ---------------------------------------------

// launch
viewerSetup();
