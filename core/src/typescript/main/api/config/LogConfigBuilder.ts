import {LogLevel} from "../LogLevel";
import {LogStyleCfg} from "./LogStyleValue";
import {LogRuntime} from "../LogRuntime";
import {LogChannelTypes} from "../type/LogChannelTypes";
import {LogConfig} from "./LogConfig";
import {DateFormatter} from "../DateFormatter";
import {ArgumentFormatter} from "../ArgumentFormatter";

export interface LogConfigBuilder {

  setDateFormatter(formatter: DateFormatter): LogConfigBuilder;
  setLevel(level: LogLevel): LogConfigBuilder;
  setStyle(type: LogStyleCfg): LogConfigBuilder;
  setChannel(channel: (runtime: LogRuntime) => LogChannelTypes): LogConfigBuilder;
  setFormatterArgument(formatter: ArgumentFormatter): LogConfigBuilder;

  finish(): LogConfig;
}

// tslint:disable-next-line:no-namespace
export namespace LogConfigBuilder {

  export function create(): LogConfigBuilder {
    throw new Error("TODO");
  }
}
