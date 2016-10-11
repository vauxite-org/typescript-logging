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

   // Sending change of log level
   {
     from: "tsl-extension"
     data: {
       type: "configure-log-level",
       value: {
         categoryId: 1,
         logLevel: "Debug",
         recursive: true
       }
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
   },

   // Update one or more categories
   {
     from: "tsl-logging"
     data: {
       type: "categories-rt-update",
       value: [...]
     }
   },

 */

export class ExtensionHelper {

  static registered: boolean = false;


  private constructor()
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
              case "configure-log-level":


                /*
                  The value is represented as:
                   value: {
                     categoryId: 1,
                     logLevel: "Debug",
                     recursive: true
                   }
                 */
                if(evt.data.data.value) {
                  const dataValue: any = evt.data.data.value;
                  const catId: number = dataValue.categoryId;
                  const logLevel: string = dataValue.logLevel;
                  const recursive: boolean = dataValue.recursive;

                  const catsApplied = ExtensionHelper.applyLogLevel(catId, logLevel, recursive);
                  if(catsApplied.length > 0) {
                    // Send changes back
                    ExtensionHelper.sendCategoriesRuntimeUpdateMessage(catsApplied);
                  }
                }
                else {
                  console.log("Dropping configure-log-level message, it is not valid");
                }

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
      valueArray.add(JSONHelper.categoryToJSON(cat, true));
    });

    ExtensionHelper.sendMessage(message.toString());
  }

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

  static sendCategoriesRuntimeUpdateMessage(categories: Category[]): void {
    if(!ExtensionHelper.registered) {
      return;
    }

    const message = new JSONObject();
    const dataObject = new JSONObject();
    message.addString("from","tsl-logging");
    message.addObject("data", dataObject);

    const valueArray = new JSONArray<JSONObject>();
    dataObject.addString("type","categories-rt-update");
    dataObject.addArray("value", valueArray);

    // The value objects sends over nested arrays like:
    /*
     [
     {id: 1,logLevel:"Debug"}, {id: 2,logLevel:"Warn"}
     ]
     */
    const service = CategoryServiceImpl.getInstance();

    categories.forEach((cat: Category) => {

      const value = new JSONObject();
      value.addNumber("id", cat.id);
      value.addString("logLevel", LogLevel[service.getCategorySettings(cat).logLevel].toString());
      valueArray.add(value);
    });

    ExtensionHelper.sendMessage(message.toString());
  }

  private static applyLogLevel(categoryId: number, logLevel: string, recursive: boolean): Category[] {
    console.log("Will change log level for category with id: " + categoryId + ", to logLevel=" + logLevel + ", recursive=" + recursive);

    const cats: Category[] = [];

    const category = CategoryServiceImpl.getInstance().getCategoryById(categoryId);
    if(category != null) {
      ExtensionHelper._applyLogLevelRecursive(category, LogLevel.fromString(logLevel), recursive, cats);
    }
    else
    {
      console.log("Could not change log level, failed to find category with id: " + categoryId);
    }

    return cats;
  }

  private static _applyLogLevelRecursive(category: Category, logLevel: LogLevel, recursive: boolean, cats: Category[]): void {
    CategoryServiceImpl.getInstance().getCategorySettings(category).logLevel = logLevel;

    cats.push(category);

    console.log("LogLevel for category: " + category.name + ", changed to level: " + LogLevel[logLevel].toString());

    if(recursive) {
      category.children.forEach((child : Category) => {
        ExtensionHelper._applyLogLevelRecursive(child, logLevel, recursive, cats);
      });
    }
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


