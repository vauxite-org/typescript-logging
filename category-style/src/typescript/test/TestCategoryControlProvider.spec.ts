import {$test, LogLevel} from "typescript-logging-core";
import {CATEGORY_LOG_CONTROL, CATEGORY_PROVIDER_SERVICE} from "../main/impl/CategoryProviderService";
import {CategoryProvider} from "../main/api/CategoryProvider";

describe("Test CategoryControlProvider", () => {
  const message = new $test.TestControlMessage();

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    CATEGORY_PROVIDER_SERVICE.clear();
    message.clear();
  });

  test("Test fetching non-existing provider fails", () => {
    const control = CATEGORY_LOG_CONTROL(message.write);

    CategoryProvider.createProvider("test");

    /* By number */
    expect(() => control.getProvider(1)).toThrowError(new Error("Provider with index '1' does not exist (outside of range)."));
    expect(() => control.getProvider(-1)).toThrowError(new Error("Provider with index '-1' does not exist (outside of range)."));

    /* By name */
    expect(() => control.getProvider("nope")).toThrowError(new Error("Provider with name 'nope' does not exist."));
  });

  test("Test the help is present for the control", () => {
    const control = CATEGORY_LOG_CONTROL(message.write);
    control.help();
    expect(message.messages.join("\n")).toContain("You can use the following commands:");
  });

  test("Test fetching existing provider succeeds", () => {
    const control = CATEGORY_LOG_CONTROL(message.write);

    CategoryProvider.createProvider("test1");
    CategoryProvider.createProvider("test2");

    const controlProvider1 = control.getProvider("test1");
    const controlProvider2 = control.getProvider("test2");
    const controlProvider1ByIndex = control.getProvider(0);
    const controlProvider2ByIndex = control.getProvider(1);

    expect(controlProvider1.name).toEqual("test1");
    expect(controlProvider2.name).toEqual("test2");
    expect(controlProvider1ByIndex.name).toEqual("test1");
    expect(controlProvider2ByIndex.name).toEqual("test2");
  });

  test("Test control provider shows current provider settings", () => {
    const control = CATEGORY_LOG_CONTROL(message.write);

    control.showSettings();
    expect(message.messages).toEqual(["Available CategoryProviders:\n"]);

    CategoryProvider.createProvider("Awesome Provider");
    CategoryProvider.createProvider("Even More Awesome Provider");

    message.clear();
    control.showSettings();

    expect(message.messages).toEqual(["Available CategoryProviders:\n  [0, Awesome Provider          ]\n  [1, Even More Awesome Provider]\n"]);

    /* Create 8 more, to get to 10 */
    let expectedValue = "Available CategoryProviders:\n  [ 0, Awesome Provider          ]\n  [ 1, Even More Awesome Provider]\n";
    for (let i = 2; i < 10; i++) {
      const provider = CategoryProvider.createProvider("Another Awesome One: " + i);
      expectedValue += "  [" + ((i < 10) ? " " + i : i) + ", " + provider.name + ((i < 10) ? "    " : "   ") + "]\n";
    }
    message.clear();
    control.showSettings();

    expect(message.messages).toEqual([expectedValue]);
  });

  test("Test control provider shows settings for a CategoryProvider", () => {
    const control = CATEGORY_LOG_CONTROL(message.write);

    const provider = CategoryProvider.createProvider("test");
    const controlProvider = control.getProvider("test");
    controlProvider.showSettings();

    expect(message.messages).toEqual(["Available categories (CategoryProvider 'test'):\n"]);

    const root = provider.getCategory("root");
    const child1 = root.getChildCategory("child 1");
    child1.getChildCategory("child 1_1");
    child1.getChildCategory("child 1_2");
    const child2 = root.getChildCategory("child 2");
    child2.getChildCategory("child 2_1");

    message.clear();
    controlProvider.showSettings();

    const expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Error)]",
      "  [2,   child 1_1 (level=Error)]",
      "  [3,   child 1_2 (level=Error)]",
      "  [4,  child 2    (level=Error)]",
      "  [5,   child 2_1 (level=Error)]",
    ];

    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);
  });

  test("Test control provider can change level by index", () => {
    const control = CATEGORY_LOG_CONTROL(message.write);

    const provider = CategoryProvider.createProvider("test");
    const controlProvider = control.getProvider("test");
    controlProvider.showSettings();

    const root = provider.getCategory("root");
    const child1 = root.getChildCategory("child 1");
    child1.getChildCategory("child 1_1");
    child1.getChildCategory("child 1_2");

    message.clear();
    controlProvider.showSettings();

    let expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Error)]",
      "  [2,   child 1_1 (level=Error)]",
      "  [3,   child 1_2 (level=Error)]",
    ];
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);
    message.clear();

    /* Change by index 3 */
    controlProvider.update("debug", 3);
    expect(message.messages).toEqual(["Successfully updated category 'child 1_2' by index '3' to log level 'debug' and recursively applied to children (if any)."]);
    message.clear();

    expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Error)]",
      "  [2,   child 1_1 (level=Error)]",
      "  [3,   child 1_2 (level=Debug)]",
    ];
    controlProvider.showSettings();
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);
    message.clear();

    /* Now update root to trace, should be applied recursively by default */
    controlProvider.update("trace", 0);
    expect(message.messages).toEqual(["Successfully updated category 'root' by index '0' to log level 'trace' and recursively applied to children (if any)."]);
    message.clear();

    expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Trace)]",
      "  [1,  child 1    (level=Trace)]",
      "  [2,   child 1_1 (level=Trace)]",
      "  [3,   child 1_2 (level=Trace)]",
    ];
    controlProvider.showSettings();
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);

    /* Some sanity checks, all should be trace - also new categories created from existing should take over trace */
    expect(root.logLevel).toEqual(LogLevel.Trace);
    expect(child1.logLevel).toEqual(LogLevel.Trace);

    const child2 = root.getChildCategory("child 2");
    expect(child2.logLevel).toEqual(LogLevel.Trace);

    /* Now only update child_1, non recursive */
    message.clear();
    controlProvider.update("info", 1, true);
    expect(message.messages).toEqual(["Successfully updated category 'child 1' by index '1' to log level 'info'."]);
    message.clear();

    expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Trace)]",
      "  [1,  child 1    (level=Info )]",
      "  [2,   child 1_1 (level=Trace)]",
      "  [3,   child 1_2 (level=Trace)]",
      "  [4,  child 2    (level=Trace)]",
    ];
    controlProvider.showSettings();
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);
  });

  it("Test control provider can reset to original log levels", () => {
    // noinspection DuplicatedCode
    const control = CATEGORY_LOG_CONTROL(message.write);
    const provider = CategoryProvider.createProvider("test");

    const root = provider.getCategory("root");
    const child1 = root.getChildCategory("child 1");
    child1.getChildCategory("child 1_1");
    const child2 = root.getChildCategory("child 2");

    /* Change log levels */
    provider.updateRuntimeSettingsCategory(child1, {level: LogLevel.Info});
    provider.updateRuntimeSettingsCategory(child2, {level: LogLevel.Warn});

    /* Create the control provider, it will store current levels to reset to later */
    const controlProvider = control.getProvider("test");
    controlProvider.showSettings();

    let expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Info )]",
      "  [2,   child 1_1 (level=Info )]",
      "  [3,  child 2    (level=Warn )]",
    ];
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);

    controlProvider.update("debug", "root");
    message.clear();

    expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Debug)]",
      "  [1,  child 1    (level=Debug)]",
      "  [2,   child 1_1 (level=Debug)]",
      "  [3,  child 2    (level=Debug)]",
    ];
    controlProvider.showSettings();
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);

    /* Now reset it should go back to the initial */
    controlProvider.reset();
    message.clear();
    controlProvider.showSettings();

    expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Info )]",
      "  [2,   child 1_1 (level=Info )]",
      "  [3,  child 2    (level=Warn )]",
    ];
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);
  });

  it("Test control provider can use save and restore", () => {
    // noinspection DuplicatedCode
    const control = CATEGORY_LOG_CONTROL(message.write);
    const provider = CategoryProvider.createProvider("test");

    const root = provider.getCategory("root");
    const child1 = root.getChildCategory("child 1");
    child1.getChildCategory("child 1_1");
    const child2 = root.getChildCategory("child 2");

    /* Change log levels */
    provider.updateRuntimeSettingsCategory(child1, {level: LogLevel.Info});
    provider.updateRuntimeSettingsCategory(child2, {level: LogLevel.Warn});

    /* Create the control provider, it will store current levels to reset to later */
    const controlProvider = control.getProvider("test");
    controlProvider.showSettings();

    let expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Info )]",
      "  [2,   child 1_1 (level=Info )]",
      "  [3,  child 2    (level=Warn )]",
    ];
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);
    controlProvider.save();
    controlProvider.reset();

    message.clear();
    provider.updateRuntimeSettingsCategory(child1, {level: LogLevel.Error});
    provider.updateRuntimeSettingsCategory(child2, {level: LogLevel.Error});

    controlProvider.showSettings();
    expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Error)]",
      "  [2,   child 1_1 (level=Error)]",
      "  [3,  child 2    (level=Error)]",
    ];
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);

    message.clear();
    controlProvider.restore(true);
    expect(message.messages).toEqual(["Successfully restored state for CategoryControlProvider 'test'"]);
    message.clear();

    expectedArr = [
      "Available categories (CategoryProvider 'test'):",
      "  [0, root        (level=Error)]",
      "  [1,  child 1    (level=Info )]",
      "  [2,   child 1_1 (level=Info )]",
      "  [3,  child 2    (level=Warn )]",
    ];
    controlProvider.showSettings();
    expect(message.messages).toEqual([expectedArr.join("\n") + "\n"]);
  });
});
