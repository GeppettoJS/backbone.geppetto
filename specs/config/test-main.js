"use strict";

// Defer QUnit startup until dependencies have been loaded with RequireJS
QUnit.config.autostart = false;

// Allow QUnit to use global scope, which RequireJS needs to inject dependencies
QUnit.specify.globalApi = true;

require.config( {
    paths:{
        jquery:'../../dependencies/jquery',
        underscore:'../../dependencies/underscore',
        backbone:'../../dependencies/backbone',
        eventbinder:'../../dependencies/backbone.eventbinder',
        wreqr:'../../dependencies/backbone.wreqr',
        marionette:'../../dependencies/backbone.marionette',
        geppetto:'../../backbone.geppetto',
        text:'../../dependencies/text'
    },

    shim: {
        "marionette": ["eventbinder"]
    }
} );

require(
        [
            // external libraries with AMD support

            "jquery",
            "underscore",
            "backbone",
            "eventbinder",
            "wreqr",
            "marionette",
            "geppetto",
            "../geppetto-specs"

        ], function ( $, _, Backbone, EventBinder, Wreqr, Marionette, Geppetto, MyApp ) {

            $( function () {
                QUnit.start();
            });
        }
);
