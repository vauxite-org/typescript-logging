import {fileSizeToBytes, RetentionStrategy} from "../api/RetentionStrategy";
import {NodeLogWriter, StreamCallBack} from "./NodeLogWriter";
import * as fs from "fs";
import {NodeChannelOptions} from "../api/NodeChannelOptions";

/**
 * Base class for node channels which contains all the logic around retention and where to write to.
 */
export abstract class AbstractNodeChannel {

  private readonly _retentionStrategy: RetentionStrategy;

  private readonly _onRollOver: ((path: fs.PathLike) => void) | undefined;
  private readonly _maxSizeBytes: number;
  private _streamCallBacks: StreamCallBack | undefined;

  private _initialized: boolean = false;
  private _writer: NodeLogWriter | undefined;
  private _currentSize: number = 0;

  /**
   * We track them here until a "close" event occurs for these files, then we call the rollover function the user set.
   * We track a unique number for them, because if it didn't close a minute *after* rollover occurred something went wrong and
   * we just purge them from this array to not create a silent memory leak over time.
   * @private
   */
  private readonly _rollOverFiles: { path: fs.PathLike, rollOverId: number, timer?: NodeJS.Timer } [] = [];
  private _rollOverId: number = 0;

  protected constructor(retentionStrategy: RetentionStrategy, options?: NodeChannelOptions) {
    this._retentionStrategy = retentionStrategy;
    this._onRollOver = options && options.onRollOver ? options.onRollOver : undefined;
    const maxFileSize = retentionStrategy.maxFileSize;
    if (maxFileSize) {
      this._maxSizeBytes = fileSizeToBytes(maxFileSize);
    }
    else {
      /* Default of 100 MB */
      this._maxSizeBytes = fileSizeToBytes({value: 100, unit: "MegaBytes"});
    }
    this.onStreamError = this.onStreamError.bind(this);
    this.onStreamFinished = this.onStreamFinished.bind(this);
    this.onStreamClose = this.onStreamClose.bind(this);
    this.onRetentionRollOver = this.onRetentionRollOver.bind(this);
    this.removeRollOverFileArrayByPathAndRollOverId = this.removeRollOverFileArrayByPathAndRollOverId.bind(this);
  }

  /**
   * Forcefully close the underlying writer.
   */
  public close() {
    try {
      if (this._writer) {
        this._writer.close();
        this._writer = undefined;
      }
    }
    finally {
      /* Make sure to remove any remaining timers from rollover */
      this._rollOverFiles.forEach(v => {
        if (v.timer) {
          clearTimeout(v.timer);
        }
      });
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
    this._retentionStrategy.initialize(this.onRetentionRollOver);
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

    this._writer = new NodeLogWriter(nextFile, this._retentionStrategy.encoding, {onFinished: this.onStreamFinished, onError: this.onStreamError, onClose: this.onStreamClose});
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

  private onStreamFinished(path: fs.PathLike) {
    if (this._streamCallBacks && this._streamCallBacks.onFinished) {
      this._streamCallBacks.onFinished(path);
    }
  }

  private onStreamClose(path: fs.PathLike) {
    if (this._streamCallBacks && this._streamCallBacks.onClose) {
      this._streamCallBacks.onClose(path);
    }

    if (this._onRollOver) {
      const idx = this._rollOverFiles.findIndex(f => f.path === path);
      if (idx === -1) {
        return;
      }

      this._rollOverFiles.splice(idx, 1);
      this._onRollOver(path);
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

  private onRetentionRollOver(path: fs.PathLike) {
    /* We only care if there is a rollover specified by the end user. */
    if (this._onRollOver) {
      const nextRollOverId = this._rollOverId++;
      /* Remove it after 60 seconds, as close should really have happened by then. */
      const timer = setTimeout(() => this.removeRollOverFileArrayByPathAndRollOverId(path, nextRollOverId), 60000);
      this._rollOverFiles.push({path, rollOverId: nextRollOverId, timer});
    }
  }

  private removeRollOverFileArrayByPathAndRollOverId(path: fs.PathLike, rollOverId: number) {
    const idx = this._rollOverFiles.findIndex(f => f.rollOverId === rollOverId && f.path === path);
    if (idx === -1) {
      return;
    }
    const value = this._rollOverFiles[idx];
    value.timer = undefined; // The timer fired as we got here
    this.deleteFromRollOverArrayAndResetTimer(idx);
  }

  private deleteFromRollOverArrayAndResetTimer(idx: number) {
    const items = this._rollOverFiles.splice(idx, 1);
    if (items.length > 0) {
      const item = items[0];
      if (item.timer) {
        clearTimeout(item.timer);
      }
    }
  }
}
