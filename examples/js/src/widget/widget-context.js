define( [
    "underscore",
    "backbone",
    "geppetto",
    "src/widget/send-message-command"
], function ( _, Backbone, Geppetto, SendMessageCommand ) {

    return Geppetto.Context.extend( {
        initialize:function () {

            this.model = new Backbone.Model( {
                widgetId:_.uniqueId( "Widget " )
            } );

            this.mapCommand( "sendLocalMessage", SendMessageCommand );
            this.mapCommand( "sendParentMessage", SendMessageCommand );
            this.mapCommand( "sendGlobalMessage", SendMessageCommand );
        }
    } );
} );
  