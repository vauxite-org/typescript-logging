# Documentation log4j style

This page provides an overview of the log4j style of logging and its api. Please note that full API documentation can be found
in the docs bundle.

**Note**: _This api is not supported by the browser extension, it may be in a future release, if you care for the browser plugin, please use categorized logging instead (see main page).

* [Usage](#usage)
* [Default LoggerFactory](#default-loggerfactory)
* [Formatting message](#formatting-message)
* [Custom logger](#custom-logger)
* [Examples](#examples)
* [Api and documentation](#api-and-documentation)

## Usage

The example below configures a LoggerFactory and exports it to be used by consumers. Two LogGroupRules are added for two different groups here, service and ui.

Config.ts
```typescript
import {LoggerFactoryOptions, LogGroupRule, LogLevel, LoggerFactory, LFService} from "typescript-logging";

const options = new LoggerFactoryOptions();
options.addRule(new LogGroupRule(new RegExp("service.+"), LogLevel.Info));
options.addRule(new LogGroupRule(new RegExp("ui.+"), LogLevel.Info));

export const factory: LoggerFactory = LFService.createNamedLoggerFactory("example", options);
```

The class below exports an instance of itself, and has a method called createProduct(), which creates a product and logs in the method. Product source is left out for this example.

ProductService.ts
```typescript
import {factory} from "./Config";

const log = factory.getLogger("service.Product");

export class ProductService {

  createProduct(name: string): Product {
     // Normal log
     log.info("Creating product with name: " + name);

     // Lambda log (cheaper, only called when needed)
     log.info(() => "Creating product with name: " + name);

     return new Product(name);
  }

}

export const productService: ProductService = new ProductService();
```

The class below pretends to be SomeUI class, which when pretty() is called upon it creates a product and logs that in the ui logger.

SomeUI.ts
```typescript
import {factory} from "./Config";
import {productService} from "./ProductService";

const log = factory.getLogger("ui.SomeUI");

export class SomeUI {

  pretty(name: string): void {
     const product = productService.createProduct(name);

     log.info("Pretty ui: " + product.name);

     // Lambda log (cheaper, only called when needed)
     log.info(() => "Pretty ui: " + product.name);

     return new Product(name);
  }

}
```

Let's assume someUi.pretty("Beer"); is called, the output would then be something like the following:

Output
~~~
2016-12-22 11:14:26,273 INFO [service.Product] Creating product with name: Beer
2016-12-22 11:14:26,274 INFO [service.Product] Creating product with name: Beer
2016-12-22 11:14:26,275 INFO [ui.SomeUI] Pretty ui: Beer
2016-12-22 11:14:26,276 INFO [ui.SomeUI] Pretty ui: Beer
~~~

## Default LoggerFactory

The library provides a default LoggerFactory. This factory is available as: LFService.DEFAULT
This is the standard factory available and can be used to get Loggers from as well.

The usage of the **default LoggerFactory is recommended for library/framework developers**. 
By using it, end users can easily enable logging for these frameworks in addition to their own application logging
when using log4j. By default logging is configured to log on Error level.

Make sure to specify unique Logger names to identify your framework/library.

```typescript
const logger = LFService.DEFAULT.getLogger("reactjs/components");
````

## Formatting message

If you do not need a custom logger but need a custom message for the other logger types (non-custom),
you can specify a custom formatterLogMessage lambda instead. This allows you to change the log message without the need to implement a custom logger.

The following code gives an example on how to do this (imports have been left out):
```typescript
const options = new LoggerFactoryOptions();
const rule = new LogGroupRule(new RegExp(".+"), LogLevel.Info);
// Message only
rule.formatterLogMessage = (message) => message.message;
options.addLogGroupRule(rule);

const factory = LFService.createNamedLoggerFactory("world", options);
// This logger will use the custom formatted message now
const logger = factory.getLogger("MyLogger");
```
The logger from the example above will now use the given custom formatterLogMessage, and will only log the message without any additional information such as time.

## Custom logger

By default logging will go the console. In some cases you may want to use a custom logger which either logs differently or logs elsewhere.
The example below shows how to do add a custom logger.

CustomLogger.ts
```typescript
  // Custom logger, extend AbstractLogger which makes your life easy.
export class CustomLogger extends AbstractLogger {

    constructor(name: string, settings: LogGroupRuntimeSettings) {
      super(name, settings);
    }

    protected doLog(msg: LogMessage): void {
      // Do what you need to do with this log message!
      // You can use this.createDefaultLogMessage(msg) to get a fully default formatted message if you want.
    }
  }
```
The example above extends AbstractLogger, if you want to do everything yourself you can implement the Logger interface instead - however that is a lot of work.

Config.ts
```typescript
  // The options, define LoggerType.Custom, then use a closure to return the new logger
  // (this will be called by the library when it creates a new logger).
  // Make sure to return a new instance always, unless they are shareable between different loggers.
  const loggerOptions = new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp(".+"),LogLevel.Info, new LogFormat(), LoggerType.Custom,
      (name: string, logGroupRule: LogGroupRule) => new CustomLogger(name, logGroupRule)
  ));


  export const loggerFactory = LFService.createNamedLoggerFactory("example", options);

  // usage, where-ever.
  const logger = loggerFactory.getLogger("SomeName");  // This will return your logger now.
```
The config defines new options, with LoggerType.Custom and a lambda which returns the new CustomLogger.


## Examples

Below follow some examples on how to use the log4j style of logging.

**Importing**
```typescript
import {LFService,LoggerFactoryOptions} from "typescript-logging"
```
All classes can be imported from "typescript-logging".

**Create default LoggerFactory with default options and log message**
```typescript
  const factory = LFService.createLoggerFactory();
  const logger = factory.getLogger("SomeName");
  logger.info("Will log on info and higher by default");
```

**Create named LoggerFactory with default options and log messages using LogData**
```typescript
  const factory = LFService.createNamedLoggerFactory("MyNamedFactory");
  const logger = factory.getLogger("SomeName");

  // No additional data, just message.
  logger.info({msg: "Will log on info and higher by default"});

  // Additional data is formatted using JSON.stringify(..) by default
  const secretData = {secret: true, user: "secret"};
  logger.info({msg: "a", data: secretData});

  // Additional data is formatted according custom lambda, can be inlined too etc.
  const formatter = (data: any) => "special stuff here: " + JSON.stringify(data)";
  logger.info({msg: "hello!", data: secretData, ds: formatter});
```

**Create LoggerFactory, which logs on DEBUG (and higher) for all loggers.**
```typescript
  const factory = LFService.createNamedLoggerFactory("example", new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Debug)));
  const logger = factory.getLogger("AnyName");
  logger.trace("Will not be logged");
  logger.debug("Will log");
  logger.info("Will log"); // etc.
```

**Create LoggerFactory which has different log levels for two groups**
```typescript
  const factory = LFService.createNamedLoggerFactory("example", new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp("model\\..+"), LogLevel.INFO)))
    .addLogGroupRule(new LogGroupRule(new RegExp("service\\..+"), LogLevel.DEBUG)));
  const loggerModel = factory.getLogger("model.Person");  // This one will log on info and higher
  const loggerService = factory.getLogger("service.MyService");  // This one will log on debug and higher
