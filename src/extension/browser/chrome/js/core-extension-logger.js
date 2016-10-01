// Expose the logger for the extension, eat your own dog food! ;)
var logger = null;
(function() {
  var loggerFactory = TSL.LFService.createLoggerFactory();
  logger = loggerFactory.getLogger("Extension");
  logger.doLog = function(msg) {
    var elem = document.getElementById('debugExtension');
    if(elem != null) {
      elem.innerText = msg;
    }
    else {
      console.log("Dropped message: " + msg);
    }
  }
})();
logger.info("Logger loaded for extension...");
