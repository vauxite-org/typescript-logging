import {LogChannel, RawLogChannel, RawLogMessage} from "typescript-logging";
import {RetentionStrategy} from "./RetentionStrategy";
import {NodeLogChannel} from "../impl/NodeLogChannel";
import {RetentionStrategyMaxFilesOptions} from "./RetentionStrategyMaxFilesOptions";
import {RetentionStrategyMaxFiles} from "../impl/RetentionStrategyMaxFiles";
import {NodeRawLogChannel} from "../impl/NodeRawLogChannel";
import {NodeChannelOptions} from "./NodeChannelOptions";

/**
 * Allows creation of various node channels that can be used to log for node to files.
 */
export class NodeChannelFactory {

  /**
   * Create a new LogChannel which will use given RetentionStrategy, you can use NodeChannelFactory.createRetentionStrategyMaxFiles(..) to create
   * the RetentionStrategy (or implement a custom one).
   * @param retentionStrategy The retention type
   * @param options Additional channel options
   */
  public static createLogChannel(retentionStrategy: RetentionStrategy, options?: NodeChannelOptions): LogChannel {
    return new NodeLogChannel(retentionStrategy, options);
  }

  /**
   * Create a new RawLogChannel  which will use given RetentionStrategy, you can use NodeChannelFactory.createRetentionStrategyMaxFiles(..) to create
   * the RetentionStrategy (or implement a custom one).
   * @param retentionStrategy The retention type
   * @param writeRawLogMessage Function that does format the raw message and returns it as a string, this string is then logged in the file.
   * @param options Additional channel options
   */
  public static createRawLogChannel(retentionStrategy: RetentionStrategy, writeRawLogMessage: (msg: RawLogMessage, formatArg: (arg: unknown) => string) => string,
                                    options?: NodeChannelOptions): RawLogChannel {
    return new NodeRawLogChannel(retentionStrategy, writeRawLogMessage, options);
  }

  /**
   * Create a new RetentionStrategy based on given options. For details please {@see RetentionStrategyMaxFilesOptions}
   * @param options
   */
  public static createRetentionStrategyMaxFiles(options: RetentionStrategyMaxFilesOptions): RetentionStrategy {
    return new RetentionStrategyMaxFiles({
      directory: options.directory,
      maxFiles: options.maxFiles ? options.maxFiles : 10,
      maxFileSize: options.maxFileSize ? options.maxFileSize : {value: 10, unit: "MegaBytes"},
      encoding: options.encoding ? options.encoding : "utf-8",
      extension: options.extension ? options.extension : ".log",
      namePrefix: options.namePrefix ? options.namePrefix : "application",
    });
  }
}
