/**
 * Provides access to the current Log4TSProvider to dynamically change its log level for one or more groups.
 */
export interface Log4TSControlProvider {
  /**
   * The name of the Log4TSProvider that is being controlled by this instance.
   */
  readonly name: string;

  /**
   * Shows current settings.
   */
  readonly showSettings: () => void;

  /**
   * Update given group or all groups to given log level.
   */
  readonly update: (level: Log4TSControlProviderLogLevel, groupId?: number | string) => void;

  /**
   * Resets the levels of the groups to exactly when this Log4TSControlProvider was initially created (by Log4TSControl.getProvider(..)).
   */
  readonly reset: () => void;

  /**
   * Saves the current levels of the groups to the localStorage if available (otherwise does nothing).
   */
  readonly save: () => void;

  /**
   * Restores the log levels to the saved state if they were saved, otherwise does nothing.
   */
  readonly restore: (logRestoreFailures?: boolean) => void;

  /**
   * Shows help about this Log4TSControlProvider.
   */
  readonly help: () => void;
}

export type Log4TSControlProviderLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
