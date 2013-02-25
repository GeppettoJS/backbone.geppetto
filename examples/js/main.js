"use strict";

require.config( {
    paths:{
        jquery:'lib/dependencies/jquery',
        underscore:'lib/dependencies/underscore',
        backbone:'lib/dependencies/backbone',
        marionette:'lib/dependencies/backbone.marionette',
		'backbone.wreqr':'lib/dependencies/backbone.wreqr',
		'backbone.babysitter':'lib/dependencies/backbone.babysitter',
        geppetto:'lib/backbone.geppetto',
        text:'lib/dependencies/text',
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
