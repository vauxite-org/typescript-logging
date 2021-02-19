/* Initialize the internal logging first, that way it's always available before normal logging is used */
export {$INTERNAL_LOGGING_SETTINGS$} from "./internal/InternalLogger";

/* Export public api */
export * from "./core/index";
export * from "./log4ts/index";

