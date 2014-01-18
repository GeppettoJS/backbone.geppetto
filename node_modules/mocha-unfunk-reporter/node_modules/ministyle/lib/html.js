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

(function () {
	'use strict';

	var core = require('./core');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//TODO find where we took this and give credit (google/so :)
	function escapeHTML(html) {
		return String(html)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//TODO inline wrap method

	// html output (unsafe)
	function html(escape) {
		var mw = core.base();

		mw.error = function (str) {
			return mw.wrap(str, 'red');
		};
		mw.warning = function (str) {
			return mw.wrap(str, 'yellow');
		};
		mw.success = function (str) {
			return mw.wrap(str, 'green');
		};
		mw.accent = function (str) {
			return mw.wrap(str, 'cyan');
		};
		mw.signal = function (str) {
			return mw.wrap(str, 'magenta');
		};
		mw.muted = function (str) {
			return mw.wrap(str, 'grey');
		};
		mw.wrap = function (str, style) {
			return '<span style="color:' + style + '">' + str + '</span>';
		};
		if (escape) {
			mw.plain = function (str) {
				return '<span>' + escapeHTML(str) + '</span>';
			};
			mw.wrap = function (str, style) {
				return '<span style="color:' + style + '">' + escapeHTML(str) + '</span>';
			};
		} else {
			mw.plain = function (str) {
				return '<span>' + escapeHTML(str) + '</span>';
			};
			mw.wrap = function (str, style) {
				return '<span style="color:' + style + '">' + str + '</span>';
			};
		}
		mw.toString = function () {
			return '<ministyle-html>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// css classes output (unsafe)
	function css(prefix, escape) {
		var mw = core.base();
		mw.prefix = (typeof prefix !== 'undefined' ? prefix : 'mw-');
		mw.error = function (str) {
			return mw.wrap(str, 'error');
		};
		mw.warning = function (str) {
			return mw.wrap(str, 'warning');
		};
		mw.success = function (str) {
			return mw.wrap(str, 'success');
		};
		mw.accent = function (str) {
			return mw.wrap(str, 'accent');
		};
		mw.signal = function (str) {
			return mw.wrap(str, 'signal');
		};
		mw.muted = function (str) {
			return mw.wrap(str, 'muted');
		};
		mw.plain = function (str) {
			return mw.wrap(str, 'plain');
		};
		// html encode?
		if (escape) {
			mw.wrap = function (str, style) {
				return '<span class="' + mw.prefix + style + '">' + escapeHTML(str) + '</span>';
			};
		} else {
			mw.wrap = function (str, style) {
				return '<span class="' + mw.prefix + style + '">' + str + '</span>';
			};
		}
		mw.toString = function () {
			return '<ministyle-css>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// assemble exports
	var common = {
		html: html,
		css: css
	};

	module.exports = common;

}).call();

