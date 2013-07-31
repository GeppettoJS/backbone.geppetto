define( [
    "underscore",
    "backbone",
    "geppetto"
], function(_, Backbone, Geppetto) {

pavlov.specify("Backbone.Geppetto", function(){

    describe("when loading Geppetto", function(){

        it("should be defined as an AMD module", function() {
           assert( Geppetto ).isNotNull();
        });

        it("should be defined as a property on the Backbone object", function() {
            assert( Backbone.Geppetto ).isNotNull();
            assert( Backbone.Geppetto ).isEqualTo(Geppetto);
        });

    });

    describe("when binding a context", function() {

        var contextDefinition;
        var contextInstance;

        before(function(){
            contextDefinition = Geppetto.Context.extend();
        });

        it("should bind the context instance to the view", function() {

            var MyViewDef = Backbone.View.extend();
            var myView = new MyViewDef();

            Geppetto.bindContext({
                view: myView,
                context: contextDefinition
            });

            assert( myView.context ).isDefined();

            myView.close();
        });
    });

    describe("when a Backbone View adds an event listener to a context", function() {
        var parentView;
        var contextDefinition;
        var contextInstance;
        var childViewInstance;
        var fooSpy;

        before(function(){
            fooSpy = sinon.spy();
            contextDefinition = Geppetto.Context.extend();
            var ParentViewDef = Backbone.View.extend();
            parentView = new ParentViewDef();

            contextInstance = Geppetto.bindContext({
                view: parentView,
                context: contextDefinition
            });

            assert( parentView.context ).isDefined();

            var childViewDef = Backbone.View.extend({

                initialize: function(options) {
                    _.bindAll(this);
                    Geppetto.bindContext({
                        view: this,
                        context: this.options.context
                    });
                    this.context.listen(this, "foo", fooSpy);
                }
            });
            childViewInstance = new childViewDef({
                context: contextInstance
            });
        });

        after(function() {
            parentView.close();
            childViewInstance.remove();
            fooSpy = undefined;
        });

        it("should fire the foo event while the view is active", function() {
            contextInstance.dispatch("foo");
            assert(fooSpy.callCount ).isEqualTo(1);
        });

        it("should pass the event name in the event payload object", function() {
            contextInstance.dispatch("foo");
            assert(fooSpy.callCount ).isEqualTo(1);
            var payload = fooSpy.getCall(0).args[0];
            assert(payload.eventName).isEqualTo("foo");
        });

        it("should pass supplied data in the payload object", function() {
            contextInstance.dispatch("foo", {bar: "baz"});
            assert(fooSpy.callCount ).isEqualTo(1);
            var payload = fooSpy.getCall(0).args[0];
            assert(payload.eventName).isEqualTo("foo");
            assert(payload.bar).isEqualTo("baz");
        });

        it("should throw an exception if the payload object is a string, not an object", function() {
            assert(function() {
                contextInstance.dispatch("foo", "baz");
            } ).throwsException("Event payload must be an object");
        });

        it("should throw an exception if the payload object is a boolean false, not an object", function() {
            assert(function() {
                contextInstance.dispatch("foo", false);
            } ).throwsException("Event payload must be an object");
        });

        it("should throw an exception if the payload object is a boolean true, not an object", function() {
            assert(function() {
                contextInstance.dispatch("foo", true);
            } ).throwsException("Event payload must be an object");
        });

        it("should throw an exception if the payload object is null, not an object", function() {
            assert(function() {
                contextInstance.dispatch("foo", null);
            } ).throwsException("Event payload must be an object");
        });

        it("should pass the foo event when listened from the parent view", function() {
            var parentFooSpy = sinon.spy();
            contextInstance.listen(parentView, "foo", parentFooSpy);
            contextInstance.dispatch("foo");
            assert(fooSpy.callCount ).isEqualTo(1);
            assert(parentFooSpy.callCount ).isEqualTo(1);
        });

        it("should not fire the foo event after the child view is closed", function() {
            childViewInstance.remove();
            contextInstance.dispatch("foo");
            assert(fooSpy.callCount ).isEqualTo(0);
        });

        it("should not fire the foo event when listened from the parent view and the parent view is closed", function() {
            var parentFooSpy = sinon.spy();
            contextInstance.listen(parentView, "foo", parentFooSpy);
            parentView.close();
            contextInstance.dispatch("foo");
            assert(parentFooSpy.callCount ).isEqualTo(0);
        });
    });

    describe("when a Backbone View specifies a contextEvents map", function() {
        var parentView;
        var contextDefinition;
        var contextInstance;
        var childViewInstance;
        var fooParentSpy;
        var barParentSpy;
        var fooChildSpy;
        var barChildSpy;

        before(function(){
            fooParentSpy = sinon.spy();
            barParentSpy = sinon.spy();
            fooChildSpy = sinon.spy();
            barChildSpy = sinon.spy();

            contextDefinition = Geppetto.Context.extend();

            var ParentViewDef = Backbone.View.extend({
                initialize: function() {
                    _.bindAll(this);
                },
                contextEvents: {
                    "foo": "handleFoo",
                    "bar": function() {
                        barParentSpy();
                    }
                },
                handleFoo: function() {
                    fooParentSpy();
                }
            });
            parentView = new ParentViewDef();

            contextInstance = Geppetto.bindContext({
                view: parentView,
                context: contextDefinition
            });

            assert( parentView.context ).isDefined();

            var childViewDef = Backbone.View.extend({

                contextEvents: {
                    "foo": "handleFoo",
                    "bar": function() {
                        barChildSpy();
                    }
                },
                handleFoo: function() {
                    fooChildSpy();
                },

                initialize: function(options) {
                    _.bindAll(this);
                    Geppetto.bindContext({
                        view: this,
                        context: this.options.context
                    });
                }
            });
            childViewInstance = new childViewDef({
                context: contextInstance
            });
        });

        after(function() {
            parentView.close();
            childViewInstance.remove();
            fooParentSpy = undefined;
            barParentSpy = undefined;
            fooChildSpy = undefined;
            barChildSpy = undefined;
        });

        it("should trigger the foo response function when registered as a string", function() {
            contextInstance.dispatch("foo");
            assert(fooParentSpy.callCount ).isEqualTo(1);
            assert(fooChildSpy.callCount ).isEqualTo(1);
        });

        it("should trigger the bar response function when registered as a function", function() {
            contextInstance.dispatch("bar");
            assert(barParentSpy.callCount ).isEqualTo(1);
            assert(barChildSpy.callCount ).isEqualTo(1);
        });

        it("should remove the parent foo listener when the parent view is closed", function() {
            contextInstance.dispatch("foo");
            assert(fooParentSpy.callCount ).isEqualTo(1);
            assert(fooChildSpy.callCount ).isEqualTo(1);
            parentView.close();
            contextInstance.dispatch("foo");
            assert(fooParentSpy.callCount ).isEqualTo(1);
            assert(fooChildSpy.callCount ).isEqualTo(2);
        });

        it("should remove the child foo listener when the child view is closed", function() {
            contextInstance.dispatch("foo");
            assert(fooParentSpy.callCount ).isEqualTo(1);
            assert(fooChildSpy.callCount ).isEqualTo(1);
            childViewInstance.remove();
            contextInstance.dispatch("foo");
            assert(fooParentSpy.callCount ).isEqualTo(2);
            assert(fooChildSpy.callCount ).isEqualTo(1);
        });
    });

    describe("when registering a context listener", function() {

        var view = null;
        var context = null;

        before(function() {
            var ViewDef = Backbone.View.extend();
            view = new ViewDef();
            context = Geppetto.bindContext({
                view: view,
                context: Geppetto.Context.extend()
            });
        });

        after(function() {
            view.close();
        });

        it("should throw an error if only one argument is provided", function() {
            assert(function() {
                context.listen(view);
            }).throwsException("Expected 3 arguments (target, eventName, callback)");
        });

        it("should throw an error if only two arguments are provided", function() {
            assert(function() {
                context.listen(view, "foo");
            }).throwsException("Expected 3 arguments (target, eventName, callback)");
        });

        it("should not throw an error if three proper arguments are provided", function() {
            context.listen(view, "foo", function() {});
            assert.pass();
        });

        it("should throw an error if the target object does not have a 'listenTo' method", function() {
            assert(function() {
                context.listen({stopListening: function() {}}, "foo", function(){});
            }).throwsException("Target for listen() must define a 'listenTo' and 'stopListening' function");
        });

        it("should throw an error if the target object does not have a 'stopListening' method", function() {
            assert(function() {
                context.listen({listenTo: function() {}}, "foo", function(){});
            }).throwsException("Target for listen() must define a 'listenTo' and 'stopListening' function");
        });

        it("should not throw an error if the target object has both a 'listenTo' and 'stopListening' method", function() {
            context.listen({listenTo: function(){}, stopListening: function(){}}, "foo", function(){});
            assert.pass();
        });

        it("should throw an error if the event name is not provided", function() {
            assert(function() {
                context.listen(view, null, function(){});
            }).throwsException("eventName must be a String");
        });

        it("should throw an error if the event name is not a string", function() {
            assert(function() {
                context.listen(view, 5, function(){});
            }).throwsException("eventName must be a String");
        });

        it("should throw an error if the callback function is not provided", function() {
            assert(function() {
                context.listen(view, "foo", null);
            }).throwsException("callback must be a function");
        });

        it("should throw an error if the callback function is not a function", function() {
            assert(function() {
                context.listen(view, "foo", "bar");
            }).throwsException("callback must be a function");
        });

    });

    describe("when registering commands individually using mapCommand", function() {

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

            myView = new Backbone.View();

            Geppetto.bindContext({
                view: myView,
                context: contextDefinition
            });
        });

        after(function() {
            myView.close();
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

		it("should throw an error if the command is not a function", function(){
			assert(function(){
				myView.context.mapCommand("failEvent", {});
			}).throwsException('Command must be constructable');
		});
    });

    describe("when registering commands in batch using the commands map", function() {

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
                commands: {
                    "abcEvent": AbcCommand,
                    "xyzEvent": XyzCommand,
					"abcxyzEvent": [
						AbcCommand,
						XyzCommand
					]
                }
            });

            myView = new Backbone.View();

            Geppetto.bindContext({
                view: myView,
                context: contextDefinition
            });
        });

        after(function() {
            myView.close();
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

		it("should fire all commands registered as array", function(){
			myView.context.dispatch("abcxyzEvent");
			assert( abcSpy.called).isTrue();
			assert( xyzSpy.called).isTrue();
		});
    });

    describe("when a context has a parent context", function() {

        var parentView;
        var parentContext;

        var childView;
        var childContext;

        before(function() {
            var ParentViewDef = Backbone.View.extend();
            parentView = new ParentViewDef();
            parentContext = Geppetto.bindContext({
                view: parentView,
                context: Geppetto.Context.extend()
            });

            var ChildViewDef = Backbone.View.extend();
             childView = new ChildViewDef();
             childContext = Geppetto.bindContext({
                 view: childView,
                 context: Geppetto.Context.extend(),
                 parentContext: parentContext
             });
        });

        after(function() {
            childView.close();
            parentView.close();
        });

        it("should set the 'parentContext' attribute on the child context", function() {
            assert(childContext.parentContext).isEqualTo(parentContext);
        });

        it("should not pass events to the parent context using normal 'dispatch()'", function() {
            var spy = sinon.spy();
            parentContext.listen(parentView, "foo", spy);
            assert(spy.callCount).isEqualTo(0);
            childContext.dispatch("foo");
            assert(spy.callCount).isEqualTo(0);
        });

        it("should pass events to the parent context using 'dispatchToParent()'", function() {
            var spy = sinon.spy();
            parentContext.listen(parentView, "foo", spy);
            assert(spy.callCount).isEqualTo(0);
            childContext.dispatchToParent("foo");
            assert(spy.callCount).isEqualTo(1);
        });

        it("should dispatch a context shutdown event to the parent when the child context is closed", function() {
            var spy = sinon.spy();
            parentContext.listen(parentView, Geppetto.EVENT_CONTEXT_SHUTDOWN, spy);
            childView.close();
            assert(spy.callCount).isEqualTo(1);
        });
    });

    describe("when dispatching globally", function() {

        var view1;
        var context1;

        var view2;
        var context2;

        var view3;
        var context3;

        before(function() {

            var viewDef1 = Backbone.View.extend();
             view1 = new viewDef1();
             context1 = Geppetto.bindContext({
                 view: view1,
                 context: Geppetto.Context.extend()
             });

            var viewDef2 = Backbone.View.extend();
             view2 = new viewDef2();
             context2 = Geppetto.bindContext({
                 view: view2,
                 context: Geppetto.Context.extend()
             });

            var viewDef3 = Backbone.View.extend();
             view3 = new viewDef3();
             context3 = Geppetto.bindContext({
                 view: view3,
                 context: Geppetto.Context.extend()
             });

        });

        after(function() {
            view1.close();
            view2.close();
            view3.close();
        });

        it("should not pass events to the other contexts using normal 'dispatch()'", function() {

            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            var spy3 = sinon.spy();

            context1.listen(view1, "foo", spy1);
            context2.listen(view2, "foo", spy2);
            context3.listen(view3, "foo", spy3);

            assert(spy1.callCount).isEqualTo(0);
            assert(spy2.callCount).isEqualTo(0);
            assert(spy3.callCount).isEqualTo(0);

            context1.dispatch("foo");

            assert(spy1.callCount).isEqualTo(1);
            assert(spy2.callCount).isEqualTo(0);
            assert(spy3.callCount).isEqualTo(0);
        });

        it("should pass events to the other contexts using 'dispatchGlobally()'", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            var spy3 = sinon.spy();

            context1.listen(view1, "foo", spy1);
            context2.listen(view2, "foo", spy2);
            context3.listen(view3, "foo", spy3);

            assert(spy1.callCount).isEqualTo(0);
            assert(spy2.callCount).isEqualTo(0);
            assert(spy3.callCount).isEqualTo(0);

            context1.dispatchGlobally("foo");

            assert(spy1.callCount).isEqualTo(1);
            assert(spy2.callCount).isEqualTo(1);
            assert(spy3.callCount).isEqualTo(1);
        });


    });


    describe("when debug mode is enabled", function() {

        var view;
        var context;

        before(function() {
            var viewDef = Backbone.View.extend();
            view = new viewDef();
            context = Geppetto.bindContext({
                view: view,
                context: Geppetto.Context.extend()
            });
        });
        after(function() {
            view.close();
            Geppetto.setDebug(false);
        });

        it("should not expose a 'debug' property before enabling debug mode", function() {
            assert(Geppetto.debug).isUndefined();
        });

        it("should expose a 'debug' property after enabling debug mode", function() {
            assert(Geppetto.debug).isUndefined();
            Geppetto.setDebug(true);
            assert(Geppetto.debug).isDefined();
        });

        it("should track the number of contexts", function() {
            Geppetto.setDebug(true);
            assert(Geppetto.debug.countContexts()).isEqualTo(1);

            var otherViewDef = Backbone.View.extend();
            var otherView = new otherViewDef();
            var otherContext = Geppetto.bindContext({
                view: otherView,
                context: Geppetto.Context.extend()
            });

            assert(Geppetto.debug.countContexts()).isEqualTo(2);

            otherView.close();

            assert(Geppetto.debug.countContexts()).isEqualTo(1);
        });

        it("should track the number of events", function() {
            Geppetto.setDebug(true);
            assert(Geppetto.debug.countEvents()).isEqualTo(0);
            context.listen(view, "foo", function(){});
            assert(Geppetto.debug.countEvents()).isEqualTo(1);

            var otherViewDef = Backbone.View.extend();
            var otherView = new otherViewDef();
            var otherContext = Geppetto.bindContext({
                view: otherView,
                context: Geppetto.Context.extend()
            });

            assert(Geppetto.debug.countEvents()).isEqualTo(1);

            context.listen(otherView, "bar", function(){});
            assert(Geppetto.debug.countEvents()).isEqualTo(2);

            otherContext.listen(otherView, "baz", function(){});
            assert(Geppetto.debug.countEvents()).isEqualTo(3);

            otherContext.listen(view, "abc", function(){});
            assert(Geppetto.debug.countEvents()).isEqualTo(4);

            otherView.close();
            assert(Geppetto.debug.countEvents()).isEqualTo(1);

            view.close();
            assert(Geppetto.debug.countEvents()).isEqualTo(0);
        });

    });


});
});