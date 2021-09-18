import {RetentionStrategy} from "../api";
import {AbstractNodeChannel} from "./AbstractNodeChannel";
import {LogChannel, LogMessage} from "typescript-logging";
import * as os from "os";
import {NodeChannelOptions} from "../api/NodeChannelOptions";

/**
 * Node Channel implementation of type LogChannel.
 */
export class NodeLogChannel extends AbstractNodeChannel implements LogChannel {

  public constructor(retentionStrategy: RetentionStrategy, options?: NodeChannelOptions) {
    super(retentionStrategy, options);
  }

  public get type(): "LogChannel" {
    return "LogChannel";
  }

  public write(msg: LogMessage): void {
    const fullMsg = msg.message + (msg.error ? `\n${msg.error}` : "") + os.EOL;
    this.writeMessage(fullMsg);
  }
}

