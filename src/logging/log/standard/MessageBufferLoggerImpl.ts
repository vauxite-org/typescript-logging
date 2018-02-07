import {AbstractLogger, LogMessage} from "./AbstractLogger";
import {LogGroupRuntimeSettings} from "./LogGroupRuntimeSettings";

/**
 * Logger which buffers all messages, use with care due to possible high memory footprint.
 * Can be convenient in some cases. Call toString() for full output, or cast to this class
 * and call getMessages() to do something with it yourself.
 */
export class MessageBufferLoggerImpl extends AbstractLogger {

  private messages: string[] = [];

  constructor(name: string, logGroupRuntimeSettings: LogGroupRuntimeSettings) {
    super(name, logGroupRuntimeSettings);
  }

  public close(): void {
    this.messages = [];
    super.close();
  }

  public getMessages(): string[] {
    return this.messages;
  }

  public toString(): string {
    return this.messages.map((msg) => {
      return msg;
    }).join("\n");
  }

  protected doLog(message: LogMessage): void {
    const messageFormatter = this._getMessageFormatter();
    let fullMsg: string;
    if (messageFormatter === null) {
      fullMsg = this.createDefaultLogMessage(message);
    }
    else {
      fullMsg = messageFormatter(message);
    }
    this.messages.push(fullMsg);
  }
}
