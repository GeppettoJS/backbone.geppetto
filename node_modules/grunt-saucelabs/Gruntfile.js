module.exports = function(grunt) {
	var browsers = [{
		browserName: 'firefox',
		version: '19',
		platform: 'XP'
	}, {
		browserName: 'chrome',
		platform: 'XP'
	}, {
		browserName: 'chrome',
		platform: 'linux'
	}, {
		browserName: 'internet explorer',
		platform: 'WIN8',
		version: '10'
	}, {
		browserName: 'internet explorer',
		platform: 'VISTA',
		version: '9'
	}, {
		browserName: 'internet explorer',
		platform: 'XP',
		version: '8'
	}, {
		browserName: 'opera',
		platform: 'Windows 2008',
		version: '12'
	}];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				jshintrc: __dirname + '/.jshintrc'
			},
			files: ['bin/grunt-saucelabs-qunit',
				'tasks/**/*.js',
				'test/qunit/grunt-saucelabs-inject.js',
				'Gruntfile.js']
		},
		connect: {
			server: {
				options: {
					base: 'test',
					port: 9999
				}
			}
		},

		'saucelabs-yui': {
			all: {
				//username: '',
				//key: '',
				options: {
					urls: ['http://127.0.0.1:9999/yui/index.html'],
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID,
					concurrency: 3,
					browsers: browsers,
					testname: "yui tests"
				}
			}
		},
		'saucelabs-mocha': {
			all: {
				//username: '',
				//key: '',
				options: {
					urls: ['http://127.0.0.1:9999/mocha/test/browser/opts.html'],
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID,
					concurrency: 3,
					browsers: browsers,
					testname: "mocha tests"
				}
			}
		},
		'saucelabs-qunit': {
			all: {
				//username: '',
				//key: '',
				options: {
					urls: ['http://127.0.0.1:9999/qunit/index.html', 'http://127.0.0.1:9999/qunit/logs.html'],
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID,
					concurrency: 3,
					browsers: browsers,
					testname: "qunit tests"
				}
			}
		},
		'saucelabs-jasmine': {
			all: {
				//username: 'parashu',
				//key: '',
				options: {
					urls: ['http://127.0.0.1:9999/jasmine/SpecRunner.html', 'http://127.0.0.1:9999/jasmine/SpecRunnerDos.html'],
					tunnelTimeout: 5,
					build: process.env.TRAVIS_JOB_ID,
					concurrency: 3,
					browsers: browsers,
					testname: "jasmine tests"
				}
			}
		},
		watch: {}
	});

	grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	var testjobs = ['jshint', 'connect'];
	if (typeof process.env.SAUCE_ACCESS_KEY !== 'undefined'){
		testjobs = testjobs.concat(['saucelabs-qunit', 'saucelabs-jasmine', 'saucelabs-yui', 'saucelabs-mocha']);
	}

	grunt.registerTask('test', testjobs);
	grunt.registerTask('default', ['test']);
};