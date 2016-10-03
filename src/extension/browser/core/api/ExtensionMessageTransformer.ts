import {ExtensionLogMessage} from "./ExtensionLogMessage";

export class ExtensionMessageTransformer {

  private ExtensionMessageTransformer()
  {
    // Private constructor
  }

  createLogMessage(data: any): ExtensionLogMessage {
    return ExtensionLogMessage.create(data);
  }

  static INSTANCE = new ExtensionMessageTransformer();
}