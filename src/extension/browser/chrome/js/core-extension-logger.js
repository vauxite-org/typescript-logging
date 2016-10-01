// Expose the logger for the extension so we can log stuff for the extension, eat your own dog food! ;)
var logger = null;
(function() {
  var loggerFactory = TSL.LFService.createLoggerFactory();
  logger = loggerFactory.getLogger("Extension");
  logger.doLog = function(msg) {
    var elem = document.getElementById('debugExtensionOutput');
    if(elem != null) {
      elem.innerText = elem.innerText + '\n' + msg;
    }
    else {
      console.log("Dropped message: " + msg);
    }
  }
})();
logger.info("Logger loaded for extension...");
