/*globals QUnit require*/

// Defer QUnit startup until dependencies have been loaded with RequireJS
//QUnit.config.autostart = false;

// Allow QUnit to use global scope, which RequireJS needs to inject dependencies
//QUnit.specify.globalApi = true;

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

require(
    [
        // external libraries with AMD support

        "jquery",
        "underscore",
        "backbone",
        "geppetto",
        "geppetto-specs",
        "injector-specs"

    ], function() {
        mocha.run();
    }
);
