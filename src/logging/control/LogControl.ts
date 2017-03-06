import {CategoryServiceControl, CategoryServiceControlImpl} from "./CategoryServiceControl";
import {LoggerControl, LoggerControlImpl} from "./LogGroupControl";

/**
 * LogControl interface
 */
export interface LogControl {

  /**
   * Prints the help.
   */
  help(): void;

  /**
   * Shows an example on usage.
   */
  example(): void;

  /**
   * Return LoggerControl object related to LFService/LoggerFactories.
   */
  getLFServiceControl(): LoggerControl;

  /**
   * Return CategoryControl object.
   */
  getCategoryControl(): CategoryServiceControl;

}

export class LogControlImpl implements LogControl {

  /* tslint:disable:no-trailing-whitespace */
  private static _help: string =
`
  help()
    ** Shows this help.
    
  example()
    ** Shows code example with short explanation on using this.

  getLFServiceControl(): LoggerControl
    ** Returns LoggerControl object.
    ** Can be used to control LogGroups

  getCategoryControl(): CategoryControl
    ** Returns CategoryControl object.
`;

  private static _example: string =
`
  // First line you already did, or you would not see this example.
  const lc = TSL.getLogControl();
  lc.help(); // Prints help
  const lgc = lc.getLFServiceControl();  // Retrieve LoggerControl object
    
`;
  /* tslint:enable:no-trailing-whitespace */

  public help(): void {
    /* tslint:disable:no-console */
    console.log(LogControlImpl._help);
    /* tslint:enable:no-console */
  }

  public example(): void {
    /* tslint:disable:no-console */
    console.log(LogControlImpl._example);
    /* tslint:enable:no-console */
  }

  public getLFServiceControl(): LoggerControl {
    return new LoggerControlImpl();
  }

  public getCategoryControl(): CategoryServiceControl {
    return new CategoryServiceControlImpl();
  }
}
