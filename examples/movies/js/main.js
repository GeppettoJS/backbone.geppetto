"use strict";

require.config( {
    paths:{
        jquery: '../../../bower_components/jquery/jquery',
        underscore: '../../../bower_components/underscore/underscore',
        backbone: '../../../bower_components/backbone/backbone',
        geppetto: '../../../backbone.geppetto',
        handlebars: '../../../bower_components/handlebars/handlebars',
        mockjax: '../../../bower_components/jquery-mockjax/jquery.mockjax',
        text: '../../../bower_components/requirejs-text/text'
    },
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
        },
        handlebars: {
           exports: 'Handlebars'
        },
        mockjax: {
           deps: ['jquery'],
           exports: 'Mockjax'
        }
	}
} );

require(
        [
            // external libraries with AMD support

            "jquery",
            "underscore",
            "backbone",
            "geppetto",
            "views/containerView"

        ], function ( $, _, Backbone, Geppetto, ContainerView ) {

            $( function () {

                $( "#loadingSpinner" ).hide();

                // expose context map as public property so that 
                // we can monitor the number of contexts and events
                Geppetto.setDebug(true);

                var mainView = new ContainerView();
                mainView.render();
                mainView.$el.appendTo('body');

            } );
        }
);
