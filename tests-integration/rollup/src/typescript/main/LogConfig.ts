import {Log4TSProvider, LogLevel} from "typescript-logging-log4ts-style";
import {CategoryProvider} from "typescript-logging-category-style";
import {LogToIdRawLogChannel} from "./LogToIdRawLogChannel";

export const categoryProvider = CategoryProvider.createProvider("AwesomeCategoryProvider", {
  level: LogLevel.Debug,
  channel: new LogToIdRawLogChannel("logIdCategory"),
});


export const log4TSProvider = Log4TSProvider.createProvider("AwesomeLog4TSProvider", {
  level: LogLevel.Debug,
  channel: new LogToIdRawLogChannel("logIdLog4TS"),
  groups: [{
    expression: new RegExp("model.+"),
  }]
});
