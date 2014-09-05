// backbone.geppetto 0.7.0
//
// Copyright (C) 2013 Dave Cadwallader, Model N, Inc.
// Distributed under the MIT License
//
// Documentation and full license available at:
// http://modeln.github.com/backbone.geppetto/

(function(factory) {
    // CommonJS
    if (typeof exports === "object") {
        module.exports = factory(require('underscore'), require('backbone'));
    } else if (typeof define === "function" && define.amd) {
        // Register as an AMD module if available...
        define(["underscore", "backbone"], factory);
    } else {
        // Browser globals for the unenlightened...
        factory(_, Backbone);
    }
}(function(_, Backbone) {

    "use strict";

    if (!Backbone) {
        throw "Please include Backbone before Geppetto";
    }

    var NO_MAPPING_FOUND = 'no mapping found for key: ';
    var TYPES = {
        SINGLETON: 'singleton',
        VIEW: 'view',
        OTHER: 'other'
    };

    //based on http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply

    function applyToConstructor(constructor, argArray) {
        var args = [constructor].concat(argArray);
        var FactoryFunction = _.partial.apply(null, args);
        return new FactoryFunction();
    }

    var Resolver = function(context) {
        this._mappings = {};
        this._context = context;
        this.parent = undefined;
    };
    Resolver.prototype = {
        _createAndSetupInstance: function(config) {
            var instance;
            if (config.params) {
                var params = _.map(config.params, function(param) {
                    if (_.isFunction(param)) {
                        param = param(this._context);
                    }
                    return param;
                }, this);
                instance = applyToConstructor(config.clazz, params);
            } else {
                instance = new config.clazz();
            }
            if (!instance.initialize) {
                this.resolve(instance, config.wiring);
            }
            return instance;
        },

        _retrieveFromCacheOrCreate: function(key, overrideRules) {
            var output;
            if (this._mappings.hasOwnProperty(key)) {
                var config = this._mappings[key];
                if (!overrideRules && config.type === TYPES.SINGLETON) {
                    if (!config.object) {
                        config.object = this._createAndSetupInstance(config);
                    }
                    output = config.object;
                } else {
                    if (config.type === TYPES.VIEW) {
                        output = config.clazz;
                    } else if (config.clazz) {
                        output = this._createAndSetupInstance(config);
                    }
                }
            } else if (this.parent && this.parent.hasWiring(key)) {
                output = this.parent._retrieveFromCacheOrCreate(key, overrideRules);
            } else {
                throw new Error(NO_MAPPING_FOUND + key);
            }
            return output;
        },

        _wrapConstructor: function(OriginalConstructor, wiring) {
            if (OriginalConstructor.prototype.initialize) {
                var context = this._context;

                return OriginalConstructor.extend({
                    initialize: function() {
                        context.resolver.resolve(this, wiring);
                        OriginalConstructor.prototype.initialize.apply(this, arguments);
                    }
                });
            } else {
                return OriginalConstructor;
            }
        },


        getObject: function(key) {
            return this._retrieveFromCacheOrCreate(key, false);
        },

        wireValue: function(key, useValue) {
            this._mappings[key] = {
                clazz: null,
                object: useValue,
                type: TYPES.SINGLETON
            };
            return this;
        },

        hasWiring: function(key) {
            return this._mappings.hasOwnProperty(key) || ( !! this.parent && this.parent.hasWiring(key));
        },

        wireClass: function(key, clazz, wiring) {
            this._mappings[key] = {
                clazz: this._wrapConstructor(clazz, wiring),
                object: null,
                type: TYPES.OTHER,
                wiring: wiring
            };
            return this;
        },

        wireView: function(key, clazz, wiring) {
            this._mappings[key] = {
                clazz: this._wrapConstructor(clazz, wiring),
                object: null,
                type: TYPES.VIEW
            };
            return this;
        },

        wireSingleton: function(key, clazz, wiring) {

            this._mappings[key] = {
                clazz: this._wrapConstructor(clazz, wiring),
                object: null,
                type: TYPES.SINGLETON,
                wiring: wiring
            };
            return this;
        },

        instantiate: function(key) {
            return this._retrieveFromCacheOrCreate(key, true);
        },

        resolve: function(instance, wiring) {
            wiring = wiring || instance.wiring;
            if (wiring) {
                var propNameArgIndex = Number(!_.isArray(wiring));
                _.each(wiring, function(dependencyKey) {
                    instance[arguments[propNameArgIndex]] = this.getObject(dependencyKey);
                }, this);
            }
            this.addPubSub(instance);
            return this;
        },
        addPubSub: function(instance) {
            instance.listen = _.bind(this._context.listen, this._context);
            instance.dispatch = _.bind(this._context.dispatch, this._context);
        },
        release: function(key) {
            delete this._mappings[key];

            return this;
        },
        releaseAll: function() {
            this._mappings = {};
            return this;
        },
        configure: function(key) {
            var mapping = this._mappings[key];
            if (typeof mapping === 'undefined') {
                throw new Error(NO_MAPPING_FOUND + key);
            }
            if (!mapping.clazz || mapping.type === TYPES.VIEW) {
                throw new Error("Cannot configure " + key + ": only possible for wirings of type singleton or class");
            }
            mapping.params = _.toArray(arguments).slice(1);
        }
    };

    var Geppetto = {};

    Geppetto.version = '0.7.0';

    Geppetto.EVENT_CONTEXT_SHUTDOWN = "Geppetto:contextShutdown";

    Geppetto.Resolver = Resolver;

    var contexts = {};

    Geppetto.Context = function Context(options) {

        this.options = options || {};
        this.parentContext = this.options.parentContext;

        if (this.options.resolver) {
            this.resolver = this.options.resolver;
        } else if (!this.resolver) {
            this.resolver = new Resolver(this);
        }

        if (this.parentContext) {
            this.resolver.parent = this.parentContext.resolver;
        }

        this.vent = {};
        _.extend(this.vent, Backbone.Events);
        this._contextId = _.uniqueId("Context");
        contexts[this._contextId] = this;

        var wiring = this.wiring || this.options.wiring;
        if (wiring) {
            this._configureWirings(wiring);
        }
        if (_.isFunction(this.initialize)) {
            this.initialize.apply(this, arguments);
        }
    };

    Geppetto.bindContext = function bindContext(options) {

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

        context.resolver.resolve(view);

        // map context events
        _.each(view.contextEvents, function(callback, eventName) {
            if (_.isFunction(callback)) {
                context.listen(view, eventName, callback);
            } else if (_.isString(callback)) {
                context.listen(view, eventName, view[callback]);
            }
        });

        var returnValue;

        // only set a reference to the context on the view if the view
        // is a pre-0.7.0 component that does not use dependency injection. 
        // this will be removed in a future release...
        if (!view.wiring) {
            view.context = context;
            returnValue = context;
        }

        return returnValue;
    };

    var extractConfig = function(def, key) {
        var thisCtor, thisWiring;
        if (def.hasOwnProperty("ctor")) {
            thisCtor = def.ctor;
            thisWiring = def.wiring;
        } else {
            thisCtor = def;
        }
        return [key, thisCtor, thisWiring];
    };

    Geppetto.Context.prototype._configureWirings = function _configureWirings(wiring) {
        _.each(wiring.singletons, function(def, key) {
            this.wireSingleton.apply(this, extractConfig(def, key));
        }, this);
        _.each(wiring.classes, function(def, key) {
            this.wireClass.apply(this, extractConfig(def, key));
        }, this);
        _.each(wiring.values, function(value, key) {
            this.wireValue(key, value);
        }, this);
        _.each(wiring.views, function(def, key) {
            this.wireView.apply(this, extractConfig(def, key));
        }, this);
        this.wireCommands(wiring.commands);
    };

    var validateListen = function(target, eventName, callback) {

        if (!_.isObject(target) || !_.isFunction(target.listenTo) || !_.isFunction(target.stopListening)) {
            throw "Target for listen() must define a 'listenTo' and 'stopListening' function";
        }

        if (!_.isString(eventName)) {
            throw "eventName must be a String";
        }

        if (!_.isFunction(callback)) {
            throw "callback must be a function";
        }
    };

    Geppetto.Context.prototype.listen = function listen(target, eventName, callback) {
        validateListen(target, eventName, callback);
        return target.listenTo(this.vent, eventName, callback, target);
    };

    Geppetto.Context.prototype.listenToOnce = function listenToOnce(target, eventName, callback) {
        validateListen(target, eventName, callback);
        return target.listenToOnce(this.vent, eventName, callback, target);
    };

    Geppetto.Context.prototype.dispatch = function dispatch(eventName, eventData) {
        if (!_.isUndefined(eventData) && !_.isObject(eventData)) {
            throw "Event payload must be an object";
        }
        eventData = eventData || {};
        eventData.eventName = eventName;
        this.vent.trigger(eventName, eventData);
    };

    Geppetto.Context.prototype.dispatchToParent = function dispatchToParent(eventName, eventData) {
        if (this.parentContext) {
            this.parentContext.vent.trigger(eventName, eventData);
        }
    };

    Geppetto.Context.prototype.dispatchGlobally = function dispatchGlobally(eventName, eventData) {

        _.each(contexts, function(context) {
            if (!context) {
                return true;
            }
            context.vent.trigger(eventName, eventData);
        });
    };

    Geppetto.Context.prototype._executeCommand = function(CommandConstructor, eventName, eventData, wiring) {
        var commandInstance = new CommandConstructor(this, eventName, eventData);

        commandInstance.context = this;
        commandInstance.eventName = eventName;
        commandInstance.eventData = eventData;
        this.resolver.resolve(commandInstance, wiring);
        if (_.isFunction(commandInstance.execute)) {
            commandInstance.execute();
        }
    };

    Geppetto.Context.prototype.executeCommand = function(CommandConstructor, event) {
        if (!event) {
            event = {};
        }
        this._executeCommand(CommandConstructor, event.eventName, event.eventData);
    };

    Geppetto.Context.prototype.wireCommand = function wireCommand(eventName, CommandConstructor, wiring) {

        var _this = this;

        if (!_.isFunction(CommandConstructor)) {
            throw "Command must be constructable";
        }

        this.vent.listenTo(this.vent, eventName, function(eventData) {
            _this._executeCommand(CommandConstructor, eventName, eventData, wiring);
        }, this);
    };

    Geppetto.Context.prototype.wireCommands = function wireCommands(commandsMap) {
        var _this = this;
        _.each(commandsMap, function(mixedType, eventName) {
            if (_.isArray(mixedType)) {
                _.each(mixedType, function(commandClass) {
                    _this.wireCommand(eventName, commandClass);
                });
            } else {
                _this.wireCommand(eventName, mixedType);
            }
        });
    };

    Geppetto.Context.prototype.wireView = function(key, clazz, wiring) {
        this.resolver.wireView(key, clazz, wiring);
        return this;
    };

    Geppetto.Context.prototype.wireSingleton = function(key, clazz, wiring) {
        this.resolver.wireSingleton(key, clazz, wiring);
        return this;
    };

    Geppetto.Context.prototype.wireValue = function(key, useValue) {
        this.resolver.wireValue(key, useValue);
        return this;
    };

    Geppetto.Context.prototype.wireClass = function(key, clazz, wiring) {
        this.resolver.wireClass(key, clazz, wiring);
        return this;
    };

    Geppetto.Context.prototype.hasWiring = function(key) {
        return this.resolver.hasWiring(key);
    };

    Geppetto.Context.prototype.getObject = function(key) {
        return this.resolver.getObject(key);
    };

    Geppetto.Context.prototype.instantiate = function(key) {
        return this.resolver.instantiate(key);
    };

    Geppetto.Context.prototype.resolve = function(instance, wiring) {
        this.resolver.resolve(instance, wiring);
        return this;
    };

    Geppetto.Context.prototype.release = function(key) {
        this.resolver.release(key);
        return this;
    };

    Geppetto.Context.prototype.releaseAll = function() {
        this.resolver.releaseAll();
        return this;
    };

    Geppetto.Context.prototype.destroy = function destroy() {
        this.vent.stopListening();
        this.resolver.releaseAll();

        delete contexts[this._contextId];

        this.dispatchToParent(Geppetto.EVENT_CONTEXT_SHUTDOWN);
    };

    Geppetto.Context.extend = Backbone.View.extend;

    var debug = {

        contexts: contexts,

        countEvents: function countEvents() {

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
                if (contexts.hasOwnProperty(id)) {
                    numContexts++;
                }
            });
            return numContexts;
        }

    };

    Geppetto.setDebug = function setDebug(enableDebug) {
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
