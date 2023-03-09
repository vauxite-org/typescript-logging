import {LOG4TS_PROVIDER_SERVICE} from "../main/impl/Log4TSProviderService";
import {Log4TSProvider} from "../main/api/Log4TSProvider";
import {$test, ArgumentFormatterType, DateFormatterType, LogChannel, LogLevel} from "typescript-logging";

describe("Test Log4TSProvider", () => {

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    LOG4TS_PROVIDER_SERVICE.clear();
  });

  test("Test create provider with minimum config set", () => {
    const provider = Log4TSProvider.createProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });

    expect(provider.name).toEqual("test");
    expect(provider.groupConfigs.length).toEqual(1);

    const groupConfig = provider.groupConfigs[0];
    expect(groupConfig.level).toEqual(LogLevel.Error);
  });

  test("Test create provider with modified config", () => {
    const customChannel: LogChannel = {
      type: "LogChannel",
      write: () => null,
    };

    const argumentFormatter: ArgumentFormatterType = () => "";
    const dateFormatter: DateFormatterType = () => "";
    const groupExpression = new RegExp("model.+");

    const provider = Log4TSProvider.createProvider("test", {
      groups: [{expression: groupExpression}],
      level: LogLevel.Info,
      channel: customChannel,
      argumentFormatter,
      dateFormatter,
    });

    expect(provider.name).toEqual("test");

    const config = provider.config;
    expect(config.channel).toEqual(customChannel);
    expect(config.dateFormatter).toEqual(dateFormatter);
    expect(config.argumentFormatter).toEqual(argumentFormatter);
    expect(config.level).toEqual(LogLevel.Info);

    /* Group config must use the main config of the provider when none were provided for the group */
    expect(provider.groupConfigs.length).toEqual(1);
    const groupConfig = provider.groupConfigs[0];
    expect(groupConfig.channel).toEqual(customChannel);
    expect(groupConfig.expression).toEqual(groupExpression);
    expect(groupConfig.dateFormatter).toEqual(dateFormatter);
    expect(groupConfig.argumentFormatter).toEqual(argumentFormatter);
    expect(groupConfig.level).toEqual(LogLevel.Info);
  });

  test("Test create provider and group custom config", () => {
    const argumentFormatter: ArgumentFormatterType = () => "";
    const dateFormatter: DateFormatterType = () => "";
    const groupExpression = new RegExp("model.+");

    const provider = Log4TSProvider.createProvider("test", {
      groups: [{
        expression: groupExpression,
        level: LogLevel.Debug,
        argumentFormatter,
        dateFormatter,
      }],
    });

    /* The provider has defaults and must not match anything from above */
    expect(provider.name).toEqual("test");
    const config = provider.config;
    expect(config.dateFormatter).not.toEqual(dateFormatter);
    expect(config.argumentFormatter).not.toEqual(argumentFormatter);
    expect(config.level).toEqual(LogLevel.Error);

    /* Group config must use it's own settings as configured */
    expect(provider.groupConfigs.length).toEqual(1);
    const groupConfigs = provider.groupConfigs;
    expect(groupConfigs.length).toEqual(1);
    const groupConfig = groupConfigs[0];
    expect(groupConfig.expression).toEqual(groupExpression);
    expect(groupConfig.dateFormatter).toEqual(dateFormatter);
    expect(groupConfig.argumentFormatter).toEqual(argumentFormatter);
    expect(groupConfig.level).toEqual(LogLevel.Debug);
  });

  test("Test merging of log levels works as expected", () => {
    let provider = Log4TSProvider.createProvider("test1", {
      level: LogLevel.Debug,
      groups: [{
        expression: new RegExp(".+"),
        level: LogLevel.Debug
      }]
    });

    expect(provider.config.level).toEqual(LogLevel.Debug);
    expect(provider.groupConfigs.length).toEqual(1);

    let groupConfig = provider.groupConfigs[0];
    expect(groupConfig.level).toEqual(LogLevel.Debug);

    /* Trace is numeric value 0, which went wrong as it used a ternary check where 'truthy/falsy' came into play ... */
    provider = Log4TSProvider.createProvider("test2", {
      level: LogLevel.Trace,
      groups: [{
        expression: new RegExp(".+"),
        level: LogLevel.Trace
      }]
    });

    expect(provider.config.level).toEqual(LogLevel.Trace);
    expect(provider.groupConfigs.length).toEqual(1);

    groupConfig = provider.groupConfigs[0];
    expect(groupConfig.level).toEqual(LogLevel.Trace);
  });

  test("Provider creates correct loggers", () => {
    const channel = new $test.ArrayRawLogChannel();
    const groupExpressionModel = new RegExp("model.+");
    const groupExpressionService = new RegExp("service.+");

    const provider = Log4TSProvider.createProvider("test", {
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

    expect(provider.groupConfigs.length).toEqual(2);
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
    expect(channel.messages).toEqual(["debug", "info"]);
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
    expect(channel.messages).toEqual(["warn", "error", "fatal", "info"]);
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

  test("Test log level can be changed dynamically", () => {
    const channel = new $test.ArrayRawLogChannel();
    /* Default logs to error */
    const provider = Log4TSProvider.createProvider("test", {
      channel,
      groups: [{
        expression: new RegExp("model.+"),
        identifier: "model",
      }, {
        expression: new RegExp("service.+"),
      }],
    });
    expect(provider.groupConfigs[0].identifier).toEqual("model");
    const logProduct = provider.getLogger("model.Product");
    const logAccountService = provider.getLogger("service.AccountService");
    logProduct.warn("warn");
    logAccountService.warn("warn");
    expect(channel.size).toEqual(0);

    /* Changes level to info for all groups */
    provider.updateRuntimeSettings({level: LogLevel.Info});
    logProduct.info("product");
    logAccountService.info("accountService");
    expect(channel.messages).toEqual(["product", "accountService"]);
    channel.clear();

    const logCustomer = provider.getLogger("model.Customer");
    const logCustomerService = provider.getLogger("service.CustomerService");
    logCustomer.info("customer");
    logCustomerService.info("customerService");
    expect(channel.messages).toEqual(["customer", "customerService"]);
    channel.clear();

    /* Change only 1 group */
    provider.updateRuntimeSettingsGroup("model", {level: LogLevel.Error});
    logProduct.warn("product");
    logCustomer.warn("customer");
    logAccountService.info("accountService");
    logCustomerService.info("customerService");
    expect(channel.messages).toEqual(["accountService", "customerService"]);
    channel.clear();

    const logApple = provider.getLogger("model.amazing.Apple");
    const logFruitService = provider.getLogger("service.amazing.FruitService");
    logApple.warn("apple");
    logApple.error("appleError");
    logFruitService.debug("fruitDebug");
    logFruitService.info("fruitInfo");
    expect(channel.messages).toEqual(["appleError", "fruitInfo"]);

    /* Check that it can be turned off completely */
    provider.updateRuntimeSettings({level: LogLevel.Off});
    channel.clear();

    const logPeer = provider.getLogger("model.nice.Peer");
    const differentService = provider.getLogger("service.amazing.DifferentService");

    logApple.fatal("fatal");
    logFruitService.error("error");
    logPeer.warn("warn");
    logPeer.info("info");
    differentService.debug("debug");
    differentService.trace("trace");

    expect(channel.messages.length).toEqual(0);
  });

  test("Test channel can be changed dynamically", () => {
    const channel1 = new $test.ArrayRawLogChannel();
    const channel2 = new $test.ArrayRawLogChannel();
    /* Default logs to error */
    const provider = Log4TSProvider.createProvider("test", {
      level: LogLevel.Info,
      channel: channel1,
      groups: [{
        expression: new RegExp("model.+"),
      }, {
        expression: new RegExp("service.+"),
        identifier: "service"
      }],
    });
    expect(provider.groupConfigs[0].identifier).toEqual("/model.+/"); // This is guaranteed to be set if no id was given originally.
    expect(provider.groupConfigs[1].identifier).toEqual("service");
    const logProduct = provider.getLogger("model.Product");
    const logService = provider.getLogger("service.ProductService");
    logProduct.info("product");
    logService.info("productService");
    expect(channel1.messages).toEqual(["product", "productService"]);
    expect(channel2.messages).toEqual([]);
    channel1.clear();
    channel2.clear();

    /* Change channel for all */
    provider.updateRuntimeSettings({channel: channel2});
    logProduct.info("product");
    logService.info("productService");
    expect(channel2.messages).toEqual(["product", "productService"]);
    expect(channel1.messages).toEqual([]);
    channel1.clear();
    channel2.clear();

    const logFruit = provider.getLogger("model.Fruit");
    const logFruitService = provider.getLogger("service.FruitService");
    logFruit.info("fruit");
    logFruitService.info("fruitService");
    logProduct.info("product");
    logService.info("productService");
    expect(channel2.messages).toEqual(["fruit", "fruitService", "product", "productService"]);
    expect(channel1.messages).toEqual([]);
    channel1.clear();
    channel2.clear();
  });

  /* Tests that must fail follow */
  test("Test create provider config is missing group", () => {
    expect(() => Log4TSProvider.createProvider("test", {groups: []}))
      .toThrowError(new Error("Invalid configuration, 'groups' on configuration is empty, at least 1 group config must be specified."));
  });

  test("Test cannot create provider with same name twice", () => {
    Log4TSProvider.createProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });

    expect(() => Log4TSProvider.createProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    })).toThrowError(new Error("Log4TSProvider with name 'test' already exists, cannot create another."));
  });
});
