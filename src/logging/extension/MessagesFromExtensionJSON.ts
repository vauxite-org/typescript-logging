/**
 * Change log level for a category.
 */
export interface ExtensionRequestChangeLogLevelJSON {

  categoryId: number;

  logLevel: string;

  recursive: boolean;
}

/**
 * Enable integration between logger and extension.
 */
export interface ExtensionEnableExtensionIntegration {

}
