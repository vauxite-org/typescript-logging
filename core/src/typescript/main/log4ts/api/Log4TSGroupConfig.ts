import {Log4TSConfig} from "./Log4TSConfig";
import {PartialExcept} from "../../util/TypeUtils";

/**
 * Group config for a Log4TSProvider.
 */
export type Log4TSGroupConfig = Omit<Log4TSConfig, "groups"> & {
  readonly expression: RegExp;
}

/**
 * Used to configure a group. The expression matching a name and/or path must be specified.
 * All other options are optional and can be omitted, in which case they use
 * the defaults as specified for the Log4TSProvider this group belongs to.
 */
export type Log4TSGroupConfigOptional = PartialExcept<Log4TSGroupConfig, "expression">;
