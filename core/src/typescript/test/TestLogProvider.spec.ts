import {createDefaultLogConfig, LogProviderImpl} from "../main/core/impl/LogProviderImpl";
import {ArrayRawLogChannel} from "./TestClasses";
import {LogLevel} from "../main/core";

describe("Test LogProvider", () => {

  const channel = new ArrayRawLogChannel();
  const logProvider: LogProviderImpl = new LogProviderImpl("test", {
    ...createDefaultLogConfig(),
    channel,
    level: LogLevel.Info,
  });

  beforeEach(() => {
    logProvider.clear();
    channel.clear();
  });

  test("Test LogProvider returns same logger for same name", () => {
    const logger1 = logProvider.getLogger("logger1");
    const logger2 = logProvider.getLogger("logger2");
    const logger3 = logProvider.getLogger(["prefix", "logger3"]);

    expect(logger1 === logProvider.getLogger("logger1")).toEqual(true);
    expect(logger2 === logProvider.getLogger("logger2")).toEqual(true);
    expect(logger3 === logProvider.getLogger(["prefix", "logger3"])).toEqual(true);
  });

  test("Test LogProvider can update log level of a logger", () => {
    const logger1 = logProvider.getLogger("logger1");
    expect(logger1.logLevel).toEqual(LogLevel.Info);
    logger1.debug("debug");
    logger1.info("info");
    expect(channel.messages).toEqual(["info"]);

    logProvider.updateLoggerRuntime(logger1, {level: LogLevel.Warn});

    channel.clear();
    logger1.debug("debug");
    logger1.info("info");
    logger1.warn("warn");
    logger1.error(() => "error");

    expect(channel.messages).toEqual(["warn", "error"]);

    logProvider.updateLoggerRuntime(logger1, {level: LogLevel.Debug});
    channel.clear();
    logger1.trace("trace");
    logger1.debug("debug");
    logger1.info("info");
    logger1.warn("warn");
    logger1.error(() => "error");

    expect(channel.messages).toEqual(["debug", "info", "warn", "error"]);

    logProvider.updateLoggerRuntime(logger1, {level: LogLevel.Off});

    channel.clear();
    logger1.trace("trace");
    logger1.debug("debug");
    logger1.info("info");
    logger1.warn("warn");
    logger1.error(() => "error");
    logger1.fatal(() => "fatal");
    expect(channel.messages.length).toEqual(0);
  });

  test("Test LogProvider can update log level of all loggers", () => {
    const logger1 = logProvider.getLogger("logger1");
    const logger2 = logProvider.getLogger("logger2");
    const logger3 = logProvider.getLogger("logger3");

    logger1.debug("debug1");
    logger2.debug("debug2");
    logger3.debug("debug3");
    logger1.info("info1");
    logger2.info("info2");
    logger3.info("info3");

    expect(channel.messages).toEqual(["info1", "info2", "info3"]);

    logProvider.updateRuntimeSettings({level: LogLevel.Debug});
    channel.clear();

    logger1.debug("debug1");
    logger2.debug("debug2");
    logger3.debug("debug3");
    logger1.info("info1");
    logger2.info("info2");
    logger3.info("info3");

    expect(channel.messages).toEqual(["debug1", "debug2", "debug3", "info1", "info2", "info3"]);

    /* The loggers should still be the same ones (just an additional check) */
    expect(logger1 === logProvider.getLogger("logger1")).toEqual(true);
    expect(logger2 === logProvider.getLogger("logger2")).toEqual(true);
    expect(logger3 === logProvider.getLogger("logger3")).toEqual(true);

    /* Turn logging off for a provider */
    logProvider.updateRuntimeSettings({level: LogLevel.Off});
    channel.clear();

    logger1.debug("debug");
    logger2.error("error");
    logger3.fatal("fatal");
    logger1.trace("trace");
    logger2.info("info");
    logger3.warn("warn");

    expect(channel.messages.length).toEqual(0);
  });

  test("Test LogProvider can update channel for a logger", () => {
    const alternateChannel = new ArrayRawLogChannel();
    const logger1 = logProvider.getLogger("logger1");
    const logger2 = logProvider.getLogger("logger2");

    logger1.info("info1");
    logger2.info("info2");
    expect(channel.messages).toEqual(["info1", "info2"]);

    logProvider.updateLoggerRuntime(logger2, {channel: alternateChannel});
    logger1.info("info1 again");
    logger2.info("info2 again");

    expect(channel.messages).toEqual(["info1", "info2", "info1 again"]);
    expect(alternateChannel.messages).toEqual(["info2 again"]);
  });

  test("Test LogProvider can update level and channel for all loggers", () => {
    const alternateChannel = new ArrayRawLogChannel();
    const logger1 = logProvider.getLogger("logger1");
    const logger2 = logProvider.getLogger("logger2");
    const logger3 = logProvider.getLogger("logger3");

    logger1.info("info1");
    logger2.info("info2");
    logger3.info("info3");
    expect(channel.messages).toEqual(["info1", "info2", "info3"]);

    logProvider.updateRuntimeSettings({level: LogLevel.Warn, channel: alternateChannel});
    logger1.info("info1 again");
    logger2.info("info2 again");
    logger3.info("info3 again");
    logger1.warn("warn1");
    logger2.warn("warn2");
    logger3.warn("warn3");

    expect(channel.messages).toEqual(["info1", "info2", "info3"]);
    expect(alternateChannel.messages).toEqual(["warn1", "warn2", "warn3"]);
  });
});
