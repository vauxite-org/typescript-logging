import * as React from "react";

import {LogProps} from "./LogPanelComponent";
import {ExtensionLogMessage} from "../api/ExtensionLogMessage";
import {observer} from "mobx-react";

@observer
export class LogPanelContentComponent extends React.Component<LogProps,{}> {

  constructor(props: LogProps) {
    super(props);
  }

  render () {
    return (
      <div id="logMessagesPanel">
        <h1>Log Panel</h1>
        <div id="logMessages">
          {
            this.props.model.messages.filter((value : ExtensionLogMessage) => {
              return true;
            })
            .map((value : ExtensionLogMessage) => {
              return (
                <LogLineComponent value={value} />
              )
            })
          }
        </div>
      </div>
    );
  }
}

interface ValueModel<T> {

  value: T;

}


class LogLineComponent extends React.Component<ValueModel<ExtensionLogMessage>,{showStack: boolean}> {

  constructor(props: ValueModel<ExtensionLogMessage>) {
    super(props);

    this.state = {showStack: false};
  }

  render() {
    let stack = this.state.showStack ? this.props.value.errorAsStack: '';
    return (
    <div className={'log' + this.props.value.logLevel}>
      {this.props.value.formattedMessage}
      {this.props.value.errorAsStack != null ? <span onClick={e => this.clickMe(e)}>Click me!</span> : ''}
      {stack !== '' ? <div className="errorStack">{stack}</div> : ''}
    </div>
    );
  }

  private clickMe(evt: React.MouseEvent<HTMLElement>): void {
    this.setState({showStack: true});
  }
}