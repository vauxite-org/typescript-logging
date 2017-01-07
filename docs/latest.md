# Typescript logging documentation

This page describes how the latest, new logging mechanism of this library works and can be used.

## Why

Most logging libraries are (loosely) based on (older) existing logging implementations
in the way they used to work and are setup. There's nothing wrong with that, and in fact
the 'old' way of logging was implemented by this library in a same way initially,
and works just fine and will remain working as is (for docs on that see: [Stable version 0.1.3](stable_0.1.3.md)).

However in our projects we felt we needed a different approach to logging, specially
now that logging for typescript is often for single page applications, built in frameworks
like angular, react, ember and so on.

We wanted an easy to use logging mechanism that would build up itself dynamically if needed,
and required minimum configuration from a developers perspective.

In addition, what we also needed is to be able to easily enable/change logging when the application is already deployed.
Next to logging during development, it's also important to be able to trace problems
customers encounter in production.
The above tackled by a different project [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) which
currently can be used in Chrome, as a developer extension, that is if the logging library
is used by the application.

## How

The example below configures the logging in Config.ts and exports the relevant (sub)categories you want to log for
as well as the actual root logger (you can have multiple root loggers if you like).

The module ProductService.ts imports the exported logger and categories to log to.
The module FinancialService.ts imports the logger and root category, but decides it needs
a different child category. It does that by just declaring another category, and can immediately use it.

Config.ts
~~~
import {Category,CategoryServiceFactory,CategoryDefaultConfiguration,LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration, categories will log to Error.
CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Info));

// Create categories, they will autoregister themselves.
// This creates one root logger, with 2 child sub-categories.
export const catRoot = new Category("service");
export const catCust = new Category("customer", catRoot);
export const catProd = new Category("product", catRoot);

// Get a logger, this can be retrieved for root categories only (in the example above, the "service" category).
export const log = CategoryServiceFactory.getLogger(catRoot);
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

## Api

The full typescript API can be found in the downloads part of github as a .zip file. Download and extract the zip and open the relevant index.html,
it also contains a copy of this file as html.

You can download both bundles and documentation from here: [Documentation](https://github.com/mreuvers/typescript-logging/tree/master/downloads/bundle/latest)

**Changing default configuration** can be done through CategoryServiceFactory.setDefaultConfiguration(..). Check the documentation for details,
as each class is documented on how to be used.

**Changing log levels dynamically** when an app runs, you can use the browser plugin, see: [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) for details.
In a future release a console api will be provided as well, to support similar options like the plugin does.
