import {LogDataModel} from "./LogDataModel";
import {ExtensionLogMessage} from "./ExtensionLogMessage";
import {ExtensionCategory} from "./ExtensionCategory";
import {JSONObject} from "../../../../logging/JSONHelper";

declare var sendMessageToDevTools: any;

export class LogPanelConnector {

  private _dataModel: LogDataModel = new LogDataModel();

  private LogPanelConnector()
  {
    // Private constructor
  }

  addMessage(msg: ExtensionLogMessage): void {
    this._dataModel.addMessage(msg);
  }

  addRootCategory(cat: ExtensionCategory): void {
    this._dataModel.addRootCategory(cat);
  }

  getCategoryById(id: number): ExtensionCategory {
    return this._dataModel.getCategoryById(id);
  }

  sendChangeLogLevel(cat: ExtensionCategory, logLevel: string, recursive: boolean): void {
    /*
     from: "tsl-extension"
     data: {
       type: "configure-log-level",
       value: {
         categoryId: 1,
         logLevel: "Debug",
         recursive: true
       }
     }
     */
    const msg = new JSONObject();
    const dataObject = new JSONObject();
    const valueObject = new JSONObject();

    msg.addString("from", "tsl-extension");
    msg.addObject("data", dataObject);

    dataObject.addString("type","configure-log-level");
    dataObject.addObject("value", valueObject);

    valueObject.addNumber("categoryId", cat.id);
    valueObject.addString("logLevel", logLevel);
    valueObject.addBoolean("recursive", recursive);

    sendMessageToDevTools(msg.toString());
  }


  get dataModel(): LogDataModel {
    return this._dataModel;
  }

  static INSTANCE = new LogPanelConnector();
}