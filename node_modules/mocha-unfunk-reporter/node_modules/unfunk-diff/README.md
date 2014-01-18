# unfunk-diff

[![Build Status](https://secure.travis-ci.org/Bartvds/unfunk-diff.png?branch=master)](http://travis-ci.org/Bartvds/unfunk-diff) [![Dependency Status](https://gemnasium.com/Bartvds/unfunk-diff.png)](https://gemnasium.com/Bartvds/unfunk-diff) [![NPM version](https://badge.fury.io/js/unfunk-diff.png)](http://badge.fury.io/js/unfunk-diff)

> Object & String diff formatter for all displays

## What?

The diff renderers on npm (either object diff or string diffs) are not usable on displays without colour support. Object diffs usually lack a string diff representation which makes it difficult to spot subtle changes in string values deep in the objects structure. Unfunk-diff aims to integrate both to allow debugging of object and string differences, optionally without colour support.

* String-diff algorithm is [jsDiff](https://github.com/kpdecker/jsdiff). 
* Object-diff algorithm is [objectDiff](https://github.com/NV/objectDiff.js) with nested string-diff. May currently be even stricter then your assertions!
* Style output abstracted by [ministyle](https://github.com/Bartvds/ministyle).

## Examples

See the [travis-ci build log](https://travis-ci.org/Bartvds/unfunk-diff) for various examples (tests displayed with [mocha-unfunk-reporter](https://github.com/Bartvds/mocha-unfunk-reporter)).

## Usage

Install from npm:

````
$ npm install unfunk-diff
```` 

(it could work browser except I never got around to fix that)

## API

Minimal:

````js
console.log(formatter.ansi(valueA, valueB));
console.log(formatter.plain(valueA, valueB));
````

Full version:

````js
// get the constructor
var DiffFormatter = require('unfunk-diff').DiffFormatter;

// get a ministyle
var style = require('ministyle').css();

// pass the ministyle and line wrapping width
var formatter = new DiffFormatter(style, 80);

// get the wrapped diff
var str = formatter.getStyledDiff(valueA, valueB);
console.log(str);
````

## Build

Unfunk-diff is written in [TypeScript](http://typescript.com) and built with [grunt](http://gruntjs.com) using [grunt-ts](https://github.com/basarat/grunt-ts).

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
$ grunt
````

See the `Gruntfile` for additional commands, including many mocha runners.

## Versions

* 0.0.1 - Extracted from [mocha-unfunk-reporter](https://github.com/Bartvds/mocha-unfunk-reporter)

## Credit

* String diff from [jsDiff](https://github.com/kpdecker/jsdiff) by Kevin Decker
* Object diff from [objectDiff](https://github.com/NV/objectDiff.js) by Nikita Vasilyev

## License

Copyright (c) 2013 Bart van der Schoor

Licensed under the MIT license.