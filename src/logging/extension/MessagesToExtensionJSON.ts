/**
 * Represents a category as json.
 */
export interface ExtensionCategoryJSON {

  id: number;

  name: string;

  logLevel: string;

  parentId: number;

  children: ExtensionCategoryJSON[];
}

/**
 * Represents a category log message, as json.
 */
export interface ExtensionCategoryLogMessageJSON {

  logLevel: string;

  categories: number[];

  message: string;

  errorAsStack: string;

  formattedMessage: string;

  resolvedErrorMessage: boolean;
}

/**
 * Represents a (new) loglevel for a category, as json.
 */
export interface ExtensionCategoriesUpdateMessageJSON {

  categories: {id: number, logLevel: string}[];

}
