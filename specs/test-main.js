/*globals require*/

require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        underscore: '../bower_components/underscore/underscore',
        backbone: '../bower_components/backbone/backbone',
        geppetto: '../backbone.geppetto',
        text: '../bower_components/requirejs-text/text'
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
    "src/resolver-specs"
], function() {

    chai.Assertion.includeStack = true;

    mocha.run();
});
