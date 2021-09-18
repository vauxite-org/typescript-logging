import * as fs from "fs";

/**
 * Retention settings used by the NodeLogChannel.
 */
export interface RetentionStrategy {
  /**
   * The maximum file size allowed (when writing something > than this threshold a rollover will happen)
   */
  maxFileSize: FileSize;

  /**
   * Encoding to use for writing files (or listing them)
   */
  encoding: BufferEncoding;

  /**
   * Called when the NodeLogChannel wants to write a message the first time, this is only called once and allows for initialization/cleanup if needed.
   *
   * @param onRollOver Optional rollover function to be called when rollover occurs (when the user specified one when creating a channel, undefined otherwise.
   *                   Note that the actual function may not be what the user set as it can and will be wrapped in the default implementation.
   */
  initialize(onRollOver?: (path: fs.PathLike) => void): void;

  /**
   * Called by the channel when it needs the next file to write to, *must* return the next file path to write to as well as
   * the current size of it when it exists, 0 if it doesn't exist (or empty file).
   *
   * @param mustRollOver When mustRollOver is true must rollover to the next file, even if the last file is not full yet.
   */
  nextFile(mustRollOver: boolean): [path: fs.PathLike, size: number];
}

/**
 * Represents a file size in a user friendly format.
 */
export interface FileSize {
  /**
   * The size of the file.
   */
  value: number;

  /**
   * Size unit.
   */
  unit: "KiloBytes" | "MegaBytes";
}

/**
 * Convert given fileSize to bytes
 * @param fileSize File size to convert
 */
export function fileSizeToBytes(fileSize: FileSize): number {
  switch (fileSize.unit) {
    case "MegaBytes":
      return 1024 * 1024 * fileSize.value;
    case "KiloBytes":
      return 1024 * fileSize.value;
    default:
      throw new Error(`Type '${fileSize.unit}' is not supported.`);
  }
}
