// backbone.geppetto 0.7.1
//
// Copyright (C) 2013 Dave Cadwallader, Model N, Inc.
// Distributed under the MIT License
//
// Documentation and full license available at:
// http://modeln.github.com/backbone.geppetto/

(function( factory ){
    // CommonJS
    if( typeof exports === "object" ){
        module.exports = factory( require( 'underscore' ), require( 'backbone' ) );
    } else if( typeof define === "function" && define.amd ){
        // Register as an AMD module if available...
        define( [ "underscore", "backbone" ], factory );
    } else {
        // Browser globals for the unenlightened...
        factory( _, Backbone );
    }
}( function( _,
             Backbone ){

    "use strict";

    if( !Backbone ){
        throw "Please include Backbone before Geppetto";
    }

    var extend = Backbone.View.extend;

    //based on http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply

    /**
     *
     * @param {Mapping} mapping
     * @returns {*}
     */
    function createInstanceAndResolve( mapping ){
        var ctor = mapping.source.prototype.constructor;
        var params = [ ctor, null ].concat( mapping.parameters );
        var FactoryFunction = _.bind.apply( ctor, params );
        var instance = new FactoryFunction();
        mapping.context.resolve( instance, mapping.wiring );
        return instance;
    }

    /**
     *
     * @param {Mapping} mapping
     * @returns {Function}
     */
    function createFactory( mapping ){
        var factory = function(){
            return createInstanceAndResolve( mapping );
        };
        factory.prototype = mapping.source.prototype;
        factory.source = mapping.source;
        return factory;
    }

    /**
     * @protected
     * @param {{}} methodsMap
     * @param {*} scope
     * @returns {{}}
     */
    function bindFuncs( methodsMap,
                        scope ){
        var receiver = {};
        _.each( methodsMap, function( func,
                                      methodName ){
            receiver[ methodName ] = _.bind( func, scope );
        } );
        return receiver;
    }

    function toHash( mixed ){
        var args = _.flatten( _.toArray( arguments ) );
        return _.reduce( args, function( memo,
                                         value,
                                         index ){
            if( _.isObject( value ) ){
                _.each( value, function( value,
                                         key ){
                    if( _.isString( value ) ){
                        memo[ key ] = value;
                    }// todo: else log warning
                } );
            } else if( _.isString( value ) ){
                memo[ value ] = value;
            }// todo: else log warning
            return memo;
        }, {} );
    }

    /**
     * @protected
     * @param {string} message
     * @param {...*} [values]
     * @returns {Error}
     */
    function createError( message,
                          values ){
        if( arguments.length > 1 ){
            var args = _.toArray( arguments );
            args.shift();
            _.times( args.length, function( i ){
                message = message.replace( "$" + (i + 1), args[ i ] );
            } );
        }
        return new Error( message );
    }

    var Geppetto = {};

    Geppetto.version = '0.7.1';

    Geppetto.EVENT_CONTEXT_SHUTDOWN = "Geppetto:contextShutdown";

    var SINGLETON_PROVIDER = {
        /**
         *
         * @param {Mapping} mapping
         */
        validate : function( mapping ){
            if( !_.isFunction( mapping.source ) ){
                throw createError( "Singleton provider expects a `function`" );
            }
        },

        /**
         *
         * @param {Mapping} mapping
         * @param {string} key
         * @returns {*}
         */
        construct : function( mapping,
                              key ){
            if( !mapping.cache ){
                mapping.cache = createInstanceAndResolve( mapping );
            }
            return mapping.cache;
        }
    };

    var MULTITON_PROVIDER = {
        /**
         *
         * @param {Mapping} mapping
         */
        validate : function( mapping ){
            if( !_.isFunction( mapping.source ) ){
                throw createError( "Multiton provider expects a `function`" );
            }
        },

        /**
         *
         * @param {Mapping} mapping
         * @param {string} key
         * @returns {*}
         */
        construct : function( mapping,
                              key ){
            mapping.cache = mapping.cache || {};
            if( !mapping.cache.hasOwnProperty( key ) ){
                mapping.cache[ key ] = createInstanceAndResolve( mapping );
            }
            return mapping.cache[ key ];
        }
    };

    var VALUE_PROVIDER = {
        /**
         *
         * @param {Mapping} mapping
         * @param {string} key
         * @returns {*}
         */
        construct : function( mapping,
                              key ){
            return mapping.source;
        }
    };

    var UNRESOLVED_PROVIDER = {
        /**
         *
         * @param {Mapping} mapping
         */
        validate : function( mapping ){
            if( !_.isObject( mapping.source ) || _.isArray( mapping.source ) ){
                throw createError( "Unresolved provider expects an `object`" );
            }
        },

        /**
         *
         * @param {Mapping} mapping
         * @param {string} key
         * @returns {*}
         */
        construct : function( mapping,
                              key ){
            if( !mapping.cache ){
                mapping.cache = true;
                if( _.isObject( mapping.source ) ){
                    mapping.context.resolve( mapping.source, mapping.wiring );
                }
            }
            return mapping.source;
        }
    };

    var PRODUCER_PROVIDER = {
        /**
         *
         * @param {Mapping} mapping
         */
        validate : function( mapping ){
            if( !_.isFunction( mapping.source ) ){
                throw createError( "Producer provider expects a `function`" );
            }
        },
        
        /**
         *
         * @param {Mapping} mapping
         * @param {string} key
         * @returns {*}
         */
        construct : function( mapping, key ){
            return createInstanceAndResolve( mapping );
        }
    };

    var CONSTRUCTOR_PROVIDER = {
        /**
         *
         * @param {Mapping} mapping
         */
        validate : function( mapping ){
            if( !_.isFunction( mapping.source ) ){
                throw createError( "Constructor provider expects a `function`" );
            }
        },
        
        /**
         *
         * @param {Mapping} mapping
         * @param {string} key
         * @returns {*}
         */
        construct : function( mapping ){
            if( !mapping.cache ){
                mapping.cache = createFactory( mapping );
            }
            return mapping.cache;
        }
    };
    var COMMAND_PROVIDER = {
        construct : function( mapping ){
            var command = createInstanceAndResolve( mapping );
            if( command.execute ){
                command.execute();
            }
            return command;
        }
    };

    /**
     *
     * @param value
     * @param context
     * @returns {Mapper}
     * @constructor
     */
    function Mapping( value,
                      context ){
        this.source = value;
        this.context = context;

        return new Mapper( this );
    }

    _.extend( Mapping.prototype, {

        /**
         *
         */
        reset : function(){
            this.source = undefined;
            this.context = undefined;
            this.provider = undefined;
            this.wiring = undefined;
            this.handlers = undefined;
            this.events = undefined;
            this.parameters = undefined;
            this.cache = undefined;
        }
    } );

    /**
     * @protected
     * @param {Mapping} mapping
     * @constructor
     */
    function Mapper( mapping ){
        this._mapping = mapping;
        this.using = this.and = bindFuncs( {
            wiring     : this._withWiring,
            handlers   : this._withHandlers,
            context    : this._withContext,
            parameters : this._withParameters
        }, this );
        this.to = bindFuncs( {
            event : this._toEvent
        }, this );
        this.as = bindFuncs( Mapper.providers, this );
    }

    _.extend( Mapper.prototype, {
        /**
         * @param {{}} provider
         * @param {(string|string[]|{})} keys
         * @returns {Mapper}
         * @protected
         */
        _mapToProvider : function( provider,
                                   keys ){
            this._mapping.provider = provider;
            this._mapping.context._map( this._mapping, keys );
            _.each( this.as, function( f,
                                       providerName ){
                this.as[ providerName ] = function(){
                    throw createError( "A subject can not be mapped to multiple providers" );
                }
            }, this );
            return this;
        },

        /**
         * @param {{}|string[]} wiring
         * @protected
         */
        _withWiring : function( wiring ){
            this._mapping.wiring = toHash( _.toArray( arguments ) );
            return this;
        },

        /**
         *
         * @param {{}} handlers
         * @protected
         */
        _withHandlers : function( handlers ){
            this._mapping.handlers = handlers;
            return this;
        },

        /**
         *
         * @param {...*} parameters
         * @protected
         */
        _withParameters : function( parameters ){
            this._mapping.parameters = _.toArray( arguments );
            return this;
        },

        /**
         *
         * @param {Context} context
         * @protected
         */
        _withContext : function( context ){
            if( !(context instanceof Context ) ){
                throw createError( '`context` expects an instance of `Context`' );
            }
            this._mapping.context = context;
            return this;
        },

        /**
         *
         * @param {string} eventName
         * @protected
         */
        _toEvent : function( eventName ){
            this._mapping.provider = COMMAND_PROVIDER;
            //todo: map event
            return this;
        }
    } );

    /**
     * @protected
     * @type {{}}
     */
    Mapper.providers = {};

    /**
     *
     * @param options
     * @constructor
     */
    function Context( options ){
        this._mappings = {};

        /**
         * @param {(...string|string[]|{})} [keys]
         */
        this.release.wires = _.bind( function( keys ){
            keys = (keys)
                ? toHash( _.toArray( arguments ) )
                : _.keys( this._mappings );
            _.each( keys, function( key ){
                var mapping = this._mappings[ key ];
                delete this._mappings[ key ];
                if( !_.contains( this._mappings, mapping ) ){
                    mapping.reset();
                }
            }, this );
        }, this );
        /**
         *
         */
        this.release.all = _.bind( function(){
            this.release.wires();
        }, this );

        this.has.each = _.bind( function( keys ){
            var result = this.has( _.toArray( arguments ) );
            if( _.isBoolean( result ) ){
                return result;
            }

            return _.every( result, function( value,
                                              key ){
                return value;
            } )
        }, this )
    }

    _.extend( Context.prototype, {
        /**
         *
         * @param {Mapping} mapping
         * @param {(...string|string[]|{})} [keys]
         * @protected
         */
        _map : function( mapping,
                         keys ){
            keys = toHash( _.toArray( arguments ) );
            _.each( keys, function( key ){
                if( this._mappings.hasOwnProperty( key ) ){
                    throw createError( 'mapping already exists for "$1"', key );
                }
                this._mappings[ key ] = mapping;
            }, this );
        },

        /**
         * {{wires: Function}}
         */
        release : {},

        /**
         *
         * @param {*} value
         * @throws {Error} Context#wire parameter should not be 'undefined' or 'null'
         * @returns {Mapper} The constructor of Mapping returns a Mapper instance
         */
        wire : function( value ){
            if( _.isUndefined( value ) || _.isNull( value ) ){
                throw createError( "Context#wire parameter should not be 'undefined' or 'null'" );
            }
            return new Mapping( value, this );
        },

        _get : function( keys,
                         receiver ){
            return _.reduce( keys, function( memo,
                                             key,
                                             index ){
                if( !this._mappings.hasOwnProperty( key ) ){
                    throw createError( 'no mapping found for key "$1"', key );
                }
                if( "undefined" !== typeof memo[ index ] ){
                    throw createError( 'cannot overwrite "$1"', index );
                }
                var mapping = this._mappings[ key ];
                memo[ index ] = mapping.provider.construct( mapping, key );
                return memo;
            }, receiver, this );
        },

        /**
         *
         * @param {(...string|string[]|{})} keys
         * @throws {Error} no mapping found for key
         * @returns {*|*[]|{}}
         */
        get : function( keys ){
            keys = toHash( _.toArray( arguments ) );
            var result = this._get( keys, {} );
            if( 1 === _.size( result ) ){
                result = _.reduce( result, function( memo ){
                    return memo;
                } );
            }
            return result;
        },

        /**
         *
         * @param {*} obj
         * @param {({}|[]|...string)} wiring
         * @returns {Context}
         */
        resolve : function( obj,
                            wiring ){
            if( !_.isObject( obj ) || _.isArray( obj ) ){
                throw createError( 'Context#resolve parameter should be an object' );
            }
            var args = _.toArray( arguments );
            args.shift();
            //todo: the other stuff needs to be extracted from obj as well: parameters et cetera.
            var keys = _.defaults( toHash( args ), toHash( obj.wiring ) );
            return this._get( keys, obj );
        },

        /**
         *
         * @param {(...string|string[]|{})} keys
         * @returns {boolean}
         */
        has : function( keys ){
            keys = toHash( _.toArray( arguments ) );
            var result = _.reduce( keys, function( memo,
                                                   key,
                                                   index ){
                memo[ index ] = this._mappings.hasOwnProperty( key );
                return memo;
            }, {}, this );
            if( 1 === _.size( result ) ){
                result = _.reduce( result, function( memo ){
                    return memo;
                } );
            }
            return result;
        }
    } );

    /**
     *
     * @param {string} providerName
     * @throws {Error} Context.provide expects a String as argument
     * @throws {Error} A provider mapping already exists for
     * @returns {{using: Function}}
     */
    Context.provide = function( providerName ){
        if( !_.isString( providerName ) ){
            throw createError( "Context.provide expects a String as argument" );
        }
        if( Mapper.providers.hasOwnProperty( providerName ) ){
            throw createError( "A provider mapping already exists for '$1'", providerName );
        }
        return {
            /**
             *
             * @param {{}} provider
             * @throws {Error} A provider must expose a 'construct' method
             */
            using : function( provider ){
                if( !provider.hasOwnProperty( "construct" ) ){
                    throw createError( "A provider must expose a 'construct' method" );
                }
                /**
                 * @protected
                 * @this Mapper
                 * @param {(string|string[]|{})} keys
                 * @returns {*}
                 */
                Mapper.providers[ providerName ] = function( keys ){
                    if( provider.validate ){
                        provider.validate( this._mapping );
                    }
                    return this._mapToProvider( provider, _.toArray( arguments ) );
                };
            }
        }
    };

    /**
     *
     * @type {{provider: Function}}
     */
    Context.release = {
        /**
         *
         * @param {String} providerName
         */
        provider : function( providerName ){
            delete Mapper.providers[ providerName ];
        }
    };

    /**
     *
     * @type {{provider: Function}}
     */
    Context.has = {
        /**
         *
         * @param {String} providerName
         * @returns {boolean}
         */
        provider : function( providerName ){
            return Mapper.providers.hasOwnProperty( providerName );
        }
    };

    Context.createInstanceAndResolve = createInstanceAndResolve;
    Context.createFactory = createFactory;

    Context.provide( "singleton" )
        .using( SINGLETON_PROVIDER );

    Context.provide( "multiton" )
        .using( MULTITON_PROVIDER );

    Context.provide( "value" )
        .using( VALUE_PROVIDER );

    Context.provide( "unresolved" )
        .using( UNRESOLVED_PROVIDER );

    Context.provide( "producer" )
        .using( PRODUCER_PROVIDER );

    Context.provide( "constructor" )
        .using( CONSTRUCTOR_PROVIDER );

    Geppetto.Context = Context;
    Geppetto.toHash = toHash;

    Backbone.Geppetto = Geppetto;

    return Geppetto;
} ));
