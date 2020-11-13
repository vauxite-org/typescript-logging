import {CoreLogger} from "../main/impl/CoreLogger";
import {LogLevel} from "../main/api/LogLevel";
import {RawLogMessage} from "../main/api/RawLogMessage";
import {RawLogChannel} from "../main/api/RawLogChannel";
import {formatMessage} from "../main/impl/DefaultFormatters";

describe("Test core logger", () => {

  it ("Test formatting", () => {
    const channel = new ArrayChannel();
    const log = new CoreLogger({
      level: LogLevel.Debug,
      id: 1, channel,
      name: "Main",
      dateFormatter: _ => "YYYY-MM-DDDD",
      argumentFormatter: arg => arg.toString(),
      messageFormatter: formatMessage });
    // No formatting
    log.debug("Hello");
    log.debug("Dance1", new Error("X"));

    // Formatting
    log.debug(fmt => fmt("Dance: {}", ["2"]));
    log.debug(fmt => fmt("Dance: {} and {}", [1000, "2000"]));

    // Formatting tags but no additional args
    log.debug(fmt => fmt("Dance: {}", []));
    log.debug(fmt => fmt("Dance: {} and {}", []), new Error("y"));

    // Formatting with too many args, unused args are ignored.
    log.debug(fmt => fmt("Dance: {}", ["Friend", "Foe"]));

    expect(channel.messages).toEqual(["Hello", "Dance1", `Dance: '2'`, `Dance: '1000' and '2000'`, "Dance: {}", "Dance: {} and {}", `Dance: 'Friend'`]);
    expect(channel.errors).toEqual([undefined, new Error("X"), undefined, undefined, undefined, new Error("y"), undefined]);
  });
});

class ArrayChannel implements RawLogChannel {

  private readonly _buffer: RawLogMessage[] = [];
  public readonly type = "RawLogChannel";

  public write(msg: RawLogMessage, _: (arg: any) => string): void {
    this._buffer.push(msg);
  }

  public get messages(): ReadonlyArray<string> {
    return this._buffer.map(m => m.message);
  }

  public get errors(): ReadonlyArray<Error | undefined> {
    return this._buffer.map(m => m.exception);
  }
}
