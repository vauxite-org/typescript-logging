# TypeScript Logging

TypeScript logging can be used to add logging to your web or node project.

**_Version 2 of typescript-logging has been released, this version has been written from scratch and is
not compatible with version 1 (see migration)._**

There are two different flavors available to use. Please visit the documentation of the links below and pick the one you
prefer.

* The [typescript-logging-category-style](./category-style/README.MD) flavor.
* The [typescript-logging-log4ts-style](./log4ts-style/README.MD) flavor.

The following sections are available:

* [Getting started](#getting-started)
* [Build](#build)
* [Tests](#tests)
* [Bugs](#bugs)
* [Contributing](#contributing)
* [Migration](#migration)
* [Changelog](#changelog)

**Using typescript-logging version 1?**

Please visit
[https://github.com/vauxite-org/typescript-logging/tree/release-1.x](https://github.com/vauxite-org/typescript-logging/tree/release-1.x)
for more details. Consider upgrading to the latest version.

**Version 2 of typescript-logging is _not_ compatible with version 1**

Please check the [migration](#migration) guide for more information.

## Getting started

For all details and documentation please visit the links above. The following sections provide a quick start only for
both flavors.

### Category style flavor

*To install the category-style flavor use the following npm commands:*

```shell
npm install --save typescript-logging  # Core is required for any style
npm install --save typescript-logging-category-style
```

*Usage*

The following section configures a provider and exposes a getLogger function for other modules to use. The getLogger in
this example is used to create root categories.

```typescript
/*--- LogConfig.ts ---*/
import {CategoryProvider, Category} from "typescript-logging-category-style";

const provider = CategoryProvider.createProvider("ExampleProvider");

export function getLogger(name: string): Category {
  return provider.getCategory(name);
}
```

----

```typescript
/*--- Person.ts ---*/
import {getLogger} from "./LogConfig";

/* Root categories can and probably will be defined elsewhere, this is just an example */
const logModel = getLogger("model");

/* Create child categories based on a parent category, effectively allowing you to create a tree of loggers when needed */
const logPerson = logModel.getChildCategory("Person");

function example(value: string) {
  logPerson.debug(() => `Example function called with value ${value}`);
  try {
    // Awesome code here...
    logPerson.getChildCategory("example()").debug(() => "Child category again");
  }
  catch (e) {
    logPerson.error(() => "Awesome code failed unexpectedly", e);
  }
  finally {
    logPerson.debug(() => "Example function completed");
  }
}
```

### Log4ts flavor

*To install the log4ts-style flavor use the following npm commands:*

```shell
npm install --save typescript-logging  # Core is required for any style
npm install --save typescript-logging-log4ts-style
```

*Usage*

The following section configures a provider and exposes a getLogger function for other modules to use.

```typescript
/*--- LogConfig.ts ---*/
import {LogLevel} from "typescript-logging";
import {Log4TSProvider, Logger} from "typescript-logging-log4ts-style";

const provider = Log4TSProvider.createProvider("ExampleProvider", {
  /* Specify the various group expressions to match against */
  groups: [{
    expression: new RegExp("model.+"),
    level: LogLevel.Debug, /* This group will log on debug instead */
  }, {
    expression: new RegExp("service.+"),
  }],
});

export function getLogger(name: string): Logger {
  return provider.getLogger(name);
}
```

----

```typescript
/*--- Person.ts ---*/
import {getLogger} from "./LogConfig";

const log = getLogger("model.Person")

function example(value: string) {
  log.debug(() => `Example function called with value ${value}`);
  try {
    // Awesome code here...
  }
  catch (e) {
    log.error(() => "Awesome code failed unexpectedly", e);
  }
  finally {
    log.debug(() => "Example function completed");
  }
}
```

## Build

Please make sure to have node 18 LTS installed.

To locally build the logging flavors. The easiest is to run the ./initialize.sh script:

```shell
./initialize.sh # Clean, install and build everything.
```

This will cleanly install and build your branch from scratch.

You can also manually install things, by going into the respective directories and manually type:

```shell
# If not installed yet
npm run ci
# or for the test projects
npm install
```

Any project when you're in the respective directory can be built with:

```shell
npm run build
```

That will clean, build and test the project.

## Tests

To locally run the tests, in the respective directories:

```shell
npm run test
```

## Integration tests

If you're on linux or mac-os, it's easiest to run initialize.sh first. Otherwise, skip that and run `npm run install`
manually as shown below.

```shell
# Linux/MacOS only - Cleans everything and re-installs packages, including those for the integration projects.
./initialize.sh

# If not using ./initialize.sh, note that the dependent projects must be built first (core and the various styles, see above)
npm run install # Run inside respective test-integration project, e.g. tests-integration/rollup
npm run build   # Run inside respective test-integration project. Builds test webapp and runs cypress tests.
```

## Bugs

If you encounter a bug please log it in the issue tracker of this repository and make sure to specify what flavor
(style) you are using.

## Contributing

Feel free to contribute or come up with great ideas, please use the issue tracker for that.

If you add/change new functionality and want it merged in a later release, please open a pull request. Also add tests
for it (see various "test" directories).

Please keep in mind that things may not fit the library and in such case will be rejected, so if you are unsure please
ask first before wasting your valuable time.

# Migration

Please check the [migration guide](documentation/migration.md) if you are on an old version and wish to use the latest
version available.

## Changelog

Please check the [changelog](documentation/change_log.md)
