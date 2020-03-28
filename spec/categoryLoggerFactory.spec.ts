import {CategoryLogger} from "../src/logging/log/category/CategoryLogger";
import {CategoryServiceImpl} from "../src/logging/log/category/CategoryService";
import {CategoryDelegateLoggerImpl} from "../src/logging/log/category/CategoryDelegateLoggerImpl";
import {LoggerType, DateFormatEnum, LogLevel, CategoryLogFormat, DateFormat} from "../src/logging/log/LoggerOptions";
import {AbstractCategoryLogger, CategoryLogMessage} from "../src/logging/log/category/AbstractCategoryLogger";
import {LogData} from "../src/logging/log/LogData";
import {CategoryMessageBufferLoggerImpl} from "../src/logging/log/category/CategoryMessageBufferImpl";
import {Category} from "../src/logging/log/category/Category";
import {RuntimeSettings} from "../src/logging/log/category/RuntimeSettings";
import {CategoryRuntimeSettings} from "../src/logging/log/category/CategoryRuntimeSettings";
import {CategoryConfiguration} from "../src/logging/log/category/CategoryConfiguration";
import {CategoryServiceFactory} from "../src/logging/log/category/CategoryServiceFactory";
import {CategoryConsoleLoggerImpl} from "../src/logging/log/category/CategoryConsoleLoggerImpl";

const getBufferedMessages = (logger: CategoryLogger): string[] => {
  expect(logger instanceof CategoryDelegateLoggerImpl).toBeTruthy();
  const actualLogger = (logger as CategoryDelegateLoggerImpl).delegate;
  expect(actualLogger instanceof CategoryMessageBufferLoggerImpl).toBeTruthy();
  return (actualLogger as CategoryMessageBufferLoggerImpl).getMessages();
};

describe("Categories", () => {

  it("Plays with categories", () => {
    const root1 = new Category("root1");
    const root2 = new Category("root2");

    const child1 = new Category("root1_child1", root1);
    const root2Child1 = new Category("root2_child2", root2);

    const child11 = new Category("root1_child1_child11", child1);
    const child12 = new Category("root1_child1_child12", child1);

    expect(root1.parent).toBeNull();
    expect(child1.parent === root1).toBeTruthy();
    expect(root1.children.length).toEqual(1);
    expect(child1.children.length).toEqual(2);
    expect(child11.parent === child1).toBeTruthy();
    expect(child12.parent === child1).toBeTruthy();
    expect(child11.children.length).toEqual(0);
    expect(child12.children.length).toEqual(0);

    expect(root2.parent).toBeNull();
    expect(root2.children.length).toEqual(1);
    expect(root2Child1.parent === root2).toBeTruthy();
    expect(root2Child1.parent === root1).toBeFalsy();
  });

  it("Fails when forbidden character is used in category", () => {
    expect(() => new Category("abc")).not.toThrow();
    expect(() => new Category("a#")).toThrow();
  });
});

