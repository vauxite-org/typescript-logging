import {LogLevel} from "typescript-logging-core";
import {CategoryConfig} from "../api/CategoryConfig";

export function categoryConfigDebug(config: CategoryConfig) {
  return `CategoryConfig=level: ${LogLevel[config.level].toString()}, allowSameCategoryName=${config.allowSameCategoryName}`;
}
