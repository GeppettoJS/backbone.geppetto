define( [

], function () {

    var command = function () {
    };

    command.prototype.execute = function () {

        var messageText = this.eventData.message;
        var widgetId = this.context.model.get( "widgetId" );

        var fullMessage = widgetId + " : " + messageText;

        if ( this.eventName === "sendLocalMessage" ) {
            this.context.dispatch( "messageSent", {message:fullMessage} );
        } else if ( this.eventName === "sendParentMessage" ) {
            this.context.dispatchToParent( "messageSent", {message:fullMessage} );
        } else if ( this.eventName === "sendGlobalMessage" ) {
            this.context.dispatchGlobally( "messageSent", {message:fullMessage} );
        }

    };

    return command;
} );