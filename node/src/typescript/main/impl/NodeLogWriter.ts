import {Writable} from "stream";
import {getInternalLogger, InternalLogger} from "typescript-logging";
import * as fs from "fs";

/**
 * Class that deals with writing the actual file.
 */
export class NodeLogWriter {
  private readonly _path: fs.PathLike;
  private readonly _encoding: BufferEncoding;
  private _writeStream: Writable | undefined;

  private readonly _log: InternalLogger;

  public constructor(path: fs.PathLike, encoding: BufferEncoding) {
    this._path = path;
    this._encoding = encoding;
    this._log = getInternalLogger("node.NodeLogWriter");
  }

  public get path() {
    return this._path;
  }

  public write(value: string) {
    this.getStream().write(value, this._encoding);
  }

  public close() {
    if (this._writeStream !== undefined) {
      try {
        this._writeStream.end();
      }
      catch (e: any) {
        this._log.warn(() => "Failed to close stream", e);
      }
    }
  }

  private getStream() {
    if (this._writeStream !== undefined) {
      return this._writeStream;
    }

    this._log.debug(() => `Opening stream for path '${this._path}' using encoding '${this._encoding}'`);

    this._writeStream = fs.createWriteStream(this._path, {encoding: this._encoding});
    return this._writeStream;
  }
}
