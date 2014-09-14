// backbone.geppetto 0.7.1
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
        var args = [constructor, null].concat(argArray);
        var FactoryFunction = _.bind.apply(constructor, args);
        return new FactoryFunction();
    }

    function createFactory(clazz) {
        return function() {
            return applyToConstructor(clazz, _.toArray(arguments));
        };
    }

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

    var Geppetto = {};

    Geppetto.version = '0.7.1';

    Geppetto.EVENT_CONTEXT_SHUTDOWN = "Geppetto:contextShutdown";

    var contexts = {};

    Geppetto.Context = function Context(options) {
        this._mappings = {};

        this.options = options || {};
        this.parentContext = this.options.parentContext;

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

    Geppetto.Context.extend = Backbone.View.extend;

    _.extend(Geppetto.Context.prototype, {

        _configureWirings: function _configureWirings(wiring) {
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
        },

        _createAndSetupInstance: function(config) {
            var instance;
            if (config.params) {
                var params = _.map(config.params, function(param) {
                    if (_.isFunction(param)) {
                        param = param(this);
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
            } else if (this.parentContext && this.parentContext.hasWiring(key)) {
                output = this.parentContext._retrieveFromCacheOrCreate(key, overrideRules);
            } else {
                throw new Error(NO_MAPPING_FOUND + key);
            }
            return output;
        },

        _wrapConstructor: function(clazz, wiring) {
            var context = this;
            if (clazz.extend) {
                return clazz.extend({
                    constructor: function() {
                        context.resolve(this, wiring);
                        clazz.prototype.constructor.apply(this, arguments);
                    }
                });
            } else {
                return clazz;
            }
        },

        _mapContextEvents: function(obj) {
            _.each(obj.contextEvents, function(callback, eventName) {
                if (_.isFunction(callback)) {
                    this.listen(obj, eventName, callback);
                } else if (_.isString(callback)) {
                    this.listen(obj, eventName, obj[callback]);
                }
            }, this);
        },

        addPubSub: function(instance) {
            instance.listen = _.bind(this.listen, this);
            instance.dispatch = _.bind(this.dispatch, this);
        },

        listen: function listen(target, eventName, callback) {
            validateListen(target, eventName, callback);
            return target.listenTo(this.vent, eventName, callback, target);
        },

        listenToOnce: function listenToOnce(target, eventName, callback) {
            validateListen(target, eventName, callback);
            return target.listenToOnce(this.vent, eventName, callback, target);
        },

        dispatch: function dispatch(eventName, eventData) {
            if (!_.isUndefined(eventData) && !_.isObject(eventData)) {
                throw "Event payload must be an object";
            }
            eventData = eventData || {};
            eventData.eventName = eventName;
            this.vent.trigger(eventName, eventData);
        },

        dispatchToParent: function dispatchToParent(eventName, eventData) {
            if (this.parentContext) {
                this.parentContext.vent.trigger(eventName, eventData);
            }
        },

        dispatchToParents: function dispatchToParents(eventName, eventData) {
            if (this.parentContext && !(eventData && eventData.propagationDisabled)) {
                this.parentContext.vent.trigger(eventName, eventData);
                if (this.parentContext) {
                    this.parentContext.dispatchToParents(eventName, eventData);
                }
            }
        },

        dispatchGlobally: function dispatchGlobally(eventName, eventData) {

            _.each(contexts, function(context) {
                if (!context) {
                    return true;
                }
                context.vent.trigger(eventName, eventData);
            });
        },

        wireCommand: function wireCommand(eventName, CommandConstructor, wiring) {

            var context = this;

            if (!_.isFunction(CommandConstructor)) {
                throw "Command must be constructable";
            }

            this.vent.listenTo(this.vent, eventName, function(eventData) {

                var commandInstance = new CommandConstructor(context, eventName, eventData);

                commandInstance.context = context;
                commandInstance.eventName = eventName;
                commandInstance.eventData = eventData;
                context.resolve(commandInstance, wiring);
                if (_.isFunction(commandInstance.execute)) {
                    commandInstance.execute();
                }

            });
        },

        wireCommands: function wireCommands(commandsMap) {
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
        },

        wireValue: function(key, useValue) {
            this._mappings[key] = {
                clazz: null,
                object: useValue,
                type: TYPES.SINGLETON
            };
            return this;
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
                clazz: createFactory(this._wrapConstructor(clazz, wiring)),
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

        configure: function(key) {
            var mapping = this._mappings[key];
            if (typeof mapping === 'undefined') {
                throw new Error(NO_MAPPING_FOUND + key);
            }
            if (!mapping.clazz || mapping.type === TYPES.VIEW) {
                throw new Error("Cannot configure " + key + ": only possible for wirings of type singleton or class");
            }
            mapping.params = _.toArray(arguments).slice(1);
        },

        hasWiring: function(key) {
            return this._mappings.hasOwnProperty(key) || ( !! this.parentContext && this.parentContext.hasWiring(key));
        },

        getObject: function(key) {
            return this._retrieveFromCacheOrCreate(key, false);
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
            this._mapContextEvents(instance);
            return this;
        },

        release: function(key) {
            delete this._mappings[key];
            return this;
        },

        releaseAll: function() {
            this._mappings = {};
            return this;
        },

        destroy: function destroy() {
            this.vent.stopListening();
            this.releaseAll();

            delete contexts[this._contextId];

            this.dispatchToParent(Geppetto.EVENT_CONTEXT_SHUTDOWN);
        }

    });

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

        context.resolve(view);

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
