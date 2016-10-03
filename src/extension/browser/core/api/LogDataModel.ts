import {ExtensionLogMessage} from "./ExtensionLogMessage";
import {observable, action} from "mobx";

export class LogDataModel {

  @observable
  private _messages:ExtensionLogMessage[] = [];

  @action
  addMessage(msg: ExtensionLogMessage): void {
    this._messages.push(msg);
  }

  get messages(): ExtensionLogMessage[] {
    return this._messages;
  }
}
