import {LogChannel} from "../../api/LogChannel";
import {LogMessage} from "../../api/LogMessage";

/* tslint:disable:no-console */

/**
 * Default standard LogChannel which logs to console.
 */
export class ConsoleChannel implements LogChannel {

  public readonly type: "LogChannel" = "LogChannel";

  public write(msg: LogMessage): void {
    if (console && console.log) {
      console.log(msg.message + (msg.error ? `\n${msg.error}` : ""));
    }
  }
}
