import {LogChannel, RawLogChannel, RawLogMessage} from "typescript-logging";
import {RetentionStrategy} from "./RetentionStrategy";
import {NodeLogChannel} from "../impl/NodeLogChannel";
import {RetentionStrategyMaxFilesOptions} from "./RetentionStrategyMaxFilesOptions";
import {RetentionStrategyMaxFiles} from "../impl/RetentionStrategyMaxFiles";
import {NodeRawLogChannel} from "../impl/NodeRawLogChannel";

/**
 * Allows creation of various node channels that can be used to log for node to files.
 */
export class NodeChannelFactory {

  /**
   * Create a new LogChannel which will use given RetentionStrategy, you can use NodeChannelFactory.createRetentionStrategyMaxFiles(..) to create
   * the RetentionStrategy (or implement a custom one).
   * @param retentionStrategy The retention type
   */
  public static createLogChannel(retentionStrategy: RetentionStrategy): LogChannel {
    return new NodeLogChannel(retentionStrategy);
  }

  /**
   * Create a new RawLogChannel  which will use given RetentionStrategy, you can use NodeChannelFactory.createRetentionStrategyMaxFiles(..) to create
   * the RetentionStrategy (or implement a custom one).
   * @param retentionStrategy The retention type
   * @param writeRawLogMessage Function that does format the raw message and returns it as a string, this string is then logged in the file.
   */
  public static createRawLogChannel(retentionStrategy: RetentionStrategy, writeRawLogMessage: (msg: RawLogMessage, formatArg: (arg: any) => string) => string): RawLogChannel {
    return new NodeRawLogChannel(retentionStrategy, writeRawLogMessage);
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
      onRollOver: options.onRollOver ? options.onRollOver : () => null, // We provide an empty rollover by default.
    });
  }
}
