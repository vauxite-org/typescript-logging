import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";

/**
 * Logger which buffers all messages, use with care due to possible high memory footprint.
 * Can be convenient in some cases. Call toString() for full output, or cast to this class
 * and call getMessages() to do something with it yourself.
 */
export class CategoryMessageBufferLoggerImpl extends AbstractCategoryLogger {

  private messages: string[] = [];

  protected doLog(msg: CategoryLogMessage): void {
    const fullMsg = this.createDefaultLogMessage(msg);
    this.messages.push(fullMsg);
  }

  getMessages(): string[] {
    return this.messages;
  }

  toString(): string {
    return this.messages.map(msg => {
      return msg;
    }).join("\n");
  }
}