"use strict";

/* global describe, it, beforeEach */
/* jshint unused:false */

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );

var Geppetto = require( "../backbone.geppetto.js" );

var FixtureClass = function(){
    this.foo = undefined;
    this.params = _.toArray( arguments );
};

describe( "-- constructor provider -- ", function(){
    describe( "spec file", function(){
        it( "should be found", function(){
            expect( true ).to.be.true();
        } );
    } );
    var context;
    var undefined;
    beforeEach( function(){
        context = new Geppetto.Context();
    } );
    afterEach( function(){
        context.release.all();
        context = undefined;
    } );
    describe( "wiring an object as constructor", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( {} )
                    .as.constructor( "not a valid constructor" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a string as constructor", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( "this is not a function" )
                    .as.constructor( "not a valid constructor" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring an array as constructor", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( [] )
                    .as.constructor( "not a valid constructor" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a number as constructor", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( 9 )
                    .as.constructor( "not a valid constructor" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a boolean as constructor", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( true )
                    .as.constructor( "not a valid constructor" )
            } ).to.throw( /function/ );
        } );
    } );

    describe( "when wiring a function", function(){
        var mapper;
        beforeEach( function(){
            mapper = context.wire( FixtureClass )
                .as.constructor( "ctor" );
        } );
        it( "should resolve to a function, with the same prototype", function(){
            var result = context.get( "ctor" );
            expect( result ).to.be.a.function();
            expect( result.prototype ).to.equal( FixtureClass.prototype );
        } );
        it( "should resolve its dependencies when the result is called", function(){
            FixtureClass.prototype.wiring = "dep";
            var dep = {};
            context.wire( dep ).as.value( "dep" );
            var factory = context.get( "ctor" );
            var result = factory();
            expect( result.dep ).to.equal( dep );
            delete FixtureClass.prototype.wiring;
        } );
        it( "should resolve its dependencies when the result is `new`ed", function(){
            FixtureClass.prototype.wiring = "dep";
            var dep = {};
            context.wire( dep ).as.value( "dep" );
            var Clazz = context.get( "ctor" );
            var result = new Clazz();
            expect( result.dep ).to.equal( dep );
            delete FixtureClass.prototype.wiring;
        } );
        it( "should pass the wired parameters to the wrapped constructor", function(){
            var a = {}, b = "b", c = [ "c" ];
            mapper.using.parameters( a, b, c );
            var Clazz = context.get( "ctor" );
            var result = new Clazz();
            expect( result.params[ 0 ] ).to.equal( a );
            expect( result.params[ 1 ] ).to.equal( b );
            expect( result.params[ 2 ] ).to.equal( c );
        } );
        it( "should pass the passed parameters to the wrapped constructor (and ignore the wiring parameters)", function(){
            var a = {}, b = "b", c = [ "c" ], d={}, e="e";
            mapper.using.parameters( a, b, c );
            var Clazz = context.get( "ctor" );
            var result = new Clazz(d, e);
            expect( result.params[ 0 ] ).to.equal( d );
            expect( result.params[ 1 ] ).to.equal( e );
        } );
    } );
} );