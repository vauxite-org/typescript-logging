import {Log4TSConfig, Log4TSGroupConfig} from "../log4ts";
import {LogLevel} from "../core";

export function log4TSGroupConfigDebug(config: Log4TSGroupConfig) {
  return `Log4TSGroupConfig=level: ${LogLevel[config.level].toString()}, expression: ${config.expression.toString()}, (omitted functions/channel)`;
}

export function log4TSConfigDebug(config: Log4TSConfig) {
  const groupLog = config.groups.map(g => log4TSGroupConfigDebug(g)).join(", ");
  return `Log4TSGroupConfig=level: ${LogLevel[config.level].toString()}, groups: ${groupLog}, (omitted functions/channel)`;
}
