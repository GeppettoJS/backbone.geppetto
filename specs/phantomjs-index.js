/*global phantom, window */

var fs = require('fs'),
	system = require('system'),
	page = require('webpage').create(),
	file = fs.absolute((system.args.length > 1 && system.args[1]) || 'specs/index.html');

page.onConsoleMessage = function (msg) {
	console.log(msg);
	if (/^Tests completed in/.test(msg)) {
		phantom.exit(page.evaluate(function () {
			if (window.QUnit && QUnit.config && QUnit.config.stats) {
				return QUnit.config.stats.bad || 0;
			}
			return 1;
		}));
	}
};

page.open('file://' + file, function (status) {
	if (status !== 'success') {
		console.log('FAIL to load the address');
		phantom.exit(1);
	}
});