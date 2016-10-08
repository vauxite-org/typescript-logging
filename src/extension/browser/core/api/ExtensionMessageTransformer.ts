import {ExtensionLogMessage} from "./ExtensionLogMessage";
import {ExtensionCategory} from "./ExtensionCategory";

export class ExtensionMessageTransformer {

  private ExtensionMessageTransformer()
  {
    // Private constructor
  }

  createLogMessage(data: any): ExtensionLogMessage {
    return ExtensionLogMessage.create(data);
  }

  createRootCategory(data: any): ExtensionCategory {
    return ExtensionCategory.create(data);
  }

  static INSTANCE = new ExtensionMessageTransformer();
}