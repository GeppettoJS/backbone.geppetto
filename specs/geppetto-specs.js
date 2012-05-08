define( [
    "underscore",
    "backbone",
    "marionette",
    "geppetto"
], function(_, Backbone, Marionette, Geppetto) {
    


pavlov.specify("Backbone.Geppetto", function(){

    describe("when loading Geppetto", function(){

       it("should be defined", function() {
           assert( Geppetto ).isNotNull();
       });

    });
    
    describe("when binding a context", function() {
        
        var contextDefinition;
        var contextInstance;
        
        before(function(){
            contextDefinition = Geppetto.Context.extend({
                
            });
        });
        
        it("should bind the context instance to the view", function() {
            
            var myView = new Marionette.ItemView();
            
            Geppetto.bindContext({
                view: myView,
                context: contextDefinition
            });
            
            assert( myView.context ).isDefined();            
        });
    });
    
    describe("when registering a command", function() {

        var myView;
        
        var contextDefinition;
        
        var AbcCommand;
        var XyzCommand;
        
        var abcSpy;
        var xyzSpy;
        
        before(function(){
            abcSpy = sinon.spy();
            AbcCommand = function(){};
            AbcCommand.prototype.execute = abcSpy;

            xyzSpy = sinon.spy();
            XyzCommand = function(){};
            XyzCommand.prototype.execute = xyzSpy;            
            
            contextDefinition = Geppetto.Context.extend({
                initialize:function () {
                    this.mapCommand( "abcEvent", AbcCommand );
                    this.mapCommand( "xyzEvent", XyzCommand );
                }
            });

            myView = new Marionette.ItemView();

            Geppetto.bindContext({
                view: myView,
                context: contextDefinition
            });            
        });
        
        it("should fire AbcCommand when abcEvent is dispatched", function() {
            myView.context.dispatch("abcEvent");
            
            assert( abcSpy.called ).isTrue();
            assert( xyzSpy.called ).isFalse();
        });
    });

});
});