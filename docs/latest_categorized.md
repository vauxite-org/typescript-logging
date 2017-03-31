# Documentation category style

This page describes how the latest, new logging mechanism of this library works and can be used.

## Why

Most logging libraries are (loosely) based on (older) existing logging implementations
in the way they used to work and are setup. There's nothing wrong with that, and in fact
the 'old' way of logging is implemented in a similar fashion by the log4j style logging as well.

However in our projects we felt we needed a different approach to logging, specially
now that logging for TypeScript is often for single page applications, built in frameworks
like angular, react, ember and so on.

We wanted an easy to use logging mechanism that would build up itself dynamically if needed,
and required minimum configuration from a developers perspective by default.

In addition, what we also needed is to be able to easily enable/change logging when the application is already deployed.
Next to logging during development, it was also important to be able to trace problems customers encounter in production.

The above is tackled by a different project [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) which
currently can be used in Chrome, as a developer extension, if the category style of logging is used by the application.

## How

The example below configures the logging in Config.ts and exports the relevant (sub)categories you want to log for
as well as the actual root logger (you can have multiple root loggers if you like).

The module ProductService.ts imports the exported logger and categories to log to.
The module FinancialService.ts imports the logger and root category, but decides it needs
a different child category. It does that by just declaring another category, and can immediately use it.

Config.ts
~~~
import {Category,CategoryLogger,CategoryServiceFactory,CategoryDefaultConfiguration,LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Info));

// Create categories, they will autoregister themselves.
// This creates one root logger, with 2 child sub-categories.
export const catRoot = new Category("service");
export const catCust = new Category("customer", catRoot);
export const catProd = new Category("product", catRoot);

// Get a logger, this can be retrieved for root categories only (in the example above, the "service" category).
export const log: CategoryLogger = CategoryServiceFactory.getLogger(catRoot);
~~~

ProductService.ts
~~~
import {log,catProd,catCust} from "./Config"

export class ProductService {

  createProduct(name: string): Product {
     // Normal log to category: catProd
     log.info("Creating product with name: " + name, catProd);

     // Lambda log to catProd (cheaper)
     log.infoc(() => "Creating product with name: " + name, catProd);

     // Specifying no category, will log to the root category by default, service in the example.
     log.info("Creating product with name: " + name);

     // Log to multiple categories
     log.info("Creating product with name: " + name, catProd, catCust);

     return new Product(name);
  }

}
~~~

FinancialService.ts
~~~
import {log,catRoot} from "./Config"

// Oh, turns out we need another sub-category. This can be done just
// as easy as just defining it where you need it dynamically.
const catFin = new Category("financial", catRoot);

export class FinancialService {

  processMoney(): void {
    log.info("Log to the new category", catFin);
  }

}
~~~

Output (we assume we called the methods createProduct("Beer") and processMoney()):
~~~
2016-12-22 11:14:26,273 INFO [product] Creating product with name: Beer
2016-12-22 11:14:26,274 INFO [product] Creating product with name: Beer
2016-12-22 11:14:26,275 INFO [service] Creating product with name: Beer
2016-12-22 11:14:26,275 INFO [product, customer] Creating product with name: Beer
2016-12-22 11:14:26,276 INFO [financial] Log to the new category
~~~

## Custom logger

By default logging will go the console. In some cases you may want to use a custom logger which either logs differently or logs elsewhere.
The example below shows how to do this.

CustomLogger.ts
~~~
import {AbstractCategoryLogger,Category,CategoryLogMessage,RuntimeSettings} from "typescript-logging";

export class CustomLogger extends AbstractCategoryLogger {

  private messages: string[] = [];

  // The first two parameters are required, the 3rd one is an example parameter
  // where we give this logger an array and log all messages to that array.
  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings, messages: string[]) {
    super(rootCategory, runtimeSettings);
    this.messages = messages;
  }

  // This is the only thing you really need to implement. In this case
  // we just write the complete message to the array.
  protected doLog(msg: CategoryLogMessage): void {
    // Note: we use createDefaultLogMessage() to spit it out formatted and all
    // however you're free to print in any way you like, the data is all
    // present on the message.
    this.messages.push(this.createDefaultLogMessage(msg));
  }
}
~~~
The code above shows how to create a CustomLogger, the easiest way is to extend AbstractCategoryLogger. If you really
want to implement everything yourself you could implement CategoryLogger instead (note this is quite some work).

Config.ts
~~~
import {Category,CategoryLogger,CategoryLogFormat,CategoryServiceFactory,CategoryDefaultConfiguration,LoggerType,LogLevel,RuntimeSettings} from "typescript-logging";
import {CustomLogger} from "./CustomLogger"

export const catRoot = new Category("service");
const messages: string[] = [];

// Configure to use our custom logger, note the callback which returns our CustomLogger from above.
const config = new CategoryDefaultConfiguration(
   LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
  (rootCategory: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(rootCategory, runtimeSettings, messages)
);
CategoryServiceFactory.setDefaultConfiguration(config);

export const log: CategoryLogger = CategoryServiceFactory.getLogger(catRoot);
~~~
The config above modifies the configuration and makes sure that we use our CustomLogger for logging.
If you'd log using the logger, e.g. log.info("Hello"). The formatted message in this example would end up in the array "messages" from above.
Obviously you can do whatever you need to do in the CustomLogger.

That's all there is to it to make a custom logger. :)

## Api and documentation

The full typescript API can be found in the downloads part of github as a .zip file. Download and extract the zip and open the relevant index.html,
it also contains a copy of this file as html.

You can download both bundles and documentation from here: [Documentation](https://github.com/mreuvers/typescript-logging/tree/master/downloads/bundle/latest)

### Changing default configuration
Can be done through CategoryServiceFactory.setDefaultConfiguration(..). Check the documentation for details, as each class is documented on how to be used.

### Changing log levels dynamically
When an app runs, you can use the developer extension , see: [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) for details.

You can also use the console control API for this since 0.3. For details see [here](latest_console_control.md).

## Browser developer extension

Make sure to visit: [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) to get the chrome developer extension, which allows you to dynamically change log levels when the app runs.