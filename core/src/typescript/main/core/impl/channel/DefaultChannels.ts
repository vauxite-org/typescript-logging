import {LogChannel} from "../../api/LogChannel";
import {ConsoleLogChannel} from "./ConsoleLogChannel";

/* tslint:disable:no-namespace */

/**
 * Provides access to various default channels provided by typescript logging.
 */
export namespace DefaultChannels {
  /**
   * Create a new standard LogChannel that logs to the console.
   */
  export function createConsoleChannel(): LogChannel {
    return new ConsoleLogChannel();
  }
}
