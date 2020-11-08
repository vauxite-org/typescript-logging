import {LogData} from "../LogData";

export type LogDataType = string | LogData | (() => string | LogData);
