# Changelog

This page describes the relevant changes per version since 2.0.0 release.

* 2.1.0
    * Dev dependencies updated (to get rid of vulnerability warnings), these have no influence on the production
      release and are used during the build only.

* 2.0.2
    * Fix issue https://github.com/vauxite-org/typescript-logging/issues/102 for both flavors, where LogLevel.Trace was
      erroneously set to LogLevel.Error (default) when custom config was provided.
    * Dev dependencies were bumped up (to get rid of vulnerability warnings), these have no influence on the production
      release and are used during the build only.

* 2.0.1
    * Fix issue https://github.com/vauxite-org/typescript-logging/issues/93 for category style (arguments were passed
      incorrectly to logger)

* 2.0.0
    * Official release of fully rewritten log library.
