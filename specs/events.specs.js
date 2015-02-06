"use strict";

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );
var Geppetto = require( "../backbone.geppetto.js" );
var NOOP = _.noop;

describe( "-- Events --", function(){

    describe( "spec file", function(){
        it( "should be found", function(){
            expect( true ).to.be.true();
        } );
    } );

    describe( "Geppetto.Events", function(){
        it( "should be an object", function(){
            expect( Geppetto.Events ).to.be.an.object();
        } );
        var subject;
        beforeEach( function(){
            subject = _.extend( {}, Geppetto.Events );
        } );
        afterEach( function(){
            subject.off();
        } );

        describe( "extended object", function(){
            var methods = [ "on", "off", "trigger", "once", "listenTo", "stopListening", "listenToOnce" ];

            methods.forEach( function( methodName ){
                it( [ "should have an `", methodName, "` method" ].join( "" ), function(){
                    expect( subject[ methodName ] ).to.be.a.function();
                } )
            } );

            describe( "#on", function(){
                it( "should register an event and callback", function(){
                    var listener = sinon.spy();
                    subject.on( "event", listener );
                    subject.trigger( "event" );
                    expect( listener.callCount ).to.equal( 1 );
                } );
                it( "should register the callback in `scope`", function(){
                    var scope;
                    var handler = function(){
                        scope = this;
                    };
                    var listener = {};
                    subject.on( "event", handler, listener );
                    subject.trigger( "event" );
                    expect( scope ).to.equal( listener );
                } );
                it( "should expose an `execute` method", function(){
                    var result = subject.on( "event" );
                    expect( result.execute ).to.be.a.function();
                } );
                it( "should expose a `have` method", function(){
                    var result = subject.on( "event" );
                    expect( result.have ).to.be.a.function();
                } );
                describe( "#execute", function(){
                    it( "should throw an error for a `string` as callback", function(){
                        expect( function(){
                            subject.on( "event" ).execute( "" );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for a `boolean` as callback", function(){
                        expect( function(){
                            subject.on( "event" ).execute( true );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for a `number` as callback", function(){
                        expect( function(){
                            subject.on( "event" ).execute( 9 );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for `undefined` as callback", function(){
                        expect( function(){
                            subject.on( "event" ).execute();
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for `null` as callback", function(){
                        expect( function(){
                            subject.on( "event" ).execute( null );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should register all values of an `object` as callback", function(){
                        var callbacks = {
                            a : sinon.spy(),
                            b : sinon.spy()
                        };
                        subject.on( "event" ).execute( callbacks );
                        subject.trigger( "event" );
                        expect( callbacks.a.callCount ).to.equal( 1 );
                        expect( callbacks.b.callCount ).to.equal( 1 );
                    } );
                    it( "should register all values of an `array` as callback", function(){
                        var callbacks = {
                            a : sinon.spy(),
                            b : sinon.spy()
                        };
                        subject.on( "event" ).execute( [ callbacks.a, callbacks.b ] );
                        subject.trigger( "event" );
                        expect( callbacks.a.callCount ).to.equal( 1 );
                        expect( callbacks.b.callCount ).to.equal( 1 );
                    } );
                    it( "should register a function as callback", function(){
                        var listener = sinon.spy();
                        subject.on( "event" ).execute( listener );
                        subject.trigger( "event" );
                        expect( listener.callCount ).to.equal( 1 );
                    } );
                } );
                describe( "#have", function(){
                    it( "should throw an error for a `boolean` as target", function(){
                        expect( function(){
                            subject.on( "event" ).have( true );
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for a `number` as target", function(){
                        expect( function(){
                            subject.on( "event" ).have( 9 );
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for an `array` as target", function(){
                        expect( function(){
                            subject.on( "event" ).have( [] );
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for `undefined` as target", function(){
                        expect( function(){
                            subject.on( "event" ).have();
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for `null` as target", function(){
                        expect( function(){
                            subject.on( "event" ).have( null );
                        } ).to.throw( /object|string/i );
                    } );
                    describe( "when passed a `string`", function(){

                        var constructed;
                        var Listener;
                        beforeEach( function(){
                            Listener = function(){
                                constructed = this;
                            };
                            var context = subject.context = new Geppetto.Context();
                            context.wire( Listener ).as.singleton( "listener" );
                        } );
                        afterEach( function(){
                            constructed = undefined;
                            subject.context && subject.context.release.all();
                            delete subject.context;
                        } );
                        it( "should throw an error when the dispatcher has no `context` member", function(){
                            subject.context = undefined;
                            expect( function(){
                                subject.on( "event" ).have( "" );
                            } ).to.throw( /context/i );
                        } );
                        it( "should expose an `execute` method", function(){
                            var result = subject.on( "event" ).have( "" );
                            expect( result.execute ).to.be.a.function();
                        } );
                        describe( "#execute", function(){
                            it( "should not resolve the wiring until triggered", function(){
                                subject.on( "event" ).have( "listener" ).execute( NOOP );
                                expect( constructed ).to.be.undefined();
                                subject.trigger( "event" );
                                expect( constructed ).not.to.be.undefined();
                            } );
                            it( "should register a `function` as callback in resolved scope `have`", function(){
                                var executed;
                                subject.on( "event" ).have( "listener" ).execute( function(){
                                    executed = this
                                } );
                                subject.trigger( "event" );
                                expect( executed ).to.equal( constructed );
                            } );
                            it( "should register a `string` as a method callback", function(){
                                var spy = Listener.prototype.handler = sinon.spy();
                                subject.on( "event" ).have( "listener" ).execute( "handler" );
                                subject.trigger( "event" );
                                expect( spy.callCount ).to.equal( 1 );
                            } );
                            it( "should throw an error if the `have` scope has no member with provided name", function(){
                                subject.on( "event" ).have( "listener" ).execute( "not a property" );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /method/i );
                            } );
                            it( "should throw an error if the `have` scope has no function as a member with provided name", function(){
                                Listener.prototype.handler = "not a function";
                                subject.on( "event" ).have( "listener" ).execute( "handler" );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function/i );
                            } );
                            it( "should throw an error for a `boolean` as callback", function(){
                                subject.on( "event" ).have( "listener" ).execute( true );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for a `number` as callback", function(){
                                subject.on( "event" ).have( "listener" ).execute( 9 );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for `null` as callback", function(){
                                subject.on( "event" ).have( "listener" ).execute( null );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should register `execute` as a callback if none was provided", function(){
                                var spy = Listener.prototype.execute = sinon.spy();
                                subject.on( "event" ).have( "listener" ).execute();
                                subject.trigger( "event" );
                                expect( spy.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `object` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject.on( "event" ).have( "listener" ).execute( handlers );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `array` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject.on( "event" ).have( "listener" ).execute( _.values( handlers ) );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                        } );
                    } );
                    describe( "when passed a `function`", function(){
                        it( "should expose an `execute` method", function(){
                            var result = subject.on( "event" ).have( {} );
                            expect( result.execute ).to.be.a.function();
                        } );
                        describe( "#execute", function(){
                            it( "should register a `function` as callback in scope `have`", function(){
                                var scope;
                                var handler = function(){
                                    scope = this;
                                };
                                var listener = {};
                                subject.on( "event" ).have( listener ).execute( handler );
                                subject.trigger( "event" );
                                expect( scope ).to.equal( listener );
                            } );
                            it( "should register a `string` as a method callback", function(){
                                var listener = {
                                    handler : sinon.spy()
                                };
                                subject.on( "event" ).have( listener ).execute( "handler" );
                                subject.trigger( "event" );
                                expect( listener.handler.callCount ).to.equal( 1 );
                            } );
                            it( "should throw an error if the `have` scope has no member with provided name", function(){
                                expect( function(){
                                    subject.on( "event" ).have( {} ).execute( "not a property" );
                                } ).to.throw( /method/i );
                            } );
                            it( "should throw an error if the `have` scope has no function as a member with provided name", function(){
                                expect( function(){
                                    subject.on( "event" ).have( { handler : "handler" } ).execute( "handler" );
                                } ).to.throw( /function/i );
                            } );
                            it( "should throw an error for a `boolean` as callback", function(){
                                expect( function(){
                                    subject.on( "event" ).have( {} ).execute( true );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for a `number` as callback", function(){
                                expect( function(){
                                    subject.on( "event" ).have( {} ).execute( 9 );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for `null` as callback", function(){
                                expect( function(){
                                    subject.on( "event" ).have( {} ).execute( null );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should register `execute` as a callback if none was provided", function(){
                                var listener = {
                                    execute : sinon.spy()
                                };
                                subject.on( "event" ).have( listener ).execute();
                                subject.trigger( "event" );
                                expect( listener.execute.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `object` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject.on( "event" ).have( {} ).execute( handlers );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `array` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject.on( "event" ).have( {} ).execute( _.values( handlers ) );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                        } );
                    } );

                } );
            } )
        } );
    } );
} )
;