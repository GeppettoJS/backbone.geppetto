define( [
    "jquery",
    "underscore",
    "backbone",
    "geppetto"
], function ( $, _, Backbone, Geppetto ) {

    return Backbone.View.extend( {

        className:"messages",

        initialize:function () {
            _.bindAll( this );

            this.context = this.options.context;
            this.context.listen( "messageSent", this.onMessageSent );
        },

        onMessageSent:function ( eventData ) {
            var newMessage = $( "<span>" + eventData.message + "<br></span>" );
            this.$el.prepend( newMessage );
        }
    } );

} );