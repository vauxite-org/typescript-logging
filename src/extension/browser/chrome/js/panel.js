
window.addEventListener("message", function(event) {


  var data = event.data;

  // {"type":"log-message","value":{}" }
  if(data.type && data.value) {

    switch(data.type) {
      case "log-message":
        var logMessage = RCT.extensionMessageTransformer.createLogMessage(data.value);
        logger.info("Converted to logMessage: " + JSON.stringify(logMessage));
        RCT.connector.addMessage(logMessage);
        break;
      case "root-categories-tree":
        if(!(data.value instanceof Array)) {
          logger.error("Expected value to be array with categories, not an array, got: " + JSON.stringify(data.value));
          return;
        }

        data.value.forEach(function(cat) {
          var extensionCategory = RCT.extensionMessageTransformer.createRootCategory(cat);
          // Do NOT use stringify, circular structure. cba to fix that for stringify.
          logger.info("Converted to extensionCategory: " + extensionCategory.name);
          RCT.connector.addRootCategory(extensionCategory);
        });
        break;
      case "categories-rt-update":
        if(!(data.value instanceof Array)) {
          logger.error("Expected value to be array with categories, not an array, got: " + JSON.stringify(data.value));
          return;
        }
        data.value.forEach(function(cat) {
          var extensionCategory = RCT.connector.getCategoryById(cat.id);
          if(extensionCategory != null) {
            // Do NOT use stringify, circular structure. cba to fix that for stringify.
            extensionCategory.applyLogLevel(cat.logLevel);
            logger.info("Found extensionCategory: " + extensionCategory.name + ", applied logLevel");
          }
        });
        break;
      default:
        throw new Error("Unsupported type: " + actualData.type);
    }
  }
  else {
    logger.warn("Dropping message (invalid/unsupported format): " + event.data);
  }


}, false);


function sendMessageToDevTools(msg) {
  chrome.runtime.sendMessage(null, msg);
  //portToDevTools.postMessage(msg);
}


/**
 * OUR extension logging, do not confuse with logging we monitor.
 * @param msg Message
 */
function sendLogMessage(msg) {
  logger.info(msg);
}