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
            contextDefinition = Geppetto.Context.extend();
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
    
    describe("when a view adds an event listener to a context", function() {
        var parentView;
        var contextDefinition;
        var contextInstance;
        var childViewInstance;
        var fooSpy;
        
        before(function(){
            fooSpy = sinon.spy();
            contextDefinition = Geppetto.Context.extend();
            var ParentViewDef = Marionette.ItemView.extend();
            parentView = new ParentViewDef();
            
            contextInstance = Geppetto.bindContext({
                view: parentView,
                context: contextDefinition
            });

            assert( parentView.context ).isDefined();

            var childViewDef = Marionette.ItemView.extend({

                initialize: function() {
                    _.bindAll(this);
                },

                listenToContext: function() {
                    this.context = this.options.context;
                    this.context.listen(this, "foo", this.handleFoo);
                },
                handleFoo: function() {
                    fooSpy();
                }
            });
            childViewInstance = new childViewDef({
                context: contextInstance
            });            
        });
        
        after(function() {
            parentView.close();
            fooSpy = undefined;
        });

        it("should hold the event in the view", function() {

            assert( _.size(childViewInstance._listeners) ).isEqualTo(1);
            childViewInstance.listenToContext();
            assert( _.size(childViewInstance._listeners) ).isEqualTo(2);
            assert(childViewInstance._listeners["l9"]._events["foo"] ).isDefined();
        });        
        
        it("should fire the foo event while the view is active", function() {
            childViewInstance.listenToContext();
            contextInstance.dispatch("foo");
            assert(fooSpy.callCount ).isEqualTo(1);
        });

        it("should not fire the foo event after the view is closed", function() {
            childViewInstance.listenToContext();
            childViewInstance.close();
            contextInstance.dispatch("foo");
            assert(fooSpy.callCount ).isEqualTo(0);
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

        it("should not fire AbcCommand after the associated view is closed", function() {
 
            myView.close();
            myView.context.dispatch("abcEvent");

            assert( abcSpy.called ).isFalse();
            assert( xyzSpy.called ).isFalse();
        });        
    });

});
});