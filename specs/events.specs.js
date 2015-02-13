"use strict";

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );
var Geppetto = require( "../backbone.geppetto.js" );
var Backbone = require( "Backbone" );
var NOOP = _.noop;

describe( "-- Events --", function(){

    describe( "spec file", function(){
        it( "should be found", function(){
            expect( true ).to.be.true();
        } );
    } );

    describe( "Geppetto.Events", function(){
        it( "should be a function", function(){
            expect( Geppetto.Events ).to.be.a.function();
        } );

        function testInFull( factory ){
            var subject;
            beforeEach( function(){
                subject = factory();
            } );
            afterEach( function(){
                subject.off();
            } );

            var methods = [ "on", "off", "trigger", "once", "listenTo", "stopListening", "listenToOnce" ];

            methods.forEach( function( methodName ){
                it( [ "should expose a `", methodName, "` method" ].join( "" ), function(){
                    expect( subject[ methodName ] ).to.be.a.function();
                } )
            } );

            function testListenMethod( method ){
                it( "should register an event and callback (as in Backbone)", function(){
                    var listener = sinon.spy();
                    subject[ method ]( "event", listener );
                    subject.trigger( "event" );
                    expect( listener.callCount ).to.equal( 1 );
                } );
                it( "should register the callback in `scope` (as in Backbone)", function(){
                    var scope;
                    var handler = function(){
                        scope = this;
                    };
                    var listener = {};
                    subject[ method ]( "event", handler, listener );
                    subject.trigger( "event" );
                    expect( scope ).to.equal( listener );
                } );
                it( "should expose an `execute` method", function(){
                    var result = subject[ method ]( "event" );
                    expect( result.execute ).to.be.a.function();
                } );
                it( "should expose a `have` method", function(){
                    var result = subject[ method ]( "event" );
                    expect( result.have ).to.be.a.function();
                } );
                describe( "#execute", function(){
                    it( "should throw an error for a `string` as callback", function(){
                        expect( function(){
                            subject[ method ]( "event" ).execute( "" );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for a `boolean` as callback", function(){
                        expect( function(){
                            subject[ method ]( "event" ).execute( true );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for a `number` as callback", function(){
                        expect( function(){
                            subject[ method ]( "event" ).execute( 9 );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for `undefined` as callback", function(){
                        expect( function(){
                            subject[ method ]( "event" ).execute();
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should throw an error for `null` as callback", function(){
                        expect( function(){
                            subject[ method ]( "event" ).execute( null );
                        } ).to.throw( /function|object|array/i );
                    } );
                    it( "should register all values of an `object` as callback", function(){
                        var callbacks = {
                            a : sinon.spy(),
                            b : sinon.spy()
                        };
                        subject[ method ]( "event" ).execute( callbacks );
                        subject.trigger( "event" );
                        expect( callbacks.a.callCount ).to.equal( 1 );
                        expect( callbacks.b.callCount ).to.equal( 1 );
                    } );
                    it( "should register all values of an `array` as callback", function(){
                        var callbacks = {
                            a : sinon.spy(),
                            b : sinon.spy()
                        };
                        subject[ method ]( "event" ).execute( [ callbacks.a, callbacks.b ] );
                        subject.trigger( "event" );
                        expect( callbacks.a.callCount ).to.equal( 1 );
                        expect( callbacks.b.callCount ).to.equal( 1 );
                    } );
                    it( "should register a function as callback", function(){
                        var listener = sinon.spy();
                        subject[ method ]( "event" ).execute( listener );
                        subject.trigger( "event" );
                        expect( listener.callCount ).to.equal( 1 );
                    } );
                } );
                describe( "#have", function(){
                    it( "should throw an error for a `boolean` as target", function(){
                        expect( function(){
                            subject[ method ]( "event" ).have( true );
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for a `number` as target", function(){
                        expect( function(){
                            subject[ method ]( "event" ).have( 9 );
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for an `array` as target", function(){
                        expect( function(){
                            subject[ method ]( "event" ).have( [] );
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for `undefined` as target", function(){
                        expect( function(){
                            subject[ method ]( "event" ).have();
                        } ).to.throw( /object|string/i );
                    } );
                    it( "should throw an error for `null` as target", function(){
                        expect( function(){
                            subject[ method ]( "event" ).have( null );
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
                                subject[ method ]( "event" ).have( "" );
                            } ).to.throw( /context/i );
                        } );
                        it( "should expose an `execute` method", function(){
                            var result = subject[ method ]( "event" ).have( "" );
                            expect( result.execute ).to.be.a.function();
                        } );
                        describe( "#execute", function(){
                            it( "should not resolve the wiring until triggered", function(){
                                subject[ method ]( "event" ).have( "listener" ).execute( NOOP );
                                expect( constructed ).to.be.undefined();
                                subject.trigger( "event" );
                                expect( constructed ).not.to.be.undefined();
                            } );
                            it( "should register a `function` as callback in resolved scope `have`", function(){
                                var executed;
                                subject[ method ]( "event" ).have( "listener" ).execute( function(){
                                    executed = this
                                } );
                                subject.trigger( "event" );
                                expect( executed ).to.equal( constructed );
                            } );
                            it( "should register a `string` as a method callback", function(){
                                var spy = Listener.prototype.handler = sinon.spy();
                                subject[ method ]( "event" ).have( "listener" ).execute( "handler" );
                                subject.trigger( "event" );
                                expect( spy.callCount ).to.equal( 1 );
                            } );
                            it( "should throw an error if the `have` scope has no member with provided name", function(){
                                subject[ method ]( "event" ).have( "listener" ).execute( "not a property" );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /method/i );
                            } );
                            it( "should throw an error if the `have` scope has no function as a member with provided name", function(){
                                Listener.prototype.handler = "not a function";
                                subject[ method ]( "event" ).have( "listener" ).execute( "handler" );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function/i );
                            } );
                            it( "should throw an error for a `boolean` as callback", function(){
                                subject[ method ]( "event" ).have( "listener" ).execute( true );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for a `number` as callback", function(){
                                subject[ method ]( "event" ).have( "listener" ).execute( 9 );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for `null` as callback", function(){
                                subject[ method ]( "event" ).have( "listener" ).execute( null );
                                expect( function(){
                                    subject.trigger( "event" );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should register `execute` as a callback if none was provided", function(){
                                var spy = Listener.prototype.execute = sinon.spy();
                                subject[ method ]( "event" ).have( "listener" ).execute();
                                subject.trigger( "event" );
                                expect( spy.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `object` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject[ method ]( "event" ).have( "listener" ).execute( handlers );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `array` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject[ method ]( "event" ).have( "listener" ).execute( _.values( handlers ) );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                        } );
                    } );
                    describe( "when passed a `function`", function(){
                        it( "should expose an `execute` method", function(){
                            var result = subject[ method ]( "event" ).have( {} );
                            expect( result.execute ).to.be.a.function();
                        } );
                        describe( "#execute", function(){
                            it( "should register a `function` as callback in scope `have`", function(){
                                var scope;
                                var handler = function(){
                                    scope = this;
                                };
                                var listener = {};
                                subject[ method ]( "event" ).have( listener ).execute( handler );
                                subject.trigger( "event" );
                                expect( scope ).to.equal( listener );
                            } );
                            it( "should register a `string` as a method callback", function(){
                                var listener = {
                                    handler : sinon.spy()
                                };
                                subject[ method ]( "event" ).have( listener ).execute( "handler" );
                                subject.trigger( "event" );
                                expect( listener.handler.callCount ).to.equal( 1 );
                            } );
                            it( "should throw an error if the `have` scope has no member with provided name", function(){
                                expect( function(){
                                    subject[ method ]( "event" ).have( {} ).execute( "not a property" );
                                } ).to.throw( /method/i );
                            } );
                            it( "should throw an error if the `have` scope has no function as a member with provided name", function(){
                                expect( function(){
                                    subject[ method ]( "event" ).have( { handler : "handler" } ).execute( "handler" );
                                } ).to.throw( /function/i );
                            } );
                            it( "should throw an error for a `boolean` as callback", function(){
                                expect( function(){
                                    subject[ method ]( "event" ).have( {} ).execute( true );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for a `number` as callback", function(){
                                expect( function(){
                                    subject[ method ]( "event" ).have( {} ).execute( 9 );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should throw an error for `null` as callback", function(){
                                expect( function(){
                                    subject[ method ]( "event" ).have( {} ).execute( null );
                                } ).to.throw( /function|object|array|string/i );
                            } );
                            it( "should register `execute` as a callback if none was provided", function(){
                                var listener = {
                                    execute : sinon.spy()
                                };
                                subject[ method ]( "event" ).have( listener ).execute();
                                subject.trigger( "event" );
                                expect( listener.execute.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `object` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject[ method ]( "event" ).have( {} ).execute( handlers );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                            it( "should register all values of an `array` as callback", function(){
                                var handlers = {
                                    a : sinon.spy(),
                                    b : sinon.spy()
                                };
                                subject[ method ]( "event" ).have( {} ).execute( _.values( handlers ) );
                                subject.trigger( "event" );
                                expect( handlers.a.callCount ).to.equal( 1 );
                                expect( handlers.b.callCount ).to.equal( 1 );
                            } );
                        } );
                    } );

                } );
            }

            describe( "#on", function(){
                testListenMethod( "on" );
                it( "should register a handler permanently", function(){
                    var spy = sinon.spy();
                    subject.on( "event" ).execute( spy );
                    subject.trigger( "event" );
                    subject.trigger( "event" );
                    subject.trigger( "event" );
                    expect( spy.callCount ).to.equal( 3 );
                } );
            } );
            describe( "#once", function(){
                testListenMethod( "once" );
                it( "should register a handler for single use", function(){
                    var spy = sinon.spy();
                    subject.once( "event" ).execute( spy );
                    subject.trigger( "event" );
                    subject.trigger( "event" );
                    subject.trigger( "event" );
                    expect( spy.callCount ).to.equal( 1 );
                } );
            } );
            describe( "#trigger", function(){
                it( "should pass parameters to the handler", function(){
                    var passed;
                    subject.on( "event" ).execute( function(){
                        passed = _.toArray( arguments );
                    } );
                    subject.trigger( "event", "a", "b", "c" );
                    expect( passed ).to.eql( [ "a", "b", "c" ] );
                } );
                it( "should return itself", function(){
                    var result = subject.trigger( "event" );
                    expect( result ).to.equal( subject );
                } );
            } );
            describe( "#dispatch", function(){
                it( "should pass `eventName` and `eventData` to handlers", function(){
                    var passed;
                    subject.on( "event" ).execute( function(){
                        passed = _.toArray( arguments );
                    } );
                    subject.dispatch( "event", [ "a", "b", "c" ] );
                    expect( passed ).to.eql( [
                        {
                            eventName : "event",
                            eventData : [ "a", "b", "c" ]
                        }
                    ] );
                } );
                it( "should return itself", function(){
                    var result = subject.trigger( "event" );
                    expect( result ).to.equal( subject );
                } );
            } );
            describe( "#listenTo", function(){
                it( "should expose an `on` method", function(){
                    expect( subject.listenTo( {} ).on ).to.be.a.function();
                } );
                var dispatcher;
                beforeEach( function(){
                    dispatcher = _.extend( {}, Geppetto.Events );
                } );
                afterEach( function(){
                    dispatcher.off();
                } );
                it( "should bind a handler to the subject (as in Backbone)", function(){
                    var scope;
                    subject.listenTo( dispatcher, "event", function(){
                        scope = this;
                    } );
                    subject.trigger( "event" );
                    expect( scope ).to.equal( subject );
                } );
                describe( "#on", function(){
                    it( "should expose an `execute` method", function(){
                        var result = subject.listenTo( dispatcher ).on( "event" );
                        expect( result.execute ).to.be.a.function();
                    } );
                    describe( "#execute", function(){
                        it( "should register a callback", function(){
                            var spy = sinon.spy();
                            subject.listenTo( dispatcher ).on( "event" ).execute( spy );
                            dispatcher.trigger( "event" );
                            expect( spy.callCount ).to.equal( 1 );
                        } );
                        it( "should register a `string` as a method callback", function(){
                            subject.handler = sinon.spy();
                            subject.listenTo( dispatcher ).on( "event" ).execute( "handler" );
                            dispatcher.trigger( "event" );
                            expect( subject.handler.callCount ).to.equal( 1 );
                            delete subject.handler;
                        } );
                        it( "should throw an error if the subject has no member with provided name", function(){
                            expect( function(){
                                subject.listenTo( dispatcher ).on( "event" ).execute( "not a property" )
                            } ).to.throw( /method/i );
                        } );
                        it( "should throw an error if the subject has no function as a member with provided name", function(){
                            subject.handler = "handler";
                            expect( function(){
                                subject.listenTo( dispatcher ).on( "event" ).execute( "handler" );
                            } ).to.throw( /function/i );
                            delete subject.handler;
                        } );
                        it( "should throw an error for a `boolean` as callback", function(){
                            expect( function(){
                                subject.listenTo( dispatcher ).on( "event" ).execute( true );
                            } ).to.throw( /function|object|array|string/i );
                        } );
                        it( "should throw an error for a `number` as callback", function(){
                            expect( function(){
                                subject.listenTo( dispatcher ).on( "event" ).execute( 9 );
                            } ).to.throw( /function|object|array|string/i );
                        } );
                        it( "should throw an error for `null` as callback", function(){
                            expect( function(){
                                subject.listenTo( dispatcher ).on( "event" ).execute( null );
                            } ).to.throw( /function|object|array|string/i );
                        } );
                        it( "should register `execute` as a callback if none was provided", function(){
                            subject.execute = sinon.spy();
                            subject.listenTo( dispatcher ).on( "event" ).execute();
                            dispatcher.trigger( "event" );
                            expect( subject.execute.callCount ).to.equal( 1 );
                            delete subject.execute;
                        } );
                        it( "should register all values of an `object` as callback", function(){
                            var handlers = {
                                a : sinon.spy(),
                                b : sinon.spy()
                            };
                            subject.listenTo( dispatcher ).on( "event" ).execute( handlers );
                            dispatcher.trigger( "event" );
                            expect( handlers.a.callCount ).to.equal( 1 );
                            expect( handlers.b.callCount ).to.equal( 1 );
                        } );
                        it( "should register all values of an `array` as callback", function(){
                            var handlers = {
                                a : sinon.spy(),
                                b : sinon.spy()
                            };
                            subject.listenTo( dispatcher ).on( "event" ).execute( _.values( handlers ) );
                            dispatcher.trigger( "event" );
                            expect( handlers.a.callCount ).to.equal( 1 );
                            expect( handlers.b.callCount ).to.equal( 1 );
                        } );
                        it( "should allow listening to Backbone.Events objects", function(){
                            var vent = _.extend( {}, Backbone.Events );
                            var spy = sinon.spy();
                            subject.listenTo( vent ).on( "event" ).execute( spy );
                            vent.trigger( "event" );
                            expect( spy.callCount ).to.equal( 1 );
                        } );
                    } );
                } );
            } );
        }

        describe( "as an extension source", function(){
            testInFull( function(){
                return _.extend( {}, Geppetto.Events );
            } );
        } );
        describe( "as a constructor", function(){
            var factory = function(){
                return new Geppetto.Events();
            };
            it( "should create an instance of Events", function(){
                var events = factory();
                expect( events ).to.be.an.instanceOf( Geppetto.Events );
            } );
            testInFull( factory )
        } );
        describe( "as a factory", function(){
            var factory = Geppetto.Events;
            it( "should create an instance of Events", function(){
                var events = factory();
                expect( events ).to.be.an.instanceOf( Geppetto.Events );
            } );
            testInFull( factory );
        } );
        describe( "as a wrapper", function(){
            it( "should return the subject", function(){
                var subject = {};
                var result = Geppetto.Events( subject );
                expect( result ).to.equal( subject );
            } );
        } );
    } );
} )
;