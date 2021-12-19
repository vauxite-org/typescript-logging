import * as React from "react";
import * as ReactDOM from "react-dom";
import {RootComponent} from "./RootComponent";
import {logChannel} from "./LogConfig";
import {CATEGORY_LOG_CONTROL} from "typescript-logging-category-style";

export {CATEGORY_LOG_CONTROL} from "typescript-logging-category-style";
export {LOG4TS_LOG_CONTROL} from "typescript-logging-log4ts-style";

function start() {
  ReactDOM.render(
    (
      <RootComponent initialize={logChannel.setWriteValue}/>
    ),
    document.getElementById("contentId")
  );
}

start();
