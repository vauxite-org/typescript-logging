import {LogLevel} from "../core";
import {EnhancedMap} from "../util/EnhancedMap";

/**
 * Internal loggers are used by the library itself. It allows us to log
 * on a few key points, which is useful when troubleshooting why
 * things don't work as one expects.
 *
 * By default the internal provider logs at Error (so nothing will
 * be shown unless there is an error in setup e.g.).
 */
export interface InternalLogger {
  debug: (msg: () => string) => void;
  info: (msg: () => string) => void;
  warn: (msg: () => string, error?: Error) => void;
  error: (msg: () => string, error?: Error) => void;
}

export function getInternalLogger(name: string): InternalLogger {
  return provider.getLogger(name);
}

/**
 * Can be used to change the *internal* logging of the library.
 * Has no effect on end user logging.
 *
 * As such should normally not be used by end users.
 */
export const $INTERNAL_LOGGING_SETTINGS$ = {
  /**
   * Changes the log level for the internal logging (for all new and existing loggers)
   * @param level New log level
   */
  setInternalLogLevel: (level: LogLevel) => provider.changeLogLevel(level),

  /**
   * Changes where messages are written to for all new and existing loggers),
   * by default they are written to the console.
   * @param fnOutput Function to write messages to
   */
  setOutput: (fnOutput: (msg: string) => void) => provider.changeOutput(fnOutput),

  /**
   * Resets the log level and output back to defaults (level to error and writing to console)
   * for all new and existing loggers.
   */
  reset: () => provider.reset(),
 };

interface InternalProvider {
  getLogger(name: string): InternalLogger;
}

class InternalLoggerImpl implements InternalLogger {

  private readonly _name: string;
  private _level: LogLevel;
  private _fnOutput: (msg: string) => void;

  public constructor(name: string, level: LogLevel, fnOutput: (msg: string) => void) {
    this._name = name;
    this._level = level;
    this._fnOutput = fnOutput;
  }

  public debug(msg: () => string): void {
    this.log(LogLevel.Debug, msg);
  }

  public error(msg: () => string, error: Error | undefined): void {
    this.log(LogLevel.Error, msg);
  }

  public info(msg: () => string): void {
    this.log(LogLevel.Info, msg);
  }

  public warn(msg: () => string, error: Error | undefined): void {
    this.log(LogLevel.Warn, msg);
  }

  public setLevel(level: LogLevel) {
    this._level = level;
  }

  public setOutput(fnOutput: (msg: string) => void) {
    this._fnOutput = fnOutput;
  }

  private log(level: LogLevel, msg: () => string, error?: Error | undefined) {
    if (this._level > level) {
      return;
    }

    // tslint:disable-next-line:no-console
    this._fnOutput(`${LogLevel[this._level].toString()} <INTERNAL LOGGER> ${this._name} ${msg()}${error ? "\n" + error.stack : ""}`);
  }
}

class InternalProviderImpl implements InternalProvider {

  private _logLevel: LogLevel;
  private _fnOutput: (msg: string) => void;

  private readonly _loggers = new EnhancedMap<string, InternalLoggerImpl>();

  constructor() {
    this._logLevel = LogLevel.Error;
    this._fnOutput = this.logConsole;
  }

  public getLogger(name: string): InternalLogger {
    return this._loggers.computeIfAbsent(name, key => new InternalLoggerImpl(key, this._logLevel, this._fnOutput));
  }

  public changeLogLevel(level: LogLevel) {
    this._logLevel = level;
    this._loggers.forEach(logger => logger.setLevel(level));
  }

  public changeOutput(_fnOutput: (msg: string) => void) {
    this._fnOutput = _fnOutput;
    this._loggers.forEach(logger => logger.setOutput(this._fnOutput));
  }

  public reset() {
    this.changeLogLevel(LogLevel.Error);
    this._fnOutput = this.logConsole;
    this._loggers.forEach(logger => logger.setOutput(this._fnOutput));
  }

  private logConsole(msg: string) {
    // tslint:disable-next-line:no-console
    console.log(msg);
  }
}

const provider = new InternalProviderImpl();
