import {LogChannel} from "../LogChannel";
import {RawLogChannel} from "../RawLogChannel";

/**
 * The type of the LogChannel. The channel is used to send
 * log statements to. The channel must either be a normal LogChannel
 * or a RawLogChannel. The normal one is the easiest one to use
 * as it will receive complete log messages.
 * The raw channel gets a the raw log message, and allows complete
 * control on how to log a message.
 */
export type LogChannelType = LogChannel | RawLogChannel;
