import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";

/**
 * Logger which buffers all messages, use with care due to possible high memory footprint.
 * Can be convenient in some cases. Call toString() for full output, or cast to this class
 * and call getMessages() to do something with it yourself.
 */
export class CategoryMessageBufferLoggerImpl extends AbstractCategoryLogger {

  private messages: string[] = [];

  public getMessages(): string[] {
    return this.messages;
  }

  public toString(): string {
    return this.messages.map((msg: string) => {
      return msg;
    }).join("\n");
  }

  protected doLog(msg: CategoryLogMessage): void {
    const messageFormatter = this._getMessageFormatter();
    let fullMsg: string;
    if (messageFormatter === null) {
      fullMsg = this.createDefaultLogMessage(msg);
    }
    else {
      fullMsg = messageFormatter(msg);
    }
    this.messages.push(fullMsg);
  }
}
