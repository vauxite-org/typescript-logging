import * as fs from "fs";

/**
 * Returns Dirent (files) within given directory that match given matcher function
 * @param directory Directory to check (must exist)
 * @param encoding Encoding to use
 * @param fnMatch Called for each file/directory
 */
export function listFiles(directory: string, encoding: BufferEncoding, fnMatch: (fileName: fs.Dirent) => boolean): fs.Dirent[] {
  try {
    return fs.readdirSync(directory, {encoding, withFileTypes: true})
      .filter(fnMatch);
  }
  catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error(`Failed to list files for directory '${directory}'.`);
  }
}
