var windowMainPanel = null;

chrome.devtools.panels.create("SuperPanel",
  "images/icon.png",
  "panel.html",
  function(panel) {

    panel.onShown.addListener(function tmp(windowPanel) {
      windowMainPanel = windowPanel;

      // We only need to configure the logger framework once.
      panel.onShown.removeListener(tmp);

      // Send configure message
      chrome.devtools.inspectedWindow.eval(
        "window.postMessage({ type: 'tsl-chrome-extension', text: 'configure-for-extension' }, '*')",
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

//Handle response received from background page.
port.onMessage.addListener(function(msg) {
  windowMainPanel.postMessage({"type":"logMessage","text": msg}, "*");
});




