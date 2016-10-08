import {LogDataModel} from "./LogDataModel";
import {ExtensionLogMessage} from "./ExtensionLogMessage";
import {ExtensionCategory} from "./ExtensionCategory";

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

  get dataModel(): LogDataModel {
    return this._dataModel;
  }

  static INSTANCE = new LogPanelConnector();
}