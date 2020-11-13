import {MessageFormatterType} from "./MessageFormatterType";

export type LogMessageType = string | ((formatter: MessageFormatterType) => string);
