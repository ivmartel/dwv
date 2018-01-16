/* global chrome */

// local chrome app setting
// Goes in pair with a simple manifest.json including name, description,
// version, icons and this:
//
//  "app": {
//    "background": {
//      "scripts": ["/resources/scripts/chrome-background.js"]
//    }
//  },

chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('../viewers/mobile/index.html', {
        'bounds': {
            'width': 1100,
            'height': 800
        }
    });
});
