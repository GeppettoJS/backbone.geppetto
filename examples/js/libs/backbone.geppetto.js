// Backbone.Geppetto v0.1.1
//
// Copyright (C) 2012 Model N, Inc.  
// Distributed under the MIT License
//
// Documentation and full license available at:
// http://modeln.github.com/backbone.geppetto/

define( [
    "jquery",
    "underscore",
    "backbone",
    "marionette"
], function ( $, _, Backbone, Marionette ) {

    Backbone.Marionette.Geppetto = (function ( Backbone, _, $ ) {

        var Geppetto = {};

        Geppetto.Context = function Context( id, parentContext ) {
            this.id = id;
            this.parentContext = parentContext;
            this.vent = new Backbone.Marionette.EventAggregator();

            this.initialize && this.initialize();
        };

        Geppetto.Context.prototype.listen = function ( eventName, callback ) {
            this.vent.bindTo( eventName, callback );
        };

        Geppetto.Context.prototype.dispatch = function ( eventName, eventData ) {
            this.vent.trigger( eventName, eventData );
        };

        Geppetto.Context.prototype.dispatchToParent = function ( eventName, eventData ) {
            if ( this.parentContext ) {
                this.parentContext.vent.trigger( eventName, eventData );
            }
        };

        Geppetto.Context.prototype.dispatchGlobally = function ( eventName, eventData ) {

            _.each( contexts, function ( context, contextId ) {
                context.vent.trigger( eventName, eventData );
            } );
        };

        Geppetto.Context.prototype.mapCommand = function ( eventName, commandClass ) {

            this.vent.bindTo( eventName, function ( eventData ) {

                var commandInstance = new commandClass();

                commandInstance.context = this;
                commandInstance.eventName = eventName;
                commandInstance.eventData = eventData;
                commandInstance.execute && commandInstance.execute();

            }, this );
        };
        
        Geppetto.Context.prototype.unmapAll = function() {
            this.vent.unbindAll();    
        };

        var extend = Backbone.View.extend;
        Geppetto.Context.extend = extend;

        var contexts = {};
        
        var debug = {
        
            contexts : contexts,
        
            countEvents : function() {
                
                var numEvents = 0;
                
                _.each(contexts, function(context, id) {
                    if (contexts.hasOwnProperty(id)) {
                        numEvents += context.vent.bindings.length;    
                    }                    
                });
                
                return numEvents;
            },
            
            countContexts: function() {
                
                var numContexts = 0;
                
                _.each(contexts, function(context, id) {
                    if (contexts.hasOwnProperty(id)){
                        numContexts++;
                    }
                });
                return numContexts;
            }
            
        };
        
        Geppetto.setDebug = function( enableDebug ) {
            if (enableDebug) {
                this.debug = debug;
            } else {
                this.debug = undefined;
            }
            return this.debug;
        };
                
        var counter = 0;

        var DATA_TAG = "data-geppetto-context";

        Geppetto.createContext = function ( el, contextDefinition, parentContext ) {

            var id = counter++;
            $( el ).attr( DATA_TAG, id );

            var newContext = contextDefinition
                    ? new contextDefinition( id, parentContext )
                    : new Geppetto.Context( id, parentContext );

            newContext.el = el;
            
            contexts[id] = newContext;

            return newContext;
        };


        Geppetto.getContext = function ( el ) {

            var id;
            if($(el).attr(DATA_TAG)) {
                id = $(el).attr(DATA_TAG);                
            } else {
                var matched = $( el ).parents( "[" + DATA_TAG + "]" );
                if ( !matched.length ) {
                    throw Error( "Could not find a parent element with data-geppetto-context attr for provided element" );
                } else if ( matched.length > 1 ) {
                    throw Error( "Expected 1 parent element with data-geppetto-context attr for provided element but found " + matched.length );
                }

                id = $( matched[0] ).attr( DATA_TAG );

            }
            
            var context = contexts[id];
            return context;
        };
        
        Geppetto.removeContext = function ( el ) {
            var id = $( el ).attr( 'id' );
            var context = contexts[id];
            context.unmapAll();
            context.el.close && context.el.close();
            delete contexts[id];
        };

        return Geppetto;

    })( Backbone, _, window.jQuery || window.Zepto || window.ender );

    return Backbone.Marionette.Geppetto;
} );