import * as React from "react";
import * as ReactDOM from "react-dom";
import {RootComponent} from "./RootComponent";
import {logChannel} from "./LogConfig";

function start() {
  ReactDOM.render(
    (
      <RootComponent initialize={logChannel.setWriteValue}/>
    ),
    document.getElementById("contentId")
  );
}

start();
