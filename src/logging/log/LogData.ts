export interface LogData {
  msg: string;
  data?: any;

  ds?(data: any): string;
}
