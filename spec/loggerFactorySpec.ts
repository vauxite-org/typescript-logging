import {LFService, LoggerFactoryOptions, LogGroupRule} from "../src/logging/LoggerFactoryService";
import {LogLevel} from "../src/logging/LoggerOptions";
import {Logger} from "../src/logging/Logger";


describe("LoggerFactory configuration", () => {

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

});

