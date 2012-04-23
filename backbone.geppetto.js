// Backbone.Geppetto v0.1.1
//
// Copyright (C) 2012 Model N, Inc.  
// Distributed under the MIT License
//
// Documentation and full license available at:
// http://modeln.github.com/backbone.geppetto/

define( [
    "jquery",
    "livequery",
    "underscore",
    "backbone",
    "marionette"
], function ( $, LiveQuery, _, Backbone, Marionette ) {

    Backbone.Marionette.Geppetto = (function ( Backbone, _, $ ) {

        if ( ! $.livequery ) {
            throw Error("Dependency failure: jQuery livequery must be included before backbone.geppetto");
        }

        $.extend($.fn, {

            expireAndDelete : function() {
                this.expire();

                var toDelete = [];
                var self = this;
                $.each( $.livequery.queries, function(i, query) {
                    if ( self.selector == query.selector && self.context == query.context )
                        toDelete.push(i);
                });

                $.each( toDelete, function(i, indexToDelete){
                    $.livequery.queries.splice(indexToDelete, 1);
                });
            }
        });

        var Geppetto = {};

        Geppetto.Context = function Context( id, parentContext ) {
            this.id = id;
            this.parentContext = parentContext;
            this.vent = new Backbone.Marionette.EventAggregator();

            this.initialize && this.initialize();
        };

        Geppetto.Context.prototype.listen = function listen( eventName, callback ) {
            this.vent.bindTo( eventName, callback );
        };

        Geppetto.Context.prototype.dispatch = function dispatch( eventName, eventData ) {
            this.vent.trigger( eventName, eventData );
        };

        Geppetto.Context.prototype.dispatchToParent = function dispatchToParent( eventName, eventData ) {
            if ( this.parentContext ) {
                this.parentContext.vent.trigger( eventName, eventData );
            }
        };

        Geppetto.Context.prototype.dispatchGlobally = function dispatchGlobally( eventName, eventData ) {

            _.each( contexts, function ( context, contextId ) {
                context.vent.trigger( eventName, eventData );
            } );
        };

        Geppetto.Context.prototype.mapCommand = function mapCommand( eventName, commandClass ) {

            this.vent.bindTo( eventName, function ( eventData ) {

                var commandInstance = new commandClass();

                commandInstance.context = this;
                commandInstance.eventName = eventName;
                commandInstance.eventData = eventData;
                commandInstance.execute && commandInstance.execute();

            }, this );
        };

        Geppetto.Context.prototype.unmapAll = function unmapAll() {
            this.vent.unbindAll();
        };

        var extend = Backbone.View.extend;
        Geppetto.Context.extend = extend;

        var contexts = {};

        var debug = {

            contexts : contexts,

            countEvents : function countEvents() {

                var numEvents = 0;

                _.each(contexts, function(context, id) {
                    if (contexts.hasOwnProperty(id)) {
                        numEvents += context.vent.bindings.length;
                    }
                });

                return numEvents;
            },

            countContexts: function countContexts() {

                var numContexts = 0;

                _.each(contexts, function(context, id) {
                    if (contexts.hasOwnProperty(id)){
                        numContexts++;
                    }
                });
                return numContexts;
            }

        };

        Geppetto.setDebug = function setDebug( enableDebug ) {
            if (enableDebug) {
                this.debug = debug;
            } else {
                this.debug = undefined;
            }
            return this.debug;
        };

        var counter = 0;
        var childCounter = 0;

        var DATA_TAG = "data-geppetto-context";
        var CHILD_DATA_TAG = "data-geppetto-child";

        Geppetto.createContext = function createContext( el, contextDefinition, parentContext ) {

            var id = counter++;
            $( el ).attr( DATA_TAG, id );

            var newContext = contextDefinition
                    ? new contextDefinition( id, parentContext )
                    : new Geppetto.Context( id, parentContext );

            newContext.el = el;

            contexts[id] = newContext;

            return newContext;
        };

        Geppetto.getContext = function getContext( el, callback ) {

            var that = this;
            
            if (this.debug) {
                var startTime = (new Date()).getTime();
            }
                
            var childId = childCounter++;
            $(el).attr(CHILD_DATA_TAG, childId);

            var childAttachedToParentSelector = $('[' + DATA_TAG + '] [' + CHILD_DATA_TAG + '="' + childId + '"]');

            childAttachedToParentSelector.livequery(function() {

                childAttachedToParentSelector.expireAndDelete();

                var id;
                if($(el).attr(DATA_TAG)) {
                    id = $(el).attr(DATA_TAG);
                } else {
                    var matched = $( el ).parents( "[" + DATA_TAG + "]:first" );
                    if ( !matched.length ) {
                        throw Error( "Could not find a parent element with data-geppetto-context attr for provided element" );
                    } else if ( matched.length > 1 ) {
                        throw Error( "Expected 1 parent element with data-geppetto-context attr for provided element but found " + matched.length );
                    }

                    id = $( matched[0] ).attr( DATA_TAG );

                }

                var context = contexts[id];

                if (that.debug) {
                    var endTime = (new Date()).getTime();

                    var timeDiff = endTime - startTime;
                    console && console.log && console.log("Geppetto.getContext(): Completed in " + timeDiff + " ms.");
                }
                
                callback(context);

            });

        };

        Geppetto.removeContext = function removeContext( el ) {
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