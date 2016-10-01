import {Category, CategoryLogger} from "../src/logging/CategoryLogger";
import {CategoryServiceFactory, CategoryDefaultConfiguration} from "../src/logging/CategoryService";
import {LogLevel, LoggerType} from "../src/logging/LoggerOptions";
import {CategoryDelegateLoggerImpl} from "../src/logging/CategoryDelegateLoggerImpl";
import {CategoryMessageBufferLoggerImpl} from "../src/logging/CategoryMessageBufferImpl";

const getMessagesAsString = (logger: CategoryLogger): string => {
  expect(logger instanceof CategoryDelegateLoggerImpl).toBeTruthy();
  const actualLogger = (<CategoryDelegateLoggerImpl>logger).delegate;
  expect(actualLogger instanceof CategoryMessageBufferLoggerImpl).toBeTruthy();
  return (<CategoryMessageBufferLoggerImpl>actualLogger).toString();
};

const getMessages = (logger: CategoryLogger): string[] => {
  expect(logger instanceof CategoryDelegateLoggerImpl).toBeTruthy();
  const actualLogger = (<CategoryDelegateLoggerImpl>logger).delegate;
  expect(actualLogger instanceof CategoryMessageBufferLoggerImpl).toBeTruthy();
  return (<CategoryMessageBufferLoggerImpl>actualLogger).getMessages();
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
    CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Error, LoggerType.MessageBuffer), true);

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
    CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Trace, LoggerType.MessageBuffer), true);

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
    CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Trace, LoggerType.MessageBuffer), true);
    const logger = CategoryServiceFactory.getLogger(catRoot);

    logger.info("Hello");
    const messages = getMessages(logger);
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("[root] Hello");
  });
});