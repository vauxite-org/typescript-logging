# typescript-logging

Typescript library for logging. Simple and flexible in usage.
The library is written in typescript, so it will easily integrate with other Typescript projects.

The library comes with a separate chrome browser developer extension, which allows you to control logging at runtime.
For detail see: [Typescript Logging Developer Extension](#typescript-logging-developer-extension)

The bundle can be used for normal javascript projects if needed (es5 compatible).

## Installation

Use npm to install for usage in your project.

~~~
npm install --save typescript-logging
~~~
No additional typings are required, these are included.

Requires typescript 2.1.5+ (tested).

Or download the (minified) javascript bundle and documentation from [here](https://github.com/mreuvers/typescript-logging/tree/master/downloads/bundle/latest).

### Promise

The library does NOT ship with a polyfill of Promise anymore, this was done on purpose as shipping with a polyfill
often lead to conflicts if other projects already have a different promise polyfill included.

So if you do care about old browsers, that do not have Promise support you must provide one yourself such as e.g. es6-promise.


## Usage

The library provides two mechanisms for logging, one which looks similar to the widely known log4j like loggers
and a new more experimental way of logging.

Which one to use, is a matter of preference, both have advantages and disadvantages.

Note: Currently the chrome developer extension supports "Categorized logging" only, in the future it will support both (planned for 0.3 release).


### Log4j way of logging

ConfigLog4j.ts
~~~
import {LoggerFactory, LoggerFactoryOptions, LFService, LogGroupRule, LogLevel} from "typescript-logging";

// Create options instance and specify 2 LogGroupRules:
// * One for any logger with a name starting with model, to log on debug
// * The second one for anything else to log on info
const options = new LoggerFactoryOptions()
.addLogGroupRule(new LogGroupRule(new RegExp("model.+"), LogLevel.Debug))
.addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));

// Create a named loggerfactory and pass in the options and export the factory.
// Named is since version 0.2.+ (it's recommended for future usage)
export const factory = LFService.createNamedLoggerFactory("LoggerFactory", options);
~~~

ElseWhere.ts
~~~
import {factory} from "./ConfigLog4j";

// Retrieve a logger (you can decide to use it per class and/or module or just
// export it in the config above etc. Your loggers - your choice!).
// This logger will fall in the first LogGroupRule from above.
const log = factory.getLogger("model.Product");

// This logger will fall in the 2nd LogGroupRule
const logOther = factory.getLogger("somethingElse");

export class ElseWhere {

  magic(name: string): void {
    log.debug("Casting debug magic spell: " + name);
    logOther.info("Casting info magic spell: " + name);

    // Lamda logging, cheaper as its only executed when needed.
    log.debugc(() => "Casting lambda debug magic spell: " + name);
    logOther.infoc(() => "Casting lambda info magic spell: " + name);

    // Use template script
    log.infoc(() => `Casting magic spell: ${name}`);
  }
}
~~~

When the method magic("Lumina") is called on an ElseWhere instance, it will log:
~~~
2017-02-15 20:43:52,807 DEBUG [model.Product] Casting debug magic spell: Lumina
2017-02-15 20:43:52,809 INFO [somethingElse] Casting info magic spell: Lumina
2017-02-15 20:43:52,810 DEBUG [model.Product] Casting lambda debug magic spell: Lumina
2017-02-15 20:43:52,811 INFO [somethingElse] Casting lambda info magic spell: Lumina
2017-02-15 20:43:52,812 INFO [model.Product] Casting magic spell: Lumina
~~~


### Categorized way of logging

This provides a quick example (since 0.2.0+), please check the documentation section for full documentation.

Config.ts
~~~
import {Category,CategoryLogger,CategoryServiceFactory,CategoryDefaultConfiguration,LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Info));

// Create categories, they will autoregister themselves.
// This creates one root logger, with 1 child sub category.
export const catRoot = new Category("service");
export const catProd = new Category("product", catRoot);

// Get a logger, this can be retrieved for root categories only (in the example above, the "service" category).
export const log: CategoryLogger = CategoryServiceFactory.getLogger(catRoot);
~~~

ElseWhere.ts
~~~
import {log,catProd} from "./Config"

export class ElseWhere {

  magic(name: string): void {
     // Normal log to category: catProd
     log.info("Performing magic: " + name, catProd);

     // Lambda log to catProd (cheaper)
     log.infoc(() => "Performing magic once more: " + name, catProd);

     log.infoc(() => `With template script: ${name}`, catProd);
  }
}
~~~

