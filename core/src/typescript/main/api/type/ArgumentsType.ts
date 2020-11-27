/**
 * Arguments of a log message, either must be given as readonly array
 * or as function returning a readonly array.
 */
export type ArgumentsType = ReadonlyArray<any> | (() => ReadonlyArray<any>);
