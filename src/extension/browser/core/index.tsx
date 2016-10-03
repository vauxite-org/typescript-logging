import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, IndexRoute, Route, hashHistory } from "react-router";
import {ExtensionMessageTransformer} from "./api/ExtensionMessageTransformer";
import {LogPanelConnector} from "./api/LogPanelConnector";
import {LogPanel} from "./components/LogPanel";

export const connector = LogPanelConnector.INSTANCE;
export const extensionMessageTransformer = ExtensionMessageTransformer.INSTANCE;

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