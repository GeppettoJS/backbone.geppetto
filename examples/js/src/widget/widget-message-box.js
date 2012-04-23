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
        },

        onContextReady:function (context) {
            this.context = context;
            this.context.listen( "messageSent", this.onMessageSent );
        },

        render:function () {

            Geppetto.getContext( this.el, this.onContextReady );
            return this;
        },

        onMessageSent:function ( eventData ) {
            var newMessage = $( "<span>" + eventData.message + "<br></span>" );
            this.$el.prepend( newMessage );
        }
    } );

} );