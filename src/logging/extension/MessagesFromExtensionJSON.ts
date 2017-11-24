/**
 * Change log level for a category.
 */
export interface ExtensionRequestChangeLogLevelJSON {

  categoryId: number;

  logLevel: string;

  recursive: boolean;
}
