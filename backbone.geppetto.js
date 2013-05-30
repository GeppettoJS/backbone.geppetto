// Backbone.Geppetto v0.5.1
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
        if (_.isFunction(this.initialize)) {
            this.initialize.apply(this, arguments);
        }
        this._contextId = _.uniqueId("Context");
        contexts[this._contextId] = this;

        this.mapCommands();
    };

    Geppetto.bindContext = function bindContext( options ) {

        this.options = options || {};

        var view = this.options.view;

        var context = null;
        if (typeof this.options.context === 'function') {
            // create new context if we get constructor
            context = new this.options.context(this.options);

            // only close context if we are the owner
            if (!view.close) {
                view.close = function() {
                    view.trigger("close");
                    view.remove();
                };
            }

            view.on("close", function() {
                view.off("close");
                context.unmapAll();
            });
        } else if (typeof this.options.context === 'object') {
            // or use existing context if we get one
            context = this.options.context;
        }

        view.context = context;

        // map context events
        _.each(view.contextEvents, function(callback, eventName) {
            if (_.isFunction(callback)) {
                context.listen(view, eventName, callback);
            } else if (_.isString(callback)) {
                context.listen(view, eventName, view[callback]);
            }
        });

        return context;
    };

    Geppetto.Context.prototype.listen = function listen( target, eventName, callback ) {

        if (arguments.length !== 3) {
            throw "Expected 3 arguments (target, eventName, callback)";
        }

        if ( ! _.isObject(target) || 
             ! _.isFunction(target.listenTo) || 
             ! _.isFunction(target.stopListening)) {
            throw "Target for listen() must define a 'listenTo' and 'stopListening' function";
        }

        if ( ! _.isString(eventName)) {
            throw "eventName must be a String";
        }

        if ( ! _.isFunction(callback)) {
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

    Geppetto.Context.prototype.mapCommand = function mapCommand( eventName, CommandConstructor ) {

        var _this = this;

        this.vent.listenTo( this.vent, eventName, function ( eventData ) {

            var commandInstance = new CommandConstructor();

            commandInstance.context = _this;
            commandInstance.eventName = eventName;
            commandInstance.eventData = eventData;
            if (_.isFunction(commandInstance.execute)) {
                commandInstance.execute();
            } 

        }, this );
    };

    Geppetto.Context.prototype.mapCommands = function mapCommands() {
        var _this = this;
        _.each(this.commands, function(commandClass, eventName) {
            _this.mapCommand(eventName, commandClass);
        });
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
