# Changelog

This page describes the relevant changes per version.

* 0.3.1
  * Fixed: [Remove "Dropping unknown message"](https://github.com/mreuvers/typescript-logging/issues/8)
* 0.3.0 (current release)
  * Added console control api for both log4j and category style of logging
  * **Potentially breaking change** AbstractLogger (log4) doLog(..) modified, it passes raw message now. Not backwards compatible, see [migration](migration.md) for details.
  * **Potentially breaking change** AbstractLogger (log4) constructor changed to accept runtime settings. Not backwards compatible, see [migration](migration.md) for details.
  * ExtensionHelper does not unnecessary log on console when using chrome extension.
  * Code cleanup.
* 0.2.1
  * Fixed: [Make sure to access window object only for browsers, not for node](https://github.com/mreuvers/typescript-logging/issues/3)
* 0.2.0
  * No changes, bump to official release.
* 0.2.0-beta7
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