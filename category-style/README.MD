# TypeScript Logging category style

Logging library for Typescript projects. This is one of the available flavors, please see [here](../README.md) for all
available styles.

This flavor differentiates itself from the alternatives by allowing applications to do topological logging
(by creating a tree structure of loggers). The corner stone is the `Category` from which child categories can be created
recursively. Each category is a logger as well and can be used to log.

As an example let's look at performance logging. We could use a `Category` named "Performance" which would be accessible
throughout the application. Any messages logged by it will be categorized as to belong to "Performance"
and all logging can easily be enabled/disabled for this Category. For more fine-grained control, child categories can be
created if needed, creating a topology/tree of loggers.

* [Getting started](#getting-started)
* [Logging](#logging)
* [Configuration](#configuration)
* [Dynamic control](#dynamic-control)

Using typescript-logging **_version 1_**? Please
visit [https://github.com/vauxite-org/typescript-logging/tree/release-1.x](https://github.com/vauxite-org/typescript-logging/tree/release-1.x)
for more details. Consider upgrading to the latest version.

## Getting started

This section describes how to get started quickly.

### Installation

To install this flavor issue the following commands:

```shell
npm install --save typescript-logging
npm install --save typescript-logging-category-style
```

The first command installs the "core" of typescript logging and is a required dependency. The second command installs
the flavor (category) to use.

### Quick start

The following code defines a configuration file which creates a single `CategoryProvider`, which is configured with a
log level of `Debug` (default is `Error`). We also create a couple of root categories that will be used by the modules
below to either log directly or create child categories from.

Note that we give a CategoryProvider a unique name, this is useful for external control (
see [Dynamic control](#dynamic-control))
for more details about that.

```typescript
/*--- config/LogConfig.ts ---*/
import {LogLevel} from "typescript-logging";
import {CategoryProvider, Category} from "typescript-logging-category-style";

const provider = CategoryProvider.createProvider("ExampleProvider", {
  level: LogLevel.Debug,
});

/* Create some root categories for this example, you can also expose getLogger() from the provider instead e.g. */
export const rootModel = provider.getCategory("model");
export const rootService = provider.getCategory("service");
export const rootMain = provider.getCategory("main");
```

The modules below use the categories created in LogConfig.ts in various ways.

```typescript
/*--- model/Account.ts ---*/
import {rootService} from "../config/LogConfig";

/* Creates a child category/logger called "Account" below "model" */
const log = rootService.getChildCategory("Account");

export interface Account {
  name: string;
}

export function createAccount(name: string): Account {
  log.debug(() => `Creating new account with name '${name}'.`);
  // Something fancy here to create it.
  return {name};
}
```

```typescript
/*--- service/AccountService.ts ---*/
import {rootService} from "../config/LogConfig";
import {Account} from "../model/Account";

/* Creates a child category/logger called "AccountService" below "service" */
const log = rootService.getChildCategory("AccountService");

export async function saveAccount(account: Account) {
  log.debug(() => `Will save account '${account.name}'.`);
  // ... Update code
  try {
    await someUpdateHere();
  }
  catch (e) {
    log.error(() => `Failed to save account '${account.name}'.`, e);
    throw e;
  }
}
```

```typescript
/*--- Main.ts ---*/
import {rootMain} from "./config/LogConfig";
import {createAccount} from "./model/Account";
import {saveAccount} from "./service/Account";

/* Create an account and save it - log on success/error */
const account = createAccount("My Account");
saveAccount(account)
  .then(() => {
    /* Note we use the root category directly to log with here */
    rootMain.debug("Successfully created account.", account.name);
  })
  .catch(e => {
    rootMain.error("Ooops...", e);
  });
```

Now let's assume Main.ts is executed above. It successfully creates and saves the account. The logging will then roughly
end up like below.

```
2021-12-31 23:14:26,273 DEBUG [model.Account] Creating new account with name 'My Account'.
2021-12-31 23:14:26,275 DEBUG [service.Account] Will save account 'My Account'.
2021-12-31 23:14:27,192 DEBUG [main] Successfully created account. ["My Account"] 
```

## Logging

The quick start above gives an overview on how to create a provider, get categories from it and then log using a
category.

To be clear about this from the beginning: a `Category` is a `Logger`. In fact a Category extends the CoreLogger
interface. Category has a few additional properties, such as a name an optional parent (category) and children (child
categories).

So a category in this flavor can be used to log.

A logger can log on different `LogLevels`:

- Trace
- Debug
- Info
- Warn
- Error
- Fatal
- Off

Each level except 'Off' has a matching function on the Logger, for example `trace` for Trace and `debug` for Debug. The
signatures of the function are the same for all of them. Note that the level 'Off' turns logging off completely.

This shows the signatures for debug.

```typescript
interface CoreLogger {
  debug(message: LogMessageType, ...args: unknown[]): void;

  debug(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
}
```

The above may look confusing, but we merge the functions in the implementation (and this is how to declare this in
TypeScript).

Essentially it allows us to log messages in various formats like this:

```typescript
// Assume 'log' is our Logger here.
log.debug("This is a simple message");
log.debug("This is a simple message and we log an Error (normally you'd catch it and then log it)", new Error("Some Exception"));
log.debug(() => "Simple message as lambda");
log.debug(() => "Simple message as lambda with Error", () => new Error("SomeOther"));
log.debug("Simple message with some random arguments", 100, "abc", ["some", "array"], true);
log.debug(() => "Simple message as lambda with Error and some random arguments", new Error("Some Exception"), 100, "abc", ["some", "array"], true);
```

The example of `debug` applies to any of the available functions (trace, debug, info, warn, error and fatal). What is
logged exactly how will depend on the configuration and channel in use.

## Configuration

This section provides more details on how to configure the category style logging.

### Options

A CategoryProvider created without any options logs on `LogLevel.Error` and uses a default channel that logs to the
console. Messages are formatted in a default sane format (see above for an example).

This code snippet creates a CategoryProvider with default settings:

```typescript
import {CategoryProvider} from "typescript-logging-category-style";

const provider = CategoryProvider.createProvider("ProviderWithDefaultSettings");

/* Will log on error level and on the console */
const rootLogger = provider.getCategory("Root");
```

The following configuration options are available and can be passed as optional argument when creating the
CategoryProvider. The documentation for each option can be read below
(this is from the source code so your IDE will help you with that too).

```typescript
type CategoryConfigOptional = {
  /**
   * Default LogLevel.
   */
  readonly level?: LogLevel;

  /**
   * What kind of channel to log to (a normal or raw channel).
   * This is the default channel. Can be overridden depending on the
   * configuration options by the chosen logging solution.
   *
   * Default channel logs to console.
   */
  readonly channel?: LogChannel | RawLogChannel;

  /**
   * The argument formatter to use.
   */
  readonly argumentFormatter?: ArgumentFormatterType;

  /**
   * The date formatter to use to format a timestamp in the log line.
   */
  readonly dateFormatter?: DateFormatterType;

  /**
   * This allows one to retrieve the same (child) category from CategoryProvider by name.
   * This means it creates the Category once, and next time it is asked for returns the same Category.
   *
   * Set to false to mimic version 1 behavior, in which case it will throw an Error telling you cannot
   * create the same category twice.
   *
   * Default value is true.
   */
  readonly allowSameCategoryName?: boolean;
}
```

With this knowledge we can create for example a provider that logs on a different log level, uses a custom date
formatter and logs to a custom LogChannel like the following code snippet.

```typescript
import {LogLevel} from "typescript-logging";
import {CategoryProvider} from "typescript-logging-category-style";

const provider = CategoryProvider.createProvider("ProviderWithCustomSettings", {
  level: LogLevel.Info,
  dateFormatter: millisSinceEpoch => `${millisSinceEpoch}`, // Silly example, normally you'd e.g. create a Date and do custom formatting for that.
  channel: {
    type: "LogChannel",
    write: logMessage => console.log(`This is a custom channel: ${logMessage.message}`),
  },
});
```

The example is a bit silly to keep it simple. It writes the millis out literally as a string
(you probably want to convert it to a Date and then return a custom string instead). It also specifies a custom channel
which writes to the console pre-fixed by some text. However, all the options can be fully customized to your needs, so
you can for example write to something else completely.

### Channels

In the previous section we already briefly touched on the concept of channels. In this section we will look into more
detail what it means and how they can be used to customize your logging if needed.

Using the standard settings a provider uses a predefined `LogChannel`, which logs to console (from `DefaultChannels`
to be exactly).

There are two type of channels that can be used for configuration:

- `LogChannel`
- `RawLogChannel`

The **LogChannel** is best used if you only want to write a pre-formatted message (and possibly error stack) to another
place than the default console. The LogChannel is defined as follows.

```typescript
export interface LogChannel {

  readonly type: "LogChannel";

  /**
   * Write a complete LogMessage away, the LogMessage is
   * ready and formatted.
   */
  readonly write: (msg: LogMessage) => void;
}
```

Essentially it expects you to provide the `write` function. The `type` (a discriminating union) is solely there to
distinguish between the different channels and is always `"LogChannel"` for a `LogChannel`. The write function is called
with a `LogMessage` when it must be logged, and contains a message and optional error (formatted as stack). We have
already seen how to create a custom LogChannel in the previous section (have a look above if you didn't read it yet).

The **RawLogChannel** can be used for more advanced scenarios. It allows us to completely format the message in any way
we want as well as writing it elsewhere. The RawLogChannel is defined as follows.

```typescript
export interface RawLogChannel {

  readonly type: "RawLogChannel";

  /**
   * Write the RawLogMessage away. The formatArg function can be used to format
   * arguments from the RawLogMessage if needed. By default the formatArg function will
   * use JSON.stringify(..), unless a global format function was registered
   * in which case it uses that.
   */
  readonly write: (msg: RawLogMessage, formatArg: (arg: unknown) => string) => void;
}
```

Similar to LogChannel it expects you to provide the `write` function. The main difference here is that the
passed `RawLogMessage` contains a lot of information on what is supposed to be logged. It is up to the implementer of
the function what to do with it and how to output it.

The `RawLogMessage` is defined as follows:

```typescript
export interface RawLogMessage {

  /**
   * The level it was logged with.
   */
  readonly level: LogLevel;

  /**
   * Time of log statement in millis (since epoch)
   */
  readonly timeInMillis: number;

  /**
   * Contains the log name involved when logging (logger name or category name), by default it's always 1
   * but can be more in some advanced cases.
   */
  readonly logNames: string | ReadonlyArray<string>;

  /**
   * Original user message, and only that. No log level, no timestamp etc.
   */
  readonly message: string;

  /**
   * Error if present.
   */
  readonly exception?: Error;

  /**
   * Additional arguments when they were logged, else undefined.
   */
  readonly args?: ReadonlyArray<unknown>;
}
```

As can be seen there are various data fields present. There are some utility format functions present to help out if
needed. These are `formatArgument` and `formatDate` which respectively format an argument and a time stamp as the
library does for a `LogChannel`.

The following code snippet creates a provider which uses a `RawLogChannel`.

```typescript
import {LogLevel} from "typescript-logging";
import {CategoryProvider} from "typescript-logging-category-style";

const provider = CategoryProvider.createProvider("ProviderWithCustomSettings", {
  channel: {
    type: "RawLogChannel",
    write: (msg, formatArg) => {
      const date = new Date(msg.timeInMillis);
      const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      console.log(`${dateStr} ${LogLevel[msg.level]} ${msg.message}`);
    },
  },
});
```

The code above logs only the `LogLevel` and message of the incoming `RawLogMessage` and creates a custom date format for
it (this logs the date in dd-MM-yyyy format). The example is of course simplified, but what you should pick up from this
is that you can fully control how to format the raw data and where to write to.

For clarity, the examples inline the channels for clarity, but you can of course write separate functions and/or classes
for them as well if they get complex.

## Dynamic control

This section gives an overview on how to dynamically control the log levels of your application. This means to change
the levels after the normal setup/configuration, at a certain point in time.

This is very useful if your application for a user encounters an issue. In order to find out what is wrong you can ask
for more information and tell the customer to enable certain parts of the logging and reproduce their problem with debug
logging enabled.

There are two ways to achieve this.

- [Programmatically by your application](#programmatic control)
- [Externally using the CategoryControl](#external control)

### Programmatic control

This allows *your* application to take matters in its own hands. You could add some option to change logging for example
from the user interface of the application. You would do that then by changing the runtime settings of various
categories.

The CategoryProvider exposes two functions for this purpose:

```typescript
interface CategoryProvider {
  // Docs left out for clarity (see your IDE code insight when using CategoryProvider).
  readonly updateRuntimeSettings: (settings: RuntimeSettings) => void;
  readonly updateRuntimeSettingsCategory: (category: Category, settings: CategoryRuntimeSettings) => void;
}
```

The function `updateRuntimeSettings` allows changing the level (or channel) for *all categories*. This applies to
already created categories and new ones by default.

The function `updateRuntimeSettingsCategory` allows a change of log level only, for given category
(and it's children recursively).

The following snippet will change the log level to `Trace` for all existing categories and new ones.

```typescript
// Assume provider is a CategoryProvider
provider.updateRuntimeSettings({level: LogLevel.Trace});
```

### External control

This allows you to control the logging dynamically, but externally through the browser console running your client
application.

This is available as function `CATEGORY_LOG_CONTROL` and can be imported from the library. This can then be used like:

```typescript
import {CATEGORY_LOG_CONTROL} from "typescript-logging-category-style";

const control = CATEGORY_LOG_CONTROL();
control.help(); // Shows help on how to get started
const controlProvider = control.getProvider("MyProviderName");
controlProvider.help(); // Shows help for control provider
controlProvider.showSettings(); // Will print current settings of the provider
controlProvider.update("debug"); // Updates all categories (and new) to debug level recursively
controlProvider.update("trace", 5); // Updates 5th category of showSettings() to trace recursively
controlProvider.save(); // Save current state of categories to localStorage
controlProvider.reset(); // Resets to state of when control provider was fetched first

/* Restores to the saved state, this can be done at any time also after a browser restart, provided localStorage is available */
controlProvider.restore();
```

This is by default not available to the client as it needs to be your choice whether to expose this in the browser
console or not. In order to do this, it comes down to one of:

- Expose it in the index.ts(x) of your application and make sure your bundler exports it by prefixing with a variable
  for example (recommended).
- Expose it on the window in some fashion

#### Expose using Webpack example

The following section shows how to export the `CATEGORY_LOG_CONTROL` function using Webpack, and make it available in
the browser console. This allows it to be used in a client application when you need to debug something that is already
delivered to a customer.

```typescript
/* Your src/index.ts(x) */
export {CATEGORY_LOG_CONTROL} from "typescript-logging-category-style";
```

Now make sure Webpack creates a bundle that exposes the index (simplified as ts-loaders etc. are left out, but it shows
the relevant part on how to expose it).

```javascript
/* webpack.config.js */
const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "myapp.js",
    library: "myapp",
  },
};
```

Now when you'd open your application in your browser, open the console - you can type:

```javascript
/* Console of your application */
const control = myapp.CATEGORY_LOG_CONTROL();
control.help();
// etc.
```

#### Expose using Rollup example

The following section shows how to export the `CATEGORY_LOG_CONTROL` function using Rollup, and make it available in the
browser console. This allows it to be used in a client application when you need to debug something that is already
delivered to a customer.

```typescript
/* Your src/index.ts(x) */
export {CATEGORY_LOG_CONTROL} from "typescript-logging-category-style";
```

Now make sure Rollup creates a bundle that exposes the index (simplified as plugins are left out, but it shows the
relevant part on how to expose it).

```javascript
/* rollup.config.js */
export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/myapp.js",
      name: "myapp",
      format: "iife",
    },
  ],
};
```

Now when you'd open your application in your browser, open the console - you can type:

```javascript
/* Console of your application */
const control = myapp.CATEGORY_LOG_CONTROL();
control.help();
// etc.
```

#### Expose on window manually

```typescript
/* Your src/index.ts(x) */
import {CATEGORY_LOG_CONTROL} from "typescript-logging-category-style";

if (window !== undefined) {
  (window as any).appLogControl = CATEGORY_LOG_CONTROL;
}
```

The above code exposes "appLogControl" on the global window object if it exists. When it does the logging can be
accessed in the browser's console as follows:

```javascript
/* Console of your application */
const control = appLogControl();  // or: window.appLogControl()
control.help();
// etc.
```
