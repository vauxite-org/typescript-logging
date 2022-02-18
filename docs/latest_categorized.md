# Documentation category style

This page describes how the latest, new logging mechanism of this library works and can be used.

* [Why](#why)
* [Usage](#usage)
* [Formatting message](#formatting-message)
* [Custom logger](#custom-logger)
* [Api and documentation](#api-and-documentation)
* [Browser developer extension](#browser-developer-extension)


## Why

Most logging libraries are (loosely) based on (older) existing logging implementations
in the way they used to work and are setup. There's nothing wrong with that, and in fact
the 'old' way of logging is implemented in a similar fashion by the log4j style logging as well.

However in our projects we felt we needed a different approach to logging, specially
now that logging for TypeScript is often for single page applications, built in frameworks
like angular, react, ember and so on.

We wanted an easy to use logging mechanism that could build up itself dynamically if needed,
and required minimum configuration from a developers perspective by default.

In addition, what we also needed is to be able to easily enable/change logging when the application is already deployed.
Next to logging during development, it was also important to be able to trace problems customers encounter in production.

The above is tackled by a different project [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) which
currently can be used in Chrome, as a developer extension, if the category style of logging is used by the application.

In addition of the extension, logging can be changed on console level as well.

## Usage

The example below configures the logging in Config.ts and exports a handful of categories. Each category created can be used
directly to log for that category (so, debug, info etc methods are present on it!).

Logging directly using Category is new since version 0.5.0.

In the previous versions you first had to retrieve a logger using: `CategoryServiceFactory.getLogger(categoryHere)`
That still works, but is not necessary anymore.

The module ProductService.ts imports the categories to log to (and the logger as example).
The module FinancialService.ts imports the catService category, but it needs
an additional child category. It does that by just declaring another category, and can immediately use it.

Config.ts
```typescript
import {Category,CategoryLogger,CategoryServiceFactory,CategoryConfiguration,LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

// Create categories, they will autoregister themselves.
// This creates one root (no parent) category, with two children.
export const catService = new Category("service");
export const catCust = new Category("customer", catService);
export const catProd = new Category("product", catService);

// This is not needed anymore since 0.5.0, but effectively does the same for given category.
// It can be retrieved for a category directly, this is mostly for backwards compatibility.
export const logProduct: CategoryLogger = CategoryServiceFactory.getLogger(catProd);
```

ProductService.ts
```typescript
import {catService,catProd,catCust,logProduct} from "./Config"

export class ProductService {

  createProduct(name: string): Product {
     // Normal log for category: catProd
     catProd.info("Creating product with name: " + name);

     // Lambda log for category: catProd (cheaper, only called when needed)
     catProd.info(() => "Creating product with name: " + name);

     // logProduct does exactly the same as catProd.info(..) would, just here as example.
     logProduct.info("Creating product with name: " + name);

     // Log to multiple categories, logs for catCust as well.
     catProd.info("Creating product with name: " + name, catCust);

     return new Product(name);
  }
}
```

FinancialService.ts
```typescript
import {catService} from "./Config"

// Oh, turns out we need another sub-category. This can be done dynamically later on as well.
const catFin = new Category("financial", catService);

export class FinancialService {

  processMoney(): void {
    catFin.info("Log to the new category");

    const data = { text: "letters" };

    // Note we use LogData to pass in here! Also 'data' is just a shortcut for 'data: data' here.
    catFin.info({msg: "LogData message", data}, catFin);

    // This custom formats the additional data (ds lambda)
    catFin.info({msg: "LogData message", data, ds: (value: any) => "[custom]: " + JSON.stringify(value)});
  }

}
```

Output (we assume we called the methods createProduct("Beer") and processMoney()):
~~~
2016-12-22 11:14:26,273 INFO [product] Creating product with name: Beer
2016-12-22 11:14:26,274 INFO [product] Creating product with name: Beer
2016-12-22 11:14:26,275 INFO [product] Creating product with name: Beer
2016-12-22 11:14:26,275 INFO [product, customer] Creating product with name: Beer
2016-12-22 11:14:26,276 INFO [financial] Log to the new category
2016-12-22 11:14:26,277 INFO [financial] LogData message [data]: {"text":"letters"}
2016-12-22 11:14:26,278 INFO [financial] LogData message [custom]: {"text":"letters"}
~~~

For LogData interface see: [LogData](latest_log4j.md) close to the bottom of the page.

## Formatting message

If you do not need a custom logger but need a custom message for the other logger types (non-custom),
you can specify a custom formatterLogMessage lambda instead. This allows you to change the log message without the need to implement a custom logger.

The following code gives an example on how to do this (imports have been left out):
```typescript
const defaultConfig = new CategoryConfiguration(LogLevel.Info, LoggerType.Console);
defaultConfig.formatterLogMessage = (msg: CategoryLogMessage): string => {
  // This example just shortens the message (will have no time info etc.)
  return msg.getMessage();
};
CategoryServiceFactory.setDefaultConfiguration(defaultConfig);
export const catService = new Category("service");

// The catService above can be used for logging now and uses the custom formatter.
```
The category from the example above will now use the given formatter, and will only log the message without any additional information such as time.

## Custom logger

By default logging will go the console. In some cases you may want to use a custom logger which either logs differently or logs elsewhere.
The example below shows how to do add a custom logger.

CustomLogger.ts
```typescript
import {AbstractCategoryLogger,Category,CategoryLogMessage,RuntimeSettings} from "typescript-logging";

export class CustomLogger extends AbstractCategoryLogger {

  private messages: string[] = [];

  // The first two parameters are required, the 3rd is our parameter
  // where we give this logger an array and log all messages to that array.
  constructor(category: Category, runtimeSettings: RuntimeSettings, messages: string[]) {
    super(category, runtimeSettings);
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
```
The code above shows how to create a CustomLogger, the easiest way is to extend AbstractCategoryLogger. If you really
want to implement everything yourself you could implement interface CategoryLogger instead (note this is quite some work).

Config.ts
```typescript
import {Category,CategoryLogger,CategoryLogFormat,CategoryServiceFactory,CategoryConfiguration,LoggerType,LogLevel,RuntimeSettings} from "typescript-logging";
import {CustomLogger} from "./CustomLogger"

export const catService = new Category("service");
const messages: string[] = [];

// Configure to use our custom logger, note the callback which returns our CustomLogger from above.
const config = new CategoryConfiguration(
   LogLevel.Info, LoggerType.Custom, new CategoryLogFormat(),
  (category: Category, runtimeSettings: RuntimeSettings) => new CustomLogger(category, runtimeSettings, messages)
);
CategoryServiceFactory.setDefaultConfiguration(config);

// The catService can be used for logging now using the custom logger beneath.
```
The config above modifies the configuration and makes sure that we use our CustomLogger for logging.
If you'd log using the catService, e.g. catService.info("Hello"). The formatted message in this example would end up in the array "messages" from above.
Obviously you can do whatever you need to do in the CustomLogger.

That's all there is to it to make a custom logger. :)

## Api and documentation

The full typescript API is bundled in the npm package, your editor will recognize the typings.

### Changing default configuration
Can be done through CategoryServiceFactory.setDefaultConfiguration(...). Check the documentation for details, as each class is documented on how to be used.

### Changing log levels dynamically
When an app runs, you can use the developer extension , see: [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) for details.

You can also use the console control API for this since 0.3. For details see [here](latest_console_control.md).

## Browser developer extension

Make sure to visit: [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) to get the chrome developer extension, which allows you to dynamically change log levels when the app runs.
