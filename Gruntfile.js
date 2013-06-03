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

        blanket_qunit: {
            all: {
                options: {
                    urls: ['specs/index.html?coverage=true&gruntReport'],
                    threshold: 97
                }
            }

        },
        jshint: {
            all: ['Gruntfile.js', 'backbone.geppetto.js', 'specs/*.js']
        }
    } );

    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-blanket-qunit' );
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );

    grunt.registerTask( 'lint', ['jshint'] );
    grunt.registerTask( 'coverage', ['blanket_qunit'] );
    grunt.registerTask( 'travis', ['jshint', 'blanket_qunit'] );
    
    grunt.registerTask( 'default', ['uglify', 'jshint', 'blanket_qunit'] );
};
