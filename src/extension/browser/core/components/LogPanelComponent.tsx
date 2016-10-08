import * as React from "react";
import {LogDataModel} from "../api/LogDataModel";
import {LogPanelConnector} from "../api/LogPanelConnector";
import {LogPanelContentComponent} from "./LogPanelContentComponent";
import {LogPanelTreeComponent} from "./LogPanelTreeComponent";

export interface LogProps {

  model: LogDataModel;

}

class LogPanelComponent extends React.Component<LogProps,{}> {

  constructor(props: LogProps) {
    super(props);
  }

  render () {
    return (
      <div>
        <LogPanelTreeComponent model={this.props.model} />
        <LogPanelContentComponent model={this.props.model}/>
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