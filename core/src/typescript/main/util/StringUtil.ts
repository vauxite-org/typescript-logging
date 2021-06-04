/**
 * Pad given value with given fillChar from the beginning (default is an empty space)
 * @param value Value to pad
 * @param length The length the string must be
 * @param fillChar The padding char (1 char length allowed only)
 * @return Padded string or the same string if it is already of given length (or larger).
 */
export function padStart(value: string, length: number, fillChar: string = " ") {
  return padInternal(value, length, "start", fillChar);
}

/**
 * Pad given value with given fillChar from the end (default is an empty space)
 * @param value Value to pad
 * @param length The length the string must be
 * @param fillChar The padding char (1 char length allowed only)
 * @return Padded string or the same string if it is already of given length (or larger).
 */
export function padEnd(value: string, length: number, fillChar: string = " ") {
  return padInternal(value, length, "end", fillChar);
}

/**
 * Returns the max length of a string value in given array
 * @param arr Array to check
 * @return Max length, 0 if array is empty
 */
export function maxLengthStringValueInArray(arr: string[]): number {
  return arr
    .map(v => v.length)
    .reduce((previous, current) => {
      if (current > previous) {
        return current;
      }
      return previous;
    }, 0);
}

function padInternal(value: string, length: number, padType: "start" | "end", fillChar: string = " ") {
  if (length <= value.length) {
    return value;
  }
  if (fillChar.length > 1) {
    throw new Error(`Fill char must be one char exactly, it is: ${fillChar.length}`);
  }

  const charsNeeded = length - value.length;
  let padding = "";

  for (let i = 0; i < charsNeeded; i++) {
    padding += fillChar;
  }

  if (padType === "start") {
    return padding + value;
  }
  return value + padding;
}
