import {Log4TSConfig} from "./Log4TSConfig";
import {PartialExcept} from "../../util/TypeUtils";

/**
 * Group config for a Log4TSProvider.
 */
export type Log4TSGroupConfig = Omit<Log4TSConfig, "groups"> & {
  readonly expression: RegExp;

  /**
   * Identifier, this is used to make your life easier when you need to dynamically
   * control the log levels of this group and easily wish to recognize it.
   *
   * It is used in Log4TSProvider.updateRuntimeSettings(..) for example as the identifier there.
   *
   * If not set externally, it will be set to the expression's representation as string instead.
   */
  readonly identifier: string;
};

/**
 * Used to configure a group. The expression matching a name and/or path must be specified.
 * All other options are optional and can be omitted, in which case they use
 * the defaults as specified for the Log4TSProvider this group belongs to.
 */
export type Log4TSGroupConfigOptional = Omit<PartialExcept<Log4TSGroupConfig, "expression">, "channel">;
