
import {ExtensionCategory} from "./ExtensionCategory";
import {LogDataModel} from "./LogDataModel";

export class ExtensionLogMessage {

  private _logLevel = "Error";
  private _message: string = null;
  private _formattedMessage: string = null;

  private _errorAsStack: string = null;
  private _resolvedErrorMessage: boolean = false;

  private _categories: ExtensionCategory[] = [];

  get logLevel(): string {
    return this._logLevel;
  }

  get message(): any {
    return this._message;
  }

  get formattedMessage(): any {
    return this._formattedMessage;
  }

  get errorAsStack(): any {
    return this._errorAsStack;
  }

  get resolvedErrorMessage(): boolean {
    return this._resolvedErrorMessage;
  }

  get categories(): ExtensionCategory[] {
    return this._categories;
  }

  static create(data: any, logDataModel: LogDataModel): ExtensionLogMessage {
    const logMessage = new ExtensionLogMessage();

    if(data.message) {
      logMessage._message = data.message;
    }
    if(data.logLevel) {
      logMessage._logLevel = data.logLevel;
    }
    if(data.formattedMessage) {
      logMessage._formattedMessage = data.formattedMessage;
    }
    if(data.errorAsStack) {
      logMessage._errorAsStack = data.errorAsStack;
    }
    if(data.resolvedErrorMessage) {
      logMessage._resolvedErrorMessage = data.resolvedErrorMessage;
    }

    if(data.categories) {
      data.categories.forEach((id : number) => {
        const category = logDataModel.getCategoryById(id);
        if(category != null) {
          logMessage._categories.push(category);
        }
      });
    }

    return logMessage;
  }

}

export const ALL_LOG_LEVELS_CATEGORY = ["Fatal","Error","Warn","Info","Debug","Trace"];