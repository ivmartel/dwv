/* global chrome */
chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('../viewers/mobile/index.html', {
        'bounds': {
            'width': 1100,
            'height': 800
        }
    });
});