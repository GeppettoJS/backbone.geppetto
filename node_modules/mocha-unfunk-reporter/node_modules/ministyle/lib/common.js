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

//TODO find efficient code generator to cut down repetitive blocks
// without unnecessary property-by-string lookups or wrapper closures
//TODO freeze some props

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*jshint -W003 */
/*jshint -W115 */

(function () {
	'use strict';

	var core = require('./core');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// plain text
	function plain() {
		var mw = core.base();

		mw.plain = function (str) {
			return String(str);
		};
		mw.error = function (str) {
			return mw.plain(str);
		};
		mw.warning = function (str) {
			return mw.plain(str);
		};
		mw.success = function (str) {
			return mw.plain(str);
		};
		mw.accent = function (str) {
			return mw.plain(str);
		};
		mw.muted = function (str) {
			return mw.plain(str);
		};
		mw.toString = function () {
			return '<ministyle-plain>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//TODO inline wrap method

	// debug wrappers
	function dev() {
		var mw = core.base();
		mw.error = function (str) {
			return '[error|' + str + ']';
		};
		mw.warning = function (str) {
			return '[warng|' + str + ']';
		};
		mw.success = function (str) {
			return '[succs|' + str + ']';
		};
		mw.accent = function (str) {
			return '[accnt|' + str + ']';
		};
		mw.signal = function (str) {
			return '[signl|' + str + ']';
		};
		mw.muted = function (str) {
			return '[muted|' + str + ']';
		};
		mw.plain = function (str) {
			return'[plain|' + str + ']';
		};
		mw.toString = function () {
			return '<ministyle-dev>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// return empty spaces
	function empty() {
		var mw = plain();

		mw.plain = function (str) {
			str = String(str);
			var ret = '';
			for (var i = 0; i < str.length; i++) {
				ret += ' ';
			}
			return ret;
		};
		mw.toString = function () {
			return '<ministyle-empty>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// assemble exports
	var common = {
		plain: plain,
		dev: dev,
		empty: empty
	};

	module.exports = common;

}).call();

