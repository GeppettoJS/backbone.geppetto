module.exports = function(grunt) {

    var browsers = [
        {
            browserName: "firefox",
            platform: "XP"
        },        
        {
            browserName: "chrome",
            platform: "XP"
        },        
        {
            browserName: 'internet explorer',
            platform: 'WIN8'
        },
        {
            browserName: 'safari',
            platform: 'Mac 10.8'
        }                       
];
    
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
            }
        },
        "jsbeautifier": {
            files: ['beautify.json', 'Gruntfile.js', 'backbone.geppetto.js', 'specs/*.js'],
            options: {
                config: "beautify.json"
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
                    urls: ["http://localhost:9001/specs/index.html"],
                    build: process.env.TRAVIS_JOB_ID,
                    concurrency: 1,
                    detailedError: true,
                    browsers: browsers,
                    testname: "Backbone.Geppetto",
                    tags: ["master"]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-blanket-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-version');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-saucelabs');
    
    grunt.registerTask('beautify', ['jsbeautifier']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('coverage', ['blanket_mocha']);
    grunt.registerTask('travis', ['jshint', 'blanket_mocha', 'connect', 'saucelabs-mocha']);
    grunt.registerTask("sauce", ['connect', 'saucelabs-mocha']);

    grunt.registerTask('default', ['version', 'uglify', 'jshint', 'blanket_mocha']);
};
