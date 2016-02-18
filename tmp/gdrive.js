/**
 * Google drive utils.
 */
var dwv = dwv || {};
dwv.gdrive = dwv.gdrive || {};

// The Browser API key obtained from the Google Developers Console.
// Replace with your own Browser API key, or your own key.
dwv.gdrive.developerKey = "AIzaSyA5YAedAwoQsBZ-TzVEEVkv2ezD5hqe4s0";
// The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
dwv.gdrive.clientId = "544445548355-7pli7rbg578hslnngnkj7ledcg6g5ejo.apps.googleusercontent.com";
// Replace with your own App ID. (Its the first number in your Client ID)
dwv.gdrive.appId = "544445548355";
// Scope to use to access user's Drive items.
dwv.gdrive.scope = ['https://www.googleapis.com/auth/drive.readonly'];

function loadAuthApi() {
  gapi.load('auth', {'callback': dwv.gdrive.onAuthApiLoad});
}

dwv.gdrive.onAuthApiLoad = function () {
  window.gapi.auth.authorize(
    {
      'client_id': dwv.gdrive.clientId,
      'scope': dwv.gdrive.scope.join(' '),
      'immediate': false
    },
    dwv.gdrive.handleAuthResult);
};

dwv.gdrive.handleAuthResult = function (authResult) {
  if (authResult && !authResult.error) {
    dwv.gdrive.loadPickerApi();
  }
};

dwv.gdrive.loadPickerApi = function () {
  gapi.load('picker', {'callback': dwv.gdrive.onPickerApiLoad});
};

// Create and render a Picker object for searching images.
dwv.gdrive.onPickerApiLoad = function () {
    var view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes("application/dicom");
    var picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        //.setAppId(appId)
        //.setDeveloperKey(developerKey)
        .setOAuthToken(gapi.auth.getToken().access_token)
        .addView(view)
        .addView(new google.picker.DocsUploadView())
        .setCallback(dwv.gdrive.loadDriveApi)
        .build();
     picker.setVisible(true);
};

dwv.gdrive.loadDriveApi = function (data) {
  var func = dwv.gdrive.createDriveApiLoad(data);
  gapi.client.load('drive', 'v3', func);
};

dwv.gdrive.createDriveApiLoad = function (data) {
  var f = function () { dwv.gdrive.onDriveApiLoad(data); };
  return f;
};

dwv.gdrive.onDriveApiLoad = function (data) {
  if (data.action == google.picker.Action.PICKED) {
    var fileId = data.docs[0].id;
    var request = gapi.client.drive.files.get({
        'fileId': fileId, 'fields': 'webContentLink'
    });
    request.execute( dwv.gdrive.createViewer );
  }
};

dwv.gdrive.createViewer = function (resp) {
  // main application
  var myapp = new dwv.App();
  // initialise the application
  myapp.init({
      "containerDivId": "dwv",
      "fitToWindow": true,
      "tools": ["Scroll", "Zoom/Pan", "Window/Level"],
      "gui": ["tool"],
      "isMobile": true
  });
  dwv.gui.appendResetHtml(myapp);

  //see https://developers.google.com/api-client-library/javascript/features/cors
  var header = "Bearer " + gapi.auth.getToken().access_token;

  myapp.loadURL([resp.webContentLink], header);

  /*var xhr = new XMLHttpRequest();
  xhr.open('GET', resp.webContentLink);
  xhr.setRequestHeader('Authorization', 'Bearer ' + oauthToken);
  xhr.onload = function(){ console.log("Done!!"); };
  xhr.onerror = function(error){ console.log("Error in request..."); console.log(error); };
  xhr.send();*/
};
