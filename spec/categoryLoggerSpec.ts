import {CategoryLogger} from "../src/logging/log/category/CategoryLogger";
import {LogLevel, LoggerType} from "../src/logging/log/LoggerOptions";
import {CategoryDelegateLoggerImpl} from "../src/logging/log/category/CategoryDelegateLoggerImpl";
import {CategoryMessageBufferLoggerImpl} from "../src/logging/log/category/CategoryMessageBufferImpl";
import {Category} from "../src/logging/log/category/Category";
import {CategoryConfiguration} from "../src/logging/log/category/CategoryConfiguration";
import {CategoryServiceFactory} from "../src/logging/log/category/CategoryServiceFactory";

const getMessagesAsString = (logger: CategoryLogger | Category): string => {
  let delegate: CategoryDelegateLoggerImpl;
  if (logger instanceof Category) {
    delegate = (logger as any)._logger as CategoryDelegateLoggerImpl;
  }
  else {
    delegate = logger as CategoryDelegateLoggerImpl;
  }
  expect(delegate).toBeDefined();

  const actualLogger = delegate.delegate;
  expect(actualLogger instanceof CategoryMessageBufferLoggerImpl).toBeTruthy();
  return (actualLogger as CategoryMessageBufferLoggerImpl).toString();
};

const getMessages = (logger: CategoryLogger | Category): string[] => {
  let delegate: CategoryDelegateLoggerImpl;
  if (logger instanceof Category) {
    delegate = (logger as any)._logger as CategoryDelegateLoggerImpl;
  }
  else {
    delegate = logger as CategoryDelegateLoggerImpl;
  }
  expect(delegate).toBeDefined();

  const actualLogger = delegate.delegate;
  expect(actualLogger instanceof CategoryMessageBufferLoggerImpl).toBeTruthy();
  return (actualLogger as CategoryMessageBufferLoggerImpl).getMessages();
};

const logsAllLevels = (logger: CategoryLogger | Category, done: DoneFn): void => {
  logger.trace("trace1");
  logger.trace({ msg: "trace2" });
  logger.trace(() => "trace3");
  logger.trace(() => ({msg: "trace4" }) );
  logger.trace(() => ({ msg: "trace5", data: "x" }));

  logger.debug("debug1");
  logger.debug({ msg: "debug2" });
  logger.debug(() => "debug3");
  logger.debug(() => ({msg: "debug4" }) );
  logger.debug(() => ({ msg: "debug5" }));

  logger.info("info1");
  logger.info({ msg: "info2" });
  logger.info(() => "info3");
  logger.info(() => ({msg: "info4" }) );
  logger.info(() => ({ msg: "info5" }));

  logger.warn("warn1");
  logger.warn({ msg: "warn2" });
  logger.warn(() => "warn3");
  logger.warn(() => ({msg: "warn4" }) );
  logger.warn(() => ({ msg: "warn5" }));

  logger.error("error1", new Error("errorex1"));
  logger.error({msg: "error2"}, new Error("errorex2"));
  logger.error(() => "error3", () => new Error("errorex3"));
  logger.error(() => ({msg : "error4"}), () => new Error("errorex4"));
  logger.error(() => ({ msg: "error5" }), () => new Error("errorex5"));

  logger.resolved("resolved1", new Error("resolvedex1"));
  logger.resolved({msg: "resolved2"}, new Error("resolvedex2"));
  logger.resolved(() => "resolved3", () => new Error("resolvedex3"));
  logger.resolved(() => ({msg : "resolved4"}), () => new Error("resolvedex4"));
  logger.resolved(() => ({ msg: "resolved5" }), () => new Error("resolvedex5"));

  logger.fatal("fatal1", new Error("fatalex1"));
  logger.fatal({msg: "fatal2"}, new Error("fatalex2"));
  logger.fatal(() => "fatal3", () => new Error("fatalex3"));
  logger.fatal(() => ({msg : "fatal4"}), () => new Error("fatalex4"));
  logger.fatal(() => ({ msg: "fatal5" }), () => new Error("fatalex5"));

  logger.log(LogLevel.Fatal, "random1", new Error("randomex1"));
  logger.log(LogLevel.Fatal, { msg: "random2" }, new Error("randomex2"));
  logger.log(LogLevel.Fatal, () => "random3", () => new Error("randomex3"));
  logger.log(LogLevel.Fatal, () => ({msg : "random4"}), () => new Error("randomex4"));
  logger.log(LogLevel.Fatal, () => ({ msg: "random5" }), () => new Error("randomex5"));

  setTimeout(() => {
    const messages = getMessages(logger);
    expect(messages.length).toEqual(40);

    const result = getMessagesAsString(logger);
    expect(result).toContain("trace1");
    expect(result).toContain("trace2");
    expect(result).toContain("trace3");
    expect(result).toContain("trace4");
    expect(result).toContain("trace5");

    expect(result).toContain("debug1");
    expect(result).toContain("debug2");
    expect(result).toContain("debug3");
    expect(result).toContain("debug4");
    expect(result).toContain("debug5");

    expect(result).toContain("info1");
    expect(result).toContain("info2");
    expect(result).toContain("info3");
    expect(result).toContain("info4");
    expect(result).toContain("info5");

    expect(result).toContain("warn1");
    expect(result).toContain("warn2");
    expect(result).toContain("warn3");
    expect(result).toContain("warn4");
    expect(result).toContain("warn5");

    expect(result).toContain("error1");
    expect(result).toContain("errorex1");
    expect(result).toContain("error2");
    expect(result).toContain("errorex2");
    expect(result).toContain("error3");
    expect(result).toContain("errorex3");
    expect(result).toContain("error4");
    expect(result).toContain("errorex4");
    expect(result).toContain("error5");
    expect(result).toContain("errorex5");

    expect(result).toContain("resolved1");
    expect(result).toContain("resolvedex1");
    expect(result).toContain("resolved2");
    expect(result).toContain("resolvedex2");
    expect(result).toContain("resolved3");
    expect(result).toContain("resolvedex3");
    expect(result).toContain("resolved4");
    expect(result).toContain("resolvedex4");
    expect(result).toContain("resolved5");
    expect(result).toContain("resolvedex5");

    expect(result).toContain("fatal1");
    expect(result).toContain("fatalex1");
    expect(result).toContain("fatal2");
    expect(result).toContain("fatalex2");
    expect(result).toContain("fatal3");
    expect(result).toContain("fatalex3");
    expect(result).toContain("fatal4");
    expect(result).toContain("fatalex4");
    expect(result).toContain("fatal5");
    expect(result).toContain("fatalex5");

    expect(result).toContain("random1");
    expect(result).toContain("randomex1");
    expect(result).toContain("random2");
    expect(result).toContain("randomex2");
    expect(result).toContain("random3");
    expect(result).toContain("randomex3");
    expect(result).toContain("random4");
    expect(result).toContain("randomex4");
    expect(result).toContain("random5");
    expect(result).toContain("randomex5");
    done();
  }, 500);
};

