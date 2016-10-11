import {SimpleMap} from "../../../../logging/DataStructures";
import {observable} from "mobx";

export class ExtensionCategory {

  @observable
  private _id: number;

  @observable
  private _name: string;

  @observable
  private _logLevel: string;

  @observable
  private _parent: ExtensionCategory;

  @observable
  private _children: ExtensionCategory[] = [];


  constructor(id: number, name: string, logLevel: string, parent: ExtensionCategory = null) {
    this._id = id;
    this._name = name;
    this._logLevel = logLevel;
    this._parent = parent;

    if(parent != null) {
      parent._children.push(this);
    }
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get logLevel(): string {
    return this._logLevel;
  }

  get parent(): ExtensionCategory {
    return this._parent;
  }

  get children(): ExtensionCategory[] {
    return this._children;
  }

  /**
   * Only applies logLevel
   */
  applyLogLevel(logLevel: string): void {
    this._logLevel = logLevel;
  }

  static create(data: any): ExtensionCategory {
    /*
     {
       "categories":
       [
         { id=1,
           name: "x",
           parent: null,
           logLevel: "Error"
         },
         { id=2,
           name: "y",
           parent: 1,
           logLevel: "Error"
         }
       ]
     }
    */



    if(!data.categories) {
      throw new Error("Invalid object, missing categories. Object=" + JSON.stringify(data));
    }

    const result: SimpleMap<ExtensionCategory> = new SimpleMap<ExtensionCategory>();
    let rootCategory: ExtensionCategory = null;

    const categories = data.categories;
    categories.forEach((cat: any) => {
      ExtensionCategory.validateJSONCategory(cat);

      const id = <number>cat.id;
      const name = <string>cat.name;
      const logLevel = <string>cat.logLevel;

      const idParent = <number>cat.parent;
      let parent: ExtensionCategory = null;
      if(idParent != null) {
        const parentCategory = result.get(idParent.toString());
        if(parentCategory == null) {
          throw new Error("Failed to find parent category for category: " + JSON.stringify(cat));
        }
        parent = parentCategory;
      }

      const newCategory = new ExtensionCategory(id, name, logLevel, parent);


      if(rootCategory == null) {
        rootCategory = newCategory;
      }
      else if(newCategory.parent == null) {
        throw new Error("Found a root category - already have root category this is not allowed. Category: " + JSON.stringify(cat));
      }

      result.put(newCategory.id.toString(), newCategory);
    });

    if(rootCategory == null) {
      throw new Error("Did not find any root category");
    }

    return rootCategory;
  }

  private static validateJSONCategory(cat: any): void {
    if(!cat.id) {
      throw new Error("Missing id field, category: " + JSON.stringify(cat));
    }
    if(!cat.name) {
      throw new Error("Missing name field, category: " + JSON.stringify(cat));
    }
    if(cat.parent === undefined) {
      throw new Error("Missing parent field, category: " + JSON.stringify(cat));
    }
    if(!cat.logLevel) {
      throw new Error("Missing logLevel field, category: " + JSON.stringify(cat));
    }
  }
}