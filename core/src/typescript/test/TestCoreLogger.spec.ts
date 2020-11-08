import {CoreLogger} from "../main/impl/CoreLogger";
import {LogLevel} from "../main/api/LogLevel";
import {RawLogMessage} from "../main/api/RawLogMessage";
import {RawLogChannel} from "../main/api/RawLogChannel";

describe("Test core logger", () => {

  it ("Test formatting", () => {
    const channel = new ArrayChannel();
    const log = new CoreLogger({ logLevel: LogLevel.Debug, channel, name: "Main", dateFormatter: _ => "YYYY-MM-DDDD", argumentFormatter: arg => arg.toString()});
    // No formatting
    log.debug("Hello");
    log.debug("Dance1", new Error("X"));

    // Formatting
    log.debug("Dance: {}", "2");
    log.debug("Dance: {} and {}", 1000, "2000");

    // Formatting tags but no additional args
    log.debug("Dance: {}");
    log.debug("Dance: {} and {}", new Error("y"));

    // Formatting with too many args, left over should end up as remaining arg.
    log.debug("Dance: {}", "Friend", "Foe");

    expect(channel.messages).toEqual(["Hello", "Dance1", `Dance: 2`, `Dance: 1000 and 2000`, "Dance: {}", "Dance: {} and {}", `Dance: Friend`]);
    expect(channel.errors).toEqual([undefined, new Error("X"), undefined, undefined, undefined, new Error("y"), undefined]);
    expect(channel.remainingArgs).toEqual([undefined,undefined,undefined,undefined,undefined,undefined,["Foe"]]);
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

  public get remainingArgs(): ReadonlyArray<any[] | undefined> {
    return this._buffer.map(m => m.args)
  }
}
