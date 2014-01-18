module.exports = function (grunt) {
	'use strict';

	var path = require('path');

	grunt.registerMultiTask('mocha_unfunk', 'change unfunk-reporter options', function () {
		var options = this.options({
			style: 'ansi'
		});
		require(path.resolve(__dirname, '..')).option(options);
		grunt.util._.forEach(function (value, name) {
			process.env['MOCHA_UNFUNK_' + name.toUpperCase()] = value;
		});
	});
};
