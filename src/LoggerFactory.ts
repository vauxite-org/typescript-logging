import {Logger} from "./Logger";

export interface LoggerFactory {

  getLogger(named: string): Logger;

}