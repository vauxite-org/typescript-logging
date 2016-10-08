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
      <div>
        <h1>Log Panel</h1>

          {
            this.props.model.messages.map((value : ExtensionLogMessage) => {
              return <div>{value.formattedMessage}</div>
            })
          }
      </div>
    )
  }
}