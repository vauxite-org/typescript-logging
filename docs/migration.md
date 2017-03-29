# Migration

This page describes per version the necessary migration steps you may need to take if you were using certain features that were changed in a version.

# 0.3.0

This version breaks backwards compatibility in the following ways (compilation will fail):
* AbstractLogger (log4j)
  * Constructor accepts LogGroupRuntimeSettings as second parameter instead of LogGroupRule.
    * If you extend AbstractLogger modify the parameter of your constructor
  * doLog(..) method signature changed to: `protected abstract doLog(msg: LogMessage): void`, it now is called with a LogMessage containing all raw data.
    * If you extend AbstractLogger modify the signature, for old behavior (same formatting as before), call: `this.createDefaultLogMessage(msg)` which returns a formatted message as string.