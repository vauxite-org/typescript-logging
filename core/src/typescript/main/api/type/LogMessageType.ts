import {MessageFormatterType} from "./MessageFormatterType";

/**
 * The LogMessage type, the message that is logged. Either a string, or a lambda
 * function returning a string. Note that the lambda function has a formatter
 * available, which allows formatting of a message if needed.
 *
 * For example: log.debug(fmt => fmt("My name is a {}, and I am from {}.", "secret", "a country"));
 */
export type LogMessageType = string | ((formatter: MessageFormatterType) => string);
