chrome.extension.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (message) {

  });

  // Send messages to devtools
  chrome.extension.onMessage.addListener(function (message, sender) {
    port.postMessage(message);
  });
});