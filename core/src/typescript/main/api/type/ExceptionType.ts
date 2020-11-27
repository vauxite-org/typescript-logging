/**
 * Error type, when there is an Error to log this must be used either
 * by giving an error directly or by returning an Error as function.
 */
export type ExceptionType = Error | (() => Error);
