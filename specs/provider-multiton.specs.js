"use strict";

/* global describe, it, beforeEach */
/* jshint unused:false */

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );

var subject = require( "../backbone.geppetto.js" );

var FixtureClass = function(){
    this.foo = undefined;
    this.params = _.toArray( arguments );
};

describe( "-- multiton provider -- ", function(){
    describe( "spec file", function(){
        it( "should be found", function(){
            expect( true ).to.be.true();
        } );
    } );
    var context;
    var undefined;
    beforeEach( function(){
        context = new subject.Context();
    } );
    afterEach( function(){
        context.release.all();
        context = undefined;
    } );
    describe( "wiring an object as multiton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( {} )
                    .as.multiton( "not a valid multiton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a string as multiton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( "this is not a function" )
                    .as.multiton( "not a valid multiton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring an array as multiton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( "this is not a function" )
                    .as.multiton( "not a valid multiton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a number as multiton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( 9 )
                    .as.multiton( "not a valid multiton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a boolean as multiton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( true )
                    .as.multiton( "not a valid multiton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a function as multiton", function(){
        var mapper;
        beforeEach( function(){
            mapper = context.wire( FixtureClass )
                .as.multiton( "multiton" );
        } );
        it( "should resolve to an instance of the class when retrieved", function(){
            var instance = context.get( "multiton" );
            expect( instance ).to.be.an.instanceOf( FixtureClass );
        } );
        it( "should always resolve to the same object when retrieved multiple times", function(){
            var o1 = context.get( "multiton" );
            var o2 = context.get( "multiton" );
            expect( o1 ).to.equal( o2 );
        } );
        it( "should resolve its dependencies", function(){
            FixtureClass.prototype.wiring = "dep";
            var dep = {};
            context.wire( dep ).as.value( "dep" );
            var result = context.get( "multiton" );
            expect( result.dep ).to.equal( dep );
            delete FixtureClass.prototype.wiring;
        } );
        it( "should pass the parameters to the constructor", function(){
            var a = {}, b = "b", c = [ "c" ];
            mapper.using.parameters( a, b, c );
            var result = context.get( "multiton" );
            expect( result.params[ 0 ] ).to.equal( a );
            expect( result.params[ 1 ] ).to.equal( b );
            expect( result.params[ 2 ] ).to.equal( c );
        } );

    } );
    describe( "wiring a function to multiple keys", function(){
        it( "should create an instance per key", function(){
            context.wire( FixtureClass )
                .as.multiton( "one", "two" );
            var multitons = context.get( "one", "two" );
            expect( multitons.one ).not.to.equal( multitons.two );
        } );
    } )
} );