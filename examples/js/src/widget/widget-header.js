define( [
    "marionette",
    "text!src/widget/widget-header-template.html"
], function ( Marionette, WidgetHeaderTemplate ) {

    return Marionette.ItemView.extend( {
        template:WidgetHeaderTemplate,

        initialize:function () {
            this.context = this.options.context;
            this.model = this.context.model;
        }
    } );

} );