import {ArrayRawLogChannel, TestControlMessage} from "./TestClasses";
import {LOG4TS_LOG_CONTROL, LOG4TS_PROVIDER_SERVICE} from "../main/log4ts/impl/Log4TSProviderService";
import {Log4TSProvider} from "../main/log4ts";
import {LogLevel} from "../main/core";

describe("Test Log4TSControlProvider", () => {
  const message = new TestControlMessage();

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    LOG4TS_PROVIDER_SERVICE.clear();
    message.clear();
  });

  test("Test fetching non-existing provider fails", () => {
    const control = LOG4TS_LOG_CONTROL(message.write);
    Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });

    /* By number */
    expect(() => control.getProvider(1)).toThrowError(new Error("Provider with index '1' does not exist (outside of range)."));
    expect(() => control.getProvider(-1)).toThrowError(new Error("Provider with index '-1' does not exist (outside of range)."));

    /* By name */
    expect(() => control.getProvider("nope")).toThrowError(new Error("Provider with name 'nope' does not exist."));
  });

  test("Test fetching existing provider succeeds", () => {
    const control = LOG4TS_LOG_CONTROL(message.write);
    Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });
    Log4TSProvider.createLog4TSProvider("another", {
      groups: [{
        expression: new RegExp("another.+"),
      }],
    });
    const controlProvider1 = control.getProvider(0);
    expect(controlProvider1).toEqual(control.getProvider("test"));
    expect(controlProvider1).not.toEqual(control.getProvider(1));
    expect(controlProvider1).not.toEqual(control.getProvider("another"));

    const controlProvider2 = control.getProvider(1);
    expect(controlProvider2).toEqual(control.getProvider("another"));
    expect(controlProvider2).not.toEqual(control.getProvider(0));
    expect(controlProvider2).not.toEqual(control.getProvider("test"));
  });

  test("Test control provider shows settings", () => {
    const control = LOG4TS_LOG_CONTROL(message.write);
    Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });
    const controlProvider = control.getProvider("test");
    controlProvider.showSettings();
    expect(message.messages).toEqual(["Available group configs (Log4TSProvider 'test'):\n  [0, /model.+/ (level=Error)]\n"]);
  });

  test("Test control provider shows settings with multiple groups", () => {
    const control = LOG4TS_LOG_CONTROL(message.write);
    Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
          expression: new RegExp("model.+"),
        }, {
          expression: new RegExp("advanced.+"),
          level: LogLevel.Warn,
        }, {
          expression: new RegExp("ignored.+"),
          identifier: "my awesome identifier",
        }, {
          expression: new RegExp("blaat.blaat.+"),
        },
      ],
    });
    const controlProvider = control.getProvider("test");
    controlProvider.showSettings();

    const expected =
      "Available group configs (Log4TSProvider 'test'):\n" +
      "  [0, /model.+/             (level=Error)]\n" +
      "  [1, /advanced.+/          (level=Warn )]\n" +
      "  [2, my awesome identifier (level=Error)]\n" +
      "  [3, /blaat.blaat.+/       (level=Error)]\n";

    expect(message.messages).toEqual([expected]);
  });

  test("Test control provider updates log level of group configs", () => {
    const channel = new ArrayRawLogChannel();
    const control = LOG4TS_LOG_CONTROL(message.write);
    const provider = Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      },{
        expression: new RegExp("sample.+"),
      }],
      channel,
    });
    const logger = provider.getLogger("model.Sample");
    const loggerAnother = provider.getLogger("sample.Another");

    expect(logger.logLevel).toEqual(LogLevel.Error);
    expect(loggerAnother.logLevel).toEqual(LogLevel.Error);

    logger.warn("warn");
    loggerAnother.warn("warn");
    expect(channel.size).toEqual(0);

    /* Change group of provider by index, we change the first group only */
    const controlProvider = control.getProvider("test");
    controlProvider.update("debug", 0);
    expect(message.messages).toEqual(["Updated group config with index '0' successfully."]);

    expect(logger.logLevel).toEqual(LogLevel.Debug);
    expect(loggerAnother.logLevel).toEqual(LogLevel.Error);
    logger.debug("debug");
    loggerAnother.debug("debug2");
    expect(channel.messages).toEqual(["debug"]);
    channel.clear();
    message.clear();

    /* Check that new loggers have the current log levels */
    expect(provider.getLogger("model.Hallo").logLevel).toEqual(LogLevel.Debug);
    expect(provider.getLogger("sample.YetAnother").logLevel).toEqual(LogLevel.Error);

    /* Update all groups */
    controlProvider.update("info");
    expect(logger.logLevel).toEqual(LogLevel.Info);
    expect(loggerAnother.logLevel).toEqual(LogLevel.Info);
    logger.debug("debug1");
    loggerAnother.debug("debug2");
    logger.info("info1");
    loggerAnother.info("info2");
    expect(channel.messages).toEqual(["info1", "info2"]);
  });

  test("Test control provider can reset back to levels when it was created", () => {
    const channel = new ArrayRawLogChannel();
    const control = LOG4TS_LOG_CONTROL(message.write);
    const provider = Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
      channel,
    });

    const logger = provider.getLogger("model.Sample");
    expect(logger.logLevel).toEqual(LogLevel.Error);

    const controlProvider = control.getProvider("test");
    controlProvider.update("debug");
    logger.debug("debug");
    expect(channel.messages).toEqual(["debug"]);
    channel.clear();
    message.clear();

    controlProvider.reset();
    expect(message.messages).toEqual(["Successfully reset log levels back to original state (from when this Log4TSControlProvider was created)."]);

    expect(logger.logLevel).toEqual(LogLevel.Error);
    expect(provider.getLogger("model.Another").logLevel).toEqual(LogLevel.Error);

    logger.warn("warn");
    expect(channel.size).toEqual(0);
  });

  test ("Test control provider can use save and restore", () => {
    const channel = new ArrayRawLogChannel();
    const control = LOG4TS_LOG_CONTROL(message.write);
    let provider = Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
        identifier: "model",
      },{
        expression: new RegExp("service.+"),
        identifier: "service",
      }],
      channel,
    });

    let controlProvider = control.getProvider("test");
    let logModel = provider.getLogger("model.Sample");
    const expectedLevels = [{identifier: "model", level: LogLevel.Error}, {identifier: "service", level: LogLevel.Error}];
    expect(provider.groupConfigs.map(v => ({ identifier: v.identifier as string,  level: v.level }))).toStrictEqual(expectedLevels);
    controlProvider.update("info", "model");

    expectedLevels[0].level = LogLevel.Info;
    expect(logModel.logLevel).toEqual(LogLevel.Info);
    expect(message.messages).toEqual(["Updated group config with id 'model' successfully."]);
    expect(provider.groupConfigs.map(v => ({ identifier: v.identifier as string,  level: v.level }))).toStrictEqual(expectedLevels);
    message.clear();

    controlProvider.save();
    expect(message.messages).toEqual(["Successfully saved state for Log4TSControlProvider 'test'."]);
    channel.clear();
    message.clear();
    LOG4TS_PROVIDER_SERVICE.clear();

    /* Redo, we should start with error, and then restore should return to previous state */
    provider = Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
        identifier: "model",
      },{
        expression: new RegExp("service.+"),
        identifier: "service",
      }],
      channel,
    });
    controlProvider = control.getProvider("test");
    logModel = provider.getLogger("model.Sample");
    expect(logModel.logLevel).toEqual(LogLevel.Error);
    expectedLevels[0].level = LogLevel.Error;
    expect(provider.groupConfigs.map(v => ({ identifier: v.identifier as string,  level: v.level }))).toStrictEqual(expectedLevels);
    controlProvider.restore();

    expect(message.messages).toEqual(
      ["Log4TSControlProvider 'test' - restored log level of group 'model' to 'Info'.","Log4TSControlProvider 'test' - restored log level of group 'service' to 'Error'."]
    );
    expect(logModel.logLevel).toEqual(LogLevel.Info);
  });
});
