
import {CategoryRuntimeSettings} from "../log/category/CategoryService";
export interface CategoryControl {

}

export class CategoryControlImpl implements CategoryControl {

  private _runtimeSettings: CategoryRuntimeSettings;

  public constructor(runtimeSettings: CategoryRuntimeSettings) {
    this._runtimeSettings = runtimeSettings;
  }

}
