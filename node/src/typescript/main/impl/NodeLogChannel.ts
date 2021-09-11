import {RetentionStrategy} from "../api/RetentionStrategy";
import {AbstractNodeChannel} from "./AbstractNodeChannel";
import {LogChannel, LogMessage} from "typescript-logging";

/**
 * Node Channel implementation of type LogChannel.
 */
export class NodeLogChannel extends AbstractNodeChannel implements LogChannel {

  public constructor(retentionStrategy: RetentionStrategy) {
    super(retentionStrategy);
  }

  public get type(): "LogChannel" {
    return "LogChannel";
  }

  public write(msg: LogMessage): void {
    const fullMsg = msg.message + (msg.error ? `\n${msg.error}` : "") + "\n";
    this.writeMessage(fullMsg);
  }
}