With the above example if magic("spell") is executed it will log:
~~~
2016-01-07 11:14:26,273 INFO [product] Performing magic: spell
2016-01-07 11:14:26,274 INFO [product] Performing magic once more: spell
2016-01-07 11:14:26,275 INFO [product] With template script: spell
~~~

## Documentation

Since version 0.2.0 the documentation has been split off in several sections.

### Api and related
* Latest log4j like logging: [Log4j documentation](docs/latest_log4j.md)
* Latest categorized like logging: [Categorized documentation](docs/latest_categorized.md)
* Stable older version 0.1.3: [Stable version 0.1.3](docs/stable_0.1.3.md)

The latest version is backwards compatible with 0.1.3 (except for categorized, since that is new since 0.2).

### Webpack with more than one project module (important)

Note: This section is only relevant if you have multiple projects depending on each other and all need to use typescript-logging.

Whenever you use multiple projects, that are packed separately by webpack (thus each results in a separate bundle).
You need to make sure to only have typescript-logging packed once in the final module. Not doing so will result
in undesired unclear behavior. This is since the framework keeps state, and you only want it packed once because of that
or state will be spread over different modules.

Example:

Project A is a core project (and thus used by other projects as a dependency), this project must make sure
to *not* pack typescript-logging within it's module by using the external option:

~~~
var webpack = require("webpack");

module.exports = {
    ... more webpack config here

    externals : {
      "typescript-logging": "typescript-logging"
    }

};
~~~

Then project B, that depends on project A should pack typescript-logging along normally
(which is what webpack normally does if it's a dependency in package.json).


## Typescript Logging Developer Extension

Starting with version 0.2.0+ a chrome developer extension is available to easily allow changing log levels and filtering of logging for an application
that uses typescript logging.

![Extension screenshot](img/typescript-logging-tab.png)

Please visit: [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) on how to get this.

Note: The extension currently only integrates with the categorized way of logging. Current plan is to add support for log4j like logging as well in 0.3.

## Build

To build locally:

~~~
npm run build
~~~

## Tests

To run the tests:

~~~
npm run test
~~~

## Bugs

We all wish there were none in our software, but alas. If you encounter a bug please log it in the issue tracker.

## Contributing

Feel free to contribute or come up with great ideas, please use the issue tracker for that.

If you add/change new functionality and want it merged to master, please open a pull request. Also add tests for it (spec directory).

Some things may not fit the library and could be rejected, so if you are unsure please ask first before wasting your valuable time!

## History
* 0.2.0-beta7 (current release)
  * Include source in distribution (makes source map warnings go away)
* 0.2.0-beta6
  * Updated documentation
  * Enhanced the extension support (to actually help fix issues on the extension with packed webpack modules)
  * Added option for creating named LoggerFactories
  * Some internal changes to better structure the project
  * Fix log.trace internally to not call log.trace (which was just wrong).
* 0.2.0-beta5
  * Use typescript 2.1.5 as minimum, as that gets rid of references in generated .d.ts files to node e.a
* 0.2.0-beta4
  * Drop / move types (they can cause issues with es6 ts projects)
  * Added 'setConfigurationCategory(...)' to CategoryServiceFactory to allow config for specific category (and childs).
  * Update documentation
* 0.2.0-beta3
  * Update latest documentation with example for custom logger
  * Expose CategoryLogFormat, was missing.
  * Add source maps to the latest download as well.
* 0.2.0-beta2
  * Fix missing optionals in Logger interface
  * Hopefully fix @node reference declaration issues by adding typings (compile would fail, feels like a TS bug but not sure).
* 0.2.0-beta1
  * Categorized logging (new feature)
  * Categorized logging supports chrome developer extension
  * Updated and split documentation (pre 0.2 and latest)
  * Standard logging (0.1.3) remains compatible (does not integrate with chrome extension)
* 0.1.3 No api changes, release ok.
  * Updated documentation (slightly changed examples, added example how to import, added additional logger api)
  * Fix that messages get logged in proper order always (due to using a promise for error resolving, they could get out of order)
* 0.1.2 No changes (npm related), release ok.
* 0.1.1 No changes (npm related), do not use.
* 0.1.0 Initial release, do not use.
