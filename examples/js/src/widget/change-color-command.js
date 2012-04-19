define( [

], function () {

    var command = function () {};

    command.prototype.execute = function () {

        var colorInHex = this.getRandomColor();
        this.context.model.set( "color", colorInHex );
        
    };

    command.prototype.getRandomColor = function () {
        // thanks to paul irish - http://paulirish.com/2009/random-hex-color-code-snippets/        
        return '#' + Math.floor( Math.random() * 16777215 ).toString( 16 );
    };    
    
    return command;
} );
