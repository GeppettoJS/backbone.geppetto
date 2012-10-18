"use strict";

require.config( {
    paths:{
        jquery:'../../dependencies/jquery',
        underscore:'../../dependencies/underscore',
        backbone:'../../dependencies/backbone',
        eventbinder:'../../dependencies/backbone.eventbinder',
        wreqr:'../../dependencies/backbone.wreqr',
        marionette:'../../dependencies/backbone.marionette',
        geppetto:'../../backbone.geppetto',
        text:'../../dependencies/text',
        myapp:"src/my-app"
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
            "myapp"

        ], function ( $, _, Backbone, EventBinder, Wreqr, Marionette, Geppetto, MyApp ) {

            $( function () {

                // expose context map as public property so that 
                // we can monitor the number of contexts and events
                Geppetto.setDebug(true);
                
                MyApp.render();

            } );
        }
);
