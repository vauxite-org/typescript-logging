import {CategoryServiceImpl} from "./CategoryService";
import {Category} from "./CategoryLogger";
import {JSONHelper, JSONObject, JSONArray} from "./JSONHelper";
import {CategoryLogMessage} from "./AbstractCategoryLogger";
import {LogLevel} from "./LoggerOptions";
import {MessageFormatUtils} from "./MessageUtils";

/*

   Messages we send/receive must always look like:

   From the extension to us:

   // Request to configure the framework.
   {
     from: "tsl-extension"
     data: {
       type: "configure",
       value: ""
     }
   }


   From us to the extension:

   // Us sending the root categories and their structure
   {
     from: "tsl-logging"
     data: {
       type: "root-categories-tree",
       value: [...]
     }
   },

   // Sending a log message
   {
     from: "tsl-logging"
     data: {
       type: "log-message",
       value: {
       }
     }
   }

 */

export class ExtensionHelper {

  static registered: boolean = false;


  private ExtensionHelper()
  {
    // Private constructor
  }

  /**
   * Enables the window event listener to listen to messages (from extensions).
   * Can be registered/enabled only once.
   */
  static register(): void {
    if(!ExtensionHelper.registered) {
      if(typeof window !== "undefined") {
        window.addEventListener("message", (evt: MessageEvent) => {
          if(evt.source != window) {
            return;
          }

          if(evt.data && evt.data.from && evt.data.data && evt.data.from === "tsl-extension") {

            switch(evt.data.data.type) {
              case "configure":
                console.log("Will configure logger framework for use with chrome extension...");

                CategoryServiceImpl.getInstance().enableExtensionIntegration();
                // Send root categories
                ExtensionHelper.sendRootCategoriesToExtension();
                break;
              default:
                console.log("Unknown command for tsl, command was: " + evt.data.data.type);
                break;
            }
          }

        }, false);
        ExtensionHelper.registered = true;
      }
    }
  }

  /**
   * If extension integration is enabled, will send the root categories over to the extension.
   * Otherwise does nothing.
   */
  static sendRootCategoriesToExtension(): void {
    if(!ExtensionHelper.registered) {
      return;
    }

    const message = new JSONObject();
    const dataObject = new JSONObject();
    message.addString("from","tsl-logging");
    message.addObject("data", dataObject);

    const valueArray = new JSONArray<JSONObject>();
    dataObject.addString("type","root-categories-tree");
    dataObject.addArray("value", valueArray);

    // The value objects sends over nested arrays like:
    /*
      [
          {categoryTreeStructure here}, {each category as element}
      ]
     */

    CategoryServiceImpl.getInstance().getRootCategories().forEach((cat: Category) => {
      valueArray.add(JSONHelper.categoryTreeToJSON(cat));
    });

    ExtensionHelper.sendMessage(message.toString());
  }

  // TODO: Deal with message, also js when logging millis, drops the 0, fix that in general.
  // Consider using error/warn of console, if present in console logger.
  static sendLogMessage(msg: CategoryLogMessage): void {
    if(!ExtensionHelper.registered) {
      return;
    }

    // log-message
    const message = new JSONObject();
    const dataObject = new JSONObject();
    message.addString("from","tsl-logging");
    message.addObject("data", dataObject);

    dataObject.addString("type","log-message");
    const logObject = new JSONObject();
    dataObject.addObject("value", logObject);

    logObject.addString("logLevel", LogLevel[msg.getLevel()].toString());

    const categories = new JSONArray<number>();
    msg.getCategories().forEach((cat : Category) => {
      categories.add(cat.id);
    });
    logObject.addArray("categories", categories);
    logObject.addBoolean("resolvedErrorMessage", msg.isResolvedErrorMessage());

    logObject.addString("errorAsStack", msg.getErrorAsStack());
    logObject.addString("message", msg.getMessage());
    logObject.addString("formattedMessage", MessageFormatUtils.renderDefaultMessage(msg));

    ExtensionHelper.sendMessage(message.toString());
  }

  private static sendMessage(msg: string): void {
    if(!ExtensionHelper.registered) {
      return;
    }

    if(typeof window !== "undefined") {
      console.log("Sending message to extension: " + msg);

      window.postMessage(msg, "*");
    }
  }
}


