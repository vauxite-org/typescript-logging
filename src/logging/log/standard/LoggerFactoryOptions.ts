import {LogGroupRule} from "./LogGroupRule";

/**
 * Options object you can use to configure the LoggerFactory you create at LFService.
 */
export class LoggerFactoryOptions {

  private _logGroupRules: LogGroupRule[] = [];
  private _enabled: boolean = true;

  /**
   * Add LogGroupRule, see {LogGroupRule) for details
   * @param rule Rule to add
   * @returns {LoggerFactoryOptions} returns itself
   */
  public addLogGroupRule(rule: LogGroupRule): LoggerFactoryOptions {
    this._logGroupRules.push(rule);
    return this;
  }

  /**
   * Enable or disable logging completely for the LoggerFactory.
   * @param enabled True for enabled (default)
   * @returns {LoggerFactoryOptions} returns itself
   */
  public setEnabled(enabled: boolean): LoggerFactoryOptions {
    this._enabled = enabled;
    return this;
  }

  get logGroupRules(): LogGroupRule[] {
    return this._logGroupRules;
  }

  get enabled(): boolean {
    return this._enabled;
  }
}
