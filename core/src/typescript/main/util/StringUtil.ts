/**
 * Pad given value with given fillChar from the beginning (default is an empty space)
 * @param value Value to pad
 * @param length The length the string must be
 * @param fillChar The padding char (1 char length allowed only)
 * @return Padded string or the same string if it is already of given length (or larger).
 */
export function padStart(value: string, length: number, fillChar: string = " ") {
  if (length <= value.length) {
    return value;
  }
  if (fillChar.length > 1) {
    throw new Error(`Fill char must be one char exactly, it is: ${fillChar.length}`);
  }

  const charsNeeded = length - value.length;
  let prefix = "";

  for (let i = 0; i < charsNeeded; i++) {
    prefix += fillChar;
  }

  return prefix + value;
}
