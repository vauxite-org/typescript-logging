import {MessageArgumentFormatterType} from "../api/type/MessageArgumentFormatterType";

export function formatMessage(message: string, messageArgs: ReadonlyArray<any>, messageArgumentFormatter?: MessageArgumentFormatterType): string {
  let result = "";
  let indexArg = 0;
  for (let i = 0; i < message.length;) {

    // No args left, don't bother to format anymore.
    if (indexArg >= messageArgs.length) {
      result += message.substring(i);
      break;
    }

    /*
     * See if we can find {} to format.
     *
     * TODO: Allow escape of {}
     */
    const c = message.charAt(i);
    if ((i + 1) < message.length && c === "{" && message.charAt(i + 1) === "}") {
      result +=  messageArgumentFormatter ? messageArgumentFormatter(messageArgs[indexArg++]) : formatMessageArgument(messageArgs[indexArg++]);
      i += 2;
    }
    else {
      result += c;
      i += 1;
    }
  }
  return result;
}

export function formatMessageArgument(arg: any): string {
  if (typeof arg === "undefined") {
    return "undefined";
  }
  return `'${arg.toString()}'`;
}

export function formatArgument(arg: any): string {
  return JSON.stringify(arg);
}
