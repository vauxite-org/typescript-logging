import {StreamCallBack} from "../../main/impl/NodeLogWriter";
import * as fs from "fs";

/**
 * Helper class which we use to verify all expected events are called, and in the correct order.
 */
export class StreamCallBackImpl implements StreamCallBack {

  private readonly _promise: Promise<void>;
  private _expectedCount: number;
  private _onRollOver?: (path: fs.PathLike) => void | undefined;
  private _resolve!: (value: (void | PromiseLike<void>)) => void;
  private _reject!: (reason?: any) => void;

  private _error: Error | undefined;
  private _callStack: { finishCalled: boolean, closeCalled: boolean, path?: fs.PathLike }[] = [];

  public constructor(expectedCount: number) {
    this._expectedCount = expectedCount;
    this._promise = new Promise<void>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.onRollOver = this.onRollOver.bind(this);
  }

  public setExpectedCount(value: number) {
    if (value < this._callStack.length) {
      throw new Error(`Cannot set to ${value}, stack is ${this._callStack.length}`);
    }
    this._expectedCount = value;
  }

  public setRollOver(onRollOver: (path: fs.PathLike) => void | undefined) {
    this._onRollOver = onRollOver;
  }

  public onError(error: Error): void {
    this._error = error;
  }

  public onFinished(path: fs.PathLike): void {
    if (this._callStack.length >= this._expectedCount) {
      this._reject(new Error("Something went wrong, maximum count reached cannot finish once more."));
      return;
    }
    this._callStack.push({finishCalled: true, closeCalled: false, path});
  }

  public onClose(path: fs.PathLike): void {
    if (this._callStack.length === 0) {
      this._reject(new Error("onClose called but there is nothing on the stack"));
      return;
    }

    const value = this._callStack.find(p => p.path === path && !p.closeCalled);
    if (value === undefined) {
      this._reject(new Error(`Unexpected error, could not find entry in stack with path ${path}, or all were closed already`));
      return;
    }

    if (value.finishCalled) {
      value.closeCalled = true;
      if (this._callStack.length === this._expectedCount) {
        /* Are all close called, then we can resolve */
        const entry = this._callStack.find(p => !p.closeCalled);
        if (entry === undefined) {
          /* Return the top of the stack path, that is the last file that finished */
          this._resolve();
        }
      }
    }
    else {
      if (this._error) {
        this._reject(this._error);
      }
      else {
        this._reject(new Error(`Unexpected error, no finish was called and there was no error yet close was called for path ${path}`));
      }
    }
  }

  public onRollOver(path: fs.PathLike) {
    if (this._onRollOver) {
      const found = this._callStack.find(v => v.path === path);
      if (!found) {
        throw new Error(`Failed to find rollover path: ${path} within call stack`);
      }

      if (!found.finishCalled || !found.closeCalled) {
        throw new Error(`Found path ${path} within call stack, however finish/close was not called already. FinishCalled=${found.finishCalled}, ${found.closeCalled}`);
      }

      this._onRollOver(path);
    }
  }

  public isFinished(): Promise<void> {
    return this._promise;
  }

  public getFile(): fs.PathLike {
    if (this._callStack.length === 0) {
      throw new Error("No file present on stack");
    }
    const path = this._callStack[this._callStack.length - 1].path;
    if (path === undefined) {
      throw new Error("No file was set");
    }
    return path;
  }

  public getFiles() {
    return this._callStack.map(v => v.path).filter(isDefined);
  }

  public verifyStackValid() {
    if (this._callStack.length !== this._expectedCount) {
      throw new Error(`Stack is not of expected count, stack size is ${this._callStack.length}, but expected ${this._expectedCount}`);
    }
    for (let i = 0; i < this._callStack.length; i++) {
      const value = this._callStack[i];
      if (!value.finishCalled || !value.closeCalled || value.path === undefined) {
        throw new Error(`Invalid entry found in stack at index ${i}, finishCalled=${value.finishCalled}, closeCalled=${value.closeCalled}`);
      }
    }
  }
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

