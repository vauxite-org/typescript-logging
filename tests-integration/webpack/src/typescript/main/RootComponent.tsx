import * as React from "react";
import {categoryProvider, log4TSProvider} from "./LogConfig";

interface RootComponentProps {
  initialize(setLogValue: (value: string) => void): void;
}

// tslint:disable-next-line:variable-name
export const RootComponent = (props: RootComponentProps) => {
  const [logValue, setLogValue] = React.useState("");
  React.useEffect(() => {
    props.initialize(newValue => setLogValue(prev => prev + newValue));
  }, []);
  return <div>
    <textarea id="logArea" rows={10} cols={80} value={logValue} readOnly={true}/>
    <button id="log4TSStyleButton" onClick={() => testLog4TSStyle()}>Test log4ts style</button>
    <button id="categoryStyleButton" onClick={() => testCategoryStyle()}>Test category style</button>
    <button id="clearButton" onClick={() => setLogValue("")}>Clear</button>
  </div>;
};

function testLog4TSStyle() {
  const log = log4TSProvider.getLogger("model.Example");
  log.trace("trace");
  log.debug("debug!");
  log.info("info!");
  log.warn(() => "warn!");
  log.error(() => "error!");
  log.fatal("fatal!");
}

function testCategoryStyle() {
  const root = categoryProvider.getCategory("root");
  const child1 = root.getChildCategory("child1");
  root.trace("trace");
  root.debug("root");
  root.info("info");
  child1.warn("warn");
  child1.error(() => "error");
  child1.fatal(() => "fatal");
}
