import * as React from "react";
import {observable} from "mobx";
import {observer} from "mobx-react";

export interface Update {

  setUpdateFunction(f: () => void): void;

}

export class LogDataModel {

  @observable
  private _message:string;

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }
}

export interface LogProps {

  model: LogDataModel;

  update: Update;
}

@observer
class LogPanelComponent extends React.Component<LogProps,{}> {

  private doSomething = () => {
    console.log("doSomething: " + this.props.model.message);
    //this.forceUpdate();
  }

  constructor(props: LogProps) {
    super(props);
    this.props.update.setUpdateFunction(this.doSomething);
  }

  render () {
    return (
      <div>
        <h1>Log Panel</h1>
        <p>{this.props.model.message}</p>
      </div>
    )
  }
}


export class LogPanelConnector {

  private _dataModel: LogDataModel = new LogDataModel();
  private _function: Function;

  private _updateFunction: Update = {
    setUpdateFunction(f: () => void):void {
      console.log("Registering function: " + f);
      LogPanelConnector.INSTANCE._function = f;
    }
  } as Update;

  private LogPanelConnector()
  {
    // Private constructor
  }

  set message(value: string) {
    console.log("Change message: " + value);
    this._dataModel.message = value;
    console.log("My function looks like: " + this._function);
    this._function();
  }

  get updateFunction(): Update {
    return this._updateFunction;
  }


  get dataModel(): LogDataModel {
    return this._dataModel;
  }

  static INSTANCE = new LogPanelConnector();
}


const LogPanelComponentWrapper = () => {
  return (
    <LogPanelComponent model={LogPanelConnector.INSTANCE.dataModel} update={LogPanelConnector.INSTANCE.updateFunction} />
  );
}


export const LogPanel = LogPanelComponentWrapper;