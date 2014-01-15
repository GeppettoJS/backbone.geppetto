define( [
    "src/widget/widget-view"
], function ( WidgetView ) {

    var command = function () {
    };

    command.prototype.execute = function () {

        var randomColor = this.getRandomColor();

        var widgetCounter = this.context.model.get( "widgetCounter" );
        widgetCounter = widgetCounter + 1;
        var uniqueId = "Widget " + widgetCounter;

        var newWidget = new WidgetView( {

            model:new Backbone.Model( {
                color:randomColor,
                widgetId:uniqueId
            } ),

            parentContext:this.context
        } );

        this.context.model.set( "widgetCounter", widgetCounter );

        this.context.dispatch( "widgetCreated", {widget:newWidget} );
    };

    command.prototype.getRandomColor = function () {
        // thanks to paul irish - http://paulirish.com/2009/random-hex-color-code-snippets/        
        return '#' + Math.floor( Math.random() * 16777215 ).toString( 16 );
    };

    return command;
} );