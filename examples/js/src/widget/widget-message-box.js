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

        render:function () {
//            this.context = Geppetto.getContext(this.el);
            this.context = this.options.context;
            this.context.listen( "messageSent", this.onMessageSent );

            return this;
        },

        onMessageSent:function ( eventData ) {
            var newMessage = $( "<span>" + eventData.message + "<br></span>" );
            this.$el.prepend( newMessage );
        }
    } );

} );