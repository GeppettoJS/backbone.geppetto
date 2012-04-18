define( [
    "jquery",
    "underscore",
    "marionette",
    "geppetto",
    "text!src/widget/widget-template.html",
    "src/widget/widget-context",
    "src/widget/widget-message-box"
], function ( $, _, Marionette, Geppetto, WidgetTemplate, WidgetContext, WidgetMessageBox ) {

    return Marionette.ItemView.extend( {
        template:WidgetTemplate,

        className:"widget",

        events:{
            "click .sendLocalButton":"onLocalButtonClick",
            "click .sendParentButton":"onParentButtonClick",
            "click .sendGlobalButton":"onGlobalButtonClick"
        },

        initialize:function () {
            _.bindAll( this );
            this.model = this.options.model;
        },

        onRender:function () {
            this.$el.css( "background-color", this.model.get( "color" ) );

            this.context = Geppetto.createContext( this.el, WidgetContext, this.options.parentContext );
            this.context.model = this.model;

            this.context.listen( "messageSent", this.onMessageSent );

//            var header = new WidgetHeader({
//                context: this.context    
//            });
//
//            var that = this;
//            
//            header.render().done(function(){
//                that.$el.prepend(header.el);    
//            });
//            


            var messageBox = new WidgetMessageBox( {
                context:this.context
            } );

            this.$el.append( messageBox.render().$el );
        },

        onLocalButtonClick:function () {
            var messageText = this.$( ".messagebox" ).val();
            this.context.dispatch( "sendLocalMessage", {message:messageText} );
        },

        onParentButtonClick:function () {
            var messageText = this.$( ".messagebox" ).val();
            this.context.dispatch( "sendParentMessage", {message:messageText} );
        },

        onGlobalButtonClick:function () {
            var messageText = this.$( ".messagebox" ).val();
            this.context.dispatch( "sendGlobalMessage", {message:messageText} );
        }
    } );

} );