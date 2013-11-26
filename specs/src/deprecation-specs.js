/* suppress jshint warnings for chai syntax - https://github.com/chaijs/chai/issues/41#issuecomment-14904150 */
/* jshint -W024 */
/* jshint expr:true */
define( [
    "underscore", "backbone", "geppetto"
], function ( _, Backbone, Geppetto ) {

    var expect = chai.expect;

    describe( "when using deprecated methods", function () {

        var consoleStub;
        var destroyStub;
        var wireCommandStub;

        beforeEach( function () {
            consoleStub = sinon.stub( console, "log" );
            destroyStub = sinon.stub( Geppetto.Context.prototype, "destroy" );
            wireCommandStub = sinon.stub( Geppetto.Context.prototype, "wireCommand" );
        } );

        afterEach( function () {
            consoleStub.restore();
            destroyStub.restore();
            wireCommandStub.restore();
        } );

        describe( "and deprecation warnings are disabled", function () {
            it( "should pass unmapAll() to destroy()", function () {
                var context = new Geppetto.Context();
                expect( destroyStub ).not.to.have.beenCalled;
                context.unmapAll();
                expect( destroyStub ).to.have.beenCalledOnce;
            } );
            it( "should not write to the console when mapAll() is called", function () {
                var context = new Geppetto.Context();
                expect( consoleStub ).not.to.have.beenCalled;
                context.unmapAll();
                expect( consoleStub ).not.to.have.beenCalled;
            } );
            it( "should pass mapCommand() to wireCommand()", function () {
                var context = new Geppetto.Context();
                expect( wireCommandStub ).not.to.have.beenCalled;
                context.mapCommand( "foo", function () {
                } );
                expect( wireCommandStub ).to.have.beenCalledOnce;
            } );
            it( "should not write to the console when mapCommand() is called", function () {
                var context = new Geppetto.Context();
                expect( consoleStub ).not.to.have.beenCalled;
                context.mapCommand( "foo", function () {
                } );
                expect( consoleStub ).not.to.have.beenCalled;
            } );
        } );


        describe( "and deprecation warnings are enabled", function () {

            beforeEach( function () {
                Geppetto.setDeprecationWarning( true );
            } );

            afterEach( function () {
                Geppetto.setDeprecationWarning( false );
            } );

            it( "should pass unmapAll() to destroy()", function () {
                var context = new Geppetto.Context();
                expect( destroyStub ).not.to.have.beenCalled;
                context.unmapAll();
                expect( destroyStub ).to.have.beenCalledOnce;
            } );
            it( "should write a warning msg to the console when unmapAll() is called", function () {
                var context = new Geppetto.Context();
                expect( consoleStub ).not.to.have.beenCalled;
                context.unmapAll();
                expect( consoleStub ).to.have.been.calledWith(
                        "[Geppetto] Context.unmapAll is deprecated.  Please use Context.destroy"
                );
            } );
            it( "should pass mapCommand() to wireCommand()", function () {
                var context = new Geppetto.Context();
                expect( wireCommandStub ).not.to.have.beenCalled;
                context.mapCommand( "foo", function () {
                } );
                expect( wireCommandStub ).to.have.beenCalledOnce;
            } );
            it( "should write a warning msg to the console when mapCommand() is called", function () {
                var context = new Geppetto.Context();
                expect( consoleStub ).not.to.have.beenCalled;
                context.mapCommand( "foo", function () {
                } );
                expect( consoleStub ).to.have.been.calledWith(
                        "[Geppetto] Context.mapCommand is deprecated.  Please use Context.wireCommand"
                );
            } );
        } );
    } );
} );