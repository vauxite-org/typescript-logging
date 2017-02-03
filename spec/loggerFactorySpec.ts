import {LogLevel} from "../src/logging/log/LoggerOptions";
import {Logger} from "../src/logging/log/standard/Logger";
import {LoggerFactory} from "../src/logging/log/standard/LoggerFactory";
import {LoggerFactoryImpl} from "../src/logging/log/standard/LoggerFactoryImpl";
import {LFService, LoggerFactoryOptions, LogGroupRule} from "../src/logging/log/standard/LoggerFactoryService";

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
    let factory: LoggerFactory = LFService.createNamedLoggerFactory("helloworld");
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

    const rtSettings = factory.getLogGroupRuntimeSettingsByLoggerName(loggerHello.name);
    expect(rtSettings).not.toBeNull();
    expect(rtSettings.level).toEqual(LogLevel.Warn);

    const notExists = factory.getLogGroupRuntimeSettingsByLoggerName("nonsense");
    expect(notExists).toBeNull();

    // Since there is only one loggroup, it has to be 0.
    const rtSettingsAgain = factory.getLogGroupRuntimeSettingsByIndex(0);
    expect(rtSettingsAgain).not.toBeNull();
    expect(rtSettingsAgain === rtSettings).toBeTruthy();
  });

});