describe("CategoryLogger...", () => {

  let catRoot: Category;
  let catChild1: Category;
  let catChild2: Category;

  beforeEach(() => {
    CategoryServiceFactory.clear();
    catRoot = new Category("root");
    catChild1 = new Category("child1", catRoot);
    catChild2 = new Category("child2", catRoot);
  });

  afterEach(() => {
    CategoryServiceFactory.clear();
  });

  it("Default logs to error", () => {
    // Need to switch to messagebuffer for testing, by default or it will go to console.
    CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Error, LoggerType.MessageBuffer));

    const logger = CategoryServiceFactory.getLogger(catRoot);
    logger.trace("Trace", catRoot);
    logger.debug("Debug", catRoot);
    logger.info("Info", catRoot);
    logger.warn("Warn", catRoot);
    logger.error("Error", null, catRoot);

    let msg = getMessagesAsString(logger);
    expect(msg).not.toContain("[root] Trace");
    expect(msg).not.toContain("[root] Debug");
    expect(msg).not.toContain("[root] Info");
    expect(msg).not.toContain("[root] Warn");
    expect(msg).toContain("[root] Error");

    logger.error("Fatal", null, catRoot);
    msg = getMessagesAsString(logger);
    expect(msg).toContain("[root] Error");
    expect(msg).toContain("[root] Fatal");
  });

  it("Logs to different levels", () => {
    CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Trace, LoggerType.MessageBuffer));

    const logger = CategoryServiceFactory.getLogger(catRoot);
    logger.trace("Trace", catRoot);
    logger.debug("Debug", catRoot);
    logger.info("Info", catRoot);
    logger.warn("Warn", catRoot);
    logger.error("Error", null, catRoot);
    logger.error("Fatal", null, catRoot);

    const messages = getMessages(logger);
    expect(messages.length).toEqual(6);
    expect(messages[0]).toContain("[root] Trace");
    expect(messages[1]).toContain("[root] Debug");
    expect(messages[2]).toContain("[root] Info");
    expect(messages[3]).toContain("[root] Warn");
    expect(messages[4]).toContain("[root] Error");
    expect(messages[5]).toContain("[root] Fatal");
  });

  it("Logs to root category by default", () => {
    CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Trace, LoggerType.MessageBuffer));
    const logger = CategoryServiceFactory.getLogger(catRoot);

    logger.info("Hello");
    const messages = getMessages(logger);
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("[root] Hello");
  });

  it("Logs to different levels", () => {
    CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info, LoggerType.MessageBuffer));
    const logger = CategoryServiceFactory.getLogger(catRoot);
    logger.info(() => "Dance", catRoot);
    const messages = getMessages(logger);
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("[root] Dance");
  });

  it("Category log picks up changes", () => {
    CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info, LoggerType.MessageBuffer));
    const catSome = new Category("catSome");
    const catAnother = new Category("catAnother", catSome);

    catSome.info("info");
    catSome.trace("trace");
    catAnother.info("info");
    catAnother.trace("trace");

    let messages = getMessages(catSome);
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("info");

    messages = getMessages(catAnother);
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("info");

    CategoryServiceFactory.setConfigurationCategory(new CategoryConfiguration(LogLevel.Trace, LoggerType.MessageBuffer), catSome, true);
    catSome.info("info1");
    catSome.trace("trace1");
    messages = getMessages(catSome);
    expect(messages.length).toEqual(2);
    expect(messages[0]).toContain("info1");
    expect(messages[1]).toContain("trace1");

    catAnother.info("info1");
    catAnother.info("trace1");
    messages = getMessages(catSome);
    expect(messages.length).toEqual(2);
    expect(messages[0]).toContain("info1");
    expect(messages[1]).toContain("trace1");
  });

  it("Category can log to multiple categories", () => {
    CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info, LoggerType.MessageBuffer));
    const catService = new Category("service");
    const catSome = new Category("catSome");
    const catAnother = new Category("catAnother", catSome);

    catAnother.info("info", catService, catSome);

    const messages = getMessages(catAnother);
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("info");
    expect(messages[0]).toContain("[catAnother, service, catSome]");
  });

  describe("LogData", () => {
    const data = {key: "data"};
    const msg = "Message";
    let logger: CategoryLogger;

    beforeEach(() => {
      // Need to switch to messagebuffer for testing, by default or it will go to console.
      CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Trace, LoggerType.MessageBuffer));

      logger = CategoryServiceFactory.getLogger(catRoot);
    });

    it("Can handle LogData with custom ds", () => {
      logger.info({msg, data, ds: (d: any) => "hello " + d.key}, catRoot);

      const messages: string[] = getMessages(logger);
      expect(messages.length).toEqual(1);
      expect(messages[0]).toContain(msg + " [data]: hello " + data.key);
    });

    it("Can handle LogData without custom ds", () => {
      logger.info({msg, data}, catRoot);

      const messages: string[] = getMessages(logger);
      expect(messages.length).toEqual(1);
      expect(messages[0]).toContain(msg + " [data]: " + JSON.stringify(data));
    });

    it("Can handle LogData without custom ds and only message", () => {
      logger.info({msg}, catRoot);

      const messages: string[] = getMessages(logger);
      expect(messages.length).toEqual(1);
      expect(messages[0]).toContain(msg);
    });

    it("Test we do not bail on invalid error object", (doneFn) => {
      CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info, LoggerType.MessageBuffer));

      // Invalid error passsed in, this case a literal object. We should not bail out.
      const invalidError = { invalid : "bla" };
      catRoot.error("Failed1", invalidError as any);

      // Next invalid error, but cannot be stringified either. We should not bail out.
      const anotherInvalidError = new InvalidError();
      anotherInvalidError.setSelf(anotherInvalidError);

      catRoot.error("Failed2", anotherInvalidError as any);

      setTimeout(() => {
        const messages = getMessages(logger);
        expect(messages.length === 2);

        expect(messages[0]).toContain("Unexpected error object was passed in. Could not resolve it, stringified object: {\"invalid\":\"bla\"}");
        expect(messages[1]).toContain("Unexpected error object was passed in. Could not resolve it or stringify it");
        doneFn();
      }, 50)
    });
  });

  describe("Normal log methods support normal parameters and lambdas", () => {

    let logger: CategoryLogger;

    beforeEach(() => {
      // Need to switch to messagebuffer for testing, by default or it will go to console.
      CategoryServiceFactory.clear();
      CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Trace, LoggerType.MessageBuffer));
    });

    it("Tests all log levels", (doneFn) => {
      logger = CategoryServiceFactory.getLogger(catRoot);
      logsAllLevels(logger, doneFn);
    });

    it("Tests all log levels when using category directly", (doneFn) => {
      logsAllLevels(catRoot, doneFn);
    });

    it("Doesn't matter which one to use", () => {
      catRoot.info("Bla1");
      logger = CategoryServiceFactory.getLogger(catRoot);
      logger.info("Bla2");

      const fromLogger = getMessages(logger);
      const fromCategory = getMessages(catRoot);

      expect(fromLogger.length).toEqual(2);
      expect(fromCategory.length).toEqual(2);
    });
  });
});

class InvalidError {

  private _self: InvalidError;

  public setSelf(self: InvalidError) {
    this._self = self;
  }
}
