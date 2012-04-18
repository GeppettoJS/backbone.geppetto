define( [
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "geppetto",
    "text!src/container/widget-container.html",
    "src/container/widget-container-context"
], function ( $, _, Backbone, Marionette, Geppetto, WidgetContainerTemplate, WidgetContainerContext ) {

    return Marionette.ItemView.extend( {
        template:WidgetContainerTemplate,

        initialize:function () {
            _.bindAll( this );
        },

        events:{
            "click #addWidgetButton":"onAddWidgetButtonClick"
        },

        onRender:function () {
            this.context = Geppetto.createContext( this.el, WidgetContainerContext );
            this.context.model = new Backbone.Model( {
                widgetCounter:0
            } );

            this.context.listen( "widgetCreated", this.onWidgetCreated );
            this.context.listen( "messageSent", this.onMessageSent );
        },

        onAddWidgetButtonClick:function () {
            this.context.dispatch( "addWidget" );
        },

        onWidgetCreated:function ( eventData ) {
            var newWidget = eventData.widget;

            var that = this;

            newWidget.render().done( function () {
                that.$( "#widgets" ).append( newWidget.el );
            } );
        },

        onMessageSent:function ( eventData ) {

            var newMessage = $( "<span>" + eventData.message + "<br></span>" );

            this.$( "#parent-messages" ).prepend( newMessage )
        }
    } );

} );