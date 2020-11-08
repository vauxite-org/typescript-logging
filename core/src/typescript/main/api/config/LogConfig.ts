import {DateFormatter} from "../DateFormatter";
import {LogLevel} from "../LogLevel";
import {LogStyleCfg} from "./LogStyleValue";
import {LogRuntime} from "../LogRuntime";
import {LogChannelTypes} from "../type/LogChannelTypes";
import {ArgumentFormatter} from "../ArgumentFormatter";
import {Logger} from "../Logger";

export interface LogConfig {
  readonly settings: LogSettings;
  readonly getLogger: (name: string) => Logger;
}

export interface LogSettings {
  readonly argumentFormatter: ArgumentFormatter;
  readonly dateFormatter: DateFormatter;
  readonly level: LogLevel;
  readonly style: LogStyleCfg;
  readonly channel: (runtime: LogRuntime) => LogChannelTypes;
}

/*
   Category requires a parent so: getLogger(name) is not sufficient.

   If we'd split up log4js and catstyle logging, each would have
   their own logconfig to create with. But in the end they must
   be able to deliver a LogRuntime (and LogSettings).

   So the builders would be in their respective packages too.
 */
