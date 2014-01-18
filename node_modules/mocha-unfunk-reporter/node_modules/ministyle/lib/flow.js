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

/*jshint -W003*/

(function () {
	'use strict';

	var core = require('./core');
	var common = require('./common');

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function isArray(obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// toggle flow
	function toggle(main, alt) {
		var mw = core.base();
		mw.enabled = true;
		mw.main = main;
		mw.alt = (alt || common.plain());
		mw.active = mw.main;

		mw.swap = function () {
			mw.active = (mw.active !== mw.main ? mw.main : mw.alt);
		};
		mw.error = function (str) {
			str = String(str);
			if (mw.enabled && mw.active) {
				return mw.active.error(str);
			}
			return str;
		};
		mw.warning = function (str) {
			str = String(str);
			if (mw.enabled && mw.active) {
				return mw.active.warning(str);
			}
			return str;
		};
		mw.success = function (str) {
			str = String(str);
			if (mw.enabled && mw.active) {
				return mw.active.error(str);
			}
			return str;
		};
		mw.accent = function (str) {
			str = String(str);
			if (mw.enabled && mw.active) {
				return mw.active.accent(str);
			}
			return str;
		};
		mw.signal = function (str) {
			str = String(str);
			if (mw.enabled && mw.active) {
				return mw.active.signal(str);
			}
			return str;
		};
		mw.muted = function (str) {
			str = String(str);
			if (mw.enabled && mw.active) {
				return mw.active.muted(str);
			}
			return str;
		};
		mw.plain = function (str) {
			str = String(str);
			if (mw.enabled && mw.active) {
				return mw.active.plain(str);
			}
			return str;
		};
		mw.toString = function () {
			return '<ministyle-toggle>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// peek with callback and control output
	function peek(callback, main, alt) {
		var mw = core.base();
		mw.enabled = true;
		mw.main = (main || common.plain());
		mw.alt = (alt || common.plain());
		mw.callback = (callback || function (str, def /*, type, main, alt*/) {
			return def(String(str));
		});

		mw.error = function (str) {
			str = String(str);
			if (mw.enabled && mw.callback) {
				var tmp = mw.callback(str, mw.main.error, 'error', mw.main, mw.alt);
				if (typeof tmp !== 'string') {
					return mw.main.error(str);
				}
				return tmp;
			}
			return mw.alt.error(str);
		};
		mw.warning = function (str) {
			str = String(str);
			if (mw.enabled && mw.callback) {
				var tmp = mw.callback(str, mw.main.warning, 'warning', mw.main, mw.alt);
				if (typeof tmp !== 'string') {
					return mw.main.warning(str);
				}
				return tmp;
			}
			return mw.alt.warning(str);
		};
		mw.success = function (str) {
			str = String(str);
			if (mw.enabled && mw.callback) {
				var tmp = mw.callback(str, mw.main.success, 'success', mw.main, mw.alt);
				if (typeof tmp !== 'string') {
					return mw.main.success(str);
				}
				return tmp;
			}
			return mw.alt.success(str);
		};
		mw.accent = function (str) {
			str = String(str);
			if (mw.enabled && mw.callback) {
				var tmp = mw.callback(str, mw.main.accent, 'accent', mw.main, mw.alt);
				if (typeof tmp !== 'string') {
					return mw.main.accent(str);
				}
				return tmp;
			}
			return mw.alt.accent(str);
		};
		mw.signal = function (str) {
			str = String(str);
			if (mw.enabled && mw.callback) {
				var tmp = mw.callback(str, mw.main.signal, 'signal', mw.main, mw.alt);
				if (typeof tmp !== 'string') {
					return mw.main.signal(str);
				}
				return tmp;
			}
			return mw.alt.accent(str);
		};
		mw.muted = function (str) {
			str = String(str);
			if (mw.enabled && mw.callback) {
				var tmp = mw.callback(str, mw.main.muted, 'muted', mw.main, mw.alt);
				if (typeof tmp !== 'string') {
					return mw.main.muted(str);
				}
				return tmp;
			}
			return mw.alt.muted(str);
		};
		mw.plain = function (str) {
			str = String(str);
			if (mw.enabled && mw.callback) {
				var tmp = mw.callback(str, mw.main.plain, 'plain', mw.main, mw.alt);
				if (typeof tmp !== 'string') {
					return mw.main.plain(str);
				}
				return tmp;
			}
			return mw.alt.plain(str);
		};
		// html encode?
		mw.wrap = function (str, style) {
			return '<span class="' + mw.prefix + style + '">' + str + '</span>';
		};
		mw.toString = function () {
			return '<ministyle-peek>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// pull though a stack of styles
	function stack(items) {
		var mw = core.base();
		mw.enabled = true;
		mw.stack = (isArray(items) ? items : Array.prototype.slice.call(arguments, 0));

		mw.error = function (str) {
			str = String(str);
			if (mw.enabled) {
				for (var i = 0, ii = mw.stack.length; i < ii; i++) {
					str = mw.stack[i].error(str);
				}
			}
			return str;
		};
		mw.warning = function (str) {
			str = String(str);
			if (mw.enabled) {
				for (var i = 0, ii = mw.stack.length; i < ii; i++) {
					str = mw.stack[i].warning(str);
				}
			}
			return str;
		};
		mw.success = function (str) {
			str = String(str);
			if (mw.enabled) {
				for (var i = 0, ii = mw.stack.length; i < ii; i++) {
					str = mw.stack[i].success(str);
				}
			}
			return str;
		};
		mw.accent = function (str) {
			str = String(str);
			if (mw.enabled) {
				for (var i = 0, ii = mw.stack.length; i < ii; i++) {
					str = mw.stack[i].accent(str);
				}
			}
			return str;
		};
		mw.signal = function (str) {
			str = String(str);
			if (mw.enabled) {
				for (var i = 0, ii = mw.stack.length; i < ii; i++) {
					str = mw.stack[i].signal(str);
				}
			}
			return str;
		};
		mw.muted = function (str) {
			str = String(str);
			if (mw.enabled) {
				for (var i = 0, ii = mw.stack.length; i < ii; i++) {
					str = mw.stack[i].muted(str);
				}
			}
			return str;
		};
		mw.plain = function (str) {
			str = String(str);
			if (mw.enabled) {
				for (var i = 0, ii = mw.stack.length; i < ii; i++) {
					str = mw.stack[i].plain(str);
				}
			}
			return str;
		};
		mw.toString = function () {
			return '<ministyle-stack>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// assemble exports
	var flow = {
		stack: stack,
		toggle: toggle,
		peek: peek
	};

	module.exports = flow;

}).call();

