# Migration

This section provides an overview of breaking changes, when migrating from an older typescript-logging version.

## Version 1.0.x -> 2.0.x

As version 2 is a complete rewrite from scratch there is no direct migration path although certain things are still
similar.

Version 2 comes with two separate flavors `category-style` and `log4ts-style`, depending on whether you used the
LFService or CategoryServiceFactory, you respectively want to install `typescript-logging-category-style` or
`typescript-logging-log4ts-style`. Please check out the documentation for the respective flavor for installation and all
details.

* The [typescript-logging-category-style](../category-style/README.MD) flavor
* The [typescript-logging-log4ts-style](../log4ts-style/README.MD) flavor

The Logger and Category interfaces are mostly backwards compatible (and if not the compiler will tell you).

**Breaking changes are found in the setup/configuration** of each style compared to version 1.

The category-style is now set up using a CategoryProvider.createProvider(...) call, and the log4ts-style by
Log4TSProvider.createProvider(...).

Custom message formatting / loggers can be provided by custom channels (see documentation).

The browser developer extension currently has no replacement, this may change if there is sufficient demand for it. Use
the dynamic logging control instead (see documentation of each style).
