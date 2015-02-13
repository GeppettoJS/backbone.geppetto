"use strict";

/* global describe, it, beforeEach */
/* jshint unused:false */

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );

var subject = require( "../backbone.geppetto.js" );

describe( "-- value provider -- ", function(){
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
    describe( "wiring an object as value", function(){
        it( "should resolve to the  value", function(){
            var source = {};
            context.wire( source )
                .as.value( "value" );
            var obj = context.get( "value" );
            expect( obj ).to.equal( source );
        } );
        it( "should not resolve its dependencies", function(){
            var source = {
                wiring : "dep"
            };
            var dep = {};
            context.wire( dep ).as.value( "dep" );
            context.wire( source ).as.value( "value" );
            var result = context.get( "value" );
            expect( result.dep ).to.be.undefined();
        } );
    } );
    describe( "wiring a boolean as value", function(){
        it( "should maintain a `true` value", function(){
            context.wire( true )
                .as.value( "value" );
            var obj = context.get( "value" );
            expect( obj ).to.be.true();
        } );
        it( "should maintain a `false` value", function(){
            context.wire( false )
                .as.value( "value" );
            var obj = context.get( "value" );
            expect( obj ).to.be.false();
        } );
    } );
    describe( "wiring a number as value", function(){
        it( "should resolve to the value", function(){
            context.wire( 9 )
                .as.value( "value" );
            var obj = context.get( "value" );
            expect( obj ).to.equal( 9 );
        } );
    } );
    describe( "wiring a value to multiple keys", function(){
        it( "should resolve to the same value", function(){
            var source = {};
            context.wire( source )
                .as.value( "a", "b" );
            var obj = context.get( "a", "b" );
            expect( obj ).to.eql( {
                a : source,
                b : source
            } );
        } );
    } );
} );