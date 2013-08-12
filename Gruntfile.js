module.exports = function ( grunt ) {
    var pkgConfig = grunt.file.readJSON('package.json');
    pkgConfig.version = grunt.file.readJSON('version.json').version;
    grunt.initConfig( {

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
            all: [ 'specs/index.html' ],
            options: {
                threshold: 98,
                log: true,
                reporter: 'mocha-unfunk-reporter',
                mocha: {}
            }
        },
        version       : {
            defaults : {
                src : [
                    'package.json', 'bower.json', '<%= pkg.name %>.js'
                ]
            }
        }        
    } );

    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-blanket-mocha' );
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-version' );

    grunt.registerTask( 'lint', ['jshint'] );
    grunt.registerTask( 'coverage', ['blanket_mocha'] );
    grunt.registerTask( 'travis', ['jshint', 'blanket_mocha'] );
    
    grunt.registerTask( 'default', [ 'version', 'uglify', 'jshint', 'blanket_mocha'] );
};
