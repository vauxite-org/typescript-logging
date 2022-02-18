# Console logging control

This page describes how the logging can be controlled dynamically using the console. There are two 'controls':
* log4j console control
* categorized console control

Please see the sections below for details.

The standard typescript-logging bundle exposes a variable called TSL, on which to start.

This variables exposes several functions to call:
* help()
* getLogControl()
* getCategoryControl()

*The help provided by the logging objects is leading always, and should be consulted for more details!*

**Webpack users read this first**: To use the console api when webpack bundles your stuff, see [below](#expose-console-control-api-with-webpack).

## Log4j console control

This can be used if your application uses the log4j style of logging.

The log4j control object can be retrieved by:
```
let control = TSL.getLogControl();
```

This provides you access to the control object for log4j. This object provides several functions,
but the most important ones for you to start with are:

```
control.help();
control.listFactories();
```

The first provides help on all functions available, and the listFactories() provides an overview of all registered LoggerFactories.

The example below changes the the log level for all LogGroups within a LoggerFactory (through browser console e.g.):

```
let control = TSL.getLogControl();

// Factories are numbered, use listFactories() to find out
let factoryControl = control.getLoggerFactoryControl(1);

// Change the loglevel for all LogGroups for this factory to Debug (so all existing/new loggers from this factory will log to Debug)
factoryControl.change({group: "all", logLevel: "Debug"});

// Resets everything (all LogGroups) back to their original settings, before our changes.
factoryControl.reset();  // or factory.reset("all")
```

Always use the help() on the objects for more details.

## Categorized console control

This can be used if your application uses the categorized style of logging.

The categorized control object can be retrieved by:
```
let control = TSL.getCategoryControl();
```

This provides you access to the control object for categories. This object provides several functions,
but the most important ones for you to start with are:

```
control.help();
control.showSettings();
```

Help provides an overview of available functions and how to use them.
The change function allows you to change the settings for categories.

The example below changes the log levels for categories.
```
let control = TSL.getCategoryControl();

// Change all root categories recursively (so include childs), and the loglevel to Debug (so all existing/new loggers will log on Debug)
control.change({category: "all", recursive:true, logLevel: "Debug"});

// Change category 1, not it's childs and set the loglevel to warn. Use control.showSettings() to list available categories.
control.change({category: 1, recursive:false, logLevel: "Warn"});

// Resets everything back to original settings, before the changes.
control.reset();

```

Always use the help() on the objects for more details.

## Expose Console control API with webpack

If you use the normal bundle, it will already be exposed by the TSL variable (see above).
However if you use webpack for example you need to do something more, since webpack bundles things the TSL variable will not be available anymore.

There are a few ways doing this. Please read the comments in the code.

### Webpack way

```
var webpack = require("webpack");

module.exports = {

 // Notice the library part in this case called it LOGGING but you can expose it differently.
 // This packs your current project as library and exposes it as LOGGING, whatever you export from your index.ts (or whatever your main index is),
 // can be accessed through LOGGING here.
 output: {
    libraryTarget: "var",
    library: "LOGGING",
    .... // your stuff
  }

};
```

index.ts
~~~
// Your stuff here ...

import { help, getLogControl, getCategoryControl } from "typescript-logging";
export const CNT: any = {
  help: help,
  getLogControl: getLogControl,
  getCategoryControl: getCategoryControl,
};
~~~

In the browser (usage):
~~~
LOGGING.CNT.help();
let control = LOGGING.CNT.getLogControl();
~~~

### Using window object

The shortest and easiest way, just expose stuff on the window object (this only works in a browser!).

index.ts
```
import * as logging from "typescript-logging";

// This exposes EVERYTHING typescript-logging exposes, which includes help etc but a lot more you don't need.
// You could easily filter and only expose help, getLogControl and getCategoryControl
(window as any).LOGGING = logging;
```

In the browser (usage):
~~~
LOGGING.help();
let control = LOGGING.getLogControl();
~~~

