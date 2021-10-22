import {formatArgument, formatDate, formatMessage, LogLevel,} from "../main/core";
import {LoggerImpl} from "../main/core/impl/LoggerImpl";
import {ArrayLogChannel, ArrayRawLogChannel} from "./TestClasses";

describe("Test core logger", () => {

  test("Test logger level", () => {
    assertLogLevels(LogLevel.Trace);
    assertLogLevels(LogLevel.Debug);
    assertLogLevels(LogLevel.Info);
    assertLogLevels(LogLevel.Warn);
    assertLogLevels(LogLevel.Error);
    assertLogLevels(LogLevel.Fatal);
  });

  test("Test with various supported arguments", () => {
    const [logger, channel] = createDefaultLogger(LogLevel.Debug);
    logger.debug("message1");
    logger.debug(() => "message2");
    logger.debug(fmt => fmt("message{}", [3]));
    logger.debug("message4", new Error("error1"));
    logger.debug("message5", () => new Error("error2"));
    logger.debug(() => "message6", () => new Error("error3"));
    logger.debug(() => "message7", new Error("error4"));
    logger.debug("message8", "arg1");
    logger.info("message9", "arg1", 2);
    logger.debug("message10", () => ["arg1", 2]);
    logger.debug(() => "message11", new Error("error5"), {a: "bla"});
    logger.debug(() => "message12", () => new Error("error6"), {a: "bla"});
    logger.warn(() => "message13", () => ["a", 500]);
    logger.debug(() => "message14", () => ["a", 500], "unexpected", 250.51);

    expect(channel.messages).toEqual([
      "XXX DEBUG [Main] message1",
      "XXX DEBUG [Main] message2",
      "XXX DEBUG [Main] message'3'",
      "XXX DEBUG [Main] message4",
      "XXX DEBUG [Main] message5",
      "XXX DEBUG [Main] message6",
      "XXX DEBUG [Main] message7",
      `XXX DEBUG [Main] message8 ["arg1"]`,
      `XXX INFO  [Main] message9 ["arg1", 2]`,
      `XXX DEBUG [Main] message10 ["arg1", 2]`,
      `XXX DEBUG [Main] message11 [{"a":"bla"}]`,
      `XXX DEBUG [Main] message12 [{"a":"bla"}]`,
      `XXX WARN  [Main] message13 ["a", 500]`,
      `XXX DEBUG [Main] message14 ["a", 500, "unexpected", 250.51]`,
    ]);

    const errors = channel.logMessages.map(m => m.error);
    expect(errors[0]).toBeUndefined();
    expect(errors[1]).toBeUndefined();
    expect(errors[2]).toBeUndefined();
    expect(errors[3]).toContain("error1");
    expect(errors[4]).toContain("error2");
    expect(errors[5]).toContain("error3");
    expect(errors[6]).toContain("error4");
    expect(errors[7]).toBeUndefined();
    expect(errors[8]).toBeUndefined();
    expect(errors[9]).toBeUndefined();
    expect(errors[10]).toContain("error5");
    expect(errors[11]).toContain("error6");
    expect(errors[12]).toBeUndefined();
    expect(errors[13]).toBeUndefined();
  });

  test("Test formatting", () => {
    const channel = new ArrayRawLogChannel();
    const log = new LoggerImpl({
      level: LogLevel.Debug,
      id: "A",
      channel,
      name: "Main",
      dateFormatter: millis => formatDate(millis),
      argumentFormatter: arg => formatArgument(arg),
      messageFormatter: formatMessage
    });

    // No formatting
    log.debug("Hello");
    log.debug("Dance1", new Error("X"));
    log.debug(() => "Hello 2!");

    // Formatting
    log.debug(fmt => fmt("Dance: {}", ["2"]));
    log.debug(fmt => fmt("Dance: {} and {}", [1000, "2000"]));

    // Formatting tags but no additional args
    log.debug(fmt => fmt("Dance: {}", []));
    log.debug(fmt => fmt("Dance: {} and {}", []), new Error("y"));

    // Formatting with too many args, unused args are ignored.
    log.debug(fmt => fmt("Dance: {}", ["Friend", "Foe"]));

    expect(channel.messages).toEqual(["Hello", "Dance1", "Hello 2!", `Dance: '2'`, `Dance: '1000' and '2000'`, "Dance: {}", "Dance: {} and {}", `Dance: 'Friend'`]);
    expect(channel.errors).toEqual([undefined, new Error("X"), undefined, undefined, undefined, undefined, new Error("y"), undefined]);
  });

  test("Test arguments formatting", () => {
    const [log, channel] = createDefaultLogger(LogLevel.Debug);

    log.debug("Hello!", "A");
    log.debug("Hello!", "A", 4, undefined, null, ["dance", "again"]);
    log.debug("Hello!", new Error("fail"), "A", 4, undefined, null, ["dance", "again"]);

    expect(channel.messages).toEqual([
      `XXX DEBUG [Main] Hello! ["A"]`,
      `XXX DEBUG [Main] Hello! ["A", 4, undefined, null, ["dance","again"]]`,
      `XXX DEBUG [Main] Hello! ["A", 4, undefined, null, ["dance","again"]]`,
    ]);
  });

  function assertLogLevels(logLevel: LogLevel) {
    const input = ["trace", "debug", "info", "warn", "error", "fatal"];
    const [log, channel] = createDefaultLogger(logLevel);
    log.trace(input[0]);
    log.debug(input[1]);
    log.info(input[2]);
    log.warn(input[3]);
    log.error(input[4]);
    log.fatal(input[5]);

    const idx: number = logLevel;
    const expected = input.slice(idx).map(v => {
      let levelStr = v.toUpperCase();
      if (levelStr.length < 5) {
        levelStr += " ";
      }
      return "XXX " + levelStr + " [Main] " + v;
    });
    expect(channel.messages).toEqual(expected);
  }
});

function createDefaultLogger(level: LogLevel): [logger: LoggerImpl, channel: ArrayLogChannel] {
  const channel = new ArrayLogChannel();
  return [new LoggerImpl({
    level,
    id: "B",
    channel,
    name: "Main",
    dateFormatter: _ => "XXX",
    argumentFormatter: arg => formatArgument(arg),
    messageFormatter: formatMessage
  }), channel];
}
