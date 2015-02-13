"use strict";

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );
var subject = require( "../backbone.geppetto.js" );

describe( "-- helpers API -- ", function(){
    describe( "Geppetto", function(){
        it( "should expose a `toHash` function", function(){
            expect( subject.toHash ).to.be.a.function();
        } );
        describe( ".toHash", function(){
            it( "should turn a string  into a hash", function(){
                var result = subject.toHash( "a" );
                expect( result ).to.eql( { a : "a" } );
            } );
            it( "should turn multiple values  into a hash", function(){
                var result = subject.toHash( "a", "b", "c" );
                expect( result ).to.eql( {
                    a : "a",
                    b : "b",
                    c : "c"
                } );
            } );
            it( "should turn an array into a hash", function(){
                var result = subject.toHash( [ "a", "b", "c" ] );
                expect( result ).to.eql( {
                    a : "a",
                    b : "b",
                    c : "c"
                } );
            } );
            it( "should turn an array of arrays into a hash", function(){
                var result = subject.toHash( [ [ "a", [ "b" ] ], [ "c" ] ] );
                expect( result ).to.eql( {
                    a : "a",
                    b : "b",
                    c : "c"
                } );
            } );
            it( "should leave an object as is", function(){
                var result = subject.toHash( {
                    aa : "a",
                    bb : "b",
                    cc : "c"
                } );
                expect( result ).to.eql( {
                    aa : "a",
                    bb : "b",
                    cc : "c"
                } );
            } );
            it( "should turn mixed parameters into a hash", function(){
                var result = subject.toHash( "d", {
                    aa : "a",
                    bb : "b",
                    cc : "c"
                }, [ "e", "f" ] );
                expect( result ).to.eql( {
                    d  : 'd',
                    aa : 'a',
                    bb : 'b',
                    cc : 'c',
                    e  : 'e',
                    f  : 'f'
                } );
            } );
            it( "should return an empty object by default", function(){
                var result = subject.toHash();
                expect( result ).to.eql( {} );
            } );
            it( "should ignore `undefined` as a sole parameter", function(){
                var result = subject.toHash( undefined );
                expect( result ).to.eql( {} );
            } );
            it( "should ignore `undefined` inside arrays", function(){
                var result = subject.toHash( [ undefined, "a" ] );
                expect( result ).to.eql( { a : "a" } );
            } );
            it( "should ignore `undefined` inside hashes", function(){
                var result = subject.toHash( {
                    a : "a",
                    b : undefined
                } );
                expect( result ).to.eql( { a : "a" } );
            } );
        } );
    } )
} );