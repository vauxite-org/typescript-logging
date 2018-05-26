import {
  LFService
} from "../src/logging/log/standard/LFService";
import {MessageBufferLoggerImpl} from "../src/logging/log/standard/MessageBufferLoggerImpl";
import {LogLevel, LogFormat, LoggerType} from "../src/logging/log/LoggerOptions";
import {AbstractLogger, LogMessage} from "../src/logging/log/standard/AbstractLogger";
import {LoggerFactory} from "../src/logging/log/standard/LoggerFactory";
import {Logger} from "../src/logging/log/standard/Logger";
import {LogGroupRuntimeSettings} from "../src/logging/log/standard/LogGroupRuntimeSettings";
import {LoggerFactoryOptions} from "../src/logging/log/standard/LoggerFactoryOptions";
import {LogGroupRule} from "../src/logging/log/standard/LogGroupRule";

/**
 * Custom logger for testing, only logs the last message.
 */
class CustomLoggerImpl extends AbstractLogger {

  private _message: string;

  constructor(name: string, settings: LogGroupRuntimeSettings) {
    super(name, settings);
  }

  protected doLog(message: LogMessage): void {
    this._message = this.createDefaultLogMessage(message);
  }

  get message(): string {
    return this._message;
  }
}

const getMessagesAsString = (logger: Logger): string => {
  if (logger instanceof MessageBufferLoggerImpl) {
    const actualLogger = logger as MessageBufferLoggerImpl;
    return actualLogger.toString();
  }
  throw new Error("Not a MessageBufferLogger");
};

const getMessages = (logger: Logger): string[] => {
  if (logger instanceof MessageBufferLoggerImpl) {
    const actualLogger = logger as MessageBufferLoggerImpl;
    return actualLogger.getMessages();
  }
  throw new Error("Not a MessageBufferLogger");
};

