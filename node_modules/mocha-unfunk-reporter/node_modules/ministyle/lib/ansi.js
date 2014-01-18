/*

 ministyle

 https://github.com/Bartvds/ministyle

 Copyright (c) 2013 Bart van der Schoor

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*jshint -W003 */
/*jshint -W115 */

(function () {
	'use strict';

	var core = require('./core');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//for console logging
	function ansi() {
		var mw = core.base();

		mw.error = function (str) {
			return '\x1B[31m' + str + '\x1B[0m';
		};
		mw.warning = function (str) {
			return '\x1B[33m' + str + '\x1B[0m';
		};
		mw.success = function (str) {
			return '\x1B[32m' + str + '\x1B[0m';
		};
		mw.accent = function (str) {
			return '\x1B[36m' + str + '\x1B[0m';
		};
		mw.signal = function (str) {
			return '\x1B[35m' + str + '\x1B[0m';
		};
		mw.muted = function (str) {
			return '\x1B[90m' + str + '\x1B[0m';
		};
		mw.plain = function (str) {
			return String(str);
		};
		mw.toString = function () {
			return '<ministyle-ansi>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// for console logging (depending on colors.js getters)
	function colorjs() {
		//TODO assert props?
		var mw = core.base();

		mw.error = function (str) {
			return String(str).red;
		};
		mw.warning = function (str) {
			return String(str).yellow;
		};
		mw.success = function (str) {
			return String(str).green;
		};
		mw.accent = function (str) {
			return String(str).cyan;
		};
		mw.signal = function (str) {
			return String(str).magenta;
		};
		mw.muted = function (str) {
			return String(str).grey;
		};
		mw.plain = function (str) {
			return String(str);
		};
		mw.toString = function () {
			return '<ministyle-colorjs>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// assemble exports
	var common = {
		ansi: ansi,
		colorjs: colorjs,
		grunt: colorjs
	};

	module.exports = common;

}).call();

