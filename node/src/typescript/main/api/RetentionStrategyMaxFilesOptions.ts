import {FileSize} from "./RetentionStrategy";

/**
 * Specifies the retention options to use when logging to files. Only directory is required, the others have sane
 * defaults but can be set differently if needed. See respective properties for details.
 *
 * Defaults to: maximum 10 files, 1 file maximum size of 10 MegaBytes, encoding utf-8, namePrefix: application, extension: .log .
 *
 * Default logs to: [directory]/[namePrefix][number][extension] (e.g. application1.log, application2.log etc. based on defaults).
 */
export interface RetentionStrategyMaxFilesOptions {
  /**
   * Directory to write the log files in, if it does not exist an attempt is made to create the path. If that fails
   * the logging will bail out with an Error as logging would be impossible.
   */
  readonly directory: string;

  /**
   * The encoding to use to read/write log files, default is utf-8.
   */
  readonly encoding?: BufferEncoding;

  /**
   * The prefix name for a file, the default is 'application'
   */
  readonly namePrefix?: string;

  /**
   * The extension of the file, the default is '.log'
   */
  readonly extension?: string;

  /**
   * The maximum size of a file, defaults to 10 MB (MegaBytes). When full (or the next written log line does not fit) rolls over to the next file.
   */
  readonly maxFileSize?: FileSize;

  /**
   * The maximum number of log files to keep around, defaults to 10. When the maximum is reached, the oldest file is deleted and writing starts
   * anew for that file.
   */
  readonly maxFiles?: number;
}
