/**
 * Send a message.
 */
export interface ExtensionMessageJSON<D> {

  from: string;

  data: ExtensionMessageContentJSON<D>;

}

/**
 * Content for the message.
 */
export interface ExtensionMessageContentJSON<D> {

  type: string;

  value: D;

}
