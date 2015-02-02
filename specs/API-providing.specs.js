"use strict";

var _ = require( "underscore" );
var sinon = require( "sinon" );

var expect = require( "must" );
var Geppetto = require( "../backbone.geppetto.js" );
var subject = Geppetto.Context;

var NOOP = _.noop;
var DUMMY_PROVIDER = {
    provide : NOOP
};

describe( "-- providers API --", function(){

    describe( "spec file", function(){
        it( "should be found", function(){
            expect( true ).to.be.true();
        } );
    } );
    describe( "Geppetto.Context", function(){
        it( "should expose a `provide` static method", function(){
            expect( subject.provide ).to.be.a.function();
        } );
        describe( ".provide", function(){
            afterEach( function(){
                subject.release.provider( "foo" );
            } );
            it( "should throw an error when an Object is passed", function(){
                expect( function(){
                    subject.provide( {} )
                } ).to.throw( /expects a String/ );
            } );
            it( "should throw an error when an Array is passed", function(){
                expect( function(){
                    subject.provide( [] )
                } ).to.throw( /expects a String/ );
            } );
            it( "should throw an error when a Number is passed", function(){
                expect( function(){
                    subject.provide( 9 )
                } ).to.throw( /expects a String/ );
            } );
            it( "should return an providermapper object", function(){
                expect( subject.provide( "foo" ) ).to.have.property( "using" );
            } );
            describe( ".using", function(){
                it( "should throw an error if the provider doesn't expose a 'provide' method", function(){
                    expect( function(){
                        subject.provide( "foo" ).using( {} );
                    } ).to.throw( /provider must expose a 'provide'/ );
                } );
                it( "should throw an error when re-registering a providerName", function(){
                    subject.provide( "foo" ).using( DUMMY_PROVIDER );
                    expect( function(){
                        subject.provide( "foo" );
                    } ).to.throw( /provider mapping already exists/ );
                } );
                it( "should expand the context api", function(){
                    subject.provide( "foo" ).using( DUMMY_PROVIDER );
                    var context = new subject();
                    expect( context.wire( {} ).as ).to.have.property( "foo" );
                } );
                it( "should call the provider's 'provide' method when retrieving an object", function(){
                    var provider = {
                        provide : sinon.spy()
                    };
                    subject.provide( "foo" ).using( provider );
                    var context = new subject();
                    context.wire( {} ).as.foo( "foo" );
                    context.get( "foo" );
                    expect( provider.provide.callCount ).to.equal( 1 );
                } );
                it( "should call the provider's 'provide' method within the provider's scope", function(){
                    var scope;
                    var provider = {
                        provide : function(){
                            scope=this;
                        }
                    };
                    subject.provide( "foo" ).using( provider );
                    var context = new subject();
                    context.wire( {} ).as.foo( "foo" );
                    context.get( "foo" );
                    expect( scope ).to.equal( provider );
                } )
            } );
        } );
        describe( ".has", function(){
            describe( ".provider", function(){
                it( "should return `false` when a provider has not been registered", function(){
                    expect( subject.has.provider( "nonexistent" ) ).to.be.false();
                } );
                it( "should return `true` when a provider has been registered", function(){
                    expect( subject.has.provider( "singleton" ) ).to.be.true();
                } );
            } );
        } );
        describe( ".release", function(){
            describe( ".provider", function(){
                it( "should unregister a provider", function(){
                    subject.provide( "foo" ).using( DUMMY_PROVIDER );
                    subject.has.provider( "foo" ).must.be.true();
                    subject.release.provider("foo");
                    expect( subject.has.provider( "foo" ) ).to.be.false();
                } );
            } );
        } );
    } );
} );