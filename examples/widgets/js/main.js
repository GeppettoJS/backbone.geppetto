"use strict";

require.config( {
    paths:{
        jquery: '../../../bower_components/jquery/jquery',
        underscore: '../../../bower_components/underscore/underscore',
        backbone: '../../../bower_components/backbone/backbone',
        marionette: '../../../bower_components/marionette/lib/backbone.marionette',
        geppetto: '../../../backbone.geppetto',
        text: '../../../bower_components/requirejs-text/text',
        myapp: 'src/my-app'
    },
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
        marionette: {
            deps: ['backbone'],
            exports: 'Marionette'
        }
	}

} );

require(
        [
            // external libraries with AMD support

            "jquery",
            "underscore",
            "backbone",
            "marionette",
            "geppetto",
            "myapp"

        ], function ( $, _, Backbone, Marionette, Geppetto, MyApp ) {

            $( function () {

                // expose context map as public property so that 
                // we can monitor the number of contexts and events
                Geppetto.setDebug(true);

                MyApp.render();

            } );
        }
);
