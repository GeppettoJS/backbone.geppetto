define( [
    "jquery",
    "underscore",
    "backbone",
    "geppetto"
], function ( $, _, Backbone, Geppetto ) {

    return Backbone.View.extend( {

        className:"messages",
        constructor: function(options) {
            this.options = options;
            return Backbone.View.apply(this, arguments);
        },
        initialize:function () {
            _.bindAll.apply(_, [this].concat(_.functions(this)));

            this.context = this.options.context;
            this.context.listen( this, "messageSent", this.onMessageSent );
        },

        onMessageSent:function ( eventData ) {
            var newMessage = $( "<span>" + eventData.message + "<br></span>" );
            this.$el.prepend( newMessage );
        }
    } );

} );