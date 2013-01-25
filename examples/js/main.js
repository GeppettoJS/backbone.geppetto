"use strict";

require.config( {
    paths:{
        jquery:'../../dependencies/jquery',
        underscore:'../../dependencies/underscore',
        backbone:'../../dependencies/backbone',
        marionette:'../../dependencies/backbone.marionette',
		'backbone.wreqr':'../../dependencies/backbone.wreqr',
		'backbone.babysitter':'../../dependencies/backbone.babysitter',
        geppetto:'../../backbone.geppetto',
        text:'../../dependencies/text',
        myapp:"src/my-app"
    },
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore'],
			exports: 'Backbone'
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
