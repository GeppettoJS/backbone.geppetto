define( [
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "geppetto",
    "src/container/widget-container"
], function ( $, _, Backbone, Marionette, Geppetto, WidgetContainer ) {

    $( "#loadingSpinner" ).hide();

    Backbone.Marionette.TemplateCache.loadTemplate = function ( template, callback ) {

        // marionette expects the "template" param to be the ID of a template. 
        // instead, with RequireJS, we are handed the full text of the template,
        // so we need to override the way we load it...

        var compiledTemplate = _.template( template );
        callback.call( this, compiledTemplate );
    };

    Backbone.Marionette.Renderer.renderTemplate = function ( template, data ) {
        return template( data );
    };

    var app = new WidgetContainer( {
        el:"body"
    } );

    return app;
} );