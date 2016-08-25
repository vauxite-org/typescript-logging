# typescript-logging

Typescript and javascript library for logging. Simple and flexible.
Written in typescript, so easily integrates within any Typescript project.

Can also be used in javascript projects, or in the browser directly.

## Installation

Use npm to install for usage in your project.

~~~
npm install --save typescript-logging
~~~
No additional typings are required, these are included.


## Browser

To use in the browser with javascript directly, download the (minified) library [here](Here).
The library is exposed by global variable TSL. See the example below.

~~~~
<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="typescript-logging-bundle.min.js"></script>
    <script type="text/javascript">
      var loggerFactory = TSL.LFService.createLoggerFactory();
      var logger = loggerFactory.getLogger("Hello");
      logger.info("Hello this is a log statement.");
      logger.error("Ooops", new Error("Failed!"));
      
      // With callbacks, useful for expensive logging that's only called when needed.
      logger.infoc(function() { return "Only called when INFO (or lower) level is enabled!"; });
    </script>
  </head>
</html>
~~~~

## Examples

Below follow a few examples on how to use the library in typescript.




## API

This describes the more often used part of the typescript API. Keep in mind the javascript API is exactly the same (except you need to call things the javascript way).


### LFService

Use this to create and configure a LoggerFactory. The LoggerFactory is used to get loggers from.


~~~
  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified, the LoggerFactory, will accept any named logger and will
   * log on info level by default for, to the console.
   * @param options Options, optional.
   * @returns {LoggerFactory}
   */
  static createLoggerFactory(options?: LoggerFactoryOptions): LoggerFactory 
~~~ 


### LoggerFactoryOptions

You can specify the options for the LoggerFactory. Create a new LoggerFactoryOptions object and call method...

~~~
  /**
   * Add LogGroupRule, see {LogGroupRule) for details
   * @param rule Rule to add
   * @returns {LoggerFactoryOptions} returns itself
   */
  addLogGroupRule(rule: LogGroupRule): LoggerFactoryOptions  
~~~


### LogGroupRule

This describes basically everything for the LoggerFactory you are creating. Create a new LogGroupRule...

~~~
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
~~~

The regular expression and logLevel are required, the first allows you to split your loggers in groups. For example a regex like: "model\\\\..+" would
specify that loggers with names like: model.Person, model.Something, all would use this LogGroupRule (and thus have whatever was specified here applied).

The logLevel specifies the level of logging when it's turned 'on'. E.g, the default is LogLevel.Info.

### LogLevel

Enumeration one of...

~~~

  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal
~~~

### LogFormat

LogFormat allows to set some options about what a log line should look like. Create a new LogFormat...

~~~
  /**
   * Constructor to create a LogFormat. Can be created without parameters where it will use sane defaults.
   * @param dateFormat DateFormat (what needs the date look like in the log line)
   * @param showTimeStamp Show date timestamp at all?
   * @param showLoggerName Show the logger name?
   */
  constructor(dateFormat: DateFormat = new DateFormat(), showTimeStamp: boolean = true, showLoggerName: boolean = true)
~~~

### DateFormat

