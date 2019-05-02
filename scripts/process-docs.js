var file_system = require("fs");
var archiver = require("archiver");
var shell = require("shelljs");

var args = process.argv.slice(2);
var bundleDir=args[0];

var output = file_system.createWriteStream(bundleDir + "/docs.zip");
var archive = archiver("zip");

output.on("close", function () {
  console.log(archive.pointer() + " total bytes written.");
  shell.rm("-r", bundleDir + "/docs");
});

archive.on("error", function(err){
  throw err;
});

archive.pipe(output);
archive.directory(bundleDir + "/docs", "docs");
archive.finalize();
