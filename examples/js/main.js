"use strict";

require.config( {
    paths:{
        jquery:'libs/jquery-1.7.1.min',
        livequery: 'libs/jquery.livequery',
        underscore:'libs/underscore',
        backbone:'libs/backbone',
        marionette:'libs/backbone.marionette',
        geppetto:'libs/backbone.geppetto',
        text:'libs/text',
        myapp:"src/my-app"
    }
} );

require(
        [
            // external libraries with AMD support

            "jquery",
            "livequery",
            "underscore",
            "backbone",
            "marionette",
            "geppetto",
            "myapp"

        ], function ( $, LiveQuery, _, Backbone, Marionette, Geppetto, MyApp ) {

            $( function () {

                // expose context map as public property so that 
                // we can monitor the number of contexts and events
                Geppetto.setDebug(true);
                
                MyApp.render();

            } );
        }
);
