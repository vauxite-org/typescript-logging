import {FileSize} from "./RetentionStrategy";

/**
 * Specifies the retention options to use when logging to files. Only directory is required, the others have sane
 * defaults but can be set differently if needed. See respective properties for details.
 */
export interface RetentionStrategyMaxFilesOptions {
  /**
   * Directory to write the log files in, if it does not exist an attempt is made to create the path. If that fails
   * the logging will bail out with an Error.
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

  /**
   * When specified this function is called as soon as a rollover is about to occur, this refers to the file that is now full. If needed
   * you can back it up and/or compress it elsewhere. Keep in mind that if you do this in a synchronous fashion that may take some time
   * slowing the application down.
   *
   * If your rollover frequency is not very high, it is recommended you deal with the file in an asynchronous
   * fashion. Keep in mind that the file will be deleted once the maxFiles is reached again so may not exist anymore then
   * (normally that should take a while, unless logging occurs continuously and/or files are configured to be small).
   */
  readonly onRollOver?: (path: string) => void;
}
