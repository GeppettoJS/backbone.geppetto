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

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	var styleMap = {
		'error': 'error',
		'warning': 'warng',
		'success': 'succs',
		'accent': 'accnt',
		'signal': 'signl',
		'muted': 'muted',
		'plain': 'plain'
	};

	function getStyleNames() {
		return Object.keys(styleMap);
	}

	function getStyleShort() {
		return Object.keys(styleMap).map(function (name) {
			return styleMap[name];
		});
	}

	function getStyleMap() {
		return Object.keys(styleMap).reduce(function (memo, name) {
			memo[name] = styleMap[name];
			return memo;
		}, {});
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function plainString(str) {
		return String(str);
	}

	var miniRoot = {
		error: plainString,
		warning: plainString,
		success: plainString,
		accent: plainString,
		signal: plainString,
		muted: plainString,
		plain: plainString,
		toString: function () {
			return '<ministyle>';
		}
	};

	var miniBase = Object.create(miniRoot);

	function setBase(def) {
		assertMiniStyle(def);
		miniBase = def;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	function checkMiniStyle(target, first) {
		if (!target || typeof target !== 'object' || Array.isArray(target)) {
			return null;
		}
		var missing = [];
		var styleNames = getStyleNames();
		for (var i = 0; i < styleNames.length; i++) {
			if (typeof target[styleNames[i]] !== 'function') {
				if (first) {
					return null;
				}
				missing.push(styleNames[i]);
			}
		}
		return missing;
	}

	function isMiniStyle(target) {
		return !!checkMiniStyle(target, true);
	}

	function assertMiniStyle(target) {
		var dontHave = checkMiniStyle(target, false);
		if (!dontHave || dontHave.length > 0) {
			throw new Error('target is missing required methods: ' + dontHave.join());
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// factories
	function base() {
		return Object.create(miniBase);
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	// assemble exports
	var core = {
		assertMiniStyle: assertMiniStyle,
		checkMiniStyle: checkMiniStyle,
		isMiniStyle: isMiniStyle,
		getStyleNames: getStyleNames,
		getStyleShort: getStyleShort,
		getStyleMap: getStyleMap,
		setBase: setBase,

		base: base
	};

	module.exports = core;

}).call();

