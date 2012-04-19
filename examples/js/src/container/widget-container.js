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
            "click #clearWidgetButton":"onClearWidgetButtonClick"
        },

        onRender:function () {
            this.context = Geppetto.createContext( this.el, WidgetContainerContext );
            this.context.model = new Backbone.Model( {
                widgetCounter:0
            } );

            this.context.listen( "widgetCreated", this.onWidgetCreated );
            this.context.listen( "messageSent", this.onMessageSent );
            this.context.listen( "closeWidget", this.onCloseWidget );
            
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

            newWidget.render().done( function () {
                var el = $(newWidget.el);
                el.hide();
                that.$( "#widgets" ).append( newWidget.el );
                el.fadeIn(200);
            } );

            this.updateStats();
        },

        onMessageSent:function ( eventData ) {

            var newMessage = $( "<span>" + eventData.message + "<br></span>" );

            this.$( "#parent-messages" ).prepend( newMessage )
        },
        onCloseWidget:function ( eventData ) {
            var context = eventData.context;
            var el = context.el;
            Geppetto.removeContext(context);
            $(el).fadeOut(300, function() { $(el).remove(); });

            this.updateStats();
        },
        onClearWidgetButtonClick:function() {
            
            var that = this;
            
            $(".widget" ).each(function(){
                var context = Geppetto.getContext(this);
                that.onCloseWidget({context: context});
            });
        }
    } );

} );