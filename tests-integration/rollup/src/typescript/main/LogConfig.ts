import {Log4TSProvider} from "typescript-logging-log4ts-style";
import {CategoryProvider} from "typescript-logging-category-style";
import {LogToIdRawLogChannel} from "./LogToIdRawLogChannel";
import {LogLevel} from "typescript-logging";

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
