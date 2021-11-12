import {LogLevel, RawLogChannel, RawLogMessage} from "typescript-logging-log4ts-style";

export class LogToIdRawLogChannel implements RawLogChannel {

  private readonly _element: HTMLTextAreaElement;

  public readonly type: "RawLogChannel" = "RawLogChannel";

  public constructor(elementId: string) {
    const tmpElem = document.getElementById(elementId);
    if (tmpElem === null) {
      throw new Error(`Failed to find an element by id ${elementId}`);
    }
    this._element = tmpElem as HTMLTextAreaElement;
  }

  public write(msg: RawLogMessage, _: (arg: unknown) => string): void {
    let result = this._element.value;
    result += `${LogLevel[msg.level]} ${msg.message}\n`;
    this._element.value = result;
  }
}
