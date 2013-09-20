// Backbone.Geppetto
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


    var NO_MAPPING_FOUND = 'no mapping found for key: ';
	var TYPES = {
		SINGLETON : 'singleton',
		VIEW: 'view',
		OTHER: 'other'
	};

    var Resolver = function (context) {
        this._mappings = {};
        this._context = context;
        this.parent = undefined;
    };
    Resolver.prototype = {
        _createAndSetupInstance:function ( key, Clazz ) {
            var instance = new Clazz();
            this.resolve( instance, key );
            return instance;
        },

        _retrieveFromCacheOrCreate:function ( key, overrideRules ) {
            var output;
            if ( this._mappings.hasOwnProperty( key ) ) {
                var config = this._mappings[ key ];
                if ( !overrideRules && config.type === TYPES.SINGLETON ) {
                    if ( !config.object ) {
                        config.object = this._createAndSetupInstance( key, config.clazz );
                    }
                    output = config.object;
                } else {
                    if (config.type === TYPES.VIEW) {
                        output = config.clazz;
                    } else if ( config.clazz ) {
                        output = this._createAndSetupInstance( key, config.clazz );
                    }
                }
            }else if(this.parent && this.parent.hasWiring(key)){
                output = this.parent._retrieveFromCacheOrCreate(key,overrideRules);
            } else {
                throw new Error(NO_MAPPING_FOUND + key);
            }
            return output;
        },

        _wrapViewConstructor: function(ViewConstructor) {

            var context = this._context;

            var WrappedConstructor = ViewConstructor.extend({
                initialize: function(){
                    context.resolver.resolve(this);
                    ViewConstructor.prototype.initialize.call(this, arguments);
                }
            });

            return WrappedConstructor;
        },

        createChildResolver : function(){
            var child = new Resolver(this._context);
            child.parent = this;
            return child;
        },

        getObject:function ( key ) {
            return this._retrieveFromCacheOrCreate( key, false );
        },

        wireValue:function ( key, useValue ) {
            this._mappings[ key ] = {
                clazz:null,
                object:useValue,
                type:TYPES.SINGLETON
            };
            return this;
        },

        hasWiring:function ( key ) {
            return this._mappings.hasOwnProperty( key )	|| (!!this.parent && this.parent.hasWiring(key));
        },

        wireClass:function ( key, clazz ) {
            this._mappings[ key ] = {
                clazz:clazz,
                object:null,
                type:TYPES.OTHER
            };
            return this;
        },

        wireView:function ( key, clazz ) {
            this._mappings[ key ] = {
                clazz:this._wrapViewConstructor(clazz),
                object:null,
                type:TYPES.VIEW
            };
            return this;
        },

        wireSingleton:function ( key, clazz ) {
            this._mappings[ key ] = {
                clazz:clazz,
                object:null,
                type:TYPES.SINGLETON
            };
            return this;
        },

        instantiate:function ( key ) {
            return this._retrieveFromCacheOrCreate( key, true );
        },

        resolve:function ( instance ) {
            if( ( typeof instance === 'object' ) && 'wiring' in instance ){
                _.each(instance.wiring, function(key, index){
                    instance[key] = this.getObject(key);
                }, this);
            }
            this.addPubSub( instance );
            return this;
        },
        addPubSub: function ( instance ) {
            instance.listen = _.bind(this._context.listen, this._context);
            instance.dispatch = _.bind(this._context.dispatch, this._context);
        },
        release:function ( key ) {
            delete this._mappings[ key ];

            return this;
        },
        releaseAll:function(){
            this._mappings = {};
            return this;
        }
    };

    var Geppetto = {};

    Geppetto.version = '0.6.3';

    Geppetto.EVENT_CONTEXT_SHUTDOWN = "Geppetto:contextShutdown";

    Geppetto.Resolver = Resolver;

    var contexts = {};

    Geppetto.Context = function Context( options ) {

        this.options = options || {};
        this.parentContext = this.options.parentContext;
        if(this.parentContext){
            this.resolver = this.parentContext.resolver.createChildResolver();
        }else{
            this.resolver = new Resolver(this);
        }
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
                context.destroy();
            });
        } else if (typeof this.options.context === 'object') {
            // or use existing context if we get one
            context = this.options.context;
        }

        view.context = context;
        context.resolver.resolve(view);

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
        if ( ! _.isUndefined(eventData) && ! _.isObject(eventData) ) {
            throw "Event payload must be an object";
        }
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

    Geppetto.Context.prototype.wireCommand = function wireCommand( eventName, CommandConstructor ) {

        var _this = this;

        if(!_.isFunction(CommandConstructor)){
            throw "Command must be constructable";
        }

        this.vent.listenTo( this.vent, eventName, function ( eventData ) {

            var commandInstance = new CommandConstructor();

            commandInstance.context = _this;
            commandInstance.eventName = eventName;
            commandInstance.eventData = eventData;
            _this.resolver.resolve(commandInstance);
            if (_.isFunction(commandInstance.execute)) {
                commandInstance.execute();
            }

        }, this );
    };

    Geppetto.Context.prototype.mapCommands = function mapCommands() {
        var _this = this;
        _.each(this.commands, function(mixedType, eventName) {
            if(_.isArray(mixedType)){
                _.each(mixedType, function(commandClass){
                    _this.wireCommand(eventName, commandClass);
                });
            }else{
                _this.wireCommand(eventName, mixedType);
            }
        });
    };

    Geppetto.Context.prototype.destroy = function destroy() {
        this.vent.stopListening();
        this.resolver.releaseAll();

        delete contexts[this._contextId];

        this.dispatchToParent(Geppetto.EVENT_CONTEXT_SHUTDOWN);
    };

    Geppetto.Context.extend = Backbone.View.extend;

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