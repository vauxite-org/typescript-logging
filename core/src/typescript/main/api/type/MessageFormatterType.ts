/**
 * Formatter function to format a message with arguments. A message may contain 0 or more arguments.
 * An argument can be added to a message using: {}.
 *
 * The formatter is available when using the lambda function when logging a message,
 * see the example below.
 *
 * An example: log.debug(fmt => fmt("My name is a {}, and I am from {}.", "secret", "a country"));
 */
export type MessageFormatterType = (message: string, messageArgs: ReadonlyArray<any>) => string;
