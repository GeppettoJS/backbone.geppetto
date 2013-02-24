// Backbone.Geppetto v0.5
//
// Copyright (C) 2013 Model N, Inc.
// Distributed under the MIT License
//
// Documentation and full license available at:
// http://modeln.github.com/backbone.geppetto/

(function (factory) {
    if (typeof define === "function" && define.amd) {
        // Register as an AMD module if available...
        define(["underscore", "backbone"], factory);
    } else {
        // Browser globals for the unenlightened...
        factory(_, Backbone);
    }
}(function(_, Backbone) {

    "use strict";

    if(!Backbone){
        throw "Please include Backbone before Geppetto";
    }

    var Geppetto = {};

    Geppetto.EVENT_CONTEXT_SHUTDOWN = "Geppetto:contextShutdown";

    var contexts = {};

    Geppetto.Context = function Context( options ) {

        this.options = options || {};
        this.parentContext = this.options.parentContext;
        this.vent = {};
        _.extend(this.vent, Backbone.Events);
        this.initialize && this.initialize();
        this._contextId = _.uniqueId("Context");
        contexts[this._contextId] = this;
    };

    Geppetto.bindContext = function bindContext( options ) {

        this.options = options || {};

        var context = new this.options.context(this.options);
        var view = this.options.view;

        if (!view.close) {
            view.close = function() {
                view.trigger("close");
                view.remove();
            }
        }

        view.on("close", function() {
            view.off("close");
            context.unmapAll();
        });

        view.context = context;

        return context;
    };

    Geppetto.Context.prototype.listen = function listen( target, eventName, callback ) {

        if (arguments.length !== 3) {
            throw "Expected 3 arguments (target, eventName, callback)";
        }

        if (!target.listenTo || !target.stopListening) {
            throw "Target for listen() must define a 'listenTo' and 'stopListening' function";
        }

        if (eventName == null || typeof eventName !== "string") {
            throw "eventName must be a String";
        }

        if (callback == null || typeof callback !== "function") {
            throw "callback must be a function";
        }

        return target.listenTo( this.vent, eventName, callback, target );
    };

    Geppetto.Context.prototype.dispatch = function dispatch( eventName, eventData ) {
        eventData = eventData || {};
        eventData.eventName = eventName;
        this.vent.trigger( eventName, eventData );        };

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

        var _this = this;

        this.vent.listenTo( this.vent, eventName, function ( eventData ) {

            var commandInstance = new commandClass();

            commandInstance.context = _this;
            commandInstance.eventName = eventName;
            commandInstance.eventData = eventData;
            commandInstance.execute && commandInstance.execute();

        }, this );
    };

    Geppetto.Context.prototype.unmapAll = function unmapAll() {

        this.vent.stopListening();

        delete contexts[this._contextId];

        this.dispatchToParent(Geppetto.EVENT_CONTEXT_SHUTDOWN);
    };

    var extend = Backbone.View.extend;
    Geppetto.Context.extend = extend;

    var debug = {

        contexts : contexts,

        countEvents : function countEvents() {

            var numEvents = 0;

            _.each(contexts, function(context, id) {
                if (contexts.hasOwnProperty(id)) {
                    numEvents += _.size(context.vent._events);
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

    Backbone.Geppetto = Geppetto;

    return Geppetto;
}));
