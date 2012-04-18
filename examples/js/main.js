"use strict";

require.config( {
    paths:{
        jquery:'libs/jquery-1.7.1.min',
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
            "underscore",
            "backbone",
            "marionette",
            "geppetto",
            "myapp"

        ], function ( $, _, Backbone, Marionette, Geppetto, MyApp ) {

            $( function () {

                MyApp.render();

            } );
        }
);
