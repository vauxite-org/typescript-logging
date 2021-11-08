/**
 * Make all properties of type T partial, but the properties given as K (from T) remain as they are (e.g. required).
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make all properties of T mutable.
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
