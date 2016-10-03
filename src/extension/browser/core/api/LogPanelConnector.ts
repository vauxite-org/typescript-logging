import {LogDataModel} from "./LogDataModel";
import {ExtensionLogMessage} from "./ExtensionLogMessage";

export class LogPanelConnector {

  private _dataModel: LogDataModel = new LogDataModel();

  private LogPanelConnector()
  {
    // Private constructor
  }

  addMessage(msg: ExtensionLogMessage): void {
    this._dataModel.addMessage(msg);
  }

  get dataModel(): LogDataModel {
    return this._dataModel;
  }

  static INSTANCE = new LogPanelConnector();
}