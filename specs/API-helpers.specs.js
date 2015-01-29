"use strict";

var _ = require( "underscore" );
var sinon = require( "sinon" );
var stub = require( "proxyquire" );
var expect = require( "must" );
var subject = require( "../backbone.geppetto.js" );

function verifyResult( result,
                       map ){
    expect( result ).to.be.an.object();
    _.each( map, function( value,
                           key ){
        expect( result ).to.have.property( key );
        expect( result[ key ] ).to.equal( value );
    } );
    expect( _.keys( result ).join( "," ) ).to.equal( _.keys( map ).join( "," ) );
}

describe( "-- helpers API -- ", function(){
    describe( "Geppetto", function(){
        it( "should expose a `toHash` function", function(){
            expect( subject.toHash ).to.be.a.function();
        } );
        describe( ".toHash", function(){
            it( "should turn a string  into a hash", function(){
                var result = subject.toHash( "a" );
                verifyResult( result, { a : "a" } );
            } );
            it( "should turn multiple values  into a hash", function(){
                var result = subject.toHash( "a", "b", "c" );
                verifyResult( result, {
                    a : "a",
                    b : "b",
                    c : "c"
                } );
            } );
            it( "should turn an array into a hash", function(){
                var result = subject.toHash( [ "a", "b", "c" ] );
                verifyResult( result, {
                    a : "a",
                    b : "b",
                    c : "c"
                } );
            } );
            it( "should turn an array of arrays into a hash", function(){
                var result = subject.toHash( [ [ "a", [ "b" ] ], [ "c" ] ] );
                verifyResult( result, {
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
                verifyResult( result, {
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
                verifyResult( result, {
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
                verifyResult( result, {} );
            } );
            it( "should ignore `undefined` as a sole parameter", function(){
                var result = subject.toHash( undefined );
                verifyResult( result, {} );
            } );
            it( "should ignore `undefined` inside arrays", function(){
                var result = subject.toHash( [ undefined, "a" ] );
                verifyResult( result, { a : "a" } );
            } );
            it( "should ignore `undefined` inside hashes", function(){
                var result = subject.toHash( {
                    a : "a",
                    b : undefined
                } );
                verifyResult( result, { a : "a" } );
            } );
        } );
    } )
} );