define( [
    "underscore",
    "backbone",
    "geppetto",
    "src/widget/send-message-command",
    "src/widget/change-color-command"
], function ( _, Backbone, Geppetto, SendMessageCommand, ChangeColorCommand ) {

    return Geppetto.Context.extend( {
        initialize:function () {

            this.model = new Backbone.Model( {
                widgetId:_.uniqueId( "Widget " )
            } );

            this.wireCommand( "sendLocalMessage", SendMessageCommand );
            this.wireCommand( "sendParentMessage", SendMessageCommand );
            this.wireCommand( "sendGlobalMessage", SendMessageCommand );
            this.wireCommand( "changeColor", ChangeColorCommand );
        }
    } );
} );
