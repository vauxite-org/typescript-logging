import {LogLevel} from "typescript-logging-core";
import {Log4TSGroupConfig} from "../api/Log4TSGroupConfig";
import {Log4TSConfig} from "../api/Log4TSConfig";

export function log4TSGroupConfigDebug(config: Log4TSGroupConfig) {
  return `Log4TSGroupConfig=level: ${LogLevel[config.level].toString()}, expression: ${config.expression.toString()}, (omitted functions/channel)`;
}

export function log4TSConfigDebug(config: Log4TSConfig) {
  const groupLog = config.groups.map(g => log4TSGroupConfigDebug(g)).join(", ");
  return `Log4TSGroupConfig=level: ${LogLevel[config.level].toString()}, groups: ${groupLog}, (omitted functions/channel)`;
}
