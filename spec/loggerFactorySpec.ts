import {LFService, LoggerFactoryOptions, LogGroupRule} from "../src/LoggerFactoryService";
import {LogLevel, Logger, Category} from "../src/Logger";
import {CategoryService} from "../src/CategoryService";

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

    // Can create hierarchy by passing parent in constructor, or use addchild.
    // All categories are at Info by default, unless specified. Maybe it should be Error?
    const cat = new Category("x", new Category("parent"));
    const sub1 = new Category("sub1");
    cat.addChild(sub1).addChild(new Category("sub2", null, LogLevel.Error));

    // Export this logger somewhere for reuse, perhaps add getLogger(cat),
    // to retrieve the same in case you just need to pull it out again for some reason.
    // Or maybe just call it getLogger(cat) ?
    const logger = CategoryService.createLogger(cat);

    // Unfortunately [] must be first, since we also have an optional Error, so
    // we can't use the rest (...) notation.
    logger.info([cat],"x");
    try {
      throw new Error("Oops");
    }
    catch(e) {
      logger.info([sub1], "Something went wrong", e);
    }

  });

});

