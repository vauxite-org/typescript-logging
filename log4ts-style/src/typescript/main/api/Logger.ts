/* tslint:disable:no-empty-interface */
import {CoreLogger} from "typescript-logging";

/**
 * Represents a Logger, should be used to log your messages (and errors).
 * All methods accept a message and optionally an error and additional arguments.
 */
export interface Logger extends CoreLogger {
  // Empty interface on purpose to allow import from this module instead of the core. Also allows for extension in the future if needed.
}
