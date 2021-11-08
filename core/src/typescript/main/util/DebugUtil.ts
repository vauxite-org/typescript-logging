import {LogLevel} from "../core";
import {CategoryConfig} from "../category";

export function categoryConfigDebug(config: CategoryConfig) {
  return `CategoryConfig=level: ${LogLevel[config.level].toString()}, allowSameCategoryName=${config.allowSameCategoryName}`;
}
