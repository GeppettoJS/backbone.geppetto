/*

 miniwrite

 https://github.com/Bartvds/miniwrite

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

//TODO decide how to support monkey patch/mixin
//TODO freeze some props

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*jshint -W003*/

(function () {
	'use strict';

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function isArray(obj) {
		return (Object.prototype.toString.call(obj) === '[object Array]');
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function isMiniWrite(target) {
		return !!(target && typeof target === 'object' && typeof target.writeln === 'function');
	}

	function assertMiniWrite(target) {
		if (!target || !(typeof target === 'object' && typeof target.writeln === 'function')) {
			throw new Error('target is not a miniwrite: required methods: writeln()');
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var miniRoot = {
		writeln: function (/* line */) {
			//abstract
		},
		toString: function () {
			return '<miniwrite>';
		}
	};

	var miniBase = Object.create(miniRoot);

	function setBase(def) {
		assertMiniWrite(def);
		miniBase = def;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function base() {
		return Object.create(miniBase);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// allow writing per character, auto flush per line
	function chars(target, splitExp) {
		var inst = core.base();
		inst.textBuffer = '';
		inst.enabled = true;
		inst.splitExp = (splitExp || /(.*?)\r?\n/g);

		inst.useTarget = function (target) {
			inst.target = (target || {
				// dummy
				writeln: function () {
					//nothing
				}
			});
		};

		inst.clear = function () {
			inst.textBuffer = '';
			inst.splitExp.lastIndex = 0;
		};

		inst.write = function (str) {
			if (str === '') {
				return;
			}
			if (inst.enabled) {
				//fast path
				inst.textBuffer += str;
				inst.flush(true);
			}
		};

		inst.writeln = function (str) {
			if (inst.enabled) {
				//fast path
				if (arguments.length === 0) {
					inst.textBuffer += '\n';
				}
				else {
					inst.textBuffer += str + '\n';
				}
				inst.flush(true);
			}
		};

		inst.flush = function (linesOnly) {
			if (inst.textBuffer.length > 0) {
				var match;
				var end = 0;
				//TODO verify if we really need a capture group?
				//     instead not search for line break and use index + length of match + substing
				while ((match = inst.splitExp.exec(inst.textBuffer))) {
					inst.target.writeln(match[1]);
					end = match.index + (match[0].length || 1);
					inst.splitExp.lastIndex = end;
				}
				if (end > 0) {
					inst.textBuffer = inst.textBuffer.substring(end);
					inst.splitExp.lastIndex = 0;
				}
				if (!linesOnly && inst.textBuffer.length > 0) {
					inst.target.writeln(inst.textBuffer);
					inst.textBuffer = 0;
					inst.splitExp.lastIndex = 0;
				}
			}
		};

		inst.has = function () {
			return inst.textBuffer.length > 0;
		};

		inst.toString = function () {
			return '<miniwrite-chars>';
		};
		// use target
		inst.useTarget(target);
		return inst;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// allow writing per character, auto flush per line
	function splitter(target, splitExp) {
		var mw = core.base();
		mw.enabled = true;
		mw.splitExp = (splitExp || /\r?\n/g);
		mw.target = target;
		mw.writeln = function (str) {
			if (mw.enabled) {
				str = String(str);
				var start = 0;
				var match;

				mw.splitExp.lastIndex = 0;
				while ((match = mw.splitExp.exec(str))) {
					var line = str.substring(start, match.index);
					start = match.index + match[0].length;
					mw.splitExp.lastIndex = start;
					mw.target.writeln(line);
				}
				// append piece after final linebreak (or final blank line)
				if (start < str.length || start === str.length) {
					mw.target.writeln(str.substr(start));
				}
			}
		};
		mw.toString = function () {
			return '<miniwrite-splitter>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// control output
	function toggle(main, alt) {
		var mw = core.base();
		mw.main = main;
		mw.alt = (alt || function () {

		});
		mw.active = mw.main;
		mw.enabled = true;
		mw.swap = function () {
			mw.active = (mw.active !== mw.main ? mw.main : mw.alt);
		};
		mw.writeln = function (line) {
			if (!mw.enabled) {
				return;
			}
			if (mw.enabled) {
				mw.active.writeln(line);
			}
		};
		mw.toString = function () {
			return '<miniwrite-toggle>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// call multiple other writers
	function multi(list /*, ... */) {
		var mw = core.base();
		mw.targets = (isArray(list) ? list : Array.prototype.slice.call(arguments.length, 0));
		mw.enabled = true;
		mw.writeln = function (line) {
			if (mw.enabled) {
				for (var i = 0, ii = mw.targets.length; i < ii; i++) {
					mw.targets[i].writeln(line);
				}
			}
		};
		mw.toString = function () {
			return '<miniwrite-multi>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// use callback to transform
	function peek(target, callback) {
		var mw = core.base();
		mw.enabled = true;
		mw.target = target;
		mw.callback = (callback || function (line /*, mw*/) {
			return line;
		});
		mw.writeln = function (line) {
			if (mw.enabled && mw.callback) {
				line = mw.callback(line, mw);
				if (typeof line === 'string') {
					mw.target.writeln(line);
				}
			}
		};
		mw.toString = function () {
			return '<miniwrite-peek>';
		};
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// to extract as string (can wrap others)
	function buffer(patch) {
		var mw = (patch || core.base());
		mw.lines = [];
		mw.enabled = true;
		mw.writeln = function (line) {
			if (mw.enabled) {
				mw.lines.push(String(line));
			}
		};
		//TODO add wordwrap?
		mw.concat = function (seperator, indent, sepAfter) {
			if (mw.lines.length > 0) {
				sepAfter = (typeof sepAfter !== 'undefined' ? sepAfter : true);
				seperator = (typeof seperator !== 'undefined' ? seperator : '\n');
				indent = (typeof indent !== 'undefined' ? indent : '');
				return indent + mw.lines.join(seperator + indent) + (sepAfter ? seperator : '');
			}
			return '';
		};
		mw.clear = function () {
			mw.lines.length = 0;
		};
		if (!patch) {
			mw.toString = function () {
				return '<miniwrite-buffer>';
			};
		}
		return mw;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// assemble exports
	var core = {
		assertMiniWrite: assertMiniWrite,
		isMiniWrite: isMiniWrite,

		setBase: setBase,

		base: base,
		chars: chars,
		buffer: buffer,
		splitter: splitter,

		toggle: toggle,
		multi: multi,
		peek: peek
	};

	module.exports = core;

}).call();
