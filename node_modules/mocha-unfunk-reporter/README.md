# mocha-unfunk-reporter
[![Build Status](https://secure.travis-ci.org/Bartvds/mocha-unfunk-reporter.png?branch=master)](http://travis-ci.org/Bartvds/mocha-unfunk-reporter) [![Dependency Status](https://gemnasium.com/Bartvds/mocha-unfunk-reporter.png)](https://gemnasium.com/Bartvds/mocha-unfunk-reporter) [![NPM version](https://badge.fury.io/js/mocha-unfunk-reporter.png)](http://badge.fury.io/js/mocha-unfunk-reporter)

> Mocha reporter without console funkyness

## What?

This is a `Spec`-style console reporter for [mocha](http://visionmedia.github.io/mocha/) that doesn't confuse lesser console environments with funky display modes, cursor tricks or weird control characters.

Use-case is running mocha's in basic console views embedded in IDE's or setups with text buffered output (like travis-ci). The default config uses only some ANSI console colour codes and writes with console.log() but has option to be tuned up or down for your specific unfunky use-case.

### Notes

* The reporter does *not* extend mocha's default Base prototype because that is a main source of funkyness. This means not all of mocha's reporter features are supported.
* There are many features to ease testing usability, like aggressive attempts at getting a sensible error message or a stack filter that attempts to compact the stack trace by dropping mocha function calls.
* Object & string diffs by [unfunk-diff](https://github.com/Bartvds/unfunk-diff).
* Output by [ministyle](https://github.com/Bartvds/ministyle) & [miniwrite](https://github.com/Bartvds/miniwrite).


## Usage

Install from npm:

````
$ npm install mocha-unfunk-reporter --save-dev
```` 

Then use `'mocha-unfunk-reporter'` as `reporter` parameter in your favourite mocha runner. 

For example in `grunt-mocha-test`:

````js
grunt.initConfig({
	// ...
	mochaTest: {
		options: {
			reporter: 'mocha-unfunk-reporter'
		},
		any: {
			src: ['test/**/*.test.js']
		}
	}
});
````

## Options

There are multiple ways to set global options:

````js
//on module using .option() method
require('mocha-unfunk-reporter').option('<option_name>', <option_value>);
//or on env with prefixed name
process.env['mocha-unfunk-<option_name>'] = <option_value>;
//env also work Bash-style: upper-cased and underscores instead of dashes
process.env['MOCHA_UNFUNK_<OPTION_NAME>'] = <option_value>;
````

These are equivalent:

````js
process.env['MOCHA_UNFUNK_REPORTPENDING'] = true;
process.env['mocha-unfunk-reportPending'] = true;

require('mocha-unfunk-reporter').option('reportPending', true);
require('mocha-unfunk-reporter').option({reportPending: true});
````

The package also expose a grunt task `mocha_unfunk` to set reporter options.

````js
grunt.initConfig({
	mocha_unfunk: {
		myStyle: {
			options: {
				style: 'plain'
			}
		}
	}
}
````


### Values

Report styling: `style`

* `'ansi'` - plain with ansi color codes (default)
* `'plain'` - plain text
* `'none'` - even plainer text
* `'html'` - html span's with css colors
* `'css'` - html span's with css classes
* `'dev'` - style development codes

Output mode: `writer` 

* `'log'` - buffer and stream per line to `console.log()` (default)
* `'stdio'` - stream to `process.stdout`
* `'bulk'` - single buffered `console.log()`
* `'null'` - ignore output

Report details about pending specs, alongside failures: `reportPending`

* `false` (default) or `true`

Use custom stream: `stream` 

* any standard `WritableStream` (only usable via `require()`)

Filter internals from stack: `stackFilter` 

* `true` (default) or `false`

## Examples

Something like this: ([full version](https://raw.github.com/Bartvds/mocha-unfunk-reporter/master/media/mocha-unfunk-02.png))

![ansi](https://raw.github.com/Bartvds/mocha-unfunk-reporter/master/media/mocha-unfunk-04.png)

If you got development install you can use `$ grunt demo` to get a quick demo overview.


## Compatibility

### Assertion libraries

Tested with:

* [Chai Assertion Libary](http://chaijs.com) (best of the best, but no IE < 9)
* [Proclaim](https://github.com/rowanmanning/proclaim) (Chai-like `'assert'`, supports IE < 9)
* CommonJS-style `'assert'` (Node.js, browserify etc)

Should work with any assertion library, like:

* Expect.js (minimal reporting, use Chai's expect-style)
* Should.js (untested, use Chai's should-style)

Create an issue if you got a tip or see bugs.

### Mocha flavors:

Testing on:

* mocha (bin cli)
* [grunt-mocha](https://github.com/kmiyashiro/grunt-mocha) (grunt + phantomJS)
* [grunt-mocha-test](https://github.com/pghalliday/grunt-mocha-test) (grunt + node)

Known to work:

* grunt-simple-mocha (grunt + node)
* grunt-mocha-spawn (grunt + node)
* grunt-cafe-mocha (grunt + node)

Create an issue if you got a tip or request for more.

## Build

Unfunk-reporter is written in [TypeScript](http://typescript.com) and built using [grunt](http://gruntjs.com) and powered by [gruntfile-gtx](https://github.com/Bartvds/gruntfile-gtx).

Install development dependencies in your git checkout:
````
$ npm install
````

You need the global [grunt](http://gruntjs.com) command:
````
$ npm install grunt-cli -g
````

Build and run tests:
````
// build & display demo (handy for development)
$ grunt -h

// build & full test
$ grunt

// show gtx alias
$ grunt -h

// run test sub module
$ grunt gtx:diff
````

See the `Gruntfile` for additional commands.

## Versions

* 0.4.0 - externalised [unfunk-diff](https://github.com/Bartvds/unfunk-diff), using [ministyle](https://github.com/Bartvds/ministyle), [miniwrite](https://github.com/Bartvds/miniwrite), dropped obsolete code.
* 0.3.7 - fixed some bugs
* 0.3.6 - relaxed string encoding, cleaned stack code, support Q longStack, support multi-line messages, fixed bugs & hardened output, added `q` and `node.js` to stack filter.
* 0.3.0 - improved diffs (speed, linebreaks, escape with [jsesc](https://github.com/mathiasbynens/jsesc)), added output testing, added grunt task to set options, updated project
* 0.2.3 - support bash style uppercased+underscore-style ENV options (tip by @reydelamirienda), skip diff excessively lengthy objects (strings/arrays/arguments/buffers) 
* 0.2.2 - fixed regular Error (stack) reporting, added `chai-as-promised` & `mocha-as-promised` to stack filter, updated screenshot
* 0.2.1 - tweaked display, added pending test report (by @geekdave)
* 0.2.0 - added string diff, more assertions and runner compatibility, changed default to `style='ansi'`
* 0.1.13 - fix for grunt-mocha duration stats compatibility
* 0.1.12 - refactored options; added style and writer
* 0.1.11 - added mocha bin command test, improved reporting
* 0.1.10 - objectDiff fix, added option() methods
* 0.1.8 - compatible with grunt-mocha (PhantomJS)

## License

Copyright (c) 2013 Bart van der Schoor

Licensed under the MIT license.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/Bartvds/mocha-unfunk-reporter/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

