// Copyright (C) 2012 Model N, Inc.  
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
// associated documentation files (the "Software"), to deal in the Software without restriction, including 
// without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to 
// the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial 
// portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
// LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN 
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

define( [
    "jquery",
    "underscore",
    "backbone",
    "marionette"
], function ( $, _, Backbone, Marionette ) {

    console.log("Backbone: " + Backbone);
    console.log("Marionette: " + Marionette);
    console.log("Backbone.Marionette: " + Backbone.Marionette);

    Backbone.Marionette.Geppetto = (function ( Backbone, _, $ ) {

        var Geppetto = {};

        Geppetto.Context = function Context( id ) {
            this.id = id;
            this.vent = new Backbone.Marionette.EventAggregator();
        };

        Geppetto.Context.prototype.listen = function ( eventName, callback ) {
            this.vent.bindTo( eventName, callback );
        };

        Geppetto.Context.prototype.dispatch = function ( eventName, eventData ) {
            this.vent.trigger( eventName, eventData );
        };

        Geppetto.Context.prototype.mapCommand = function ( eventName, commandClass ) {

            console.log( "command registered for " + eventName );

            this.vent.bindTo( eventName, function ( eventData ) {

                console.log( "execute() : " + eventName );

                var commandInstance = new commandClass();

                commandInstance.context = this;
                commandInstance.eventName = eventName;
                commandInstance.eventData = eventData;
                commandInstance.execute && commandInstance.execute();
                
            }, this );
        };


        var contexts = {};
        var counter = 0;

        var DATA_TAG = "data-geppetto-context";

        Geppetto.createContext = function ( el ) {

            var id = counter++;
            $( el ).attr( DATA_TAG, id );

            var newContext = new Geppetto.Context( id );

            contexts[id] = newContext;
            console.log( "createContext() : Created context for ID: " + id );

            return newContext;
        };


        Geppetto.getContext = function ( el ) {
            var matched = $( el ).parents( "[" + DATA_TAG + "]" );
            if ( !matched.length ) {
                throw Error( "Could not find a parent element with data-geppetto-context attr for provided element" );
            } else if ( matched.length > 1 ) {
                throw Error( "Expected 1 parent element with data-geppetto-context attr for provided element but found " + matched.length );
            }

            var id = $( matched[0] ).attr( DATA_TAG );

            console.log( "getContext() : Found context with ID: " + id );

            var context = contexts[id];
            return context;
        };

        Geppetto.removeContext = function ( el ) {
            var id = $( el ).attr( 'id' );
            delete contexts[id];
        };

        return Geppetto;

    })(Backbone, _, window.jQuery || window.Zepto || window.ender);

    return Backbone.Marionette.Geppetto;
} );