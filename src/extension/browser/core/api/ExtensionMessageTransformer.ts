import {ExtensionLogMessage} from "./ExtensionLogMessage";
import {ExtensionCategory} from "./ExtensionCategory";
import {LogDataModel} from "./LogDataModel";

export class ExtensionMessageTransformer {

  private ExtensionMessageTransformer()
  {
    // Private constructor
  }

  createLogMessage(data: any, dataModel: LogDataModel): ExtensionLogMessage {
    return ExtensionLogMessage.create(data, dataModel);
  }

  createRootCategory(data: any): ExtensionCategory {
    return ExtensionCategory.create(data);
  }

  static INSTANCE = new ExtensionMessageTransformer();
}