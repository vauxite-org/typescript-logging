
window.addEventListener("message", function(event) {

  // TODO: This should not go here.
  if(event.data && typeof event.data === "string") {
    var data = JSON.parse(event.data);


    // {"type":"log-message","value":{}" }
    if(data.type && data.value) {

      switch(data.type) {
        case "log-message":
          var logMessage = RCT.extensionMessageTransformer.createLogMessage(data.value);
          logger.info("Converted to logMessage: " + JSON.stringify(logMessage));
          RCT.connector.addMessage(logMessage);
          break;
        default:
          throw new Error("Unsupported type: " + actualData.type);
      }
    }
    else {
      logger.debug("Dropping message (invalid/unsupported format): " + event.data);
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