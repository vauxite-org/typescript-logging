
window.addEventListener("message", function(event) {
  // We only accept messages from ourselves
  //if (event.source != window) {
  //  return;
  //}

  //if (event.data.type && event.data.type == "FROM_PAGE") {
  //  console.log("Content script received: " + event.data.text);
    //port.postMessage(event.data.text);
  //}

  //logger.info("Test test");

  //if(event.data.type && event.data.type == "category-extension-logger") {
    //console.log("Fuck you: " + event.data.text);
    //logger.info("Category extension logger: " + data.text);
  //}
  logger.info(event.data.text);
}, false);

function sendLogMessage(msg) {
  logger.info(msg);
}