describe("Loggers", () => {

  it("Default logs", () => {

    const loggerFactory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp("Hello.+"), LogLevel.Info, new LogFormat(), LoggerType.MessageBuffer)));
    const tmpLogger = loggerFactory.getLogger("Hello1");

    expect(tmpLogger instanceof MessageBufferLoggerImpl).toBeTruthy();

    const logger = tmpLogger as MessageBufferLoggerImpl;
    const messages: string[] = logger.getMessages();
    expect(messages.length).toEqual(0);

    logger.info("Dance!");

    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Dance!");
    expect(messages[0]).toContain("INFO");

    logger.warn("This is a warning!");

    expect(messages.length).toEqual(2);
    expect(messages[1]).toContain("This is a warning!");
    expect(messages[1]).toContain("WARN");

    // Error stack is constructed async, hence we do this async in the test.
    logger.error("Serious trouble!", new Error("Oops!"));
    waitsFor(() => messages.length === 3, "Expected 3 messages in log", 3000);
    runs(() => {
      expect(messages[2]).toContain("Serious trouble!");
      expect(messages[2]).toContain("ERROR");
      expect(messages[2]).toContain("Oops!");
    });

  });

  it("Can use custom logger", () => {
    const loggerOptions = new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp("Hello.+"), LogLevel.Info, new LogFormat(), LoggerType.Custom,
      (name: string, settings: LogGroupRuntimeSettings) => new CustomLoggerImpl(name, settings)
    ));

    const loggerFactory = LFService.createLoggerFactory(loggerOptions);
    const logger = loggerFactory.getLogger("Hello.Special.Bla");
    expect(logger instanceof CustomLoggerImpl).toBeTruthy();

    logger.info("Hello world");

    const castLogger = logger as CustomLoggerImpl;

    expect(castLogger.message).toContain("Hello world");

    const sameLogger = loggerFactory.getLogger("Hello.Special.Bla");
    expect(castLogger === sameLogger).toBeTruthy();

    const otherLogger = loggerFactory.getLogger("Hello.Other") as CustomLoggerImpl;
    expect(sameLogger === otherLogger).toBeFalsy();

    otherLogger.info("Test");
    expect(otherLogger.message).toContain("Test");

    // The other one should still have hello world
    expect(castLogger.message).toContain("Hello world");
  });

  it("Can use closures for logging", () => {
    const loggerFactory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info, new LogFormat(), LoggerType.MessageBuffer)));
    const logger = loggerFactory.getLogger("ABC") as MessageBufferLoggerImpl;

    logger.info(() => "Hello");

    expect(logger.toString()).toContain("Hello");

    // Should not log!
    logger.debug(() => "NotMe!");
    expect(logger.toString()).not.toContain("NotMe!");

    // Should log
    logger.error(() => "YesMe!", () => new Error("Failed"));
    waitsFor(() => logger.getMessages().length === 2, "Should have 2 messages by now", 3000);
    runs(() => {
      expect(logger.toString()).toContain("YesMe!");
      expect(logger.toString()).toContain("Failed");
    });
  });

  it("Will log in order", () => {
    const loggerFactory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info, new LogFormat(), LoggerType.MessageBuffer)));
    const logger = loggerFactory.getLogger("ABC") as MessageBufferLoggerImpl;
    logger.info("First");
    logger.info("Second", new Error("fail"));
    logger.info("Third", new Error("fail"));
    logger.info("Fourth");
    logger.info("Fifth", new Error("fail"));

    const msgs = logger.getMessages();
    waitsFor(() => msgs.length === 5, "Waited for 5 messages", 3000);
    runs(() => {
      expect(msgs[0]).toContain("First");
      expect(msgs[1]).toContain("Second");
      expect(msgs[2]).toContain("Third");
      expect(msgs[3]).toContain("Fourth");
      expect(msgs[4]).toContain("Fifth");
    });

  });

  describe("LogData", () => {
    const data = {key: "data"};
    const msg = "Message";
    let loggerFactory: LoggerFactory;
    let logger: MessageBufferLoggerImpl;

    beforeEach(() => {
      loggerFactory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info, new LogFormat(), LoggerType.MessageBuffer)));
      logger = loggerFactory.getLogger("ABC") as MessageBufferLoggerImpl;
    });

    it("Can handle LogData with custom ds", () => {
      logger.info({msg, data, ds: (d: any) => "hello " + d.key});

      const messages: string[] = logger.getMessages();
      expect(messages.length).toEqual(1);
      expect(messages[0]).toContain(msg + " [data]: hello " + data.key, "Failed message was: " + messages[0]);
    });

    it("Can handle LogData without custom ds", () => {
      logger.info({msg, data});

      const messages: string[] = logger.getMessages();
      expect(messages.length).toEqual(1);
      expect(messages[0]).toContain(msg + " [data]: " + JSON.stringify(data), "Failed message was: " + messages[0]);
    });

    it("Can handle LogData without custom ds and only message", () => {
      logger.info({msg});

      const messages: string[] = logger.getMessages();
      expect(messages.length).toEqual(1);
      expect(messages[0]).toContain(msg);
    });
  });

  it("Tests all log levels", () => {
    const loggerFactory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Trace, new LogFormat(), LoggerType.MessageBuffer)));
    const logger = loggerFactory.getLogger("ABC");

    logger.trace("trace1");
    logger.trace({msg: "trace2"});
    logger.trace(() => "trace3");
    logger.trace(() => ({msg: "trace4"}));
    logger.trace(() => {
      return {msg: "trace5"};
    });

    logger.debug("debug1");
    logger.debug({msg: "debug2"});
    logger.debug(() => "debug3");
    logger.debug(() => ({msg: "debug4"}));
    logger.debug(() => {
      return {msg: "debug5"};
    });

    logger.info("info1");
    logger.info({msg: "info2"});
    logger.info(() => "info3");
    logger.info(() => ({msg: "info4"}));
    logger.info(() => {
      return {msg: "info5"};
    });

    logger.warn("warn1");
    logger.warn({msg: "warn2"});
    logger.warn(() => "warn3");
    logger.warn(() => ({msg: "warn4"}));
    logger.warn(() => {
      return {msg: "warn5"};
    });

    logger.error("error1", new Error("errorex1"));
    logger.error({msg: "error2"}, new Error("errorex2"));
    logger.error(() => "error3", () => new Error("errorex3"));
    logger.error(() => ({msg: "error4"}), () => new Error("errorex4"));
    logger.error(() => {
      return {msg: "error5"};
    }, () => new Error("errorex5"));

    logger.fatal("fatal1", new Error("fatalex1"));
    logger.fatal({msg: "fatal2"}, new Error("fatalex2"));
    logger.fatal(() => "fatal3", () => new Error("fatalex3"));
    logger.fatal(() => ({msg: "fatal4"}), () => new Error("fatalex4"));
    logger.fatal(() => {
      return {msg: "fatal5"};
    }, () => new Error("fatalex5"));

    const messages = getMessages(logger);
    waitsFor(() =>   messages.length === 30, "Expected 30 messages in log", 5000);
    runs(() => {
      const result = getMessagesAsString(logger);

      expect(result).toContain("trace1");
      expect(result).toContain("trace2");
      expect(result).toContain("trace3");
      expect(result).toContain("trace4");
      expect(result).toContain("trace5");

      expect(result).toContain("debug1");
      expect(result).toContain("debug2");
      expect(result).toContain("debug3");
      expect(result).toContain("debug4");
      expect(result).toContain("debug5");

      expect(result).toContain("info1");
      expect(result).toContain("info2");
      expect(result).toContain("info3");
      expect(result).toContain("info4");
      expect(result).toContain("info5");

      expect(result).toContain("warn1");
      expect(result).toContain("warn2");
      expect(result).toContain("warn3");
      expect(result).toContain("warn4");
      expect(result).toContain("warn5");

      expect(result).toContain("error1");
      expect(result).toContain("errorex1");
      expect(result).toContain("error2");
      expect(result).toContain("errorex2");
      expect(result).toContain("error3");
      expect(result).toContain("errorex3");
      expect(result).toContain("error4");
      expect(result).toContain("errorex4");
      expect(result).toContain("error5");
      expect(result).toContain("errorex5");

      expect(result).toContain("fatal1");
      expect(result).toContain("fatalex1");
      expect(result).toContain("fatal2");
      expect(result).toContain("fatalex2");
      expect(result).toContain("fatal3");
      expect(result).toContain("fatalex3");
      expect(result).toContain("fatal4");
      expect(result).toContain("fatalex4");
      expect(result).toContain("fatal5");
      expect(result).toContain("fatalex5");
    });
  });

  it("Test we do not bail on invalid error object", () => {
    const loggerFactory = LFService.createLoggerFactory(new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Trace, new LogFormat(), LoggerType.MessageBuffer)));
    const logger = loggerFactory.getLogger("x");

    // Invalid error passsed in, this case a literal object. We should not bail out.
    const invalidError = { invalid : "bla" };
    logger.error("Failed1", invalidError as any);

    // Next invalid error, but cannot be stringified either. We should not bail out.
    const anotherInvalidError = new InvalidError();
    anotherInvalidError.setSelf(anotherInvalidError);

    logger.error("Failed2", anotherInvalidError as any);

    const messages = getMessages(logger);
    waitsFor(() =>   messages.length === 2, "Expected 1 message in log", 1000);
    runs(() => {
      expect(messages[0]).toContain("Unexpected error object was passed in. Could not resolve it, stringified object: {\"invalid\":\"bla\"}");
      expect(messages[1]).toContain("Unexpected error object was passed in. Could not resolve it or stringify it");
    });
  });
});

class InvalidError {

  private _self: InvalidError;

  public setSelf(self: InvalidError) {
    this._self = self;
  }
}
