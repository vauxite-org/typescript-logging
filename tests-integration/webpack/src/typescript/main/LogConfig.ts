import {LogToIdRawLogChannel} from "./LogToIdRawLogChannel";
import {CategoryProvider, Log4TSProvider, LogLevel} from "typescript-logging";

export const logChannel: LogToIdRawLogChannel = new LogToIdRawLogChannel();

export const categoryProvider = CategoryProvider.createProvider("AwesomeCategoryProvider", {
  level: LogLevel.Debug,
  channel: logChannel,
});

export const log4TSProvider = Log4TSProvider.createProvider("AwesomeLog4TSProvider", {
  level: LogLevel.Debug,
  channel: logChannel,
  groups: [{
    expression: new RegExp("model.+"),
  }]
});
