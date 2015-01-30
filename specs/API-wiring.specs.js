"use strict";

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );
var Geppetto = require( "../backbone.geppetto.js" );

var FixtureClass = function(){
    this.foo = undefined;
};

Geppetto.Context.provide( "mapping" ).using( {
    construct : function( mapping ){
        return mapping;
    }
} );
Geppetto.Context.provide( "reflection" ).using( {
    construct : function( mapping ){
        return mapping.source;
    }
} );
Geppetto.Context.provide( "resolution" ).using( {
    construct : function( mapping ){
        return Geppetto.Context.createInstanceAndResolve( mapping );
    }
} )

function verifyMapper( mapper ){
    expect( mapper ).to.have.property( "using" );
    expect( mapper ).to.have.property( "and" );
    expect( mapper ).to.have.property( "to" );
}

describe( "-- wiring API --", function(){
    var subject;
    var undefined;
    describe( "spec file", function(){
        it( "should be found", function(){
            expect( true ).to.be.true();
        } );
    } );

    describe( "Geppetto.Context instance", function(){
        it( "should expose a `has` method", function(){
            expect( subject.has ).to.be.a.function();
        } );
        it( "should expose a `get` method", function(){
            expect( subject.get ).to.be.a.function();
        } );
        it( "should expose a `wire` method", function(){
            expect( subject.wire ).to.be.a.function();
        } );
        it( "should expose a `release` object", function(){
            expect( subject.release ).to.be.an.object();
        } );
        it( "should expose a `resolve` method", function(){
            expect( subject.resolve ).to.be.a.function();
        } );
        beforeEach( function(){
            subject = new Geppetto.Context();
        } );
        afterEach( function(){
            subject.release.all();
        } );

        describe( "#wire", function(){
            it( "should throw an error when wiring `undefined`", function(){
                expect( function(){
                    subject.wire( undefined );
                } ).to.throw( /'undefined'/ );
            } );
            it( "should throw an error when wiring `null`", function(){
                expect( function(){
                    subject.wire( null );
                } ).to.throw( /'null'/ );
            } );
            it( "should return a mapper object", function(){
                var result = subject.wire( {} );
                expect( result ).to.have.property( "as" );
                expect( result ).to.have.property( "to" );
                expect( result ).to.have.property( "using" );
            } );
            describe( ".as", function(){
                it( "should register the value for a single key", function(){
                    var value = {};
                    subject.wire( value ).as.reflection( "a" );
                    var result = subject.get( "a" );
                    expect( result ).to.equal( value );
                } );
                it( "should register the value for multiple keys", function(){
                    var value = {};
                    subject.wire( value ).as.reflection( "a", "b", "c" );
                    var result = subject.get( "a", "b", "c" );
                    expect( result.a ).to.equal( value );
                    expect( result.b ).to.equal( value );
                    expect( result.c ).to.equal( value );
                } );
                it( "should register the value for an array of keys", function(){
                    var value = {};
                    subject.wire( value ).as.reflection( [ "a", "b", "c" ] );
                    var result = subject.get( "a", "b", "c" );
                    expect( result.a ).to.equal( value );
                    expect( result.b ).to.equal( value );
                    expect( result.c ).to.equal( value );
                } );
                it( "should register the value for a hash, using the values as keys", function(){
                    var value = {};
                    subject.wire( value ).as.reflection( {
                        aa : "a",
                        bb : "b",
                        cc : "c"
                    } );
                    var result = subject.get( "a", "b", "c" );
                    expect( result.a ).to.equal( value );
                    expect( result.b ).to.equal( value );
                    expect( result.c ).to.equal( value );
                } );
                describe( ".<provider>", function(){
                    describe( ".using", function(){
                        describe( ".wiring", function(){
                            it( "should return an instance of Mapper", function(){
                                var result = subject.wire( {} )
                                    .as.reflection( "under test" )
                                    .using.wiring( {} );
                                verifyMapper( result );
                            } );

                            it( "should store the wirings when an array of strings is passed", function(){
                                var mapper = subject.wire( {
                                    name : "under test"
                                } ).as.mapping( "under test" )
                                    .using.wiring( [ "a", "b" ] );
                                var mapping = subject.get( "under test" );
                                expect( mapping.wiring ).to.have.a.property( "a" );
                                expect( mapping.wiring.a ).to.equal( "a" );
                                expect( mapping.wiring ).to.have.a.property( "b" );
                                expect( mapping.wiring.b ).to.equal( "b" );
                            } );
                            it( "should store the wirings when a hash is passed", function(){
                                subject.wire( {
                                    name : "under test"
                                } ).as.mapping( "under test" )
                                    .using.wiring( {
                                        aa : "a",
                                        bb : "b"
                                    } );
                                var mapping = subject.get( "under test" );
                                expect( mapping.wiring ).to.have.property( "aa" );
                                expect( mapping.wiring.aa ).to.equal( "a" );
                                expect( mapping.wiring ).to.have.property( "bb" );
                                expect( mapping.wiring.bb ).to.equal( "b" );
                            } );
                        } );
                        describe( ".parameters", function(){
                            it( "should return an instance of Mapper", function(){
                                var result = subject.wire( {} )
                                    .as.reflection( "under test" )
                                    .using.parameters( {} );
                                verifyMapper( result );
                            } );
                            it( "should store the parameters as an array", function(){
                                var obj = {};
                                var arr = [];
                                subject.wire( { name : "under test" } )
                                    .as.mapping( "under test" )
                                    .using.parameters( true, null, undefined, "a string", 9, obj, arr );
                                var mapping = subject.get( "under test" );
                                expect( mapping.parameters ).to.be.an.array();
                                expect( mapping.parameters ).to.include( true );
                                expect( mapping.parameters ).to.include( null );
                                expect( mapping.parameters ).to.include( undefined );
                                expect( mapping.parameters ).to.include( "a string" );
                                expect( mapping.parameters ).to.include( 9 );
                                expect( mapping.parameters ).to.include( obj );
                                expect( mapping.parameters ).to.include( arr );
                            } );
                        } );
                        describe( ".context", function(){
                            it( "should return an instance of Mapper", function(){
                                var result = subject.wire( {} )
                                    .as.reflection( "under test" )
                                    .using.context( new Geppetto.Context() );
                                verifyMapper( result );
                            } );
                            it( "should throw an error when not an instance of `Context` is passed", function(){
                                expect( function(){
                                    subject.wire( { name : "under test" } )
                                        .as.mapping( "under test" )
                                        .using.context( {} )
                                } ).to.throw( /context/i );
                            } );
                            it( "should store it as-is", function(){
                                var newContext = new Geppetto.Context();
                                subject.wire( { name : "under test" } )
                                    .as.mapping( "under test" )
                                    .using.context( newContext );
                                var mapping = subject.get( "under test" );
                                expect( mapping.context ).to.equal( newContext );
                            } );
                        } );
                        describe( ".handlers", function(){
                            it( "should return an instance of Mapper", function(){
                                var result = subject.wire( {} )
                                    .as.reflection( "under test" )
                                    .using.handlers( {} );
                                verifyMapper( result );
                            } );
                            //todo: handlers
                        } );
                    } );
                    describe( ".as", function(){
                        describe( ".<provider>", function(){
                            it( "should throw an error", function(){
                                expect( function(){
                                    subject.wire( {} )
                                        .as.reflection( "under test" )
                                        .as.reflection( "still under test" )
                                } ).to.throw( /multiple providers/i );
                            } );
                        } );
                    } )
                } )
            } );
        } );

        describe( "#has", function(){
            beforeEach( function(){
                subject.wire( {} ).as.reflection( "a" );
                subject.wire( {} ).as.reflection( "b" );
                subject.wire( {} ).as.reflection( "c" );
            } );
            it( "should return `true` when a single key was provided and found", function(){
                expect( subject.has( "a" ) ).to.be.true();
            } );
            it( "should return a hash with correct values when an array of keys was provided and all were found", function(){
                var result = subject.has( [ "c", "a", "b" ] );
                expect( result ).to.have.property( "c" );
                expect( result.c ).to.be.true();
                expect( result ).to.have.property( "a" );
                expect( result.a ).to.be.true();
                expect( result ).to.have.property( "b" );
                expect( result.b ).to.be.true();
            } );
            it( "should return a hash with correct values when a hash of keys was provided and all were found", function(){
                var result = subject.has( {
                    aa : "a",
                    bb : "b",
                    cc : "c"
                } );
                expect( result ).to.have.property( "cc" );
                expect( result.cc ).to.be.true();
                expect( result ).to.have.property( "aa" );
                expect( result.aa ).to.be.true();
                expect( result ).to.have.property( "bb" );
                expect( result.bb ).to.be.true();
            } );
            it( "should return a hash with correct values when multiple keys wre provided and all were found", function(){
                var result = subject.has( "c", "a", "b" );
                expect( result ).to.have.property( "c" );
                expect( result.c ).to.be.true();
                expect( result ).to.have.property( "a" );
                expect( result.a ).to.be.true();
                expect( result ).to.have.property( "b" );
                expect( result.b ).to.be.true();
            } );
            it( "should return a hash with correct values when a single key was provided and not found", function(){
                expect( subject.has( "notfound" ) ).to.be.false();
            } );
            it( "should return a hash with correct values when an array of keys was provided and none were found", function(){
                var result = subject.has( [ "z", "y" ] );
                expect( result ).to.have.property( "z" );
                expect( result.z ).to.be.false();
                expect( result ).to.have.property( "y" );
                expect( result.y ).to.be.false();
            } );
            it( "should return a hash with correct values when an array of keys was provided and one was not found", function(){
                var result = subject.has( [ "c", "z", "b" ] );
                expect( result ).to.have.property( "c" );
                expect( result.c ).to.be.true();
                expect( result ).to.have.property( "z" );
                expect( result.z ).to.be.false();
                expect( result ).to.have.property( "b" );
                expect( result.b ).to.be.true();
            } );
            it( "should return a hash with correct values when multiple keys were provided and none were found", function(){
                var result = subject.has( "z", "y" );
                expect( result ).to.have.property( "z" );
                expect( result.z ).to.be.false();
                expect( result ).to.have.property( "y" );
                expect( result.y ).to.be.false();
            } );
            it( "should return a hash with correct values when multiple keys were provided and one was not found", function(){
                var result = subject.has( "c", "z", "b" );
                expect( result ).to.have.property( "c" );
                expect( result.c ).to.be.true();
                expect( result ).to.have.property( "z" );
                expect( result.z ).to.be.false();
                expect( result ).to.have.property( "b" );
                expect( result.b ).to.be.true();
            } );
            describe( ".each", function(){
                it( "should return `true` when a single key was provided and found", function(){
                    expect( subject.has.each( "a" ) ).to.be.true();
                } );
                it( "should return `true` when an array of keys was provided and all were found", function(){
                    expect( subject.has.each( [ "c", "a", "b" ] ) ).to.be.true();
                } );
                it( "should return `true` when a hash of keys was provided and all were found", function(){
                    expect( subject.has.each( {
                        aa : "a",
                        bb : "b",
                        cc : "c"
                    } ) ).to.be.true();
                } );
                it( "should return `true` when multiple keys wre provided and all were found", function(){
                    expect( subject.has.each( "c", "a", "b" ) ).to.be.true();
                } );
                it( "should return `false` when a single key was provided and not found", function(){
                    expect( subject.has.each( "notfound" ) ).to.be.false();
                } );
                it( "should return `false` when an array of keys was provided and none were found", function(){
                    expect( subject.has.each( [ "z", "y" ] ) ).to.be.false();
                } );
                it( "should return `false` when an array of keys was provided and one was not found", function(){
                    expect( subject.has.each( [ "c", "z", "b" ] ) ).to.be.false();
                } );
                it( "should return `false` when multiple keys were provided and none were found", function(){
                    expect( subject.has.each( "z", "y" ) ).to.be.false();
                } );
                it( "should return `false` when multiple keys were provided and one was not found", function(){
                    expect( subject.has.each( "c", "z", "a" ) ).to.be.false();
                } );
            } )
        } );

        describe( "#get", function(){
            var a;
            var b;
            var c;
            beforeEach( function(){
                a = {
                    name : "a"
                };
                b = {
                    name : "b"
                };
                c = {
                    name : "c"
                };
                subject.wire( a ).as.reflection( "a" );
                subject.wire( b ).as.reflection( "b" );
                subject.wire( c ).as.reflection( "c" );
            } );
            it( "should retrieve the correct value when a single key is passed", function(){
                expect( subject.get( "a" ) ).to.equal( a );
            } );
            it( "should retrieve the correct value when an array with a single key is passed", function(){
                expect( subject.get( [ "a" ] ) ).to.equal( a );
            } );
            it( "should retrieve an array of values when an array of keys is passed", function(){
                var result = subject.get( [ "a", "b" ] );
                expect( result ).to.be.an.object();
                expect( result ).to.have.property( "a" );
                expect( result.a ).to.equal( a );
                expect( result ).to.have.property( "b" );
                expect( result.b ).to.equal( b );
            } );
            it( "should retrieve an array of values when multiple keys are passed", function(){
                var result = subject.get( "a", "b" );
                expect( result ).to.be.an.object();
                expect( result ).to.have.property( "a" );
                expect( result.a ).to.equal( a );
                expect( result ).to.have.property( "b" );
                expect( result.b ).to.equal( b );
            } );
            it( "should retrieve a hash of values when an array with a hash is passed", function(){
                expect( subject.get( [ { aa : "a" } ] ) ).to.equal( a );
            } );
            it( "should retrieve a hash of values when a hash is passed", function(){
                var result = subject.get( {
                    aa : "a",
                    bb : "b"
                } );
                expect( result ).to.be.an.object();
                expect( result ).to.have.property( "aa" );
                expect( result.aa ).to.equal( a );
                expect( result ).to.have.property( "bb" );
                expect( result.bb ).to.equal( b );
            } );
            it( "should throw an error when a mapping is not found", function(){
                expect( function(){
                    subject.get( {
                        aa       : "a",
                        bb       : "b",
                        notfound : "not meant to be found"
                    } );
                } ).to.throw( /no mapping found/ );
            } );
            it( "should resolve dependencies with mapping wiring an object", function(){
                FixtureClass.prototype.wiring = { qux : "foo" };
                var foo = {};
                subject.wire( foo ).as.reflection( "foo" );
                subject.wire( FixtureClass ).as.resolution( "fixture" );
                var instance = subject.get( "fixture" );
                expect( instance.qux ).to.equal( foo );
            } );
            it( "should resolve dependencies with mapping wiring  an array", function(){
                FixtureClass.prototype.wiring = [ "foo" ];
                var foo = {};
                subject.wire( foo ).as.reflection( "foo" );
                subject.wire( FixtureClass ).as.resolution( "fixture" );
                var instance = subject.get( "fixture" );
                expect( instance.foo ).to.equal( foo );
            } );
            it( "should resolve dependencies with mapping wiring  an string", function(){
                FixtureClass.prototype.wiring = "foo";
                var foo = {};
                subject.wire( foo ).as.reflection( "foo" );
                subject.wire( FixtureClass ).as.resolution( "fixture" );
                var instance = subject.get( "fixture" );
                expect( instance.foo ).to.equal( foo );
            } );
            it( "should resolve merged dependencies giving precedence to mapping wiring over class configuration", function(){
                FixtureClass.prototype.wiring = { qux : "foo" };
                var foo = {};
                var baz = {};
                subject.wire( foo ).as.reflection( "foo" );
                subject.wire( baz ).as.reflection( "baz" );
                subject.wire( FixtureClass )
                    .as.resolution( "fixture" )
                    .using.wiring( {
                        qux : "baz"
                    } );
                var instance = subject.get( "fixture" );
                expect( instance.qux ).to.equal( baz );
                delete FixtureClass.prototype.wiring;
            } );
            it( "should resolve merged dependencies giving precedence to parameters over mapping wiring", function(){
                var foo = {};
                var baz = {};
                subject.wire( foo ).as.reflection( "foo" );
                subject.wire( baz ).as.reflection( "baz" );
                subject.wire( FixtureClass )
                    .as.resolution( "fixture" )
                    .using.wiring( {
                        qux : "foo"
                    } );
                var instance = subject.get( "fixture", {
                    qux : "baz"
                } );
                expect( instance.qux ).to.equal( baz );
            } );
        } );

        describe( "#release", function(){
            var a;
            var b;
            var c;
            beforeEach( function(){
                a = {
                    name : "a"
                };
                b = {
                    name : "b"
                };
                c = {
                    name : "c"
                };
                subject.wire( a ).as.reflection( "a" );
                subject.wire( b ).as.reflection( "b" );
                subject.wire( c ).as.reflection( "c" );
            } );
            afterEach( function(){
                subject.release.all();
            } );
            describe( ".wires", function(){
                it( "should release the corresponding key when a single key is passed", function(){
                    subject.release.wires( "a" );
                    expect( subject.has( "a" ) ).to.be.false();
                    expect( subject.has( "b" ) ).to.be.true();
                    expect( subject.has( "c" ) ).to.be.true();
                } );
                it( "should release the corresponding keys when multiple keys are passed", function(){
                    subject.release.wires( "a", "b" );
                    expect( subject.has( "a" ) ).to.be.false();
                    expect( subject.has( "b" ) ).to.be.false();
                    expect( subject.has( "c" ) ).to.be.true();
                } );
                it( "should release the corresponding keys when an array of keys is passed", function(){
                    subject.release.wires( [ "a", "b" ] );
                    expect( subject.has( "a" ) ).to.be.false();
                    expect( subject.has( "b" ) ).to.be.false();
                    expect( subject.has( "c" ) ).to.be.true();
                } );
                it( "should release the corresponding keys when a hash of keys is passed", function(){
                    subject.release.wires( {
                        aa : "a",
                        bb : "b"
                    } );
                    expect( subject.has( "a" ) ).to.be.false();
                    expect( subject.has( "b" ) ).to.be.false();
                    expect( subject.has( "c" ) ).to.be.true();
                } );
                it( "should release all keys when none are passed", function(){
                    subject.release.wires();
                    expect( subject.has( "a" ) ).to.be.false();
                    expect( subject.has( "b" ) ).to.be.false();
                    expect( subject.has( "c" ) ).to.be.false();
                } );
            } );
            describe( ".all", function(){
                it( "should release all keys", function(){
                    subject.release.all();
                    expect( subject.has( "a" ) ).to.be.false();
                    expect( subject.has( "b" ) ).to.be.false();
                    expect( subject.has( "c" ) ).to.be.false();
                } );
            } );
        } );
        describe( "#resolve", function(){
            var a, b;
            beforeEach( function(){
                a = {
                    name : "a"
                };
                b = {
                    name : "b"
                };
                subject.wire( a ).as.reflection( "a" );
                subject.wire( b ).as.reflection( "b" );
            } );
            it( "should throw an error when `undefined` is passed", function(){
                expect( function(){
                    subject.resolve()
                } ).to.throw( /object/i );
            } );
            it( "should throw an error when `null` is passed", function(){
                expect( function(){
                    subject.resolve( null )
                } ).to.throw( /object/i );
            } );
            it( "should throw an error when `string` is passed", function(){
                expect( function(){
                    subject.resolve( "not an object" )
                } ).to.throw( /object/i );
            } );
            it( "should throw an error when `array` is passed", function(){
                expect( function(){
                    subject.resolve( [] )
                } ).to.throw( /object/i );
            } );
            it( "should throw an error when `number` is passed", function(){
                expect( function(){
                    subject.resolve( 9 )
                } ).to.throw( /object/i );
            } );
            it( "should throw an error when `boolean` is passed", function(){
                expect( function(){
                    subject.resolve( true )
                } ).to.throw( /object/i );
            } );

            it( "should resolve the dependencies passed as a hash", function(){
                var obj = {};
                subject.resolve( obj, {
                    aa : "a",
                    bb : "b"
                } );
                expect( obj ).to.have.property( "aa" );
                expect( obj.aa ).to.equal( a );
                expect( obj ).to.have.property( "bb" );
                expect( obj.bb ).to.equal( b );
            } );
            it( "should resolve the dependencies passed as an array", function(){
                var obj = {};
                subject.resolve( obj, [ "a", "b" ] );
                expect( obj ).to.have.property( "a" );
                expect( obj.a ).to.equal( a );
                expect( obj ).to.have.property( "b" );
                expect( obj.b ).to.equal( b );
            } );
            it( "should resolve the dependencies passed as parameters", function(){
                var obj = {};
                subject.resolve( obj, "a", "b" );
                expect( obj ).to.have.property( "a" );
                expect( obj.a ).to.equal( a );
                expect( obj ).to.have.property( "b" );
                expect( obj.b ).to.equal( b );
            } );
            it( "should resolve the dependencies as configured in the class with an object", function(){
                FixtureClass.prototype.wiring = {
                    baz : "foo"
                };
                var foo = {};
                subject.wire( foo ).as.reflection( "foo" );
                var instance = subject.resolve( new FixtureClass() );
                expect( instance.baz ).to.equal( foo );
                delete FixtureClass.prototype.wiring;
            } );
            it( "should resolve its dependencies as configured in the class with an array", function(){
                FixtureClass.prototype.wiring = [ "foo" ];
                var foo = {};
                subject.wire( foo ).as.reflection( "foo" );
                var instance = subject.resolve( new FixtureClass() );
                expect( instance.foo ).to.equal( foo );
                delete FixtureClass.prototype.wiring;
            } );
            it( "should resolve its dependencies as configured in the class with a string", function(){
                FixtureClass.prototype.wiring = "foo";
                var foo = {};
                subject.wire( foo ).as.reflection( "foo" );
                var instance = subject.resolve( new FixtureClass() );
                expect( instance.foo ).to.equal( foo );
                delete FixtureClass.prototype.wiring;
            } );
            it( "should resolve dependencies as configured in the class merged with the parameters", function(){
                FixtureClass.prototype.wiring = "foo";
                var foo = {};
                subject.wire( foo ).as.reflection( "foo", "baz" );
                var instance = subject.resolve( new FixtureClass(), "baz" );
                expect( instance.foo ).to.equal( foo );
                expect( instance.baz ).to.equal( foo );
                delete FixtureClass.prototype.wiring;
            } );
            it( "should resolve merged dependencies giving precedence to parameters", function(){
                FixtureClass.prototype.wiring = { qux : "foo" };
                var foo = {};
                var baz = {};
                subject.wire( foo ).as.reflection( "foo" );
                subject.wire( baz ).as.reflection( "baz" );
                var instance = subject.resolve( new FixtureClass(), { qux : "baz" } );
                expect( instance.qux ).to.equal( baz );
                delete FixtureClass.prototype.wiring;
            } );
        } );
    } );
} );