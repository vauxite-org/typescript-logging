import * as React from "react";
import {observer} from "mobx-react";
import {ExtensionLogMessage} from "../api/ExtensionLogMessage";
import {LogDataModel} from "../api/LogDataModel";
import {LogPanelConnector} from "../api/LogPanelConnector";

export interface LogProps {

  model: LogDataModel;

}

@observer
class LogPanelComponent extends React.Component<LogProps,{}> {

  constructor(props: LogProps) {
    super(props);
  }

  render () {
    return (
      <div>
        <h1>Log Panel</h1>
        <p>
          {this.props.model.messages.map((value : ExtensionLogMessage) => {
            return <div>{value.formattedMessage}</div>
            })
          }</p>
      </div>
    )
  }
}



const LogPanelComponentWrapper = () => {
  return (
    <LogPanelComponent model={LogPanelConnector.INSTANCE.dataModel} />
  );
}

export const LogPanel = LogPanelComponentWrapper;