define( [
    "geppetto",
    "src/container/add-widget-command"
], function ( Geppetto, AddWidgetCommand ) {

    return Geppetto.Context.extend( {
        initialize:function () {
            this.wireCommand( "addWidget", AddWidgetCommand );
        }
    } );
} );
