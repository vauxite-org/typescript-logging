import {LOG4TS_LOG_CONTROL, LOG4TS_PROVIDER_SERVICE} from "../main/impl/Log4TSProviderService";
import {Log4TSProvider} from "../main/api/Log4TSProvider";
import {$test} from "typescript-logging";

describe("Test Log4TSControl", () => {
  const message = new $test.TestControlMessage();

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    LOG4TS_PROVIDER_SERVICE.clear();
    message.clear();
  });

  test("Test is empty (none registered)", () => {
    const control = LOG4TS_LOG_CONTROL(message.write);
    control.showSettings();
    expect(message.messages).toEqual(["Available Log4TSProviders:\n"]);
  });

  test("Test showSettings lists provider", () => {
    Log4TSProvider.createProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });

    const control = LOG4TS_LOG_CONTROL(message.write);
    control.showSettings();
    expect(message.messages).toEqual(["Available Log4TSProviders:\n  [0, test]\n"]);
  });

  test("Test showSettings lists multiple providers", () => {
    Log4TSProvider.createProvider("test", {
      groups: [{
        expression: new RegExp("short.+"),
      }],
    });
    Log4TSProvider.createProvider("Provider with a long name", {
      groups: [{
        expression: new RegExp("long.+"),
      }],
    });
    Log4TSProvider.createProvider("Some medium name", {
      groups: [{
        expression: new RegExp("medium.+"),
      }],
    });

    const control = LOG4TS_LOG_CONTROL(message.write);
    control.showSettings();

    const expected =
      "Available Log4TSProviders:\n" +
      "  [0, test                     ]\n" +
      "  [1, Provider with a long name]\n" +
      "  [2, Some medium name         ]\n";

    expect(message.messages).toEqual([expected]);
  });

  test("Test can get provider by either index or name", () => {
    Log4TSProvider.createProvider("test", {
      groups: [{
        expression: new RegExp("model.+"),
      }],
    });

    const control = LOG4TS_LOG_CONTROL(message.write);
    let controlProvider = control.getProvider(0);
    expect(controlProvider.name).toEqual("test");

    controlProvider = control.getProvider("test");
    expect(controlProvider.name).toEqual("test");
  });
});
