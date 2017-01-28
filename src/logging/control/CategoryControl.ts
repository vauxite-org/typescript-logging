/**
 * Interface to control Categories (from CategoryService and related) through
 *  ordinary console in browsers.
 */
export interface CategoryControl {

  /**
   * Shows help
   */
  help(): void;

  /**
   * Prints settings for all categories.
   */
  showSettings(): void;

}

export class CategoryControlImpl implements CategoryControl {


  public showSettings(): void {
    //
  }

  public help(): void {
    /* tslint:disable:no-console */
    console.log("help");
    /* tslint:enable:no-console */
  }

}
