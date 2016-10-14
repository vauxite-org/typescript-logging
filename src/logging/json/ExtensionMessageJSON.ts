
export interface ExtensionMessageJSON<D> {

  from: string;

  data: ExtensionMessageContentJSON<D>;

}

export interface ExtensionMessageContentJSON<D> {

  type: string;

  value: D;

}