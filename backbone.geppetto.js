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


	var NO_MAPPING_FOUND = 'no mapping found for this key';

    var Injector = function () {
        this._mappings = {};
		this.parent = undefined;
    };
	Injector.prototype = {
        _createAndSetupInstance:function ( key, Clazz ) {
            var instance = new Clazz();
            this.injectInto( instance, key );
            return instance;
        },

        _retrieveFromCacheOrCreate:function ( key, overrideRules ) {
            var output;
            if ( this._mappings.hasOwnProperty( key ) ) {
                var config = this._mappings[ key ];
                if ( !overrideRules && config.isSingleton ) {
                    if ( !config.object ) {
                        config.object = this._createAndSetupInstance( key, config.clazz );
                    }
                    output = config.object;
                } else {
                    if ( config.clazz ) {
                        output = this._createAndSetupInstance( key, config.clazz );
                    }
                }
			}else if(this.parent && this.parent.hasMapping(key)){
				output = this.parent._retrieveFromCacheOrCreate(key,overrideRules);
            } else {
                throw new Error(NO_MAPPING_FOUND);
            }
            return output;
        },

		createChildInjector : function(){
			var child = new Injector();
			child.parent = this;
			return child;
		},

        getObject:function ( key ) {
            return this._retrieveFromCacheOrCreate( key, false );
        },

        mapValue:function ( key, useValue ) {
            this._mappings[ key ] = {
                clazz:null,
                object:useValue,
                isSingleton:true
            };
            return this;
        },

        hasMapping:function ( key ) {
            return this._mappings.hasOwnProperty( key )	|| (!!this.parent && this.parent.hasMapping(key));
        },

        mapClass:function ( key, clazz ) {
            this._mappings[ key ] = {
                clazz:clazz,
                object:null,
                isSingleton:false
            };
            return this;
        },

        mapSingleton:function ( key, clazz ) {
            this._mappings[ key ] = {
                clazz:clazz,
                object:null,
                isSingleton:true
            };
            return this;
        },

        instantiate:function ( key ) {
            return this._retrieveFromCacheOrCreate( key, true );
        },

        injectInto:function ( instance ) {
			if( ( typeof instance === 'object' ) && 'injections' in instance ){
				_.each(instance.injections, function(key, index){
					instance[key] = this.getObject(key);
				}, this);
			}
            return this;
        },
        unmap:function ( key ) {
            delete this._mappings[ key ];

            return this;
        },
		unmapAll:function(){
			this._mappings = {};
			return this;
		}
	};

    var Geppetto = {};

    Geppetto.version = '0.6.3';

    Geppetto.EVENT_CONTEXT_SHUTDOWN = "Geppetto:contextShutdown";

	Geppetto.Injector = Injector;

    var contexts = {};

    Geppetto.Context = function Context( options ) {

        this.options = options || {};
        this.parentContext = this.options.parentContext;
		if(this.parentContext){
			this.injector = this.parentContext.injector.createChildInjector();
		}else{
			this.injector = new Injector();
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
                context.unmapAll();
            });
        } else if (typeof this.options.context === 'object') {
            // or use existing context if we get one
            context = this.options.context;
        }

        view.context = context;
		context.injector.injectInto(view);

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

    Geppetto.Context.prototype.mapCommand = function mapCommand( eventName, CommandConstructor ) {

        var _this = this;

		if(!_.isFunction(CommandConstructor)){
			throw "Command must be constructable";
		}

        this.vent.listenTo( this.vent, eventName, function ( eventData ) {

            var commandInstance = new CommandConstructor();

            commandInstance.context = _this;
            commandInstance.eventName = eventName;
            commandInstance.eventData = eventData;
			_this.injector.injectInto(commandInstance);
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
					_this.mapCommand(eventName, commandClass);
				});
			}else{
				_this.mapCommand(eventName, mixedType);
			}
        });
    };

    Geppetto.Context.prototype.unmapAll = function unmapAll() {
        this.vent.stopListening();
		this.injector.unmapAll();

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
