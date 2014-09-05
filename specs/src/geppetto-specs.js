/* suppress jshint warnings for chai syntax - https://github.com/chaijs/chai/issues/41#issuecomment-14904150 */
/* jshint -W024 */
/* jshint expr:true */
define([
    "underscore", "backbone", "geppetto"
], function(_, Backbone, Geppetto) {

    var expect = chai.expect;
    describe("Backbone.Geppetto", function() {

        describe("when loading Geppetto", function() {

            it("should be defined as an AMD module", function() {
                expect(Geppetto).not.to.be.null;
            });

            it("should be defined as a property on the Backbone object", function() {
                expect(Backbone.Geppetto).not.to.be.null;
                expect(Backbone.Geppetto).to.equal(Geppetto);
            });

        });

        describe("when a context was instantiated", function() {
            var context;
            beforeEach(function() {
                context = new Geppetto.Context();
            });
            afterEach(function() {
                context.destroy();
            });
            it("should create an resolver", function() {
                expect(context.resolver).to.be.an.instanceOf(Geppetto.Resolver);
            });
            it("should release its resolvers wirings upon shutdown", function() {
                var unmapperSpy = sinon.spy();
                context.resolver.releaseAll = unmapperSpy;
                context.destroy();
                expect(unmapperSpy).to.have.been.calledOnce;
            });
            it("should wrap the resolver's methods", function() {
                var wrapped = [
                    "wireView",
                    "wireSingleton",
                    "wireValue",
                    "wireClass",
                    "hasWiring",
                    "getObject",
                    "instantiate",
                    "resolve",
                    "release",
                    "releaseAll"
                ];
                _.each(wrapped, function(methodName) {
                    var stub = sinon.stub(context.resolver, methodName);
                    context[methodName].call(context);
                    expect(stub).to.have.been.calledOnce;
                });
            });
        });

        describe("when binding a context to a view that does not support dependency injection", function() {

            var contextDefinition;
            var contextInstance;

            beforeEach(function() {
                contextDefinition = Geppetto.Context.extend();
            });

            it("should bind the context instance to the view", function() {

                var MyViewDef = Backbone.View.extend();
                var myView = new MyViewDef();

                var returnedContext = Geppetto.bindContext({
                    view: myView,
                    context: contextDefinition
                });

                expect(myView.context).to.exist;
                expect(returnedContext).to.equal(myView.context);

                myView.close();
            });            
        });
        
        describe("when a Backbone View adds an event listener to a context", function() {
            var parentView;
            var contextDefinition;
            var contextInstance;
            var childViewInstance;
            var fooSpy;

            beforeEach(function() {
                fooSpy = sinon.spy();
                contextDefinition = Geppetto.Context.extend();
                var ParentViewDef = Backbone.View.extend();
                parentView = new ParentViewDef();

                contextInstance = Geppetto.bindContext({
                    view: parentView,
                    context: contextDefinition
                });

                expect(parentView.context).to.exist;

                var childViewDef = Backbone.View.extend({
                    constructor: function(options) {
                        this.options = options;
                        return Backbone.View.apply(this, arguments);
                    },
                    initialize: function(options) {
                        _.bindAll.apply(_, [this].concat(_.functions(this)));
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
                expect(fooSpy.callCount).to.equal(1);
            });

            it("should pass the event name in the event payload object", function() {
                contextInstance.dispatch("foo");
                expect(fooSpy).to.have.been.calledOnce;
                var payload = fooSpy.getCall(0).args[0];
                expect(payload.eventName).to.equal("foo");
            });

            it("should pass supplied data in the payload object", function() {
                contextInstance.dispatch("foo", {
                    bar: "baz"
                });
                expect(fooSpy.callCount).to.equal(1);
                var payload = fooSpy.getCall(0).args[0];
                expect(payload.eventName).to.equal("foo");
                expect(payload.bar).to.equal("baz");
            });

            it("should throw an exception if the payload object is a string, not an object", function() {
                expect(function() {
                    contextInstance.dispatch("foo", "baz");
                }).to.
                throw ("Event payload must be an object");
            });

            it("should throw an exception if the payload object is a boolean false, not an object", function() {
                expect(function() {
                    contextInstance.dispatch("foo", false);
                }).to.
                throw ("Event payload must be an object");
            });

            it("should throw an exception if the payload object is a boolean true, not an object", function() {
                expect(function() {
                    contextInstance.dispatch("foo", true);
                }).to.
                throw ("Event payload must be an object");
            });

            it("should throw an exception if the payload object is null, not an object", function() {
                expect(function() {
                    contextInstance.dispatch("foo", null);
                }).to.
                throw ("Event payload must be an object");
            });

            it("should fire the callback multiple times when the event is dispatched multiple times", function() {
                var multiDispatchSpy = sinon.spy();
                contextInstance.listen(parentView, "foo", multiDispatchSpy);
                contextInstance.dispatch("foo");
                expect(multiDispatchSpy.callCount).to.equal(1);
                contextInstance.dispatch("foo");
                expect(multiDispatchSpy.callCount).to.equal(2);
            });

            it("should fire the callback only once when using listenToOnce and the event is dispatched multiple times", function() {
                var multiDispatchSpy = sinon.spy();
                contextInstance.listenToOnce(parentView, "foo", multiDispatchSpy);
                contextInstance.dispatch("foo");
                expect(fooSpy.callCount).to.equal(1);
                expect(multiDispatchSpy.callCount).to.equal(1);
                contextInstance.dispatch("foo");
                expect(multiDispatchSpy.callCount).to.equal(1);
            });
            
            it("should pass the foo event when listened from the parent view", function() {
                var parentFooSpy = sinon.spy();
                contextInstance.listen(parentView, "foo", parentFooSpy);
                contextInstance.dispatch("foo");
                expect(fooSpy.callCount).to.equal(1);
                expect(parentFooSpy.callCount).to.equal(1);
            });

            it("should not fire the foo event after the child view is closed", function() {
                childViewInstance.remove();
                contextInstance.dispatch("foo");
                expect(fooSpy.callCount).to.equal(0);
            });

            it("should not fire the foo event when listened from the parent view and the parent view is closed", function() {
                var parentFooSpy = sinon.spy();
                contextInstance.listen(parentView, "foo", parentFooSpy);
                parentView.close();
                contextInstance.dispatch("foo");
                expect(parentFooSpy.callCount).to.equal(0);
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

            beforeEach(function() {
                fooParentSpy = sinon.spy();
                barParentSpy = sinon.spy();
                fooChildSpy = sinon.spy();
                barChildSpy = sinon.spy();

                contextDefinition = Geppetto.Context.extend();

                var ParentViewDef = Backbone.View.extend({
                    initialize: function() {
                        _.bindAll.apply(_, [this].concat(_.functions(this)));
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

                expect(parentView.context).to.exist;

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
                    constructor: function(options) {
                        this.options = options;
                        return Backbone.View.apply(this, arguments);
                    },
                    initialize: function(options) {
                        _.bindAll.apply(_, [this].concat(_.functions(this)));
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
                expect(fooParentSpy.callCount).to.equal(1);
                expect(fooChildSpy.callCount).to.equal(1);
            });

            it("should trigger the bar response function when registered as a function", function() {
                contextInstance.dispatch("bar");
                expect(barParentSpy.callCount).to.equal(1);
                expect(barChildSpy.callCount).to.equal(1);
            });

            it("should remove the parent foo listener when the parent view is closed", function() {
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount).to.equal(1);
                expect(fooChildSpy.callCount).to.equal(1);
                parentView.close();
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount).to.equal(1);
                expect(fooChildSpy.callCount).to.equal(2);
            });

            it("should remove the child foo listener when the child view is closed", function() {
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount).to.equal(1);
                expect(fooChildSpy.callCount).to.equal(1);
                childViewInstance.remove();
                contextInstance.dispatch("foo");
                expect(fooParentSpy.callCount).to.equal(2);
                expect(fooChildSpy.callCount).to.equal(1);
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

            it("should throw an error if the target object does not have a 'listenTo' method", function() {
                expect(function() {
                    context.listen({
                        stopListening: function() {}
                    }, "foo", function() {});
                }).to.
                throw ("Target for listen() must define a 'listenTo' and 'stopListening' function");
            });

            it("should throw an error if the target object does not have a 'stopListening' method", function() {
                expect(function() {
                    context.listen({
                        listenTo: function() {}
                    }, "foo", function() {});
                }).to.
                throw ("Target for listen() must define a 'listenTo' and 'stopListening' function");
            });

            it("should not throw an error if the target object has both a 'listenTo' and 'stopListening' method", function() {
                expect(function() {
                    context.listen({
                        listenTo: function() {},
                        stopListening: function() {}
                    }, "foo", function() {});
                }).not.to.
                throw ();
            });

            it("should throw an error if the event name is not provided", function() {
                expect(function() {
                    context.listen(view, null, function() {});
                }).to.
                throw ("eventName must be a String");
            });

            it("should throw an error if the event name is not a string", function() {
                expect(function() {
                    context.listen(view, 5, function() {});
                }).to.
                throw ("eventName must be a String");
            });

            it("should throw an error if the callback function is not provided", function() {
                expect(function() {
                    context.listen(view, "foo", null);
                }).to.
                throw ("callback must be a function");
            });

            it("should throw an error if the callback function is not a function", function() {
                expect(function() {
                    context.listen(view, "foo", "bar");
                }).to.
                throw ("callback must be a function");
            });

        });

        describe("when registering commands individually using wireCommand", function() {

            var myView;

            var contextDefinition;

            var AbcCommand;
            var XyzCommand;

            var abcSpy;
            var xyzSpy;

            beforeEach(function() {
                abcSpy = sinon.spy();
                AbcCommand = function() {};
                AbcCommand.prototype.execute = abcSpy;

                xyzSpy = sinon.spy();
                XyzCommand = function() {};
                XyzCommand.prototype.execute = xyzSpy;

                contextDefinition = Geppetto.Context.extend({
                    initialize: function() {
                        this.wireCommand("abcEvent", AbcCommand);
                        this.wireCommand("xyzEvent", XyzCommand);
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

                expect(abcSpy.called).to.be.true;
                expect(xyzSpy.called).to.be.false;
            });

            it("should not fire AbcCommand after the associated view is closed", function() {

                myView.close();
                myView.context.dispatch("abcEvent");

                expect(abcSpy.called).to.be.false;
                expect(xyzSpy.called).to.be.false;
            });

            it("should throw an error if the command is not a function", function() {
                expect(function() {
                    myView.context.wireCommand("failEvent", {});
                }).to.
                throw ("Command must be constructable");
            });

        });

        describe("when triggering commands", function() {
            var context;
            var resolver;
            var CommandClass;
            var command;
            beforeEach(function() {
                var ContextDefinition = Geppetto.Context.extend({});
                context = new ContextDefinition();
                resolver = context.resolver;
                CommandClass = function() {
                    this.ctorArgs = _.toArray(arguments);
                };
                CommandClass.prototype.execute = function() {
                    command = this;
                };

            });
            afterEach(function() {
                context.destroy();
                context = null;
                resolver = null;
                executionSpy = null;
                CommandClass = null;
                command = null;
            });
            it("should resolve dependencies passed to the wireCommand", function() {
                var value = {};
                resolver.wireValue('value', value);
                context.wireCommand('foo', CommandClass, {
                    dependency: 'value'
                });
                context.dispatch('foo');
                expect(command.dependency).to.equal(value);
            });

            it("should resolve dependencies declared in the command", function() {
                var value = {};
                resolver.wireValue('value', value);
                CommandClass.prototype.wiring = {
                    dependency: 'value'
                };
                context.wireCommand('foo', CommandClass);
                context.dispatch('foo');
                expect(command.dependency).to.equal(value);
            });
            
            it("should pass context and event data to the command constructor", function(){
                context.wireCommand('foo', CommandClass);
                context.dispatch('foo');
                expect(command.ctorArgs).to.contain(context);
            });
        });

        describe("when wiring dependencies in batch using the Context 'wiring' parameter", function() {

            var context;

            var AbcCommand;

            var abcSpy;

            var wiring;
            
            beforeEach(function() {
                abcSpy = sinon.spy();
                AbcCommand = function() {};
                AbcCommand.prototype.execute = abcSpy;
                wiring = {
                    commands: {
                        "abcEvent": AbcCommand
                    },
                    singletons: {
                        "singleton": function() {},
                        "customWiredSingleton": {
                            ctor: function(){},
                            wiring: {
                                "customValue": "value"
                            }
                        }
                    },
                    classes: {
                        "clazz": function() {},
                        "customWiredClass": {
                            ctor: function(){},
                            wiring: {
                                "customValue": "value"
                            }
                        }
                    },
                    values: {
                        "value": "value"
                    },
                    views: {
                        "view": Backbone.View.extend(),
                        "customWiredView": {
                            ctor: function(){},
                            wiring: {
                                "customValue": "value"
                            }
                        }

                    }
                };
                
                var ContextDefinition = Geppetto.Context.extend({
                    wiring: wiring,
                    resolver: {
                        wireSingleton: sinon.spy(),
                        wireClass: sinon.spy(),
                        wireValue: sinon.spy(),
                        wireView: sinon.spy(),
                        resolve: sinon.spy(),
                        releaseAll: sinon.spy()
                    },
                    initialize : sinon.spy()
                });

                context = new ContextDefinition();
            });

            afterEach(function() {
                context.destroy();
            });

            it("should wire commands", function() {
                context.dispatch("abcEvent");

                expect(abcSpy.called).to.be.true;
            });
            it("should wire singletons", function() {
                expect(context.resolver.wireSingleton).to.be.calledWith("singleton", wiring.singletons.singleton);
            });
            it("should wire custom-mapped singletons", function() {
                expect(context.resolver.wireSingleton).to.be.calledWith("customWiredSingleton", 
                        wiring.singletons.customWiredSingleton.ctor, wiring.singletons.customWiredSingleton.wiring);
            });
            it("should wire classes", function() {
                expect(context.resolver.wireClass).to.be.calledWith("clazz", wiring.classes.clazz);
            });
            it("should wire custom-mapped classes", function() {
                expect(context.resolver.wireClass).to.be.calledWith("customWiredClass",
                        wiring.classes.customWiredClass.ctor, wiring.classes.customWiredClass.wiring);
            });
            it("should wire values", function() {
                expect(context.resolver.wireValue).to.be.calledWith("value", wiring.values.value);
            });
            it("should wire views", function() {
                expect(context.resolver.wireView).to.be.calledWith("view", wiring.views.view);
            });
            it("should wire custom-mapped views", function() {
                expect(context.resolver.wireView).to.be.calledWith("customWiredView",
                        wiring.views.customWiredView.ctor, wiring.views.customWiredView.wiring);
            });
            it("should wire everything before initialization", function(){
                expect(context.resolver.wireSingleton).to.be.calledBefore(context.initialize);
            });
        });

        describe("when registering commands in batch using wireCommands", function() {
            var context;
            var FooCommand;
            var executionSpy;
            beforeEach(function() {
                executionSpy = sinon.spy();
                FooCommand = function() {
                    this.execute = executionSpy;
                };
                context = new Geppetto.Context();
            });
            afterEach(function() {
                context.destroy();
            });
            it("should fire FooCommand after dispatch", function() {
                context.wireCommands({
                    'foo': FooCommand
                });
                context.dispatch('foo');
                expect(executionSpy).to.have.been.calledOnce;
            });
            it("should fire all commands mapped as Array", function() {
                context.wireCommands({
                    'foo': [
                        FooCommand, FooCommand, FooCommand
                    ]
                });
                context.dispatch('foo');
                expect(executionSpy).to.have.been.calledThrice;
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

            it("should have an resolver which is a child resolver of the parent", function() {
                expect(childContext.resolver.parent).to.equal(parentContext.resolver);
            });

        });
        describe("when calling dispatchToParents on a context with multiple levels of ancestry", function() {

            var greatGrandParentView;
            var greatGrandParentContext;

            var grandParentView;
            var grandParentContext;

            var parentView;
            var parentContext;

            var childView;
            var childContext;

            beforeEach(function () {
                var ViewDef = Backbone.View.extend();

                greatGrandParentView = new ViewDef();
                greatGrandParentContext = Geppetto.bindContext({
                    view: greatGrandParentView,
                    context: Geppetto.Context.extend()
                });

                grandParentView = new ViewDef();
                grandParentContext = Geppetto.bindContext({
                    view: grandParentView,
                    context: Geppetto.Context.extend(),
                    parentContext: greatGrandParentContext
                });

                parentView = new ViewDef();
                parentContext = Geppetto.bindContext({
                    view: parentView,
                    context: Geppetto.Context.extend(),
                    parentContext: grandParentContext
                });

                childView = new ViewDef();
                childContext = Geppetto.bindContext({
                    view: childView,
                    context: Geppetto.Context.extend(),
                    parentContext: parentContext
                });


            });

            afterEach(function () {
                childView.close();
                parentView.close();
                grandParentView.close();
                greatGrandParentView.close();
            });

            it("should pass event without data payload to all ancestors", function () {
                var spyGGP = sinon.spy();
                var spyGP = sinon.spy();
                var spyP = sinon.spy();
                var spyC = sinon.spy();

                greatGrandParentView.listen(greatGrandParentView, "foo", spyGGP);
                grandParentView.listen(grandParentView, "foo", spyGP);
                parentView.listen(parentView, "foo", spyP);
                childView.listen(childView, "foo", spyC);

                childContext.dispatchToParents('foo');

                expect(spyC.callCount).to.equal(0);
                expect(spyP.callCount).to.equal(1);
                expect(spyGP.callCount).to.equal(1);
                expect(spyGGP.callCount).to.equal(1);

            });
            it("should pass data payload all ancestors", function () {
                var dataGGP;
                var dataGP;
                var dataP;
                var dataC;

                var spyGGP = sinon.spy(function (data) {
                    dataGGP = data
                });
                var spyGP = sinon.spy(function (data) {
                    dataGP = data
                });
                var spyP = sinon.spy(function (data) {
                    dataP = data;
                });
                var spyC = sinon.spy();

                greatGrandParentView.listen(    greatGrandParentView,   "foo", spyGGP);
                grandParentView.listen(         grandParentView,        "foo", spyGP);
                parentView.listen(              parentView,             "foo", spyP);
                childView.listen(               childView,              "foo", spyC);

                childContext.dispatchToParents('foo', {"foo": "bar"});

                expect(dataGGP).to.eql({"foo": "bar"});
                expect(dataGP).to.eql({"foo": "bar"});
                expect(dataP).to.eql({"foo": "bar"});

            });

            it("should pass same data payload to all ancestors, not cloned objects", function () {
                var dataGGP;
                var dataGP;
                var dataP;
                var dataC;

                var spyGGP = sinon.spy(function (data) {
                    dataGGP = data.foo;
                    data.foo++;
                });
                var spyGP = sinon.spy(function (data) {
                    dataGP = data.foo;
                    data.foo++;
                });
                var spyP = sinon.spy(function (data) {
                    dataP = data.foo;
                    data.foo++;
                });
                var spyC = sinon.spy();

                greatGrandParentView.listen(greatGrandParentView, "foo", spyGGP);
                grandParentView.listen(grandParentView, "foo", spyGP);
                parentView.listen(parentView, "foo", spyP);
                childView.listen(childView, "foo", spyC);

                payload = {"foo": 1};

                childContext.dispatchToParents('foo', payload);

                expect(dataGGP).to.equal(3);
                expect(dataGP).to.equal(2);
                expect(dataP).to.equal(1);

                expect(payload).to.eql({"foo": 4});

            });

            it("should stop bubbling when payload extended with {stopPropagation:true}", function () {

                stopBubbling = function(object) {
                    object.stopPropagation = true;
                };

                var spyGGP = sinon.spy();
                var spyGP = sinon.spy(stopBubbling);
                var spyP = sinon.spy();
                var spyC = sinon.spy();

                greatGrandParentView.listen(greatGrandParentView, "foo", spyGGP);
                grandParentView.listen(grandParentView, "foo", spyGP);
                parentView.listen(parentView, "foo", spyP);
                childView.listen(childView, "foo", spyC);

                childContext.dispatchToParents("foo", {"any": "object"});

                expect(spyC.callCount).to.equal(0);
                expect(spyP.callCount).to.equal(1);
                expect(spyGP.callCount).to.equal(1);
                expect(spyGGP.callCount).to.equal(0);

            });
            it("should not crash if an ancestor destroys its own ancestor while bubbling", function() {

                destroyGGP = function() {
                    if (greatGrandParentView.close) {
                        greatGrandParentView.close();
                    } else if (greatGrandParentView.destroy){
                        greatGrandParentView.destroy();
                    }
                };

                var spyGGP = sinon.spy();
                var spyGP = sinon.spy();
                var spyP = sinon.spy(destroyGGP);
                var spyC = sinon.spy();

                greatGrandParentView.listen(greatGrandParentView, "foo", spyGGP);
                grandParentView.listen(grandParentView, "foo", spyGP);
                parentView.listen(parentView, "foo", spyP);
                childView.listen(childView, "foo", spyC);

                childContext.dispatchToParents("foo");

                expect(spyC.callCount).to.equal(0);
                expect(spyP.callCount).to.equal(1);
                expect(spyGP.callCount).to.equal(1);
                expect(spyGGP.callCount).to.equal(0);
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
                context.listen(view, "foo", function() {});
                expect(Geppetto.debug.countEvents()).to.equal(1);

                var otherViewDef = Backbone.View.extend();
                var otherView = new otherViewDef();
                var otherContext = Geppetto.bindContext({
                    view: otherView,
                    context: Geppetto.Context.extend()
                });

                expect(Geppetto.debug.countEvents()).to.equal(1);

                context.listen(otherView, "bar", function() {});
                expect(Geppetto.debug.countEvents()).to.equal(2);

                otherContext.listen(otherView, "baz", function() {});
                expect(Geppetto.debug.countEvents()).to.equal(3);

                otherContext.listen(view, "abc", function() {});
                expect(Geppetto.debug.countEvents()).to.equal(4);

                otherView.close();
                expect(Geppetto.debug.countEvents()).to.equal(1);

                view.close();
                expect(Geppetto.debug.countEvents()).to.equal(0);
            });

        });
    
    });
});
