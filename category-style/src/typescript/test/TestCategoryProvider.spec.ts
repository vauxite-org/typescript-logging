import {CATEGORY_PROVIDER_SERVICE} from "../main/impl/CategoryProviderService";
import {$test, ArgumentFormatterType, DateFormatterType, LogLevel, RawLogChannel} from "typescript-logging";
import {CategoryProvider} from "../main/api/CategoryProvider";

describe("Test CategoryProvider", () => {

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    CATEGORY_PROVIDER_SERVICE.clear();
  });

  test("Test create provider with default config set", () => {
    const provider = CategoryProvider.createProvider("test");

    expect(provider.name).toEqual("test");
    const config = provider.runtimeConfig;
    expect(config.level).toEqual(LogLevel.Error);
    expect(config.allowSameCategoryName).toEqual(true);
  });

  test("Test create provider with custom config", () => {
    const channel: RawLogChannel = {
      type: "RawLogChannel",
      write: () => null,
    };

    const argumentFormatter: ArgumentFormatterType = () => "";
    const dateFormatter: DateFormatterType = () => "";

    const provider = CategoryProvider.createProvider("test1", {
      channel,
      level: LogLevel.Debug,
      argumentFormatter,
      dateFormatter,
      allowSameCategoryName: false,
    });

    expect(provider.name).toEqual("test1");
    const config = provider.runtimeConfig;
    expect(config.channel).toEqual(channel);
    expect(config.argumentFormatter).toEqual(argumentFormatter);
    expect(config.dateFormatter).toEqual(dateFormatter);
    expect(config.level).toEqual(LogLevel.Debug);
    expect(config.allowSameCategoryName).toEqual(false);
  });

  test("Test merging of log levels works as expected", () => {
    let provider = CategoryProvider.createProvider("test1", {
      level: LogLevel.Debug
    });

    expect(provider.config.level).toEqual(LogLevel.Debug);

    /* Trace is numeric value 0, which went wrong as it used a ternary check where 'truthy/falsy' came into play ... */
    provider = CategoryProvider.createProvider("test2", {
      level: LogLevel.Trace
    });

    expect(provider.config.level).toEqual(LogLevel.Trace);
  });

  test("Test provider creates correct loggers", () => {
    const channel = new $test.ArrayRawLogChannel();

    const provider = CategoryProvider.createProvider("test1", {
      channel,
      level: LogLevel.Debug,
    });

    const root = provider.getCategory("root");
    expect(root.name).toEqual("root");
    expect(root.parent).toBeUndefined();
    expect(root.path).toEqual(["root"]);
    expect(root.id).toEqual("test1_1");
    expect(root.children).toEqual([]);
    expect(root.logLevel).toEqual(LogLevel.Debug);

    const child1 = root.getChildCategory("child1");
    expect(child1.name).toEqual("child1");
    expect(child1.parent?.name).toEqual("root");
    expect(child1.path).toEqual(["root", "child1"]);
    expect(child1.id).toEqual("test1_2");
    expect(child1.children).toEqual([]);
    expect(child1.logLevel).toEqual(LogLevel.Debug);
    expect(root.children.length).toEqual(1);
    expect(root.children[0]).toEqual(child1);

    /* Getting them again should be same instances */
    expect(provider.getCategory("root")).toEqual(root);
    expect(provider.getCategory("child1", root)).toEqual(child1);
    expect(root.getChildCategory("child1")).toEqual(child1);
  });

  test("Test that runtime for category can be updated", () => {
    const channel = new $test.ArrayRawLogChannel();

    const provider = CategoryProvider.createProvider("test", {
      channel,
      level: LogLevel.Error,
    });

    const root = provider.getCategory("root");
    expect(root.logLevel).toEqual(LogLevel.Error);
    expect(root.runtimeSettings.channel).toEqual(channel);

    const child1 = root.getChildCategory("child1");
    const child2 = provider.getCategory("child2", root);
    expect(child1.logLevel).toEqual(LogLevel.Error);
    expect(child1.runtimeSettings.channel).toEqual(channel);
    expect(child2.logLevel).toEqual(LogLevel.Error);
    expect(child2.runtimeSettings.channel).toEqual(channel);

    /* Update only root */
    provider.updateRuntimeSettingsCategory(root, {level: LogLevel.Info, disableRecursion: true});
    expect(root.logLevel).toEqual(LogLevel.Info);
    expect(child1.logLevel).toEqual(LogLevel.Error);
    expect(child2.logLevel).toEqual(LogLevel.Error);

    root.info("root");
    child1.info("child1");
    child2.info("child2");
    expect(channel.messages).toEqual(["root"]);

    /* Change root recursively (the default behavior) */
    channel.clear();
    provider.updateRuntimeSettingsCategory(root, {level: LogLevel.Debug});
    expect(root.logLevel).toEqual(LogLevel.Debug);
    expect(child1.logLevel).toEqual(LogLevel.Debug);
    expect(child2.logLevel).toEqual(LogLevel.Debug);

    root.debug("root");
    child1.debug("child1");
    child2.debug("child2");
    child2.trace("trace"); // Should not be seen.
    expect(channel.messages).toEqual(["root", "child1", "child2"]);

    /* New child should take over from its parent */
    const child11 = child1.getChildCategory("child1_1");
    expect(child11.logLevel).toEqual(LogLevel.Debug);

    /* New root loggers still use the original setting */
    const root2 = provider.getCategory("root2");
    expect(root2.logLevel).toEqual(LogLevel.Error);

    /* This sets all existing categories (and new) to trace */
    channel.clear();
    provider.updateRuntimeSettings({level: LogLevel.Trace});
    expect(root.logLevel).toEqual(LogLevel.Trace);
    expect(child1.logLevel).toEqual(LogLevel.Trace);
    expect(child11.logLevel).toEqual(LogLevel.Trace);
    expect(child2.logLevel).toEqual(LogLevel.Trace);
    expect(root2.logLevel).toEqual(LogLevel.Trace);

    root.trace("root");
    child1.trace("child1");
    child11.trace("child11");
    child2.trace("child2");
    root2.trace("root2");
    expect(channel.messages).toEqual(["root", "child1", "child11", "child2", "root2"]);

    /* Now a new root category should start on trace */
    const root3 = provider.getCategory("root3");
    const root3Child1 = root3.getChildCategory("child1");
    expect(root3.logLevel).toEqual(LogLevel.Trace);
    expect(root3Child1.logLevel).toEqual(LogLevel.Trace);

    /* Finally check the config of the provider, original should be the same as start */
    expect(provider.config.allowSameCategoryName).toEqual(true);
    expect(provider.config.level).toEqual(LogLevel.Error);
    expect(provider.config.channel).toEqual(channel);

    /* Runtime must match the current config */
    expect(provider.runtimeConfig.allowSameCategoryName).toEqual(true);
    expect(provider.runtimeConfig.level).toEqual(LogLevel.Trace);
    expect(provider.runtimeConfig.channel).toEqual(channel);
  });

  test("Test that channel can be changed", () => {
    const channel1 = new $test.ArrayRawLogChannel();
    const channel2 = new $test.ArrayRawLogChannel();

    const provider = CategoryProvider.createProvider("test", {
      level: LogLevel.Info,
      channel: channel1,
    });

    const root = provider.getCategory("root");
    expect(root.logLevel).toEqual(LogLevel.Info);
    expect(root.runtimeSettings.channel).toEqual(channel1);

    const child1 = root.getChildCategory("child1");
    expect(child1.logLevel).toEqual(LogLevel.Info);
    expect(child1.runtimeSettings.channel).toEqual(channel1);

    root.info("root");
    child1.info("child1");
    expect(channel1.messages).toEqual(["root", "child1"]);

    /* Change the channel */
    provider.updateRuntimeSettings({
      channel: channel2,
    });
    expect(channel2.messages).toEqual([]);

    expect(root.logLevel).toEqual(LogLevel.Info);
    expect(root.runtimeSettings.channel).toEqual(channel2);
    expect(child1.logLevel).toEqual(LogLevel.Info);
    expect(child1.runtimeSettings.channel).toEqual(channel2);

    root.info("root_channel2");
    child1.info("child_channel2");
    expect(channel2.messages).toEqual(["root_channel2", "child_channel2"]);

    /* Channel 1 should be unchanged */
    expect(channel1.messages).toEqual(["root", "child1"]);

    /* new (child) categories should have channel2 as well */
    const root2 = provider.getCategory("root2");
    const child2 = root.getChildCategory("child2");

    expect(root2.logLevel).toEqual(LogLevel.Info);
    expect(root2.runtimeSettings.channel).toEqual(channel2);
    expect(child2.logLevel).toEqual(LogLevel.Info);
    expect(child2.runtimeSettings.channel).toEqual(channel2);
  });

  test("Test passed arguments are correct", () => {
    const channel = new $test.ArrayRawLogChannel();
    const provider = CategoryProvider.createProvider("test", {
      level: LogLevel.Debug,
      channel,
    });

    const root = provider.getCategory("root");
    root.debug("hello1");

    root.debug("hello2", 10);
    root.debug("hello3", {val: 100});
    root.debug(() => "hello4", "oops", {val: 100}, {str: "abc"}, [10, 11]);

    expect(channel.messages).toEqual(["hello1", "hello2", "hello3", "hello4"]);
    expect(channel.rawMessages.map(msg => msg.args)).toEqual([undefined, [10], [{val: 100}], ["oops", {val: 100}, {str: "abc"}, [10, 11]]]);
  });
});
