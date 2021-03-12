import {LOG4TS_PROVIDER_SERVICE} from "../main/log4ts/impl/Log4TSProviderService";
import {Log4TSProvider} from "../main/log4ts";
import {ArgumentFormatterType, DateFormatterType, LogChannel, LogLevel, MessageFormatterType} from "../main/core";
import {ArrayRawLogChannel} from "./TestClasses";

describe("Test Log4TSProvider", () => {

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    LOG4TS_PROVIDER_SERVICE.clear();
  });

  test ("Test create provider with minimum config set", () => {
    const provider = Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });

    expect(provider.name).toEqual("test");
    expect (provider.groupConfigs.length).toEqual(1);

    const groupConfig = provider.groupConfigs[0];
    expect(groupConfig.level).toEqual(LogLevel.Error);
  });

  test ("Test create provider with modified config", () => {
    const customChannel: LogChannel = {
      type: "LogChannel",
      write: () => null,
    };

    const argumentFormatter: ArgumentFormatterType = () => "";
    const dateFormatter: DateFormatterType = () => "";
    const messageFormatter: MessageFormatterType = () => "";
    const groupExpression = new RegExp("model.+");

    const provider = Log4TSProvider.createLog4TSProvider("test", {
      groups: [{ expression: groupExpression }],
      level: LogLevel.Info,
      channel: customChannel,
      messageFormatter,
      argumentFormatter,
      dateFormatter,
    });

    expect(provider.name).toEqual("test");

    const config = provider.config;
    expect(config.channel).toEqual(customChannel);
    expect(config.dateFormatter).toEqual(dateFormatter);
    expect(config.argumentFormatter).toEqual(argumentFormatter);
    expect(config.messageFormatter).toEqual(messageFormatter);
    expect(config.level).toEqual(LogLevel.Info);

    /* Group config must use the main config of the provider when none were provided for the group */
    expect (provider.groupConfigs.length).toEqual(1);
    const groupConfig = provider.groupConfigs[0];
    expect(groupConfig.channel).toEqual(customChannel);
    expect(groupConfig.expression).toEqual(groupExpression);
    expect(groupConfig.dateFormatter).toEqual(dateFormatter);
    expect(groupConfig.argumentFormatter).toEqual(argumentFormatter);
    expect(groupConfig.messageFormatter).toEqual(messageFormatter);
    expect(groupConfig.level).toEqual(LogLevel.Info);
  });

  test ("Test create provider and group custom config", () => {
    const argumentFormatter: ArgumentFormatterType = () => "";
    const dateFormatter: DateFormatterType = () => "";
    const messageFormatter: MessageFormatterType = () => "";
    const groupExpression = new RegExp("model.+");

    const provider = Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: groupExpression,
        level: LogLevel.Debug,
        argumentFormatter,
        dateFormatter,
        messageFormatter,
      }],
    });

    /* The provider has defaults and must not match anything from above */
    expect(provider.name).toEqual("test");
    const config = provider.config;
    expect(config.dateFormatter).not.toEqual(dateFormatter);
    expect(config.argumentFormatter).not.toEqual(argumentFormatter);
    expect(config.messageFormatter).not.toEqual(messageFormatter);
    expect(config.level).toEqual(LogLevel.Error);

    /* Group config must use it's own settings as configured */
    expect (provider.groupConfigs.length).toEqual(1);
    const groupConfigs = provider.groupConfigs;
    expect(groupConfigs.length).toEqual(1);
    const groupConfig = groupConfigs[0];
    expect(groupConfig.expression).toEqual(groupExpression);
    expect(groupConfig.dateFormatter).toEqual(dateFormatter);
    expect(groupConfig.argumentFormatter).toEqual(argumentFormatter);
    expect(groupConfig.messageFormatter).toEqual(messageFormatter);
    expect(groupConfig.level).toEqual(LogLevel.Debug);
  });

  test ("Provider creates correct loggers", () => {
    const channel = new ArrayRawLogChannel();
    const groupExpressionModel = new RegExp("model.+");
    const groupExpressionService = new RegExp("service.+");

    const provider = Log4TSProvider.createLog4TSProvider("test", {
      channel,
      groups: [
        {
          expression: groupExpressionModel,
          level: LogLevel.Debug,
        },
        {
          expression: groupExpressionService,
        },
      ],
      level: LogLevel.Info,
    });

    expect (provider.groupConfigs.length).toEqual(2);
    const groupConfigs = provider.groupConfigs;
    expect(groupConfigs.length).toEqual(2);
    expect(groupConfigs[0].expression).toEqual(groupExpressionModel);
    expect(groupConfigs[0].channel).toEqual(channel);
    expect(groupConfigs[1].expression).toEqual(groupExpressionService);
    expect(groupConfigs[1].channel).toEqual(channel);

    // Logger must match first group expression and level
    let logger = provider.getLogger("model.Hello");
    expect(LogLevel.Debug).toEqual(logger.logLevel);
    expect(channel.size).toEqual(0);
    logger.debug("debug");
    logger.info("info");
    logger.trace("trace"); // Should not appear
    expect(channel.messages).toEqual(["debug","info"]);
    channel.clear();

    // Logger must match second group expression, level will be provider's one.
    logger = provider.getLogger("service.Awesome");
    expect(LogLevel.Info).toEqual(logger.logLevel);
    logger.warn("warn");
    logger.error("error");
    logger.debug("debug");
    logger.fatal(() => "fatal");
    logger.info("info");
    logger.trace(() => "trace");
    expect(channel.messages).toEqual(["warn","error","fatal","info"]);
    channel.clear();

    // Logger does not match any group, and will fallback to default and use provider's defaults.
    logger = provider.getLogger("noMatchingGroup");
    expect(LogLevel.Info).toEqual(logger.logLevel);
    logger.info("info");
    logger.debug("debug");
    expect(channel.messages).toEqual(["info"]);

    // Finally the loggers should remain the same when asked by same name.
    logger = provider.getLogger("model.Dance");
    expect(logger === provider.getLogger("model.Dance")).toEqual(true);

    logger = provider.getLogger("notMatching");
    expect(logger === provider.getLogger("notMatching")).toEqual(true);
  });

  /* Tests that must fail follow */
  test("Test create provider config is missing group", () => {
    expect(() => Log4TSProvider.createLog4TSProvider("test", { groups: [] }))
      .toThrowError(new Error("Invalid configuration, 'groups' on configuration is empty, at least 1 group config must be specified."));
  });

  test("Test cannot create provider with same name twice", () => {
    Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });

    expect (() => Log4TSProvider.createLog4TSProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    })).toThrowError(new Error("Log4TSProvider with name 'test' already exists, cannot create another."));
  });
});
