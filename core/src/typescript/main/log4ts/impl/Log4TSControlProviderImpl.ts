import {Log4TSControlProvider, Log4TSControlProviderLogLevel} from "../api/Log4TSControlProvider";
import {LogLevel, RuntimeSettings} from "../../core";
import {Log4TSProvider} from "../api/Log4TSProvider";
import {maxLengthStringValueInArray, padEnd, padStart} from "../../util/StringUtil";

/**
 * Implementation for Log4TSControlProvider.
 */
export class Log4TSControlProviderImpl implements Log4TSControlProvider {

  private readonly _provider: Log4TSProvider;
  private readonly _messageChannel: (msg: string) => void;

  /** Tracks the original log levels for the groups when this instance was created */
  private _originalLogLevels: Map<string, LogLevel>;

  public constructor(provider: Log4TSProvider, messageChannel: (msg: string) => void) {
    this._provider = provider;
    this._messageChannel = messageChannel;

    // Identifier is guaranteed to be set internally.
    this._originalLogLevels = Log4TSControlProviderImpl.loadCurrentGroupLogLevels(provider);
  }

  public get name() {
    return this._provider.name;
  }

  public showSettings(): void {
    let result = `Available group configs (Log4TSProvider '${this._provider.name}'):\n`;

    /*
     * Make the identifier always set, similar on how to update a group.
     */
    const groupConfigs = this._provider.groupConfigs.map(cfg => ({
      level: LogLevel[cfg.level],
      channelDescription: cfg.channel.toString ? cfg.channel.toString() : JSON.stringify(cfg.channel),
      identifier: cfg.identifier as string, // This is updated and set during initialization of a provider, guaranteed.
    }));
    const maxWidthIndex = groupConfigs.length.toString().length;
    const maxWidthIdentifier = maxLengthStringValueInArray(groupConfigs.map(cfg => cfg.identifier));
    const maxWidthLevel = maxLengthStringValueInArray(groupConfigs.map(cfg => cfg.level));

    /*
      We create this kind of output:

      Available group configs (Log4TSProvider 'test'):
        [0, /model.+/:             level=Error]
        [1, /advanced.+/:          level=Warn ]
        [2, my awesome identifier: level=Error]
        [3, /blaat.blaat.+/:       level=Error]
     */
    const providerLines = groupConfigs
      .map((cfg, index) => `  [${padStart(index.toString(), maxWidthIndex)}, ${padEnd(cfg.identifier, maxWidthIdentifier)} (level=${padEnd(cfg.level, maxWidthLevel)})]`)
      .join("\n");
    result += providerLines + "\n";

    this._messageChannel(result);
  }

  public update(level: Log4TSControlProviderLogLevel, groupId?: number | string): void {
    const newLevel = LogLevel.toLogLevel(level);
    if (newLevel === undefined) {
      throw new Error(`Cannot update log provider, log level '${level}' is invalid.`);
    }
    const settings: RuntimeSettings = {
      level: newLevel,
    };

    /*
     * Update all groups.
     */
    if (groupId === undefined) {
      this._provider.updateRuntimeSettings(settings);
      this._messageChannel("Updated all group configs successfully.");
      return;
    }

    /*
     * Find the group by index and update it using its identifier.
     */
    if (typeof groupId === "number") {
      const groups = this._provider.groupConfigs;
      if (groupId < 0 || groupId >= groups.length) {
        throw new Error(`Group config with index '${groupId}' does not exist (outside of range).`);
      }
      const expectedGroup = groups[groupId];
      this._provider.updateRuntimeSettingsGroup(expectedGroup.identifier as string, settings); // Identifier is guaranteed to be set
      this._messageChannel(`Updated group config with index '${groupId}' successfully.`);
      return;
    }

    /* Update the group by its identifier directly */
    this._provider.updateRuntimeSettingsGroup(groupId, settings);
    this._messageChannel(`Updated group config with id '${groupId}' successfully.`);
  }

  public reset(): void {
    this._originalLogLevels.forEach((value, key) => {
      this._provider.updateRuntimeSettingsGroup(key, { level: value});
    });
    this._messageChannel("Successfully reset log levels back to original state (from when this Log4TSControlProvider was created).");
  }

