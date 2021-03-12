import {LogRuntime} from "./LogRuntime";

/**
 * Represents the updatable part of the settings. Can be used to update
 * the runtime settings for a logger or all loggers.
 */
export type UpdatableRuntimeSettings = Partial<UpdatableRuntimeSettingsRequired>;

/**
 * Same as UpdatableRuntimeSettings except all properties are required instead.
 */
export type UpdatableRuntimeSettingsRequired = Pick<LogRuntime, "level" | "channel">;