```

**Create LoggerFactory with different date format**
```typescript
  // The loggerfactory uses a different dateformat, and different date separator.
  const loggerFactory = LFService.createNamedLoggerFactory("example", new LoggerFactoryOptions()
    .addLogGroupRule(new LogGroupRule(new RegExp(".+"),LogLevel.Info,
      new LogFormat(new DateFormat(DateFormatEnum.YearDayMonthWithFullTime,"/"))));
```


## Api and documentation

This describes the more often used part of the typescript API. Keep in mind the javascript API is exactly the same (except you need to call things the javascript way).
Finally it's recommended to just look in the relevant classes as they contain the most up to date documentation.

The full typescript API is bundled in the npm package, your editor will recognize the typings.

### LFService

Use this to create and configure a LoggerFactory. The LoggerFactory is used to get loggers from.
```typescript
  /**
   * Create a new LoggerFactory using given name (used for console api/extension).
   * @param name Name Pick something short but distinguishable.
   * @param options Options, optional
   * @return {LoggerFactory}
   */
  public static createNamedLoggerFactory(name: string, options: LoggerFactoryOptions | null = null): LoggerFactory;

  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified, the LoggerFactory, will accept any named logger and will
   * log on info level by default for, to the console.
   * @param options Options, optional.
   * @returns {LoggerFactory}
   */
  public static createLoggerFactory(options: LoggerFactoryOptions | null = null): LoggerFactory;
```

### LoggerFactory

Created by LFService. Than use getLogger(name: string) to get a new logger to log with.

### LogGroupRule

This describes basically everything for the LoggerFactory you are creating. Create a new LogGroupRule...

```typescript
  /**
   * Create a LogGroupRule. Basically you define what logger name(s) match for this group, what level should be used what logger type (where to log)
   * and what format to write in. If the loggerType is custom, then the callBackLogger must be supplied as callback function to return a custom logger.
   * @param regExp Regular expression, what matches for your logger names for this group
   * @param level LogLevel
   * @param logFormat LogFormat
   * @param loggerType Type of logger, if Custom, make sure to implement callBackLogger and pass in, this will be called so you can return your own logger.
   * @param callBackLogger Callback function to return a new clean custom logger (yours!)
   */
  constructor(regExp: RegExp, level: LogLevel, logFormat: LogFormat = new LogFormat(), loggerType: LoggerType = LoggerType.Console, callBackLogger?: (name: string, logGroupRule: LogGroupRule)=>AbstractLogger)
```

The regular expression and logLevel are required, the first allows you to split your loggers in groups. For example a regex like: "model\\\\..+" would
specify that loggers with names like: model.Person, model.Something, all would use this LogGroupRule (and thus have whatever was specified here applied).

The logLevel specifies the level of logging when it's turned 'on'. E.g, the default is LogLevel.Info.

### LogLevel

Enumeration of...

```typescript
  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal
```

### LogFormat

LogFormat allows to set some options about what a log line should look like. Create a new LogFormat...

```typescript
  /**
   * Constructor to create a LogFormat. Can be created without parameters where it will use sane defaults.
   * @param dateFormat DateFormat (what needs the date look like in the log line)
   * @param showTimeStamp Show date timestamp at all?
   * @param showLoggerName Show the logger name?
   */
  constructor(dateFormat: DateFormat = new DateFormat(), showTimeStamp: boolean = true, showLoggerName: boolean = true)
```

### DateFormat

Defines what the timestamp should look like. Create a new DateFormat...

```typescript
  /**
   * Constructor, can be called empty as it uses defaults.
   * @param formatEnum DateFormatEnum
   * @param dateSeparator Separator used between dates
   */
  constructor(formatEnum: DateFormatEnum = DateFormatEnum.Default, dateSeparator: string = '-')
```

The DateFormatEnum allows some change on how the date is formatted.

### DateFormatEnum

This is an enumeration with the following values:

```typescript
  /**
   * Displays as: year-month-day hour:minute:second,millis -> 1999-02-12 23:59:59,123
   * Note the date separator can be set separately.
   */
  Default,

  /**
   * Displays as: year-month-day hour:minute:second -> 1999-02-12 23:59:59
   * Note the date separator can be set separately.
   */
  YearMonthDayTime,

  /**
   * Displays as: year-day-month hour:minute:second,millis -> 1999-12-02 23:59:59,123
   * Note the date separator can be set separately.
   */
  YearDayMonthWithFullTime,

  /**
   * Displays as: year-day-month hour:minute:second -> 1999-12-02 23:59:59
   * Note the date separator can be set separately.
   */
  YearDayMonthTime
```

## LogData

```typescript
export interface LogData {

  /**
   * Message to log.
   */
  msg: string;

  /**
   * Optional additional data, by default JSON.stringify(..) is used to log it in addition to the message.
   */
  data?: any;

  /**
   * If present, and data is set - this lambda is used instead of JSON.stringify(..). Must return data as string.
   * @param data Data to format
   */
  ds?(data: any): string;
}
```

## Browser

To use in the browser with javascript directly, download the correct release from github and extract the file (find the dist/bundle directory).
The library is exposed by global variable TSL. See the example below.

~~~~
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="typescript-logging-bundle.min.js"></script>
    <script type="text/javascript">
      // Create default logger
      var loggerFactory = TSL.LFService.createLoggerFactory();
      // Get a logger called "Hello"
      var logger = loggerFactory.getLogger("Hello");

      // Normal logging
      logger.info("Hello this is a log statement.");
      logger.error("Ooops", new Error("Failed!"));

      // With callbacks, this is useful when log statements are expensive (e.g. require calculation)
      // The callback is only called when needed.
      logger.info(function() { return "Only called when INFO (or lower) level is enabled!"; });
      logger.warn(function() { return "Warn " + somethingVeryExpensive(); }, function() { return new Error("Oh oh"); });
    </script>
  </head>
</html>
~~~~

