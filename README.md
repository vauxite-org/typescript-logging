# typescript-logging

Typescript library for logging. Simple and flexible.
Written in typescript, so easily integrates within any TypeScript project.
The javascript bundle can also be used in normal javascript projects and/or browser.

## Installation

Use npm to install for usage in your project.

~~~
npm install --save typescript-logging
~~~
No additional typings are required, these are included.

## Documentation

* Version 0.2.0-beta1 (Current version)
  * Categorized logging (new) [documentation here](docs/latest.md)
  * Previous way of logging, see the documentation of 0.1.3.
* Version 0.1.3 (stable) [documentation here](docs/stable_0.1.3.md)

## Build

To build locally:

~~~
npm run build
~~~

## Tests

To run the tests:

~~~
npm run test
~~~

## Bugs

We all wish there were none in our software, but alas. If you encounter a bug please log it in the issue tracker.

## Contributing

Feel free to contribute or come up with great ideas, please use the issue tracker for that. 

If you add/change new functionality and want it merged to master, please open a pull request. Also add tests for it (spec directory).
Some things may not fit the library and could be rejected, so if you are unsure please ask first before wasting your valuable time.

## History

* 0.2.0-beta1
  * Api breaking changes (different import locations for a few classes), be aware of this. Classes are still compatible with previous version.
  * Added fresh approach to logging: categorized logging. Separate from existing api.
  * Updated documentation to reflect changes
* 0.1.3 No api changes, release ok.
  * Updated documentation (slightly changed examples, added example how to import, added additional logger api)
  * Fix that messages get logged in proper order always (due to using a promise for error resolving, they could get out of order)
* 0.1.2 No changes (npm related), release ok.
* 0.1.1 No changes (npm related), do not use.
* 0.1.0 Initial release, do not use.