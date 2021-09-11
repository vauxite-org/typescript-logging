import {FileSize, fileSizeToBytes, RetentionStrategy} from "../api/RetentionStrategy";
import * as fs from "fs";
import {listFiles} from "./FileUtils";
import * as p from "path";
import {getInternalLogger, InternalLogger} from "typescript-logging";
import {RetentionStrategyMaxFilesOptions} from "../api/RetentionStrategyMaxFilesOptions";

/**
 * Implements the max files retention strategy.
 */
export class RetentionStrategyMaxFiles implements RetentionStrategy {

  private readonly _directory: string;
  private readonly _encoding: BufferEncoding;
  private readonly _namePrefix: string;
  private readonly _extension: string;
  private readonly _maxFileSize: FileSize;
  private readonly _maxFileSizeBytes: number;
  private readonly _maxFiles: number;
  private readonly _onRollOver: (path: string) => void;
  private readonly _allowedFileNamesShort = new Set<string>();
  private readonly _log: InternalLogger;

  public constructor(options: Required<RetentionStrategyMaxFilesOptions>) {
    this._directory = options.directory;
    this._encoding = options.encoding;
    this._namePrefix = options.namePrefix;
    this._extension = options.extension;
    this._maxFileSize = options.maxFileSize;
    this._maxFileSizeBytes = fileSizeToBytes(options.maxFileSize);
    this._maxFiles = options.maxFiles;
    this._onRollOver = options.onRollOver;

    this._log = getInternalLogger("node.RetentionMaxFiles");

    const exists = fs.existsSync(this._directory);
    if (!exists) {
      const created = fs.mkdirSync(this._directory, {recursive: true});
      if (!created) {
        throw new Error(`Failed to create directory '${created}', is the path valid?`);
      }
    }

    try {
      const fileInfo = fs.statSync(this._directory);
      if (!fileInfo.isDirectory()) {
        throw new Error(`Directory '${this._directory}' does exist but is not a directory, or cannot be accessed.`);
      }
    }
    catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`Failed to check that directory '${this._directory}' is indeed a directory`);
    }
  }

  public get encoding(): BufferEncoding {
    return this._encoding;
  }

  public get maxFileSize(): FileSize {
    return this._maxFileSize;
  }

  public initialize(): void {
    for (let i = 1; i <= this._maxFiles; i++) {
      this._allowedFileNamesShort.add(this.getLogFileName(i));
    }
  }

  public nextFile(mustRollOver: boolean): fs.PathLike {
    const logFilesFound = this.getLogFiles();
    if (logFilesFound.length === 0) {
      return this.getLogFileName(1);
    }

    /**
     * Find the last file in use.
     */
    const lastFile = logFilesFound.reduce((lhs, rhs) => {
      const diff = lhs.lastModified - rhs.lastModified;
      if (diff < 0) {
        return lhs;
      }
      if (diff > 0) {
        return rhs;
      }
      return lhs;
    });

    if (mustRollOver || lastFile.sizeInBytes >= this._maxFileSizeBytes) {
      /* We are forced to rollover, or the file is full, so go to the next file (1 up) */
      return this.rolloverFile(lastFile);
    }

    /* Existing file is good to go */
    return lastFile.filePath;
  }

  private rolloverFile(lastFile: FileInfo): string {
    let numValue = parseInt(lastFile.name.substring(this._namePrefix.length, lastFile.name.length - this._extension.length), 10);
    if (numValue === this._maxFiles) {
      numValue = 1;
    }
    else {
      numValue = numValue + 1;
    }

    const newFileName = this.getLogFileName(numValue);

    try {
      if (fs.existsSync(newFileName)) {
        fs.unlinkSync(newFileName);
      }
    }
    catch (e: any) {
      this._log.warn(() => `Failed to delete existing log file ${newFileName}, rollover may fail.`, e);
    }
    finally {
      this._onRollOver?.(lastFile.filePath);
    }

    return newFileName;
  }

  /**
   * Get all matching log files
   * @private
   */
  private getLogFiles(): FileInfo[] {
    return listFiles(this._directory, this._encoding, f => f.isFile() && this._allowedFileNamesShort.has(f.name))
      .map(file => {
        const filePath = this._directory + p.sep + file.name;
        try {
          const fileInfo = fs.statSync(filePath);
          return {lastModified: fileInfo.mtimeMs, sizeInBytes: fileInfo.size, filePath, name: file.name, valid: true};
        }
        catch (e: any) {
          this._log.warn(() => `Failed to get file stats for ${filePath}`, e);
          return {lastModified: 0, sizeInBytes: 0, filePath: "", name: "", valid: false};
        }
      })
      .filter(v => v.valid);
  }

  private getLogFileName(value: number) {
    return this._directory + p.sep + this._namePrefix + value + this._extension;
  }
}

interface FileInfo {
  lastModified: number;
  sizeInBytes: number;
  filePath: string;
  name: string;
}
