import * as React from "react";

export interface Update {

  setUpdateFunction(f: () => void): void;

}

export interface LogProps {

  message: () => string;

  update: Update;
}

class LogPanelComponent extends React.Component<LogProps,{}> {

  private doSomething = () => {
    console.log("doSomething: " + this.props.message());
    this.forceUpdate();
  }

  constructor(props: LogProps) {
    super(props);
    this.props.update.setUpdateFunction(this.doSomething);
  }

  render () {
    const message = this.props.message();
    return (
      <div>
        <h1>Log Panel</h1>
        <p>{message}</p>
      </div>
    )
  }
}


export class LogPanelConnector {

  private _message: string = "initial value";
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

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    console.log("Change message: " + value);
    this._message = value;
    console.log("My function looks like: " + this._function);
    this._function();
  }

  get updateFunction(): Update {
    return this._updateFunction;
  }

  static INSTANCE = new LogPanelConnector();
}


const LogPanelComponentWrapper = () => {
  return (
    <LogPanelComponent message={() => LogPanelConnector.INSTANCE.message} update={LogPanelConnector.INSTANCE.updateFunction} />
  );
}


export const LogPanel = LogPanelComponentWrapper;