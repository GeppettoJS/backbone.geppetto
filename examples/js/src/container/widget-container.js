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
            "click #addWidgetButton":"onAddWidgetButtonClick",
            "click #clearWidgetButton":"onClearWidgetButtonClick",
            "click #changeColorsButton":"onChangeColorsButtonClick"
        },

        onRender:function () {

            Geppetto.bindContext({
                view: this,
                context: WidgetContainerContext
            });            
            
            this.context.model = new Backbone.Model( {
                widgetCounter:0
            } );

            this.context.listen( this, "widgetCreated", this.onWidgetCreated );
            this.context.listen( this, "messageSent", this.onMessageSent );
            this.context.listen( this, Geppetto.EVENT_CONTEXT_SHUTDOWN, this.onCloseWidget );
            
            this.updateStats();
        },

        updateStats: function() {
            this.$("#numContexts" ).text(Geppetto.debug.countContexts());
            this.$("#numEvents" ).text(Geppetto.debug.countEvents());
        },
        
        onAddWidgetButtonClick:function () {
            this.context.dispatch( "addWidget" );
        },

        onWidgetCreated:function ( eventData ) {
            var newWidget = eventData.widget;

            var that = this;

            newWidget.on("render", ( function () {
                var el = $(newWidget.el);
                that.$( "#widgets" ).append( newWidget.el );
            } ));

            newWidget.render();
            
            this.updateStats();
        },
        
        onMessageSent:function ( eventData ) {
            var newMessage = $( "<span>" + eventData.message + "<br></span>" );
            this.$( "#parent-messages" ).prepend( newMessage )
        },
        
        onCloseWidget:function ( eventData ) {
            this.updateStats();
        },
        
        onClearWidgetButtonClick:function() {            
            this.context.dispatchGlobally("shutdownWidget");            
        },
        
        onChangeColorsButtonClick:function() {
            this.context.dispatchGlobally("changeColor");
        }
    } );

} );