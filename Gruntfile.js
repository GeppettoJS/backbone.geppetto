module.exports = function ( grunt ) {
    grunt.initConfig( {
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

    grunt.loadNpmTasks('grunt-blanket-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('coverage', ['blanket_qunit']);
    grunt.registerTask('default', ['jshint', 'blanket_qunit']);
};