  public save(): void {
    if (!localStorage) {
      this._messageChannel("Cannot save state, localStorage is not available.");
      return;
    }

    const data: SaveData = {
      name: this._provider.name,
      // The identifier is updated and set during initialization of a provider, guaranteed.)
      groups: this._provider.groupConfigs.map(cfg => ({identifier: cfg.identifier as string, level: LogLevel[cfg.level]})),
    };

    localStorage.setItem(this.createKey(), JSON.stringify(data));
    this._messageChannel(`Successfully saved state for Log4TSControlProvider '${this._provider.name}'.`);
  }

  public restore(logRestoreFailures?: boolean): void {
    const finalLogRestoreFailures = logRestoreFailures !== undefined ? logRestoreFailures : true;
    if (!localStorage) {
      if (finalLogRestoreFailures) {
        this._messageChannel(`Will not attempt to restore state for Log4TSControlProvider '${this._provider.name}', localStorage is not available.`);
      }
      return;
    }

    const key = this.createKey();
    const value = localStorage.getItem(key);
    if (value === null) {
      if (finalLogRestoreFailures) {
        this._messageChannel(`Cannot restore state for Log4TSControlProvider '${this._provider.name}', no data available.`);
      }
      return;
    }

    try {
      const savedData: SaveData = JSON.parse(value);
      if (this._provider.name !== savedData.name) {
        if (finalLogRestoreFailures) {
          this._messageChannel(`Cannot restore state for Log4TSControlProvider '${this._provider.name}', data is not for provider - found name '${savedData.name}'.`);
        }
        return;
      }

      this.restoreGroups(savedData, finalLogRestoreFailures);
      this._originalLogLevels = Log4TSControlProviderImpl.loadCurrentGroupLogLevels(this._provider);
    }
    catch (e) {
      localStorage.removeItem(key);
      this._messageChannel(`Cannot restore state for Log4TSControlProvider '${this._provider.name}', data is not valid. Invalid data removed from localStorage.`);
    }
  }

  public help(): void {
    const msg =
      `You can use the following commands (Log4TSProvider ${this._provider.name}):\n` +
      "  showSettings()                              => Shows the current configuration settings.\n" +
      "  update(logLevel, groupId?: number | string) => Change the log level for one or all config groups.\n" +
      "    level:   The log level to set - must be one of 'trace', 'debug', 'info', 'warn', 'error' or 'fatal'\n" +
      "    groupId: Optional group config to update by either index or identifier, when omitted updates all groups.\n" +
      "  reset()                                     => Resets the log levels of the config groups back to when this control provider was created.\n" +
      "  save()                                      => Saves the current log levels for all config groups of this provider. Use restore() to load last saved state.\n" +
      "  restore()                                   => Restore stored saved state, if any. Log levels will be set according to saved state.\n" +
      "  help()                                      => Shows this help.\n";
    this._messageChannel(msg);
  }

  private restoreGroups(saveData: SaveData, logCannotRestore: boolean) {
    saveData.groups.forEach(group => {
      try {
        const newLevel = LogLevel.toLogLevel(group.level);
        if (newLevel !== undefined) {
          this._provider.updateRuntimeSettingsGroup(group.identifier, {level: newLevel});
          this._messageChannel(`Log4TSControlProvider '${this._provider.name}' - restored log level of group '${group.identifier}' to '${LogLevel[newLevel]}'.`);
        }
        else {
          if (logCannotRestore) {
            this._messageChannel(`Log4TSControlProvider '${this._provider.name}' - failed to restore log level of group '${group.identifier}', invalid log level was specified.`);
          }
        }
      }
      catch (e) {
        if (logCannotRestore) {
          this._messageChannel(`Log4TSControlProvider '${this._provider.name}' - failed to restore log level of group '${group.identifier}'.`);
        }
      }
    });
  }

  private createKey(): string {
    return `Log4TSProvider-${this._provider.name}`;
  }

  private static loadCurrentGroupLogLevels(provider: Log4TSProvider):  Map<string, LogLevel> {
    return new Map<string, LogLevel>(provider.groupConfigs.map(cfg => [cfg.identifier as string, cfg.level]));
  }
}

interface SaveData {
  name: string;
  groups: ReadonlyArray<{identifier: string, level: string}>;
}
