import * as React from "react";

import {LogProps} from "./LogPanelComponent";
import {ExtensionCategory} from "../api/ExtensionCategory";
import {observer} from "mobx-react";

@observer
export class LogPanelTreeComponent extends React.Component<LogProps,{}> {

  constructor(props: LogProps) {
    super(props);
  }

  render() {
    return (
      <div>

        {
          this.props.model.rootCategories.map((value: ExtensionCategory) => {
            return <ul><LogCategoryComponent category={value} /></ul>;
          })
        }
      </div>
    );
  }

}

interface LogCategoryProps {

  category: ExtensionCategory;
}

class LogCategoryComponent extends React.Component<LogCategoryProps,{}> {

  constructor(props: LogCategoryProps) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <li>
        {this.props.category.name}
        <ul>
        {
          this.props.category.children.map((child : ExtensionCategory) => {
            return <LogCategoryComponent category={child} />;
          })
        }
        </ul>
      </li>
    );
  }

}