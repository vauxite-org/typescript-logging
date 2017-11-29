// We test that it loads properly, we had several occasions where webpack changed order
// of loading modules and suddenly things failed to load on runtime.
// This test assures things load (if not, it fails and the build will fail).

// Note this module was compiled with commonjs (not the var option) for nodejs specifically.
const tsl = require("../dist-test/bundle/typescript-logging-bundle").TSL;

// Create default logger
const loggerFactory = tsl.LFService.createLoggerFactory();

// Get a logger called "Hello"
const loggerOld = loggerFactory.getLogger("Hello");
loggerOld.error("Log4j on error", new Error("log4j error"));

tsl.CategoryServiceFactory.setDefaultConfiguration(new tsl.CategoryDefaultConfiguration(tsl.LogLevel.Debug));

const catRoot1 = new tsl.Category("root1", null);
const catChild = new tsl.Category("r1child1", catRoot1);

const catRoot2 = new tsl.Category("root2", null);
const r2Child1 = new tsl.Category("r2child1", catRoot2);
const r2child11 = new tsl.Category("r2child1-1", r2Child1);
const r2Child2 = new tsl.Category("r2child2", catRoot2);

const logger = tsl.CategoryServiceFactory.getLogger(catRoot1);
logger.error("Error in normal console", new Error("fail"), catRoot1);
logger.debug("This is on debug");

const logger2 = tsl.CategoryServiceFactory.getLogger(catRoot2);
logger2.error(function() { return "failed"; }, function() { return new Error("oops"); });
logger2.debug(function() { return "category on debug"; });

/*
CategoryServiceFactory.setDefaultConfiguration(new CategoryDefaultConfiguration(LogLevel.Debug));

export const appLog: Category = new Category('myApp');
export const log: CategoryLogger = CategoryServiceFactory.getLogger(appLog);

log.debug('I see it!!!');
*/