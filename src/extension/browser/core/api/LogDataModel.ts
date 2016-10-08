import {ExtensionLogMessage} from "./ExtensionLogMessage";
import {observable, action} from "mobx";
import {ExtensionCategory} from "./ExtensionCategory";

export class LogDataModel {

  @observable
  private _messages:ExtensionLogMessage[] = [];

  @observable
  private _rootCategories: ExtensionCategory[] = [];

  @action
  addMessage(msg: ExtensionLogMessage): void {
    this._messages.push(msg);
  }

  @action
  addRootCategory(root: ExtensionCategory): void {
    if(root.parent != null) {
      throw new Error("Root category must not have a parent");
    }
    this._rootCategories.push(root);
  }

  get messages(): ExtensionLogMessage[] {
    return this._messages;
  }

  get rootCategories(): ExtensionCategory[] {
    return this._rootCategories;
  }
}
