module.exports = function ( grunt ) {
    grunt.initConfig( {

        pkg: grunt.file.readJSON( 'package.json' ),
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
                threshold: 97,
                log: true,
                reporter: 'Spec',
                mocha: {}
            }
        }
    } );

    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-blanket-mocha' );
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );

    grunt.registerTask( 'lint', ['jshint'] );
    grunt.registerTask( 'coverage', ['blanket_mocha'] );
    grunt.registerTask( 'travis', ['jshint', 'blanket_mocha'] );

    grunt.registerTask( 'default', ['uglify', 'jshint', 'blanket_mocha'] );
};