describe("CategoryServiceFactory", () => {

  let root1: Category | null = null;
  let child1: Category | null = null;
  let child11: Category | null = null;
  let child12: Category | null = null;
  let logger: CategoryLogger | null = null;

  beforeEach(() => {
    CategoryServiceFactory.clear();
    root1 = new Category("root1");
    child1 = new Category("child1", root1);
    child11 = new Category("child11", child1);
    child12 = new Category("child12", child1);
    logger = CategoryServiceFactory.getLogger(root1);
  });

  afterEach(() => {
    root1 = null;
    child1 = null;
    child11 = null;
    child12 = null;
    logger = null;
    CategoryServiceFactory.clear();
  });

  it("Defaults works", () => {
    expect(root1).not.toBeNull();
    expect(logger).not.toBeNull();
  });

  it("All categories have runtime settings", () => {
    const service = CategoryServiceImpl.getInstance();
    expect(service.getCategorySettings(root1 as Category)).not.toBeNull();
    expect(service.getCategorySettings(child1 as Category)).not.toBeNull();
    expect(service.getCategorySettings(child11 as Category)).not.toBeNull();
    expect(service.getCategorySettings(child12 as Category)).not.toBeNull();
  });

  it("Allows to fetch by all categories", () => {
    expect(() => CategoryServiceFactory.getLogger(child1 as Category)).toBeDefined();
    expect(() => CategoryServiceFactory.getLogger(child11 as Category)).toBeDefined();
    expect(() => CategoryServiceFactory.getLogger(child12 as Category)).toBeDefined();
  });

  it("Allows adding root category dynamically", () => {
    // This will register it automatically.
    const extraRoot = new Category("root2");
    const child = new Category("someChild", extraRoot);

    const anotherLogger = CategoryServiceFactory.getLogger(extraRoot);
    expect(anotherLogger).not.toBeNull();
    expect(anotherLogger !== logger).toBeTruthy();

    const service = CategoryServiceImpl.getInstance();
    expect(service.getCategorySettings(extraRoot)).not.toBeNull();
    expect(service.getCategorySettings(child)).not.toBeNull();
  });

  it("Allows adding child category dynamically", () => {
    const child121 = new Category("hello", child12);
    expect(CategoryServiceImpl.getInstance().getCategorySettings(child121)).not.toBeNull();
    expect(child121.getCategoryPath()).toEqual("root1#child1#child12#hello");
  });

  it("Will return the same logger for root", () => {
    const anotherLogger = CategoryServiceFactory.getLogger(root1 as Category);
    expect(anotherLogger === logger).toBeTruthy();
  });

  it("Loggers are wrapped in delegate", () => {
    const delegate = CategoryServiceFactory.getLogger(root1 as Category);
    expect(delegate instanceof CategoryDelegateLoggerImpl).toBeTruthy();
  });

  const checkDefaultConfig = (cat: Category, settings: CategoryRuntimeSettings) => {
    expect(settings.category === cat).toBeTruthy();
    expect(settings.loggerType === LoggerType.Console).toBeTruthy();
    expect(settings.logFormat.showCategoryName).toBeTruthy();
    expect(settings.logFormat.showTimeStamp).toBeTruthy();
    expect(settings.logFormat.dateFormat.dateSeparator).toEqual("-");
    expect(settings.logFormat.dateFormat.formatEnum === DateFormatEnum.Default).toBeTruthy();
    expect(settings.logLevel === LogLevel.Error).toBeTruthy();
    expect(settings.callBackLogger).toBeNull();
  };

  it("Default configuration is applied to loggers", () => {

    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));
    checkDefaultConfig(child1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child1 as Category));
    checkDefaultConfig(child11 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child11 as Category));
    checkDefaultConfig(child12 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child12 as Category));

    const root2 = new Category("root2");
    const another = new Category("someChild", root2);

    checkDefaultConfig(root2, CategoryServiceImpl.getInstance().getCategorySettings(root2));
    checkDefaultConfig(another, CategoryServiceImpl.getInstance().getCategorySettings(another));

    expect(CategoryServiceFactory.getLogger(root2) instanceof CategoryDelegateLoggerImpl).toBeTruthy();
  });

  it("New default configuration can be applied to loggers", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const checkChangedConfig = (cat: Category, settings: CategoryRuntimeSettings) => {
      expect(settings.category === cat).toBeTruthy();
      expect(settings.loggerType === LoggerType.MessageBuffer).toBeTruthy();
      expect(settings.logFormat.showCategoryName).toBeFalsy();
      expect(settings.logFormat.showTimeStamp).toBeFalsy();
      expect(settings.logFormat.dateFormat.dateSeparator).toEqual("/");
      expect(settings.logFormat.dateFormat.formatEnum === DateFormatEnum.YearDayMonthWithFullTime).toBeTruthy();
      expect(settings.logLevel === LogLevel.Info).toBeTruthy();
      expect(settings.callBackLogger).toBeNull();
    };

    const configChanged = new CategoryConfiguration(
      LogLevel.Info, LoggerType.MessageBuffer, new CategoryLogFormat(new DateFormat(DateFormatEnum.YearDayMonthWithFullTime, "/"), false, false)
    );
    CategoryServiceFactory.setDefaultConfiguration(configChanged);

    checkChangedConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));
    checkChangedConfig(child1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child1 as Category));
    checkChangedConfig(child11 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child11 as Category));
    checkChangedConfig(child12 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child12 as Category));

    CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration());
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));
    checkDefaultConfig(child1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child1 as Category));
    checkDefaultConfig(child11 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child11 as Category));
    checkDefaultConfig(child12 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child12 as Category));

    // Now without reset, all will still have the previous settings. New categories added will be different.
    CategoryServiceFactory.setDefaultConfiguration(configChanged, false);
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));
    checkDefaultConfig(child1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child1 as Category));
    checkDefaultConfig(child11 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child11 as Category));
    checkDefaultConfig(child12 as Category, CategoryServiceImpl.getInstance().getCategorySettings(child12 as Category));

    const anotherRoot = new Category("anotherRoot");
    const anotherChild = new Category("someChild", anotherRoot);

    checkChangedConfig(anotherRoot, CategoryServiceImpl.getInstance().getCategorySettings(anotherRoot));
    checkChangedConfig(anotherChild, CategoryServiceImpl.getInstance().getCategorySettings(anotherChild));
  });

  it("Can use a custom logger", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const messages: string[] = [];
    const configChanged = new CategoryConfiguration(
       LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
      (rootCategory: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(rootCategory, runtimeSettings, messages)
    );
    CategoryServiceFactory.setDefaultConfiguration(configChanged);
    const rootLogger = CategoryServiceFactory.getLogger(root1 as Category);
    rootLogger.info("First Message");
    rootLogger.info("Second Message");
    expect(messages).toEqual(["First Message", "Second Message"]);
  });

  it("Can use a custom message formatter", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const configChanged = new CategoryConfiguration(LogLevel.Info, LoggerType.MessageBuffer);
    configChanged.formatterLogMessage = (msg: CategoryLogMessage): string => {
      // Just shorten the message, will only have literal text.
      const message = msg.messageAsString;
      return typeof(message) === "string" ? message : "";
    };
    CategoryServiceFactory.setDefaultConfiguration(configChanged);
    const rootLogger = CategoryServiceFactory.getLogger(root1 as Category);
    rootLogger.info("Hello root1!");
    rootLogger.info("Hello child1!", child1 as Category);

    expect(getBufferedMessages(rootLogger)).toEqual(["Hello root1!", "Hello child1!"]);
  });

  it("Cannot set custom message formatter when custom logger is used", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const messages: string[] = [];
    const configChanged = new CategoryConfiguration(
      LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
      (rootCategory: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(rootCategory, runtimeSettings, messages)
    );
    const formatterLogMessage = (msg: CategoryLogMessage): string => {
      // Just shorten the message, will only have literal text.
      const message = msg.messageAsString;
      return typeof(message) === "string" ? message : "";
    };

    expect(() => configChanged.formatterLogMessage = formatterLogMessage).toThrow("You cannot specify a formatter for log messages if your loggerType is Custom");
    CategoryServiceFactory.setDefaultConfiguration(configChanged);
  });

  it("Can set different custom formatter on category than default", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const defaultConfig = new CategoryConfiguration(LogLevel.Info, LoggerType.MessageBuffer);
    defaultConfig.formatterLogMessage = (msg: CategoryLogMessage): string => {
      // Just shorten the message, will only have literal text.
      const message = msg.messageAsString;
      return typeof(message) === "string" ? message : "";
    };

    const formatterRoot2 = (msg: CategoryLogMessage): string => {
      return msg.messageAsString + "_postFix";
    };

    const configRoot2 = new CategoryConfiguration(LogLevel.Debug, LoggerType.MessageBuffer);
    configRoot2.formatterLogMessage = formatterRoot2;

    const root2 = new Category("root2");

    CategoryServiceFactory.setDefaultConfiguration(defaultConfig);
    CategoryServiceFactory.setConfigurationCategory(configRoot2, root2);

    const rootLogger = CategoryServiceFactory.getLogger(root1 as Category);
    rootLogger.info("Hello root1!");
    rootLogger.info("Hello child1!", child1 as Category);
    const rootLogger2 = CategoryServiceFactory.getLogger(root2 as Category);
    rootLogger2.debug("Hello root2!");

    expect(getBufferedMessages(rootLogger)).toEqual(["Hello root1!", "Hello child1!"]);
    expect(getBufferedMessages(rootLogger2)).toEqual(["Hello root2!_postFix"]);
  });

  it("Does not fail reset of category settings", () => {
    const catRoot = new Category("jmod2ts");

    // Should just succeed (this was a bug) due to resetRootLogger=true flag. Fixed in 0.4.1
    CategoryServiceFactory.setConfigurationCategory(new CategoryConfiguration(LogLevel.Info), catRoot, true);
  });

  it("setConfigurationCategory() must apply changes to categories not yet used (applyChildren=false)", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const messages: string[] = [];
    const configChanged = new CategoryConfiguration(
      LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
      (rootCategory: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(rootCategory, runtimeSettings, messages)
    );

    const cat = root1 as Category;
    const catChild = child1 as Category;

    CategoryServiceFactory.setConfigurationCategory(configChanged, cat, false);
    cat.info("root message");
    catChild.info("child message");

    /*
     * The change should have applied to root *only* (parameter was false above), this means
     * that the root should log using the custom logger but the child should still use a console.
     */
    expect((catChild as any)._logger instanceof CategoryConsoleLoggerImpl);
    expect(messages).toEqual(["root message"]);
  });

  it("setConfigurationCategory() must apply changes to categories already used (applyChildren=false)", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const messages: string[] = [];
    const configChanged = new CategoryConfiguration(
      LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
      (rootCategory: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(rootCategory, runtimeSettings, messages)
    );

    const cat = root1 as Category;
    const catChild = child1 as Category;

    // Initializes the loggers internally
    cat.info("ignore");
    catChild.info("ignore");

    CategoryServiceFactory.setConfigurationCategory(configChanged, cat, false);
    cat.info("root message");
    catChild.info("child message");

    /*
     * The change should have applied to root *only* (parameter was false above), this means
     * that the root should log using the custom logger but the child should still use a console.
     */
    expect((catChild as any)._logger instanceof CategoryConsoleLoggerImpl);
    expect(messages).toEqual(["root message"]);
  });

  it("setConfigurationCategory() must apply changes to categories not yet used (applyChildren=true)", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const messages: string[] = [];
    const configChanged = new CategoryConfiguration(
      LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
      (rootCategory: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(rootCategory, runtimeSettings, messages)
    );

    const cat = root1 as Category;
    const catChild = child1 as Category;

    CategoryServiceFactory.setConfigurationCategory(configChanged, cat, true);
    cat.info("root message");
    catChild.info("child message");

    /*
     * The change should have applied to both, and must use the custom logger.
     */
    expect(messages).toEqual(["root message", "child message"]);
  });

  it("setConfigurationCategory() must apply changes to categories already used (applyChildren=true)", () => {
    checkDefaultConfig(root1 as Category, CategoryServiceImpl.getInstance().getCategorySettings(root1 as Category));

    const messages: string[] = [];
    const configChanged = new CategoryConfiguration(
      LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
      (rootCategory: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(rootCategory, runtimeSettings, messages)
    );

    const cat = root1 as Category;
    const catChild = child1 as Category;

    // Initializes the loggers internally
    cat.info("ignore");
    catChild.info("ignore");

    CategoryServiceFactory.setConfigurationCategory(configChanged, cat, true);
    cat.info("root message");
    catChild.info("child message");

    /*
     * The change should have applied to both, and must use the custom logger.
     */
    expect(messages).toEqual(["root message", "child message"]);
  });

  class CustomLogger extends AbstractCategoryLogger {

    // tslint:disable-next-line:array-type
    private messages: Array<string | LogData> = [];

    // tslint:disable-next-line:array-type
    constructor(rootCategory: Category, runtimeSettings: RuntimeSettings, messages: Array<string | LogData> ) {
      super(rootCategory, runtimeSettings);
      this.messages = messages;
    }

    protected doLog(msg: CategoryLogMessage): void {
      this.messages.push(msg.messageAsString);
    }
  }

});
