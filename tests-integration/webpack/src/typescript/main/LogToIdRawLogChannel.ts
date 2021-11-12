import {LogLevel, RawLogChannel, RawLogMessage} from "typescript-logging-log4ts-style";

export class LogToIdRawLogChannel implements RawLogChannel {

  private _writeValue: ((value: string) => void) | null = null;
  public readonly type: "RawLogChannel" = "RawLogChannel";

  public constructor() {
    this.setWriteValue = this.setWriteValue.bind(this);
  }

  public setWriteValue(value: ((value: string) => void)): void {
    this._writeValue = value;
  }

  public write(msg: RawLogMessage, _: (arg: unknown) => string): void {
    if (this._writeValue !== null) {
      this._writeValue(`${msg.logNames} ${LogLevel[msg.level]} ${msg.message}\n`);
    }
  }
}
