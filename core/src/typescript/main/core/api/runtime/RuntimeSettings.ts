import {LogRuntime} from "./LogRuntime";

/**
 * Represents the updatable part of the settings. Can be used to update
 * the runtime settings for a logger or all loggers.
 */
export type RuntimeSettings = Partial<RuntimeSettingsRequired>;

/**
 * Same as RuntimeSettings except all properties are required instead.
 */
export type RuntimeSettingsRequired = Pick<LogRuntime, "level" | "channel">;
