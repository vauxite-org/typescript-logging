import {LFService, LoggerFactoryOptions, LogGroupRule} from "../src/LoggerFactoryService";
import {LogLevel} from "../src/Logger";



describe("LoggerFactory default configuration", () => {
  it("Has valid default configuration", () => {
    const myLogger = LFService.createLoggerFactory().getLogger("MyLogger");
    expect(myLogger.isTraceEnabled()).toBeFalsy();
    expect(myLogger.isDebugEnabled()).toBeFalsy();
    expect(myLogger.isInfoEnabled()).toBeTruthy();
    expect(myLogger.isWarnEnabled()).toBeTruthy();
    expect(myLogger.isErrorEnabled()).toBeTruthy();
    expect(myLogger.isFatalEnabled()).toBeTruthy();
    myLogger.info("Hello world");
    myLogger.info("Hello world!!!", new Error("bla"));
  });
});

describe("Test LoggerFactory, non default configuration", () => {
  const factory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp("ExactName"), LogLevel.Error)));

  const myLogger = factory.getLogger("ExactName");

  console.log("mylogger:" + myLogger);

  expect(myLogger.isTraceEnabled()).toBeFalsy();

  console.log("mylogger:" + myLogger);
  expect(myLogger.isDebugEnabled()).toBeFalsy();
  expect(myLogger.isInfoEnabled()).toBeFalsy();
  expect(myLogger.isWarnEnabled()).toBeFalsy();
  expect(myLogger.isErrorEnabled()).toBeTruthy();
  expect(myLogger.isFatalEnabled()).toBeTruthy();
  myLogger.info("Should not see me");
  myLogger.warn("Should not see me too");
  myLogger.error("Should see me");
});



