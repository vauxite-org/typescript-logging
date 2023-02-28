import {formatArgument, LogLevel,} from "../main/core";
import {CoreLoggerImpl} from "../main/core/impl/CoreLoggerImpl";
import {ArrayLogChannel} from "./TestClasses";

describe("Test core logger", () => {

  test("Test logger level", () => {
    assertLogLevels(LogLevel.Trace);
    assertLogLevels(LogLevel.Debug);
    assertLogLevels(LogLevel.Info);
    assertLogLevels(LogLevel.Warn);
    assertLogLevels(LogLevel.Error);
    assertLogLevels(LogLevel.Fatal);
    assertLogLevels(LogLevel.OFF);
  });

  test("Test with various supported arguments", () => {
    const [logger, channel] = createDefaultLogger(LogLevel.Debug);
    logger.debug("message1");
    logger.debug(() => "message2");
    logger.debug("message3", new Error("error1"));
    logger.debug("message4", () => new Error("error2"));
    logger.debug(() => "message5", () => new Error("error3"));
    logger.debug(() => "message6", new Error("error4"));
    logger.debug("message7", "arg1");
    logger.info("message8", "arg1", 2);
    logger.debug("message9", () => ["arg1", 2]);
    logger.debug(() => "message10", new Error("error5"), {a: "bla"});
    logger.debug(() => "message11", () => new Error("error6"), {a: "bla"});
    logger.warn(() => "message12", () => ["a", 500]);
    logger.debug(() => "message13", () => ["a", 500], "unexpected", 250.51);

    expect(channel.messages).toEqual([
      "XXX DEBUG [Main] message1",
      "XXX DEBUG [Main] message2",
      "XXX DEBUG [Main] message3",
      "XXX DEBUG [Main] message4",
      "XXX DEBUG [Main] message5",
      "XXX DEBUG [Main] message6",
      `XXX DEBUG [Main] message7 ["arg1"]`,
      `XXX INFO  [Main] message8 ["arg1", 2]`,
      `XXX DEBUG [Main] message9 ["arg1", 2]`,
      `XXX DEBUG [Main] message10 [{"a":"bla"}]`,
      `XXX DEBUG [Main] message11 [{"a":"bla"}]`,
      `XXX WARN  [Main] message12 ["a", 500]`,
      `XXX DEBUG [Main] message13 ["a", 500, "unexpected", 250.51]`,
    ]);

    const errors = channel.logMessages.map(m => m.error);
    expect(errors[0]).toBeUndefined();
    expect(errors[1]).toBeUndefined();
    expect(errors[2]).toContain("error1");
    expect(errors[3]).toContain("error2");
    expect(errors[4]).toContain("error3");
    expect(errors[5]).toContain("error4");
    expect(errors[6]).toBeUndefined();
    expect(errors[7]).toBeUndefined();
    expect(errors[8]).toBeUndefined();
    expect(errors[9]).toContain("error5");
    expect(errors[10]).toContain("error6");
    expect(errors[11]).toBeUndefined();
    expect(errors[12]).toBeUndefined();
  });

  test("Test arguments formatting", () => {
    const [log, channel] = createDefaultLogger(LogLevel.Debug);

    const testValue = "world";
    log.debug("Hello!", "A");
    log.debug("Hello!", "A", 4, undefined, null, ["dance", "again"]);
    log.debug("Hello!", new Error("fail"), "A", 4, undefined, null, ["dance", "again"]);
    log.debug(() => `Hello ${testValue}`);
    log.debug(() => "Hello!", "B");
    log.debug(() => "Hello!", undefined, null, "hello?");
    log.debug(() => "Hello!", {test: "bla"}, [1, 2, 3]);

    expect(channel.messages).toEqual([
      `XXX DEBUG [Main] Hello! ["A"]`,
      `XXX DEBUG [Main] Hello! ["A", 4, undefined, null, ["dance","again"]]`,
      `XXX DEBUG [Main] Hello! ["A", 4, undefined, null, ["dance","again"]]`,
      `XXX DEBUG [Main] Hello world`,
      `XXX DEBUG [Main] Hello! ["B"]`,
      `XXX DEBUG [Main] Hello! [undefined, null, "hello?"]`,
      `XXX DEBUG [Main] Hello! [{\"test\":\"bla\"}, [1,2,3]]`,
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

function createDefaultLogger(level: LogLevel): [logger: CoreLoggerImpl, channel: ArrayLogChannel] {
  const channel = new ArrayLogChannel();
  return [new CoreLoggerImpl({
    level,
    id: "B",
    channel,
    name: "Main",
    dateFormatter: _ => "XXX",
    argumentFormatter: arg => formatArgument(arg),
  }), channel];
}
