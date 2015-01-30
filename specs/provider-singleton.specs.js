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

describe( "-- singleton provider -- ", function(){
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
    describe( "wiring an object as singleton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( {} )
                    .as.singleton( "not a valid singleton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a string as singleton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( "this is not a function" )
                    .as.singleton( "not a valid singleton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring an array as singleton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( [] )
                    .as.singleton( "not a valid singleton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a number as singleton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( 9 )
                    .as.singleton( "not a valid singleton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a boolean as singleton", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( true )
                    .as.singleton( "not a valid singleton" )
            } ).to.throw( /function/ );
        } );
    } );
    describe( "wiring a function as singleton", function(){
        var mapper;
        beforeEach( function(){
            mapper = context.wire( FixtureClass )
                .as.singleton( "singleton" );
        } );
        it( "should resolve to an instance of the class when retrieved", function(){
            var instance = context.get( "singleton" );
            expect( instance ).to.be.an.instanceOf( FixtureClass );
        } );
        it( "should always resolve to the same object when retrieved multiple times", function(){
            var o1 = context.get( "singleton" );
            var o2 = context.get( "singleton" );
            expect( o1 ).to.equal( o2 );
        } );
        it( "should resolve its dependencies", function(){
            FixtureClass.prototype.wiring = "dep";
            var dep = {};
            context.wire( dep ).as.value( "dep" );
            var result = context.get( "singleton" );
            expect( result.dep ).to.equal( dep );
            delete FixtureClass.prototype.wiring;
        } );
        it( "should pass the parameters to the constructor", function(){
            var a = {}, b = "b", c = [ "c" ];
            mapper.using.parameters( a, b, c );
            var result = context.get( "singleton" );
            expect( result.params[ 0 ] ).to.equal( a );
            expect( result.params[ 1 ] ).to.equal( b );
            expect( result.params[ 2 ] ).to.equal( c );
        } );
    } );
    describe( "wiring a function to multiple keys", function(){
        it( "should share the instance", function(){
            context.wire( FixtureClass )
                .as.singleton( "one", "two" );
            var singletons = context.get( "one", "two" );
            expect( singletons.one ).to.equal( singletons.two );
        } );
    } )
} );