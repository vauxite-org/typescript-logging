import {LogChannel} from "../LogChannel";
import {RawLogChannel} from "../RawLogChannel";

export type LogChannelType = LogChannel | RawLogChannel;


// export type TypeOf<T> = T extends { type: infer U } ? U : never;
