import {Writable} from "stream";
import {$internal} from "typescript-logging";
import * as fs from "fs";

/**
 * Callbacks when the writer is finished (writer.end() was called),
 * or when an error occurred when writing. The close will always be called
 * after either.
 * The NodeLogWriter closes itself on error, the caller should go to the next file in that case.
 */
export interface StreamCallBack {
  onError?(error: Error): void;

  onFinished?(path: fs.PathLike): void;

  onClose?(path: fs.PathLike): void;
}

/**
 * Class that deals with writing the actual file, uses streaming to write data.
 */
export class NodeLogWriter {
  private readonly _path: fs.PathLike;
  private readonly _encoding: BufferEncoding;
  private readonly _streamCallBack: StreamCallBack;
  private _writeStream: Writable | undefined;

  private readonly _log: $internal.InternalLogger;
  private _draining: boolean = false;
  private _endCalled: boolean = false;

  public constructor(path: fs.PathLike, encoding: BufferEncoding, streamCallBack: StreamCallBack) {
    this._path = path;
    this._encoding = encoding;
    this._streamCallBack = streamCallBack;
    this._log = $internal.getInternalLogger("node.NodeLogWriter");
    this.write = this.write.bind(this);
    this.onError = this.onError.bind(this);
    this.onFinished = this.onFinished.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  public write(value: string, cb: (() => void | null) = () => null) {
    if (this._endCalled) {
      return;
    }

    const stream = this.getStream();

    /* We are full, just wait for the drain event, then write the incoming value */
    if (this._draining) {
      stream.once("drain", () => {
        this._draining = false;
        this._log.trace(() => `Drain event resolved (later request that could not be written due to drain)`);
        this.write(value);
      });
      return;
    }

    /* For clarity, even though write may return false it is 'written' into the underlying buffer so no need to write again */
    if (!stream.write(value, this._encoding, cb)) {
      this._draining = true;
      this._log.trace(() => "Started draining, cannot write more data");
      stream.once("drain", () => {
        /* Drain is done, so allow writing again */
        cb();
        this._log.trace(() => "Drain event resolved (original request that started drain)");
        this._draining = false;
      });
    }
  }

  public close() {
    if (this._endCalled) {
      return;
    }

    if (this._writeStream !== undefined) {
      try {
        this._writeStream.end();
        this._endCalled = true;
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

    this._writeStream = fs.createWriteStream(this._path, {encoding: this._encoding, flags: "a"});
    this._writeStream.once("error", this.onError);
    this._writeStream.once("finish", this.onFinished);
    this._writeStream.once("close", this.onClose);
    return this._writeStream;
  }

  private onError(error: Error): void {
    if (this._streamCallBack && this._streamCallBack.onError) {
      this._streamCallBack.onError(error);

      /* Don't try to recover just destroy ourselves */
      if (this._writeStream) {
        this._writeStream.destroy();
        this._writeStream = undefined;
      }
    }
  }

  private onFinished() {
    if (this._streamCallBack && this._streamCallBack.onFinished) {
      this._streamCallBack.onFinished(this._path);
    }
    /* We're done destroy any left over resources */
    if (this._writeStream) {
      this._writeStream.destroy();
      this._writeStream = undefined;
    }
  }

  private onClose() {
    if (this._streamCallBack && this._streamCallBack.onClose) {
      this._streamCallBack.onClose(this._path);
    }
  }
}
