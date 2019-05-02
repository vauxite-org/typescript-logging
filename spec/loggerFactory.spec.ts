import {LogFormat, LoggerType, LogLevel} from "../src/logging/log/LoggerOptions";
import {Logger} from "../src/logging/log/standard/Logger";
import {LoggerFactory} from "../src/logging/log/standard/LoggerFactory";
import {LoggerFactoryImpl} from "../src/logging/log/standard/LoggerFactoryImpl";
import {LFService} from "../src/logging/log/standard/LFService";
import {MessageBufferLoggerImpl} from "../src/logging/log/standard/MessageBufferLoggerImpl";
import {AbstractLogger, LogMessage} from "../src/logging/log/standard/AbstractLogger";
import {LoggerFactoryOptions} from "../src/logging/log/standard/LoggerFactoryOptions";
import {LogGroupRule} from "../src/logging/log/standard/LogGroupRule";
import {LogGroupRuntimeSettings} from "../src/logging/log/standard/LogGroupRuntimeSettings";

describe("LoggerFactory configuration", () => {

  beforeEach(() => {
    LFService.closeLoggers();
  });

  it("Testing default configuration", () => {
    const factory = LFService.createLoggerFactory();
    expect(factory.isEnabled()).toBeTruthy();

    const myLogger = factory.getLogger("MyLogger");

    expect(myLogger.isTraceEnabled()).toBeFalsy();
    expect(myLogger.isDebugEnabled()).toBeFalsy();
    expect(myLogger.isInfoEnabled()).toBeTruthy();
    expect(myLogger.isWarnEnabled()).toBeTruthy();
    expect(myLogger.isErrorEnabled()).toBeTruthy();
    expect(myLogger.isFatalEnabled()).toBeTruthy();
  });

  it("Testing custom configuration", () => {
    const factory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp("ExactName"), LogLevel.Error)));
    expect(factory.isEnabled()).toBeTruthy();

    const myLogger = factory.getLogger("ExactName");
    expect(myLogger.isTraceEnabled()).toBeFalsy();
    expect(myLogger.isDebugEnabled()).toBeFalsy();
    expect(myLogger.isInfoEnabled()).toBeFalsy();
    expect(myLogger.isWarnEnabled()).toBeFalsy();
    expect(myLogger.isErrorEnabled()).toBeTruthy();
    expect(myLogger.isFatalEnabled()).toBeTruthy();

    expect(() => factory.getLogger("NotSet")).toThrow();
  });

  it("Testing named logger", () => {
    const factory: LoggerFactory = LFService.createNamedLoggerFactory("helloworld");
    expect(factory.getName()).toMatch("helloworld");
    expect(() => LFService.createNamedLoggerFactory("helloworld")).toThrow(new Error("LoggerFactory with name helloworld already exists."));
  });

  it("Testing reconfigure", () => {
    const checkModelLogger = (logger: Logger): void => {
      expect(logger.isTraceEnabled()).toBeFalsy();
      expect(logger.isDebugEnabled()).toBeFalsy();
      expect(logger.isInfoEnabled()).toBeFalsy();
      expect(logger.isWarnEnabled()).toBeTruthy();
      expect(logger.isErrorEnabled()).toBeTruthy();
      expect(logger.isFatalEnabled()).toBeTruthy();
    };

    const checkServiceLogger = (logger: Logger): void => {
      expect(logger.isTraceEnabled()).toBeFalsy();
      expect(logger.isDebugEnabled()).toBeFalsy();
      expect(logger.isInfoEnabled()).toBeTruthy();
      expect(logger.isWarnEnabled()).toBeTruthy();
      expect(logger.isErrorEnabled()).toBeTruthy();
      expect(logger.isFatalEnabled()).toBeTruthy();
    };

    const factory = LFService.createLoggerFactory();
    factory.configure(new LoggerFactoryOptions()
                       .addLogGroupRule(new LogGroupRule(new RegExp("model\\..+"), LogLevel.Warn))
                       .addLogGroupRule(new LogGroupRule(new RegExp("service\\..+"), LogLevel.Info)));
    const logModel1 = factory.getLogger("model.Test");
    checkModelLogger(logModel1);

    const logModel2 = factory.getLogger("model.A");
    checkModelLogger(logModel2);

    const logService1 = factory.getLogger("service.Test");
    checkServiceLogger(logService1);

    // model. is invalid, it needs to have something after the name
    expect(() => factory.getLogger("model.")).toThrow();
  });

  it("Testing LogGroupRule related runtime settings", () => {
    const factory = LFService.createLoggerFactory() as LoggerFactoryImpl;
    expect(factory.getName()).toEqual("LoggerFactory1");
    factory.configure(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp("model\\..+"), LogLevel.Warn)));

    const loggerHello = factory.getLogger("model.Hello");
    expect(loggerHello).not.toBeNull();

    const rtSettings = factory.getLogGroupRuntimeSettingsByLoggerName(loggerHello.name) as LogGroupRuntimeSettings;
    expect(rtSettings).not.toBeNull();
    expect(rtSettings).not.toBeNull();
    expect(rtSettings.level).toEqual(LogLevel.Warn);

    const notExists = factory.getLogGroupRuntimeSettingsByLoggerName("nonsense");
    expect(notExists).toBeNull();

    // Since there is only one loggroup, it has to be 0.
    const rtSettingsAgain = factory.getLogGroupRuntimeSettingsByIndex(0);
    expect(rtSettingsAgain).not.toBeNull();
    expect(rtSettingsAgain === rtSettings).toBeTruthy();
  });

  it("LogGroupRule can use a custom message formatter", () => {
    const options = new LoggerFactoryOptions();
    const rule = new LogGroupRule(new RegExp(".+"), LogLevel.Info, new LogFormat(), LoggerType.MessageBuffer);
    // Message only
    rule.formatterLogMessage = (message) => typeof(message.message) === "string" ? message.message : "nope should not happen!";
    options.addLogGroupRule(rule);

    const factory = LFService.createNamedLoggerFactory("world", options);
    const logger = factory.getLogger("MyLogger") as MessageBufferLoggerImpl;
    logger.info("Hello world!");
    expect(logger.getMessages()).toEqual(["Hello world!"]);
  });

  it("LogGroupRule cannot set custom message formatter when custom logger is used", () => {
    const rule = new LogGroupRule(new RegExp(".+"), LogLevel.Info, new LogFormat(), LoggerType.Custom, (name, settings) => new CustomLogger(name, settings));
    // This not allowed now.
    expect(() => rule.formatterLogMessage = (message) => typeof(message.message) === "string" ? message.message : "nope should not happen!")
      .toThrow("You cannot specify a formatter for log messages if your loggerType is Custom");
  });

  it("Default LoggerFactory is available", () => {
    expect(LFService.DEFAULT).not.toBeNull();
    const factory = LFService.DEFAULT;
    expect(factory === LFService.DEFAULT).toBeTruthy();
    factory.configure(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Warn, new LogFormat(), LoggerType.MessageBuffer)));
    const logger = factory.getLogger("test") as MessageBufferLoggerImpl;
    logger.warn("hello!");
    expect(logger.toString()).toContain("hello!");
  });

  it("Default LoggerFactory name cannot be used by users", () => {
    expect(() => LFService.createNamedLoggerFactory("DEFAULT")).toThrow(new Error("LoggerFactory name: DEFAULT is reserved and cannot be used."));
  });

  class CustomLogger extends AbstractLogger {

    protected doLog(msg: LogMessage): void {
      // Don't care
    }
  }
});
