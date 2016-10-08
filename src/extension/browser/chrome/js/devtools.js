var windowMainPanel = null;

chrome.devtools.panels.create("Logging",
  "images/icon.png",
  "panel.html",
  function(panel) {

    panel.onShown.addListener(function tmp(windowPanel) {
      windowMainPanel = windowPanel;

      // We only need to configure the logger framework once.
      panel.onShown.removeListener(tmp);

      // Send configure message
      var msg = "{ 'from': 'tsl-extension','data': { 'type':'configure','value': null }}";
      chrome.devtools.inspectedWindow.eval(
        "window.postMessage(" + msg + ",'*')",
        function(result, isException) {
          if(isException) {
            windowMainPanel.sendLogMessage("Configuration message was not successfully sent, extension will not work.");
          }
          else {
            windowMainPanel.sendLogMessage("Configuration message successfully sent.");
          }
        }
      );

    });
  }
);

// Create a port with the background page
var port = chrome.extension.connect({ name: "background-comm" });

// Handle response received from background page.
port.onMessage.addListener(function(msg) {
   /*
   Take action on each message from the login framework (not ours, the page we monitor!)
   Message from the extension will always look like this, where type differs and value obviously depends
   on the type.
   {
     from: "tsl-logging"
     data: {
       type: "root-categories-tree",
       value: any
     }
   }
   */
  if(typeof msg === "string") {
    windowMainPanel.sendLogMessage("devtools received string msg to process: " + msg);
  }
  else {
    windowMainPanel.sendLogMessage("devtools received non-string msg to process: " + JSON.stringify(msg));
  }

  if(typeof msg === "string") {

    console.log("string msg in devtools: " + msg);

    var data = JSON.parse(msg);
    if (data.from && data.data && data.from === "tsl-logging") {
      var msgData = data.data;
      if (msgData.type && msgData.value) {
        switch (msgData.type) {
          case "log-message":
            windowMainPanel.postMessage(msgData, "*");
            break;
          case "root-categories-tree":
            windowMainPanel.postMessage(msgData, "*");
            break;
          default:
            throw new Error("Unsupported message type was sent: " + msg);
        }
      }
      else {
        throw new Error("Invalid message was sent: " + msg);
      }
    }
  }
});




