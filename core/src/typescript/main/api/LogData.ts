/**
 *
 */
import {ArgumentFormatter} from "./ArgumentFormatter";

export interface LogData {
  readonly message: string;

  /**
   * Optional function to format an argument of this message. Overrides the global formatArg function (if set).
   */
  readonly formatArg?: ArgumentFormatter;
}
