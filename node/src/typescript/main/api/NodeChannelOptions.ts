import * as fs from "fs";

/**
 * Additional optional options related to the channel created, for advanced usage only.
 */
export interface NodeChannelOptions {

  /**
   * When specified this function is called when a rollover occurred. It will refer to the previously completed log file.
   * If needed you can back it up and/or compress it elsewhere. Keep in mind that if you do this in a synchronous fashion that may take some time
   * slowing your application down.
   *
   * It is recommended you deal with the file in an asynchronous fashion. Keep in mind that the file will be deleted/overwritten once the maxFiles is reached again,
   * so it may not exist anymore then (normally that should take a while, unless logging/rollover occurs at a very fast pace in which case your logging configuration
   * is probably wrong).
   */
  onRollOver?: (path: fs.PathLike) => void;
}
