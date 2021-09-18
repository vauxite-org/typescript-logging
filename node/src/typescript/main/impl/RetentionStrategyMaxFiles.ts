import {FileSize, fileSizeToBytes, RetentionStrategy} from "../api/RetentionStrategy";
import * as fs from "fs";
import {listFiles} from "./FileUtils";
import * as p from "path";
import {$internal} from "typescript-logging";
import {RetentionStrategyMaxFilesOptions} from "../api";

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
  private readonly _allowedFileNamesShort = new Set<string>();
  private readonly _log: $internal.InternalLogger;

  private _onRollOver: ((path: fs.PathLike) => void) | undefined;
  private _lastFileShortName: string | undefined;

  public constructor(options: Required<RetentionStrategyMaxFilesOptions>) {
    this._directory = options.directory;
    this._encoding = options.encoding;
    this._namePrefix = options.namePrefix;
    this._extension = options.extension;
    this._maxFileSize = options.maxFileSize;
    this._maxFileSizeBytes = fileSizeToBytes(options.maxFileSize);
    this._maxFiles = options.maxFiles;

    this._log = $internal.getInternalLogger("node.RetentionMaxFiles");

    const exists = fs.existsSync(this._directory);
    if (!exists) {
      const created = fs.mkdirSync(this._directory, {recursive: true});
      if (!created) {
        throw new Error(`Failed to create directory '${this._directory}', is the path valid?`);
      }
    }

    try {
      const fileInfo = fs.statSync(this._directory);
      if (!fileInfo.isDirectory()) {
        // noinspection ExceptionCaughtLocallyJS
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

  public initialize(onRollOver: (path: fs.PathLike) => void): void {
    this._onRollOver = onRollOver;
    for (let i = 1; i <= this._maxFiles; i++) {
      this._allowedFileNamesShort.add(this.getShortFileName(i));
    }

    const currentFile = this.determineCurrentFile();
    if (currentFile) {
      this._lastFileShortName = currentFile.name;
    }
  }

  public nextFile(mustRollOver: boolean): [path: fs.PathLike, size: number] {
    const logFilesFound = this.getLogFiles();
    if (logFilesFound.length === 0) {
      const result = this.getLogFileName(1);
      this._lastFileShortName = this.getShortFileName(1);
      return [result, 0];
    }

    const lastFile = logFilesFound.find(f => f.name === this._lastFileShortName);
    if (!lastFile) {
      /* Seems the file was removed in between, try again .. */
      return this.nextFile(mustRollOver);
    }

    /* The check on size is only there for startup, while running it will never be up-to-date as files won't be flushed by node yet (due to events still need to be processed by node) */
    if (mustRollOver || lastFile.sizeInBytes >= this._maxFileSizeBytes) {
      /* We are forced to rollover, or the file is full, so go to the next file (1 up) */
      const result = this.rolloverFile(lastFile);
      this._lastFileShortName = result[1];
      return [result[0], result[2]];
    }

    /* Existing file is good to go */
    this._lastFileShortName = lastFile.name;
    return [lastFile.filePath, lastFile.sizeInBytes];
  }

  private rolloverFile(lastFile: FileInfo): [file: fs.PathLike, shortName: string, size: number] {
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

    return [newFileName, this.getShortFileName(numValue), 0];
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

  private getShortFileName(value: number) {
    return this._namePrefix + value + this._extension;
  }

  private determineCurrentFile() {
    const logFilesFound = this.getLogFiles();

    if (logFilesFound.length === 0) {
      return undefined;
    }

    /**
     * Find the last file in use.
     */
    return logFilesFound.reduce((lhs, rhs) => {
      const diff = lhs.lastModified - rhs.lastModified;
      if (diff > 0) {
        return lhs;
      }
      if (diff < 0) {
        return rhs;
      }
      return lhs;
    });
  }
}

interface FileInfo {
  lastModified: number;
  sizeInBytes: number;
  filePath: string;
  name: string;
}
