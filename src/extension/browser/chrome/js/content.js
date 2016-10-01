window.addEventListener("message", function(event) {

  chrome.runtime.sendMessage(event.data.text);

});
