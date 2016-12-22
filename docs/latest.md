# Typescript logging documentation

This page describes how the latest, new logging mechanism of this library works and can be used.

## Why

Most logging libraries are (loosely) based on (older) existing logging implementations
in the way they used to work and are setup. There's nothing wrong with that, and in fact
the 'old' way of logging was implemented by this library in a same way initially,
and works just fine and will remain working as is (for docs on that see, 0.1.3 for that).

However in our projects we felt we needed a different approach to logging, specially
now that logging for typescript is often for single page applications, built in frameworks
like angular, react, ember and so on.

We wanted an easy to use logging mechanism that would build up itself dynamically if needed,
and required minimum configuration from a developers perspective.

In addition, what we also needed is to be able to enable/change logging when the application
is already deployed.
Next to logging during development, it's also important to be able to trace problems
customers encounter in production.
The latter is tackled by a different project [typescript-logging-extension](https://github.com/mreuvers/typescript-logging-extension) which
currently can be used in Chrome, as a developer extension, provided the logging library
is used by the application. The latter is a work in progress.

## How

Config.ts
~~~
import {Category,CategoryServiceFactory,CategoryDefaultConfiguration,LogLevel} from "typescript-logging";

// Optionally change default settings, in this example set default logging to Info.
// Without changing configuration categories will log to Error.
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
import {log} from "./Config"

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

Output:
~~~
2016-12-22 11:14:26,273 INFO [product] Creating product with name: Beer
2016-12-22 11:14:26,274 INFO [product] Creating product with name: Beer
2016-12-22 11:14:26,275 INFO [service] Creating product with name: Beer
2016-12-22 11:14:26,275 INFO [product, customer] Creating product with name: Beer
~~~

## Api
