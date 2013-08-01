/* suppress jshint warnings for chai syntax - https://github.com/chaijs/chai/issues/41#issuecomment-14904150 */
/* jshint -W024 */
/* jshint expr:true */
define( [
    "underscore",
    "backbone",
    "geppetto"
], function(_, Backbone, Geppetto) {

    var expect = chai.expect;
    describe("Backbone.Geppetto", function(){

        describe("when loading Geppetto", function(){

            it("should be defined as an AMD module", function() {
                expect( Geppetto ).not.to.be.null;
            });

            it("should be defined as a property on the Backbone object", function() {
                expect( Backbone.Geppetto ).not.to.be.null;
                expect( Backbone.Geppetto ).to.equal(Geppetto);
            });

        });

        describe("when binding a context", function() {

            var contextDefinition;
            var contextInstance;

            beforeEach(function(){
                contextDefinition = Geppetto.Context.extend();
            });

            it("should bind the context instance to the view", function() {

                var MyViewDef = Backbone.View.extend();
                var myView = new MyViewDef();

                Geppetto.bindContext({
                    view: myView,
                    context: contextDefinition
                });

                expect( myView.context ).to.exist;

                myView.close();
            });
        });

        describe("when a Backbone View adds an event listener to a context", function() {
            var parentView;
            var contextDefinition;
            var contextInstance;
            var childViewInstance;
            var fooSpy;

            beforeEach(function(){
                fooSpy = sinon.spy();
                contextDefinition = Geppetto.Context.extend();
                var ParentViewDef = Backbone.View.extend();
                parentView = new ParentViewDef();

                contextInstance = Geppetto.bindContext({
                    view: parentView,
                    context: contextDefinition
                });

                expect( parentView.context ).to.exist;

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

            afterEach(function() {
                parentView.close();
                childViewInstance.remove();
                fooSpy = undefined;
            });

            it("should fire the foo event while the view is active", function() {
                contextInstance.dispatch("foo");
                expect(fooSpy.callCount ).to.equal(1);
            });

            it("should pass supplied data in the payload object", function() {
				var expected = ["bar", "baz", "qux"];
				var event = ["foo"].concat(expected);
                contextInstance.dispatch.apply(contextInstance, event);
                expect(fooSpy.callCount ).to.equal(1);
                var actual = fooSpy.getCall(0).args;
                expect(actual).to.deep.equal(expected);
            });

            it("should pass the foo event when listened from the parent view", function() {
                var parentFooSpy = sinon.spy();
                contextInstance.listen(parentView, "foo", parentFooSpy);
                contextInstance.dispatch("foo");
                expect(fooSpy.callCount ).to.equal(1);
                expect(parentFooSpy.callCount ).to.equal(1);
            });

            it("should not fire the foo event after the child view is closed", function() {
                childViewInstance.remove();
                contextInstance.dispatch("foo");
                expect(fooSpy.callCount ).to.equal(0);
            });

            it("should not fire the foo event when listened from the parent view and the parent view is closed", function() {
                var parentFooSpy = sinon.spy();
                contextInstance.listen(parentView, "foo", parentFooSpy);
                parentView.close();
                contextInstance.dispatch("foo");
                expect(parentFooSpy.callCount ).to.equal(0);
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

            beforeEach(function(){
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

                expect( parentView.context ).to.exist;

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

            afterEach(function() {
                parentView.close();
                childViewInstance.remove();
                fooParentSpy = undefined;
                barParentSpy = undefined;
                fooChildSpy = undefined;
                barChildSpy = undefined;
            });

            it("should trigger the foo response function when registered as a string", function() {
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount ).to.equal(1);
                expect(fooChildSpy.callCount ).to.equal(1);
            });

            it("should trigger the bar response function when registered as a function", function() {
                contextInstance.dispatch("bar");
                expect(barParentSpy.callCount ).to.equal(1);
                expect(barChildSpy.callCount ).to.equal(1);
            });

            it("should remove the parent foo listener when the parent view is closed", function() {
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount ).to.equal(1);
                expect(fooChildSpy.callCount ).to.equal(1);
                parentView.close();
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount ).to.equal(1);
                expect(fooChildSpy.callCount ).to.equal(2);
            });

            it("should remove the child foo listener when the child view is closed", function() {
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount ).to.equal(1);
                expect(fooChildSpy.callCount ).to.equal(1);
                childViewInstance.remove();
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount ).to.equal(2);
                expect(fooChildSpy.callCount ).to.equal(1);
            });
        });

        describe("when registering a context listener", function() {

            var view = null;
            var context = null;

            beforeEach(function() {
                var ViewDef = Backbone.View.extend();
                view = new ViewDef();
                context = Geppetto.bindContext({
                    view: view,
                    context: Geppetto.Context.extend()
                });
            });

            afterEach(function() {
                view.close();
            });

            it("should throw an error if only one argument is provided", function() {
                expect(function() {
                    context.listen(view);
                }).to.throw("Expected 3 arguments (target, eventName, callback)");
            });

            it("should throw an error if only two arguments are provided", function() {
                expect(function() {
                    context.listen(view, "foo");
                }).to.throw("Expected 3 arguments (target, eventName, callback)");
            });

            it("should not throw an error if three proper arguments are provided", function() {
                expect(function(){
                    context.listen(view, "foo", function() {});
                }).not.to.throw();
            });

            it("should throw an error if the target object does not have a 'listenTo' method", function() {
                expect(function() {
                    context.listen({stopListening: function() {}}, "foo", function(){});
                }).to.throw("Target for listen() must define a 'listenTo' and 'stopListening' function");
            });

            it("should throw an error if the target object does not have a 'stopListening' method", function() {
                expect(function() {
                    context.listen({listenTo: function() {}}, "foo", function(){});
                }).to.throw("Target for listen() must define a 'listenTo' and 'stopListening' function");
            });

            it("should not throw an error if the target object has both a 'listenTo' and 'stopListening' method", function() {
                expect(function(){
                    context.listen({listenTo: function(){}, stopListening: function(){}}, "foo", function(){});
                }).not.to.throw();
            });

            it("should throw an error if the event name is not provided", function() {
                expect(function() {
                    context.listen(view, null, function(){});
                }).to.throw("eventName must be a String");
            });

            it("should throw an error if the event name is not a string", function() {
                expect(function() {
                    context.listen(view, 5, function(){});
                }).to.throw("eventName must be a String");
            });

            it("should throw an error if the callback function is not provided", function() {
                expect(function() {
                    context.listen(view, "foo", null);
                }).to.throw("callback must be a function");
            });

            it("should throw an error if the callback function is not a function", function() {
                expect(function() {
                    context.listen(view, "foo", "bar");
                }).to.throw("callback must be a function");
            });

        });

        describe("when registering commands individually using mapCommand", function() {

            var myView;

            var contextDefinition;

            var AbcCommand;
            var XyzCommand;

            var abcSpy;
            var xyzSpy;

            beforeEach(function(){
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

            afterEach(function() {
                myView.close();
            });

            it("should fire AbcCommand when abcEvent is dispatched", function() {
                myView.context.dispatch("abcEvent");

                expect( abcSpy.called ).to.be.true;
                expect( xyzSpy.called ).to.be.false;
            });

            it("should not fire AbcCommand after the associated view is closed", function() {

                myView.close();
                myView.context.dispatch("abcEvent");

                expect( abcSpy.called ).to.be.false;
                expect( xyzSpy.called ).to.be.false;
            });

        });

        describe("when registering commands in batch using the commands map", function() {

            var myView;

            var contextDefinition;

            var AbcCommand;
            var XyzCommand;

            var abcSpy;
            var xyzSpy;

            beforeEach(function(){
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

            afterEach(function() {
                myView.close();
            });

            it("should fire AbcCommand when abcEvent is dispatched", function() {
                myView.context.dispatch("abcEvent");

                expect( abcSpy.called ).to.be.true;
                expect( xyzSpy.called ).to.be.false;
            });

            it("should not fire AbcCommand after the associated view is closed", function() {

                myView.close();
                myView.context.dispatch("abcEvent");

                expect( abcSpy.called ).to.be.false;
                expect( xyzSpy.called ).to.be.false;
            });

            it("should fire all commands registered as array", function(){
                myView.context.dispatch("abcxyzEvent");
                expect( abcSpy.called ).to.be.true;
                expect( xyzSpy.called ).to.be.true;
            });
        });

		describe("when executing a command", function(){
			var context;
			var executionSpy;
			var Command;
			beforeEach(function(){
				executionSpy = sinon.spy();
				Command = function(){};
				Command.prototype.execute = executionSpy;
				var contextDefinition = Geppetto.Context.extend();
				context = new contextDefinition();
			});

			afterEach(function(){
				context.unmapAll();
			});

			it("should throw an error if the command is not a function", function(){
				expect(function(){
					context.execute([{}]);
				}).to.throw("Command must be constructable");
			});

			it("should throw an error if the command has no 'execute' method", function(){
				expect(function(){
					context.execute([function(){}]);
				}).to.throw("Command must define an 'execute' function");
			});

			it("its execute method should be called", function(){
				context.execute([Command]);
				expect(executionSpy.called).to.be.true;
			});

			it("should receive the payload as arguments", function(){
				var expected = ['foo', 'bar', 'baz'];
				var args = [[Command]].concat(expected);
				context.execute.apply(context, args);
				var actual = executionSpy.getCall(0).args;
				expect(actual).to.deep.equal(expected);
			});

			it("should be injected with the context", function(){
				var actual;
				var Command = function(){
					this.execute = function(){
						actual = this.context;
					};
				};
				context.execute([Command]);
				expect(actual).to.equal(context);
			});

			it("should be injected with an event object when triggered", function(){
				var actual;
				var Command = function(){
					this.execute = function(){
						actual = this.event;
					};
				};
				var expected = {
					name : 'foo',
					data : ['bar', 'baz', 'qux']
				};
				context.mapCommand(expected.name, Command);
				context.dispatch.apply(context, [expected.name].concat(expected.data));
				expect(actual).to.deep.equal(expected);
			});

			it("should have separate event data arrays for each command", function(){
				var actual = [];
				var Command = function(){
					this.execute = function(){
						actual.push(this.event.data);
					};
				};
				context.mapCommand('foo', Command);
				context.mapCommand('foo', Command);
				context.dispatch('foo', 'bar', 'baz');
				expect(actual[0]).to.not.equal(actual[1]);
				expect(actual[0]).to.deep.equal(actual[1]);
			});
		});

        describe("when a context has a parent context", function() {

            var parentView;
            var parentContext;

            var childView;
            var childContext;

            beforeEach(function() {
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

            afterEach(function() {
                childView.close();
                parentView.close();
            });

            it("should set the 'parentContext' attribute on the child context", function() {
                expect(childContext.parentContext).to.equal(parentContext);
            });

            it("should not pass events to the parent context using normal 'dispatch()'", function() {
                var spy = sinon.spy();
                parentContext.listen(parentView, "foo", spy);
                expect(spy.callCount).to.equal(0);
                childContext.dispatch("foo");
                expect(spy.callCount).to.equal(0);
            });

            it("should pass events to the parent context using 'dispatchToParent()'", function() {
                var spy = sinon.spy();
                parentContext.listen(parentView, "foo", spy);
                expect(spy.callCount).to.equal(0);
                childContext.dispatchToParent("foo");
                expect(spy.callCount).to.equal(1);
            });

            it("should dispatch a context shutdown event to the parent when the child context is closed", function() {
                var spy = sinon.spy();
                parentContext.listen(parentView, Geppetto.EVENT_CONTEXT_SHUTDOWN, spy);
                childView.close();
                expect(spy.callCount).to.equal(1);
            });
        });

        describe("when dispatching globally", function() {

            var view1;
            var context1;

            var view2;
            var context2;

            var view3;
            var context3;

            beforeEach(function() {

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

            afterEach(function() {
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

                expect(spy1.callCount).to.equal(0);
                expect(spy2.callCount).to.equal(0);
                expect(spy3.callCount).to.equal(0);

                context1.dispatch("foo");

                expect(spy1.callCount).to.equal(1);
                expect(spy2.callCount).to.equal(0);
                expect(spy3.callCount).to.equal(0);
            });

            it("should pass events to the other contexts using 'dispatchGlobally()'", function() {
                var spy1 = sinon.spy();
                var spy2 = sinon.spy();
                var spy3 = sinon.spy();

                context1.listen(view1, "foo", spy1);
                context2.listen(view2, "foo", spy2);
                context3.listen(view3, "foo", spy3);

                expect(spy1.callCount).to.equal(0);
                expect(spy2.callCount).to.equal(0);
                expect(spy3.callCount).to.equal(0);

                context1.dispatchGlobally("foo");

                expect(spy1.callCount).to.equal(1);
                expect(spy2.callCount).to.equal(1);
                expect(spy3.callCount).to.equal(1);
            });


        });


        describe("when debug mode is enabled", function() {

            var view;
            var context;

            beforeEach(function() {
                var viewDef = Backbone.View.extend();
                view = new viewDef();
                context = Geppetto.bindContext({
                    view: view,
                    context: Geppetto.Context.extend()
                });
            });
            afterEach(function() {
                view.close();
                Geppetto.setDebug(false);
            });

            it("should not expose a 'debug' property before enabling debug mode", function() {
                expect(Geppetto.debug).not.to.exist;
            });

            it("should expose a 'debug' property after enabling debug mode", function() {
                expect(Geppetto.debug).not.to.exist;
                Geppetto.setDebug(true);
                expect(Geppetto.debug).to.exist;
            });

            it("should track the number of contexts", function() {
                Geppetto.setDebug(true);
                expect(Geppetto.debug.countContexts()).to.equal(1);

                var otherViewDef = Backbone.View.extend();
                var otherView = new otherViewDef();
                var otherContext = Geppetto.bindContext({
                    view: otherView,
                    context: Geppetto.Context.extend()
                });

                expect(Geppetto.debug.countContexts()).to.equal(2);

                otherView.close();

                expect(Geppetto.debug.countContexts()).to.equal(1);
            });

            it("should track the number of events", function() {
                Geppetto.setDebug(true);
                expect(Geppetto.debug.countEvents()).to.equal(0);
                context.listen(view, "foo", function(){});
                expect(Geppetto.debug.countEvents()).to.equal(1);

                var otherViewDef = Backbone.View.extend();
                var otherView = new otherViewDef();
                var otherContext = Geppetto.bindContext({
                    view: otherView,
                    context: Geppetto.Context.extend()
                });

                expect(Geppetto.debug.countEvents()).to.equal(1);

                context.listen(otherView, "bar", function(){});
                expect(Geppetto.debug.countEvents()).to.equal(2);

                otherContext.listen(otherView, "baz", function(){});
                expect(Geppetto.debug.countEvents()).to.equal(3);

                otherContext.listen(view, "abc", function(){});
                expect(Geppetto.debug.countEvents()).to.equal(4);

                otherView.close();
                expect(Geppetto.debug.countEvents()).to.equal(1);

                view.close();
                expect(Geppetto.debug.countEvents()).to.equal(0);
            });


        });


    });
});