import {fileSizeToBytes, RetentionStrategy} from "../api/RetentionStrategy";
import {NodeLogWriter, StreamCallBack} from "./NodeLogWriter";
import * as fs from "fs";

/**
 * Base class for node channels which contains all the logic around retention and where to write to.
 */
export abstract class AbstractNodeChannel {

  private readonly _retentionStrategy: RetentionStrategy;
  private readonly _maxSizeBytes: number;
  private _streamCallBacks: StreamCallBack | undefined;

  private _initialized: boolean = false;
  private _writer: NodeLogWriter | undefined;
  private _currentSize: number = 0;

  protected constructor(retentionStrategy: RetentionStrategy) {
    this._retentionStrategy = retentionStrategy;
    const maxFileSize = retentionStrategy.maxFileSize;
    if (maxFileSize) {
      this._maxSizeBytes = fileSizeToBytes(maxFileSize);
    }
    else {
      /* Default of 100 MB */
      this._maxSizeBytes = fileSizeToBytes({value: 100, unit: "MegaBytes"});
    }
    this.onStreamError = this.onStreamError.bind(this);
    this.onFinished = this.onFinished.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  /**
   * Forcefully close the underlying writer.
   */
  public close() {
    if (this._writer) {
      this._writer.close();
      this._writer = undefined;
    }
  }

  /**
   * For testing purposes only, provides access to some stream events.
   * Will be applied next time a new stream is opened (not to current stream if any is open).
   *
   * @param callbacks The custom callback, when undefined unsets the callback.
   */
  public setStreamCallBacks(callbacks: StreamCallBack | undefined) {
    this._streamCallBacks = callbacks;
  }

  /**
   * Subclasses must not override this function, instead override the appropriate channel one (write(..)), create the message
   * there and then call this method to write the actual data.
   * @param msg Message to write
   * @protected
   */
  protected writeMessage(msg: string) {
    if (!this._initialized) {
      this.initialize();
    }

    if (this._writer === undefined) {
      this.nextWriter();
    }

    const byteSize = Buffer.byteLength(msg, this._retentionStrategy.encoding);

    if ((this._currentSize + byteSize) > this._maxSizeBytes) {

      /* Sanity check, can we even write the value at all according size? If not just bail it's a configuration error */
      if (byteSize > this._maxSizeBytes) {
        throw new Error(`Maximum allowed file size is '${this._maxSizeBytes} bytes', but want to write '${byteSize} bytes', please set file size higher.`);
      }

      this.nextWriter();
      this.writeAndUpdateSize(msg, byteSize);
    }
    else {
      this.writeAndUpdateSize(msg, byteSize);
    }
  }

  private initialize() {
    this._retentionStrategy.initialize();
    this._initialized = true;
  }

  private nextWriter() {
    /* We rollover if there is a writer, as it means this class decided it needs a rollover, otherwise it's startup let the other side decided instead. */
    const mustRollOver = this._writer !== undefined;
    if (this._writer) {
      this._writer.close();
      this._currentSize = 0;
    }
    const [nextFile, newSize] = this._retentionStrategy.nextFile(mustRollOver);
    this._currentSize = newSize;

    this._writer = new NodeLogWriter(nextFile, this._retentionStrategy.encoding, this.createStreamCallBack());
  }

  private writeAndUpdateSize(msg: string, byteSize: number) {
    // The write should be really there, else something is really wrong.
    if (this._writer) {
      this._currentSize += byteSize;
      this._writer.write(msg);
    }
    else {
      throw new Error(`Writer is not available (file system issue?), cannot log message '${msg}'`);
    }
  }

  private createStreamCallBack(): StreamCallBack {
    return {
      onFinished: this.onFinished,
      onError: this.onStreamError,
      onClose: this.onClose,
    };
  }

  private onFinished(path: fs.PathLike) {
    if (this._streamCallBacks && this._streamCallBacks.onFinished) {
      this._streamCallBacks.onFinished(path);
    }
  }

  private onClose(path: fs.PathLike) {
    if (this._streamCallBacks && this._streamCallBacks.onClose) {
      this._streamCallBacks.onClose(path);
    }
  }

  private onStreamError(error: Error) {
    /*
      This closes the current errored stream, we will try the next instead.
     */
    try {
      this.nextWriter();
    }
    finally {
      if (this._streamCallBacks && this._streamCallBacks.onError) {
        this._streamCallBacks.onError(error);
      }
    }
  }
}
