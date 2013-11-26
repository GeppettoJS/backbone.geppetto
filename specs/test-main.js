/*globals require*/

require.config({
    paths: {
        jquery: '../dependencies/jquery',
        underscore: '../dependencies/underscore',
        backbone: '../dependencies/backbone',
        geppetto: '../backbone.geppetto',
        text: '../dependencies/text'
    },

    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

require([
    "jquery",
    "underscore",
    "backbone",
    "geppetto",
    "src/geppetto-specs",
    "src/resolver-specs",
    "src/deprecation-specs"
], function() {
    mocha.run();
});
