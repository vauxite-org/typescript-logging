import {Category, CategoryLogger} from "../src/CategoryLogger";
import {CategoryServiceFactory, CategoryDefaultConfiguration} from "../src/CategoryService";
import {LogLevel, LoggerType} from "../src/LoggerOptions";
import {CategoryDelegateLoggerImpl} from "../src/CategoryDelegateLoggerImpl";
import {CategoryMessageBufferLoggerImpl} from "../src/CategoryMessageBufferImpl";

const getMessages = (logger: CategoryLogger) => {
  expect(logger instanceof CategoryDelegateLoggerImpl).toBeTruthy();
  const actualLogger = (<CategoryDelegateLoggerImpl>logger).delegate;
  expect(actualLogger instanceof CategoryMessageBufferLoggerImpl).toBeTruthy();
  return (<CategoryMessageBufferLoggerImpl>actualLogger).toString();
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
    // Need to switch to messagebuffer by default or it will go to console.
    CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Error, LoggerType.MessageBuffer));

    const logger = CategoryServiceFactory.getLogger(catRoot);
    logger.trace("Trace", catRoot);
    logger.debug("Debug", catRoot);
    logger.info("Info", catRoot);
    logger.warn("Warn", catRoot);
    logger.error("Error", null, catRoot);

    let msg = getMessages(logger);
    expect(msg).not.toContain("[root] Trace");
    expect(msg).not.toContain("[root] Debug");
    expect(msg).not.toContain("[root] Info");
    expect(msg).not.toContain("[root] Warn");
    expect(msg).toContain("[root] Error");

    logger.error("Fatal", null, catRoot);
    msg = getMessages(logger);
    expect(msg).toContain("[root] Error");
    expect(msg).toContain("[root] Fatal");
  });

});