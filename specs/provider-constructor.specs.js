"use strict";

/* global describe, it, beforeEach */
/* jshint unused:false */

var _ = require( "underscore" );
var sinon = require( "sinon" );
var stub = require( "proxyquire" );
var expect = require( "must" );

var Geppetto = require( "../backbone.geppetto.js" );

var FixtureClass = function(){
    this.foo = undefined;
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
        beforeEach( function(){
            context.wire( FixtureClass )
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
    } );
} );