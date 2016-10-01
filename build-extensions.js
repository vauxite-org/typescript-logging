const shell = require('shelljs');

const dirInput='src/extension/browser';
const dirOutput='dist/extension/browser';
const logBundle='dist/bundle/typescript-logging-bundle.js';
const tsc='node_modules/.bin/tsc'

// Chrome extension dirs
const dirOutputChrome = dirOutput + '/chrome';
const dirInputChrome = dirInput + '/chrome';

console.log('Building chrome extension...');

if(shell.test('-e', dirOutput)) {
  shell.rm('-r', dirOutput);
}
shell.mkdir('-p', dirOutputChrome);

// Yes dirOutput, chrome subdir will be created.
shell.cp('-R', dirInputChrome, dirOutput);

// Grab the logger bundle, non minified, since it's an extension anyway we ship it readable - that allows for more easily debugging if needed.
shell.cp(logBundle, dirOutputChrome + '/js/typescript-logging-bundle.js');


