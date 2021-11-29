import {ArgumentFormatterType} from "../api/type/ArgumentFormatterType";
import {DateFormatterType} from "../api/type/DateFormatterType";
import {padStart} from "../../util/StringUtil";

/**
 * Default argument formatter function, used by the library, see {@link ArgumentFormatterType}.
 * Can be used by an end user as well if needed.
 * @param arg The argument to format
 * @returns argument stringified to string (JSON.stringify), if arg is undefined returns "undefined" (without quotes).
 */
export function formatArgument(arg: unknown): string {
  if (arg === undefined) {
    return "undefined";
  }
  return JSON.stringify(arg);
}

/**
 * Default date formatter function, used by the library, see {@link DateFormatterType}.
 * Can be used by an end user as well if needed.
 * @param millisSinceEpoch Milliseconds since epoch
 * @returns The date in format: yyyy-MM-dd HH:mm:ss,SSS (example: 2021-02-26 09:06:28,123)
 */
export function formatDate(millisSinceEpoch: number): string {
  const date = new Date(millisSinceEpoch);
  const year = date.getFullYear();
  const month = padStart((date.getMonth() + 1).toString(), 2, "0");
  const day = padStart(date.getDate().toString(), 2, "0");
  const hours = padStart(date.getHours().toString(), 2, "0");
  const minutes = padStart(date.getMinutes().toString(), 2, "0");
  const seconds = padStart(date.getSeconds().toString(), 2, "0");
  const millis = padStart(date.getMilliseconds().toString(), 2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds},${millis}`;
}
