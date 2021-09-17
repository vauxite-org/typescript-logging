import * as Path from "path";
import * as fs from "fs";
import {listFiles} from "../main/impl/FileUtils";
import {Log4TSProvider, LogLevel} from "typescript-logging";
import {NodeChannelFactory} from "../main/api";
import {NodeRawLogChannel} from "../main/impl/NodeRawLogChannel";
import {StreamCallBack} from "../main/impl/NodeLogWriter";

describe("Test node logging", () => {

  let testDir: string = "";
  let provider: Log4TSProvider;
  let channel: NodeRawLogChannel;
  let streamCallBack: StreamCallBackImpl;

  beforeEach(() => {
    /*
     * Clear any state, so we always start clean.
    */
    Log4TSProvider.clear();

    /* Sanity check */
    const pathToNodeDir = getNodeDirectoryPath();
    checkExistsAndIsDirectory(pathToNodeDir);

    testDir = getNodeTestDirectoryPath();

    deleteDirectoryIfExists(testDir);

    fs.mkdirSync(testDir, {recursive: true});

    const retention = NodeChannelFactory.createRetentionStrategyMaxFiles({directory: testDir, maxFiles: 3, maxFileSize: {value: 1, unit: "KiloBytes"}});
    channel = NodeChannelFactory.createRawLogChannel(retention, msg => msg.message + "\n") as NodeRawLogChannel;
    streamCallBack = new StreamCallBackImpl(1);
    channel.setStreamCallBacks(streamCallBack);
    provider = Log4TSProvider.createLog4TSProvider("test", {channel, groups: [{expression: new RegExp("model.+"), level: LogLevel.Debug}]});
  });

  afterEach(() => {
    if (testDir !== "") {
      deleteDirectoryIfExists(testDir);
    }
    testDir = "";

    if (channel) {
      channel.close();
    }
  });

  test("Test node channel writes to file", async () => {
    const logger = provider.getLogger("model.Example");
    logger.debug("hello world 1");
    logger.debug("hello world 2");
    logger.debug("hello world 3");
    logger.debug("hello world 4");
    channel.close();

    await streamCallBack.isFinished();
    streamCallBack.verifyStackValid();

    const data = getFileContents(streamCallBack.getFile());
    expect(data).toEqual("hello world 1\nhello world 2\nhello world 3\nhello world 4\n");
  });

  test("Test node channel does rollover to next file", async () => {
    /* The channel is configured to write max 1 KB in a file (1024 bytes) */
    streamCallBack.setExpectedCount(1);

    const logger = provider.getLogger("model.Example");

    /* We write as utf-8, both a and b fit a single byte, note that each debug has a \n added too (see above in setup), hence 511 for each line. */
    const valueA = "a".repeat(511);
    const valueB = "b".repeat(511);
    logger.debug(valueA);
    logger.debug(valueB);
    channel.close(); // Just to assure flushing happens because we close the underlying stream.

    await streamCallBack.isFinished();
    streamCallBack.verifyStackValid();

    let files = streamCallBack.getFiles();
    assertFile(files, "application1.log", `${valueA}\n${valueB}\n`);
    /* There is really only 1 file here */
    const firstFile = files[0];

    /* Write something else, this should end up in the next file */
    streamCallBack = new StreamCallBackImpl(1);
    channel.setStreamCallBacks(streamCallBack);
    logger.debug("hello");
    channel.close();

    await streamCallBack.isFinished();
    streamCallBack.verifyStackValid();
    files = streamCallBack.getFiles();

    assertFile(files, "application2.log", "hello\n");
    /* First file should be valid too still of course */
    assertFile([firstFile], "application1.log", `${valueA}\n${valueB}\n`);
  });

  test("Test node channel rolls over multiple files", async () => {
    /* The channel is configured to write max 1 KB in a file (1024 bytes) */
    streamCallBack.setExpectedCount(3);

    const logger = provider.getLogger("model.Example");

    /* We write as utf-8, the letters fit a single byte, note that each debug has a \n added too (see above in setup), hence 1023 for each value. */
    const valueA = "a".repeat(1023);
    const valueB = "b".repeat(1023);
    const valueC = "c".repeat(1023);

    logger.debug(valueA);
    logger.debug(valueB); // Rollover will happen, as this won't fit
    logger.debug(valueC); // Rollover will happen, as this won't fit
    channel.close(); // To make sure last file is written

    await streamCallBack.isFinished();
    streamCallBack.verifyStackValid();
    const files = streamCallBack.getFiles();
    assertFile(files, "application1.log", valueA + "\n");
    assertFile(files, "application2.log", valueB + "\n");
    assertFile(files, "application3.log", valueC + "\n");
  });

  test("Test node channel finds existing file", async () => {
    const valueA = "a".repeat(511);
    const valueB = "b".repeat(511);
    const existingFile = getNodeTestDirectoryPath() + Path.sep + "application1.log";
    fs.writeFileSync(existingFile, valueA + "\n", {encoding: "utf-8"});

    streamCallBack.setExpectedCount(2);
    const logger = provider.getLogger("model.Example");
    logger.debug(valueB);
    logger.debug("second file");
    channel.close();

    await streamCallBack.isFinished();
    streamCallBack.verifyStackValid();

    const files = streamCallBack.getFiles();
    assertFile(files, "application1.log", `${valueA}\n${valueB}\n`);
    assertFile(files, "application2.log", "second file\n");
  });

  test("Test node channel finds last used file", async () => {
    const valueA = "a".repeat(511);
    const valueB = "b".repeat(511);

    const existingFile1 = getNodeTestDirectoryPath() + Path.sep + "application1.log";
    const existingFile2 = getNodeTestDirectoryPath() + Path.sep + "application2.log";
    const existingFile3 = getNodeTestDirectoryPath() + Path.sep + "application3.log";
    fs.writeFileSync(existingFile2, "hello2", {encoding: "utf-8"});
    await sleep(5);
    fs.writeFileSync(existingFile1, "hello1", {encoding: "utf-8"});
    await sleep(5);
    fs.writeFileSync(existingFile3, valueA + "\n", {encoding: "utf-8"});

    /* Last used file would be 3 so that should be appended to */
    streamCallBack.setExpectedCount(2);
    const logger = provider.getLogger("model.Example");
    logger.debug(valueB);
    logger.debug("should end up in file 1");
    channel.close();

    await streamCallBack.isFinished();
    streamCallBack.verifyStackValid();

    const files = streamCallBack.getFiles();
    assertFile(files, "application1.log", "should end up in file 1\n");
    assertFile(files, "application3.log", `${valueA}\n${valueB}\n`);

    /* application2.log was not touched so should be as it was before */

    assertFile([existingFile2], "application2.log", "hello2");
  });

  test("Test node channel finds last used full file, should start with next", async () => {
    const valueA = "a".repeat(511);
    const valueB = "b".repeat(511);

    const existingFile1 = getNodeTestDirectoryPath() + Path.sep + "application1.log";
    const existingFile2 = getNodeTestDirectoryPath() + Path.sep + "application2.log";
    const existingFile3 = getNodeTestDirectoryPath() + Path.sep + "application3.log";
    fs.writeFileSync(existingFile3, "hello 3", {encoding: "utf-8"});
    await sleep(5);
    fs.writeFileSync(existingFile1, "hello 1", {encoding: "utf-8"});
    await sleep(5);
    fs.writeFileSync(existingFile2, valueA + "\n" + valueB + "\n", {encoding: "utf-8"});

    /* file 2 above is full, so it should find it but immediately roll over to 3, so 2 and 1 remain untouched when writing next */
    streamCallBack.setExpectedCount(1);
    const logger = provider.getLogger("model.Example");
    logger.debug("should end up in file 3");
    channel.close();

    await streamCallBack.isFinished();
    streamCallBack.verifyStackValid();

    const files = streamCallBack.getFiles();
    assertFile(files, "application3.log", "should end up in file 3\n");

    /* The other 2 files should remain untouched as they were */
    assertFile([existingFile1], "application1.log", "hello 1");
    assertFile([existingFile2], "application2.log", valueA + "\n" + valueB + "\n");
  });
});

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

function checkExistsAndIsDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Path '${dir}' does not exist.`);
  }

  try {
    const stats = fs.statSync(dir);
    if (!stats.isDirectory()) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`Path '${dir}' is not a directory.`);
    }
  }
  catch (e) {
    throw new Error(`Failed to stat directory '${dir}'`);
  }
}

function getNodeDirectoryPath() {
  let dir = process.env.INIT_CWD;
  if (!dir) {
    dir = process.cwd();
  }

  if (!dir) {
    throw new Error("process.env.INIT_CWD is not set, is this not a node environment?");
  }

  if (!dir.endsWith("node")) {
    dir += Path.sep + "node";
  }
  return dir;
}

function getNodeTestDirectoryPath() {
  return getNodeDirectoryPath() + Path.sep + "dist" + Path.sep + "test";
}

function deleteDirectoryIfExists(directory: string) {
  if (!fs.existsSync(directory)) {
    return;
  }

  listFiles(directory, "utf-8", () => true).forEach(dirEnt => {
    if (!dirEnt.isFile()) {
      throw new Error(`Did not expect anything but files in directory '${directory}', but found: ${dirEnt.name}`);
    }
    const path = directory + Path.sep + dirEnt.name;
    fs.unlinkSync(path);
  });

  fs.rmdirSync(directory);
}

function getFileContents(path: fs.PathLike): string {
  return fs.readFileSync(path, {encoding: "utf-8"});
}

function assertFile(paths: fs.PathLike[], name: string, expectedContent: string) {
  const foundFile = paths.find(path => path.toString().endsWith(name));
  if (!foundFile) {
    throw new Error(`Failed to find file with name: ${name}`);
  }
  expect(getFileContents(foundFile)).toEqual(expectedContent);
}


function sleep(millis: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

class StreamCallBackImpl implements StreamCallBack {

  private readonly _promise: Promise<void>;
  private _expectedCount: number;
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
  }

  public setExpectedCount(value: number) {
    if (value < this._callStack.length) {
      throw new Error(`Cannot set to ${value}, stack is ${this._callStack.length}`);
    }
    this._expectedCount = value;
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

    const value = this._callStack.find(p => p.path === path);
    if (value === undefined) {
      this._reject(new Error(`Unexpected error, could not find entry in stack with path ${path}`));
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
