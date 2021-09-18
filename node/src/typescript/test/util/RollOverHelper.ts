import {StreamCallBackImpl} from "./StreamCallBackImpl";
import * as fs from "fs";

/**
 * Helper test class to verify rollover functionality.
 */
export class RollOverHelper {

  private readonly _streamCallBack: StreamCallBackImpl;
  private readonly _files: fs.PathLike[] = [];

  private _expectedCount: number;
  private readonly _promise: Promise<void>;
  private _resolve!: (value: (void | PromiseLike<void>)) => void;
  private _reject!: (reason?: any) => void;

  public constructor(streamCallBack: StreamCallBackImpl, expectedCount: number) {
    this._streamCallBack = streamCallBack;
    this._expectedCount = expectedCount;
    this._promise = new Promise<void>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.onRollOver = this.onRollOver.bind(this);
  }

  public setExpectedCount(value: number) {
    this._expectedCount = value;
  }

  public onRollOver(path: fs.PathLike): void {
    if (this._files.length === this._expectedCount) {
      throw new Error(`Too many rollovers of files, expecting: ${this._expectedCount}, extra path: ${path}`);
    }
    this._files.push(path);

    if (this._files.length === this._expectedCount) {
      this._resolve();
    }
  }

  public getFiles() {
    return this._files;
  }

  public isFinished(): Promise<void> {
    return this._promise;
  }
}
