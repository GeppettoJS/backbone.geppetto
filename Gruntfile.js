module.exports = function(grunt) {
  grunt.initConfig({
    qunit: {
      all: ['specs/index.html']
    },
    jshint: {
      all: ['Gruntfile.js', 'backbone.geppetto.js', 'specs/*.js']
    }    
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['qunit', 'jshint']);

};
