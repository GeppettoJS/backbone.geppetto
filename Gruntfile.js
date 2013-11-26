module.exports = function(grunt) {

    var browsers = [{
        browserName: "firefox",
        version: "22",
        platform: "XP"
    }, {
        browserName: "firefox",
        version: "21",
        platform: "XP"
    }, {
        browserName: "chrome",
        version: "29",
        platform: "XP"
    }, {
        browserName: "chrome",
        version: "28",
        platform: "Mac 10.6"
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
        browserName: 'internet explorer',
        platform: 'XP',
        version: '7'
    }, {
        browserName: 'internet explorer',
        platform: 'XP',
        version: '6'
    }, {
        browserName: 'safari',
        platform: 'Mac 10.8',
        version: '6'
    }, {
        browserName: 'safari',
        platform: 'Mac 10.6',
        version: '5'
    }, {
        browserName: 'iphone',
        platform: 'Mac 10.8',
        version: '6'
    }, {
        browserName: 'iphone',
        platform: 'Mac 10.8',
        version: '5.1'
    }, {
        browserName: 'ipad',
        platform: 'Mac 10.8',
        version: '6'
    }, {
        browserName: 'ipad',
        platform: 'Mac 10.8',
        version: '5.1'
    }];

    var pkgConfig = grunt.file.readJSON('package.json');
    pkgConfig.version = grunt.file.readJSON('version.json').version;
    grunt.initConfig({

        pkg: pkgConfig,
        uglify: {
            dist: {
                options: {
                    report: "gzip"
                },
                src: '<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'backbone.geppetto.js', 'specs/*.js']
        },

        blanket_mocha: {
            all: ['specs/index.html'],
            options: {
                threshold: 98,
                log: true,
                reporter: 'mocha-unfunk-reporter',
                mocha: {}
            }
        },
        version: {
            defaults: {
                src: [
                    'package.json', 'bower.json', '<%= pkg.name %>.js'
                ]
            },
            banner: {
                src: [
                    '<%= pkg.name %>.js'
                ],
                options: {
                    prefix: "^\/\/ <%= pkg.name %> "
                }
            }
        },
        "jsbeautifier": {
            fix: {
                src: ['beautify.json', 'Gruntfile.js', 'backbone.geppetto.js', 'specs/*.js'],
                options: {
                    config: "beautify.json"
                }
            },
            check: {
                src: ['beautify.json', 'Gruntfile.js', 'backbone.geppetto.js', 'specs/*.js'],
                options: {
                    config: "beautify.json",
                    mode: "VERIFY_ONLY"
                }
            }
        },
        connect: {
            options: {
                port: 9001,
                hostname: 'localhost',
                base: '.'
            },
            test: {}
        },
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            test: [
                'connect:test:keepalive', 'open:test'
            ]
        },
        open: {
            test: {
                path: 'http://localhost:9001/specs/index.html'
            }
        },
        'saucelabs-mocha': {
            all: {
                options: {
                    urls: ["http://localhost:9001/specs/sauce.html"],
                    build: process.env.TRAVIS_JOB_ID || new Date().getTime(),
                    concurrency: 1,
                    detailedError: true,
                    browsers: browsers,
                    testname: "Backbone.Geppetto",
                    tags: ["master"]
                }
            }
        }
    });

    // Loading dependencies
    for (var key in grunt.file.readJSON("package.json").devDependencies) {
        if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
    }

    grunt.registerTask('beautify', ['jsbeautifier:fix']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('coverage', ['blanket_mocha']);
    grunt.registerTask('travis', ['jsbeautifier:check', 'jshint', 'blanket_mocha', 'connect']);
    grunt.registerTask("sauce", ['connect', 'saucelabs-mocha']);

    grunt.registerTask('default', ['version', 'jsbeautifier:fix', 'uglify', 'jshint', 'blanket_mocha']);
};
