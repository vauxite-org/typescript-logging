import {AbstractNodeChannel} from "./AbstractNodeChannel";
import {RawLogChannel, RawLogMessage} from "typescript-logging";
import {RetentionStrategy} from "../api/RetentionStrategy";
import {NodeChannelOptions} from "../api/NodeChannelOptions";

/**
 * Node Channel implementation of type RawLogChannel.
 */
export class NodeRawLogChannel extends AbstractNodeChannel implements RawLogChannel {

  private readonly _writeRawLogMessage: (msg: RawLogMessage, formatArg: (arg: any) => string) => string;

  public constructor(retentionStrategy: RetentionStrategy, writeRawLogMessage: (msg: RawLogMessage, formatArg: (arg: any) => string) => string, options?: NodeChannelOptions) {
    super(retentionStrategy, options);
    this._writeRawLogMessage = writeRawLogMessage;
  }

  public get type(): "RawLogChannel" {
    return "RawLogChannel";
  }

  public write(msg: RawLogMessage, formatArg: (arg: any) => string): void {
    const result = this._writeRawLogMessage(msg, formatArg);
    this.writeMessage(result);
  }
}
