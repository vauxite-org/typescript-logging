import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, IndexRoute, Route, hashHistory } from "react-router";
import {LogPanel, LogPanelConnector} from "./components/LogPanel";

export const connector = LogPanelConnector.INSTANCE;

ReactDOM.render(
  (
    <Router history={hashHistory}>
      <Route path="/" component={LogPanel}>
        <IndexRoute component={LogPanel} />

      </Route>
    </Router>
  ),
  document.getElementById('contentPanel')
);