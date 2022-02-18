# Changelog

This page describes the relevant changes per version.
* 1.0.1
  * Maintenance release, patched and upgraded all developer dependencies.
  * Requires typescript 4.5.5 or higher.
  * Removed downloads (instead use releases from github to get source and/or bundles directly)
* 1.0.0
  * No changes, 0.6.4 is as of now the official 1.0.0 release.
* 0.6.4
  * [Issue 43](https://github.com/mreuvers/typescript-logging/issues/43) Fix "window.removeEventListener" is not a function for react-native.
* 0.6.3
  * [Issue 40](https://github.com/mreuvers/typescript-logging/issues/40) CategoryServiceFactory.setConfigurationCategory options are not properly applied has been fixed (regression bug)
* 0.6.2
  * [Issue 37](https://github.com/mreuvers/typescript-logging/issues/37) Handle non Error objects for loggers, instead of bailing out.
* 0.6.1
  * [Issue 34](https://github.com/mreuvers/typescript-logging/issues/34) Export missing LogData interface
* 0.6.0
  * [Issue 31](https://github.com/mreuvers/typescript-logging/issues/31) Make default log4j LoggerFactory instance globally available
  * [Issue 26](https://github.com/mreuvers/typescript-logging/issues/26) Remove deprecated methods (all methods deprecated previously have been removed). See previous version what was deprecated.
* 0.5.0
  * Bumped TypeScript version to 2.4.2
  * [Issue 25](https://github.com/mreuvers/typescript-logging/issues/25) Simplify usage Logger and CategoryLogger
  * **Deprecated in CategoryLogger interface** (deprecated methods will be removed in 0.6.0):
    * tracec -> use trace() instead
    * debugc -> use debug() instead
    * infoc  -> use info() instead
    * warnc  -> use warn() instead
    * errorc -> use error() instead
    * fatalc -> use fatal() instead
  * **Deprecated in Logger interface** (deprecated methods will be removed in 0.6.0):
    * tracec -> use trace() instead
    * debugc -> use debug() instead
    * infoc  -> use info() instead
    * warnc  -> use warn() instead
    * errorc -> use error() instead
    * fatalc -> use fatal() instead
  * **Deprecated class CategoryDefaultConfiguration** -> use CategoryConfiguration instead.
  * **Deprecated method CategoryServiceFactory.getRuntimeSettings()** -> No replacement.
* 0.4.2
  * [Issue 22](https://github.com/mreuvers/typescript-logging/issues/22) has been fixed (Distributed release 0.4.1 broken).
* 0.4.1
  * [Issue 19](https://github.com/mreuvers/typescript-logging/issues/19) has been fixed (log.debug text not displayed in node 8 console).
  * [Issue 21](https://github.com/mreuvers/typescript-logging/issues/21) has been fixed (CategoryServiceFactory.setConfigurationCategory if category is a child must not attempt to reset root logger).
  * ** Distribution package is broken, please do not use. **
* 0.4.0
  * Added new feature to to both log4j and category style, to specify a formatterLogMessage function instead of custom logger, which allows you to override the formatting of the log message without having to create a custom logger. Please see the docs for more details.
  * **Potentially breaking change** Both Logger and CategoryLogger message (LogMessage and CategoryLogMessage) now allow to log their message as: string | LogData (this was only string), LogData is an interface which allows you to also set a message (msg) and additional data if needed. Please see the docs for more details. Potentially breaks custom loggers, instead use properties and one of these to help you out: messageAsString, isMessageLogData and logData properties.
    * Thanks for the pull request @CSchulz !
    * See also [issue 14](https://github.com/mreuvers/typescript-logging/issues/14)
  * **Potentially breaking change** Changed CategoryLogMessage and LogMessage, now both have readonly properties only for their data, instead of methods to get the information. If you use a custom logger this may break for you, to fix just use the properties data instead.
    * See also [issue 9](https://github.com/mreuvers/typescript-logging/issues/9)
  * CategoryServiceFactory
    * Method setDefaultConfiguration, default reset parameter changed to true (from false). Reset of everything is now done by default.
    * Method setConfigurationCategory, default reset parameter changed to true (from false). Resets root logger now.
    * See also [issue 11](https://github.com/mreuvers/typescript-logging/issues/11)
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
