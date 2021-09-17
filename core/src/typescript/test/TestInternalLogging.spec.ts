import {$internal, Log4TSProvider} from "../main/typescript-logging";
import {LOG4TS_PROVIDER_SERVICE} from "../main/log4ts/impl/Log4TSProviderService";
import {InternalLogLevel} from "../main/internal/InternalLogger";

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

    Log4TSProvider.createLog4TSProvider("test", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(0);
  });

  test("Should log creating provider", () => {
    const messages: string[] = [];
    $internal.INTERNAL_LOGGING_SETTINGS.setInternalLogLevel(InternalLogLevel.Debug);
    $internal.INTERNAL_LOGGING_SETTINGS.setOutput(msg => messages.push(msg));

    Log4TSProvider.createLog4TSProvider("test1", {groups: [{expression: new RegExp("model.+")}]});

    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Creating new Log4TSProvider with name 'test1'");

    // Put level high, should not log.
    $internal.INTERNAL_LOGGING_SETTINGS.setInternalLogLevel(InternalLogLevel.Error);
    Log4TSProvider.createLog4TSProvider("test2", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(1);

    // Put to debug, should log again.
    $internal.INTERNAL_LOGGING_SETTINGS.setInternalLogLevel(InternalLogLevel.Debug);
    Log4TSProvider.createLog4TSProvider("test3", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(2);
    expect(messages[1]).toContain("Creating new Log4TSProvider with name 'test3'");
  });
});
