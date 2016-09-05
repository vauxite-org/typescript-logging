
import {Category} from "./Logger";
export interface CategoryLogger {

  info(categories: Category[], msg: string, error?: Error): void;

  infoc(categories: Category[], msg:() => string, error?:() => Error): void;

}