import {$internal} from "typescript-logging-core";
import {LOG4TS_PROVIDER_SERVICE} from "../main/impl/Log4TSProviderService";
import {Log4TSProvider} from "../main/api/Log4TSProvider";

describe("Test internal logging", () => {

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    LOG4TS_PROVIDER_SERVICE.clear();
    $internal.INTERNAL_LOGGING_SETTINGS.reset();
  });

  test("Should not log anything", () => {
    const messages: string[] = [];
    $internal.INTERNAL_LOGGING_SETTINGS.setOutput(msg => messages.push(msg));

    Log4TSProvider.createProvider("test", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(0);
  });

  test("Should log creating provider", () => {
    const messages: string[] = [];
    $internal.INTERNAL_LOGGING_SETTINGS.setInternalLogLevel($internal.InternalLogLevel.Debug);
    $internal.INTERNAL_LOGGING_SETTINGS.setOutput(msg => messages.push(msg));

    Log4TSProvider.createProvider("test1", {groups: [{expression: new RegExp("model.+")}]});

    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Creating new Log4TSProvider with name 'test1'");

    // Put level high, should not log.
    $internal.INTERNAL_LOGGING_SETTINGS.setInternalLogLevel($internal.InternalLogLevel.Error);
    Log4TSProvider.createProvider("test2", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(1);

    // Put to debug, should log again.
    $internal.INTERNAL_LOGGING_SETTINGS.setInternalLogLevel($internal.InternalLogLevel.Debug);
    Log4TSProvider.createProvider("test3", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(2);
    expect(messages[1]).toContain("Creating new Log4TSProvider with name 'test3'");
  });
});
