"use strict";

/* global describe, it, beforeEach */
/* jshint unused:false */

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );

var subject = require( "../backbone.geppetto.js" );

describe( "-- unresolved provider -- ", function(){
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
    describe( "wiring a string as unresolved", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( "this is not an object" )
                    .as.unresolved( "not a valid unresolved" )
            } ).to.throw( /object/ );
        } );
    } );
    describe( "wiring an array as unresolved", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( [] )
                    .as.unresolved( "not a valid unresolved" )
            } ).to.throw( /object/ );
        } );
    } );
    describe( "wiring a number as unresolved", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( 9 )
                    .as.unresolved( "not a valid unresolved" )
            } ).to.throw( /object/ );
        } );
    } );
    describe( "wiring a boolean as unresolved", function(){
        it( "should throw an error", function(){
            expect( function(){
                context.wire( true )
                    .as.unresolved( "not a valid unresolved" )
            } ).to.throw( /object/ );
        } );
    } );
    describe( "wiring an object as unresolved", function(){
        it( "should resolve to the object", function(){
            var source = {};
            context.wire( source )
                .as.unresolved( "unresolved" );
            var obj = context.get( "unresolved" );
            expect( obj ).to.equal( source );
        } );
        it( "should resolve its dependencies", function(){
            var source = {
                wiring : "dep"
            };
            var dep = {};
            context.wire( dep ).as.value( "dep" );
            context.wire( source ).as.unresolved( "unresolved" );
            var result = context.get( "unresolved" );
            expect( result.dep ).to.equal( dep );
        } );
        it( "should resolve its dependencies strictly once", function(){
            var source = {
                wiring : "dep"
            };
            var dep = function(){
            };
            context.wire( dep ).as.producer( "dep" );
            context.wire( source ).as.unresolved( "unresolved" );
            var result = context.get( "unresolved" );
            var d1 = result.dep;
            result = context.get( "unresolved" );
            var d2 = result.dep;
            expect( d1 ).to.equal( d2 );
        } );
    } );
} );