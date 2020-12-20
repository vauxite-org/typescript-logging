import {CoreLogger} from "../main/impl/CoreLogger";
import {LogLevel} from "../main/api/LogLevel";
import {RawLogMessage} from "../main/api/RawLogMessage";
import {RawLogChannel} from "../main/api/RawLogChannel";
import {formatArgument, formatDate, formatMessage} from "../main/impl/DefaultFormatters";
import {LogChannel} from "../main/api/LogChannel";
import {LogMessage} from "../main/api/LogMessage";

describe("Test core logger", () => {

  it ("Test logger level", () => {
    assertLogLevels(LogLevel.Trace);
    assertLogLevels(LogLevel.Debug);
    assertLogLevels(LogLevel.Info);
    assertLogLevels(LogLevel.Warn);
    assertLogLevels(LogLevel.Error);
    assertLogLevels(LogLevel.Fatal);
  });

  it ("Test formatting", () => {
    const channel = new RawArrayChannel();
    const log = new CoreLogger({
      level: LogLevel.Debug,
      id: 1, channel,
      name: "Main",
      dateFormatter: millis => formatDate(millis),
      argumentFormatter: arg => formatArgument(arg),
      messageFormatter: formatMessage
    });

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

  it("Test arguments formatting",() => {
    const [log, channel] = createDefaultLogger(LogLevel.Debug);

    log.debug("Hello!", ["A"]);
    log.debug("Hello!", ["A", 4, undefined, null, ["dance", "again"]]);
    log.debug("Hello!", new Error("fail"), ["A", 4, undefined, null, ["dance", "again"]]);

    expect(channel.messages).toEqual(
      [`XXX [Main] Hello! ["A"]`,
        `XXX [Main] Hello! ["A", 4, undefined, null, ["dance","again"]]`,
        `XXX [Main] Hello! ["A", 4, undefined, null, ["dance","again"]]`,
      ]
    );
  });

  function assertLogLevels(logLevel: LogLevel) {
    const input = ["trace","debug","info","warn","error","fatal"];
    const [log, channel] = createDefaultLogger(logLevel);
    log.trace(input[0]);
    log.debug(input[1]);
    log.info(input[2]);
    log.warn(input[3]);
    log.error(input[4]);
    log.fatal(input[5]);

    const idx: number = logLevel;
    const expected = input.slice(idx).map(v => "XXX [Main] " + v);
    expect(channel.messages).toEqual(expected);
  }
});

class ArrayChannel implements LogChannel {
  private readonly _buffer: LogMessage[] = [];
  public readonly type = "LogChannel";

  public write(msg: LogMessage): void {
    this._buffer.push(msg);
  }

  public get messages() {
    return this._buffer.map(msg => msg.message);
  }
}

class RawArrayChannel implements RawLogChannel {

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


function createDefaultLogger(level: LogLevel): [logger: CoreLogger, channel: ArrayChannel] {
  const channel = new ArrayChannel();
  return [new CoreLogger({
    level,
    id: 1,
    channel,
    name: "Main",
    dateFormatter: millis => "XXX",
    argumentFormatter: arg => formatArgument(arg),
    messageFormatter: formatMessage
  }), channel];
}
