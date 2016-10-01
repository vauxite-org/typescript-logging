
window.addEventListener("message", function(event) {

  // TODO: This should not go here.
  if(event.data && typeof event.data === "string") {
    var data = JSON.parse(event.data);

    console.log("Panel received: " + event.data);

    switch(data.type) {
      case "log-message":
        var elem = document.getElementById('logPanel');
        elem.innerText = elem.innerText + '\n' + data.value;
        break;
      default:
        throw new Error("Unsupported type: " + event.data);
    }
  }

}, false);

/**
 * OUR extension logging, do not confuse with logging we monitor.
 * @param msg Message
 */
function sendLogMessage(msg) {
  logger.info(msg);
}