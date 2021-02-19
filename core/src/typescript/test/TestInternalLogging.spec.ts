import {$INTERNAL_LOGGING_SETTINGS$, Log4TSProvider, LogLevel} from "../main/typescript-logging";
import {LOG4TS_PROVIDER_SERVICE} from "../main/log4ts/impl/Log4TSProviderService";

describe("Test internal logging", () => {

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
     */
    LOG4TS_PROVIDER_SERVICE.clear();
    $INTERNAL_LOGGING_SETTINGS$.reset();
  });

  test("Should not log anything", () => {
    const messages: string[] = [];
    $INTERNAL_LOGGING_SETTINGS$.setOutput(msg => messages.push(msg));

    Log4TSProvider.createLog4TSProvider("test", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(0);
  });

  test("Should log creating provider", () => {
    const messages: string[] = [];
    $INTERNAL_LOGGING_SETTINGS$.setInternalLogLevel(LogLevel.Debug);
    $INTERNAL_LOGGING_SETTINGS$.setOutput(msg => messages.push(msg));

    Log4TSProvider.createLog4TSProvider("test1", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Creating new Log4TSProvider with name 'test1'");

    // Put level high, should not log.
    $INTERNAL_LOGGING_SETTINGS$.setInternalLogLevel(LogLevel.Error);
    Log4TSProvider.createLog4TSProvider("test2", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(1);

    // Put to debug, should log again.
    $INTERNAL_LOGGING_SETTINGS$.setInternalLogLevel(LogLevel.Debug);
    Log4TSProvider.createLog4TSProvider("test3", {groups: [{expression: new RegExp("model.+")}]});
    expect(messages.length).toEqual(2);
    expect(messages[1]).toContain("Creating new Log4TSProvider with name 'test3'");
  });
});
