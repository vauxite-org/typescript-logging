import {LogLevel} from "../LoggerOptions";
import {LogGroupRuntimeSettings} from "./LoggerFactoryService";
import {AbstractLogger, LogMessage} from "./AbstractLogger";

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
    this.messages.push(this.createDefaultLogMessage(message));
  }
}
