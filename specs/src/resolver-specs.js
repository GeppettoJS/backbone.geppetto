/* suppress jshint warnings for chai syntax - https://github.com/chaijs/chai/issues/41#issuecomment-14904150 */
/* jshint -W024 */
/* jshint expr:true */
define([
    "underscore", "backbone", "geppetto"
], function(_, Backbone, Geppetto) {
    var expect = chai.expect;

    describe("when binding a context to a view that supports dependency injection", function() {

        var contextDefinition;
        var contextInstance;

        beforeEach(function() {
            contextDefinition = Geppetto.Context.extend({
                wiring: {
                    singletons: {
                        "foo": Backbone.Model
                    }                    
                }
            });
        });

        it("should not include a reference ", function() {

            var MyViewDef = Backbone.View.extend({
                wiring: [
                    "foo"
                ]
            });
            var myView = new MyViewDef();

            var returnedContext = Geppetto.bindContext({
                view: myView,
                context: contextDefinition
            });

            expect(myView.context).not.to.exist;
            expect(returnedContext).not.to.exist;

            myView.close();
        });
    });    
    
    describe("Backbone.Geppetto.Resolver", function() {
        var context;
        beforeEach(function() {
            context = new Geppetto.Context();
        });
        afterEach(function() {
            context.destroy();
            context = undefined;
        });
        describe("when retrieving objects", function() {
            it("should poll the parent if no corresponding mapping was found", function(){
                var value = {};
                var child = new Geppetto.Context({
                    parentContext : context
                });
                context.wireValue('value', value);
                var actual = child.getObject('value');
                expect(actual).to.equal(value);
            });
            it("should throw an error if no corresponding mapping was found", function() {
                expect(function() {
                    context.getObject('unregistered key');
                }).to.
                throw (/no mapping found/);
            });
        });
        describe("when resolving dependencies", function() {
            var key1 = 'key1';
            var value1 = {};
            var key2 = 'key2';
            var value2 = {};
            beforeEach(function() {
                context.wireValue(key1, value1);
                context.wireValue(key2, value2);
            });
            it("should accept an array for wiring config", function() {
                var depender = {
                    wiring: [key1, key2]
                };
                context.resolve(depender);
                expect(depender.key1).to.equal(value1);
                expect(depender.key2).to.equal(value2);
            });
            it("should accept a map for wiring config", function() {
                var depender = {
                    wiring: {
                        k1: key1,
                        k2: key2
                    }
                };
                context.resolve(depender);
                expect(depender.k1).to.equal(value1);
                expect(depender.k2).to.equal(value2);
            });
        });
        describe("when mapping a singleton", function() {
            var key = 'a singleton';
            var SingletonClass = function() {};
            SingletonClass.prototype.wiring = ['foo'];
            var foo = {};
            beforeEach(function() {
                context.wireValue('foo', foo);
                context.wireSingleton(key, SingletonClass);
            });
            it('should be determinable', function() {
                expect(context.hasWiring(key)).to.be.true;
            });
            it('should produce an instance of the mapped class', function() {
                var actual = context.getObject(key);
                expect(actual).to.be.an.instanceOf(SingletonClass);
            });
            it('should produce a single, unique instance', function() {
                var first = context.getObject(key);
                var second = context.getObject(key);
                expect(second).to.equal(first);
            });
            it("should be instantiatable by brute force", function() {
                var first = context.getObject(key);
                var second = context.instantiate(key);
                expect(second).to.not.equal(first);
            });
            it("should be injected with its dependencies when instantiated", function() {
                var actual = context.getObject(key);
                expect(actual.foo).to.equal(foo);
            });
            it("should optionally allow wiring configuration", function() {
                var dependerClass = function() {};
                context.wireSingleton('depender', dependerClass, {
                    dependency: key
                });
                var depender = context.getObject('depender');
                expect(depender.dependency).to.equal(context.getObject(key));
            });
            it("should map context events when instantiated", function(){
                var contextEventSpy = sinon.spy();
                _.extend(SingletonClass.prototype, Backbone.Events);
                SingletonClass.prototype.contextEvents = {
                    "event:foo" : function(){
                        contextEventSpy();
                    }
                };
                var actual = context.getObject(key);
                context.dispatch('event:foo');
                expect(contextEventSpy).to.have.been.called;
            });
        });
        describe("when mapping a value", function() {
            var key = 'a value';
            var value = {};
            beforeEach(function() {
                context.wireValue(key, value);
            });
            it('should be determinable', function() {
                expect(context.hasWiring(key)).to.be.true;
            });
            it("should be retrievable", function() {
                expect(context.getObject(key)).to.equal(value);
            });
            it("it should always return the same value", function() {
                var first = context.getObject(key);
                var second = context.getObject(key);
                expect(second).to.equal(first);
            });
        });
        describe("when mapping a class", function() {
            var key = 'a class';
            var clazz = function() {};
            clazz.prototype.wiring = ['foo'];
            var foo = {};
            beforeEach(function() {
                context.wireValue('foo', foo);
                context.wireClass(key, clazz);
            });
            it('should be determinable', function() {
                expect(context.hasWiring(key)).to.be.true;
            });
            it('should produce an instance of the mapped class', function() {
                var actual = context.getObject(key);
                expect(actual).to.be.an.instanceOf(clazz);
            });
            it('should produce a new instance every time', function() {
                var first = context.getObject(key);
                var second = context.getObject(key);
                expect(second).to.not.equal(first);
            });
            it("should be injected with its dependencies when instantiated", function() {
                var actual = context.getObject(key);
                expect(actual.foo).to.equal(foo);
            });
            it("should optionally allow wiring configuration", function() {
                var dependerClass = function() {};
                context.wireClass('depender', dependerClass, {
                    dependency: key
                });
                var depender = context.getObject('depender');
                expect(depender.dependency).to.be.an.instanceOf(clazz);
            });
            it("should map context events when instantiated", function(){
                var contextEventSpy = sinon.spy();
                _.extend(clazz.prototype, Backbone.Events);
                clazz.prototype.contextEvents = {
                    "event:foo" : function(){
                        contextEventSpy();
                    }
                };
                var actual = context.getObject(key);
                context.dispatch('event:foo');
                expect(contextEventSpy).to.have.been.called;
            });
        });
        describe("when mapping a factory", function(){
            var key = 'a class';
            var clazz = function(){};
            beforeEach(function() {
                context.wireFactory(key, clazz);
            });
            it('should be determinable', function() {
                expect(context.hasWiring(key)).to.be.true;
            });
            it('should return a function', function(){
                var factory = context.getObject(key);
                expect(factory ).to.be.a.function;
            });
            it('should create an instance of the mapped class with `new`', function(){
                var wrapped = context.getObject(key);
                var instance = new wrapped();
                expect(instance ).to.be.instanceOf(clazz);
            });
            it('should create an instance of the mapped class when called', function(){
                var factory = context.getObject(key);
                var instance = factory();
                expect(instance ).to.be.instanceOf(clazz);
            });
        });
        describe("when mapping a view", function() {
            var key = 'a class';
            var clazz;
            beforeEach(function() {
                clazz = Backbone.View.extend();

                context.wireView(key, clazz);
            });
            it('should be determinable', function() {
                expect(context.hasWiring(key)).to.be.true;
            });
            it('should extend the view constructor', function() {
                var actual = context.getObject(key);
                expect(actual).to.be.a("function");
            });
            it('should retrieve the same class every time', function() {
                var first = context.getObject(key);
                var second = context.getObject(key);
                expect(second).to.equal(first);
            });
            it("should call the view's original 'initialize' function when instantiated", function() {
                var initializeSpy = sinon.spy();
                expect(initializeSpy).not.to.have.been.called;
                clazz.prototype.initialize = function() {
                    initializeSpy();
                };
                var ViewConstructor = context.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(initializeSpy).to.have.been.calledOnce;
            });
            it("should be injected with its dependencies when instantiated", function() {
                clazz.prototype.wiring = ['foo'];
                var foo = {};
                context.wireValue('foo', foo);
                var ViewConstructor = context.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(viewInstance.foo).to.equal(foo);
            });
            it("should be injected with the context's 'listen' method when instantiated", function() {
                var ViewConstructor = context.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(viewInstance.listen).to.be.a("function");
            });
            it("should be injected with the context's 'dispatch' method when instantiated", function() {
                var ViewConstructor = context.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(viewInstance.dispatch).to.be.a("function");
            });
            it("should call injected 'listen' only on its own context", function() {
                var otherContext = new Geppetto.Context();
                var myContextStub = sinon.stub(context, "listen");
                var otherContextStub = sinon.stub(otherContext, "listen");

                var ViewConstructor = context.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(myContextStub).not.to.have.been.called;
                expect(otherContextStub).not.to.have.been.called;

                viewInstance.listen(viewInstance, "abc", function() {});

                expect(myContextStub).to.have.been.calledOnce;
                expect(otherContextStub).not.to.have.been.called;

                otherContext.destroy();
            });
            it("should call injected 'dispatch' only on its own context", function() {
                var otherContext = new Geppetto.Context();
                var myContextStub = sinon.stub(context, "dispatch");
                var otherContextStub = sinon.stub(otherContext, "dispatch");

                var ViewConstructor = context.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(myContextStub).not.to.have.been.called;
                expect(otherContextStub).not.to.have.been.called;

                viewInstance.dispatch("abc");

                expect(myContextStub).to.have.been.calledOnce;
                expect(otherContextStub).not.to.have.been.called;

                otherContext.destroy();
            });
            it("should optionally allow wiring configuration", function() {
                var value = {};
                context.wireValue('value', value);
                context.release(key);
                context.wireView(key, clazz, {
                    dependency: 'value'
                });
                var ViewCtor = context.getObject(key);
                var view = new ViewCtor();
                expect(view.dependency).to.equal(value);
            });
            it("should optionally allow wiring configuration via the mappings", function() {
                var value = {};
                context.wireValue('value', value);
                context.release(key);
                context.wireView(key, clazz, {
                    dependency: 'value'
                });
                var ViewCtor = context.getObject(key);
                var view = new ViewCtor();
                expect(view.dependency).to.equal(value);
            });            
            it("should map context events when instantiated", function(){
                var contextEventSpy = sinon.spy();
                clazz.prototype.contextEvents = {
                    "event:foo" : function(){
                        contextEventSpy();
                    }
                };
                var ViewCtor = context.getObject(key);
                var view = new ViewCtor();
                context.dispatch('event:foo');
                expect(contextEventSpy).to.have.been.called;
            });
            it("should be a factory method (as well)", function(){
                var factory = context.getObject(key);
                var view = factory();
                expect(view).to.be.instanceOf(clazz);
            });
            it("should call the factory view's original 'initialize' function when instantiated", function() {
                var initializeSpy = sinon.spy();
                expect(initializeSpy).not.to.have.been.called;
                clazz.prototype.initialize = function() {
                    initializeSpy();
                };
                var factory = context.getObject(key);
                var viewInstance = factory();
                expect(initializeSpy).to.have.been.calledOnce;
            });
            it("should be injected with its dependencies when instantiated by the factory", function() {
                clazz.prototype.wiring = ['foo'];
                var foo = {};
                context.wireValue('foo', foo);
                var factory = context.getObject(key);
                var viewInstance = factory();
                expect(viewInstance.foo).to.equal(foo);
            });
        });
        describe("when wrapping a constructor", function() {
            it("should allow wrapped constructor to handle initialization parameters in similar fashion as unwrapped constructor)", function() {
                var obj1 = {value: 'foo'};
                var obj2 = {value: 'bar'};
                var clazz = Backbone.Model.extend({
                    initialize: function (obj1, obj2) {
                        this.obj1 = obj1;
                        this.obj2 = obj2;
                    }
                });
                var originalModel = new clazz(obj1, obj2);
                var wrappedClazz = context._wrapConstructor(clazz, null);
                var wrappedModel = new wrappedClazz(obj1, obj2);
                expect(originalModel.obj1).to.eql(wrappedModel.obj1);
                expect(originalModel.obj2).to.eql(wrappedModel.obj2)
            });
            it("should allow constructors to return an instance of another type", function(){
                var Foo = function(){};
                var clazz = Backbone.Model.extend({
                    constructor : function(){
                        return new Foo();
                    } 
                });
                var wrappedClazz = context._wrapConstructor(clazz, null);
                var foo = new wrappedClazz();
                expect(foo).to.be.instanceOf(Foo);
            });
        });
        describe("when injecting objects", function() {
            var key = 'a value';
            var value = {};
            it("should have its dependencies fulfilled", function() {
                value.wiring = ['foo'];
                var foo = {};
                context.wireValue('foo', foo);
                context.resolve(value);
                expect(value.foo).to.equal(foo);
            });
        });
        describe("when unmapping objects", function() {
            var key = 'a value';
            var value = {};
            beforeEach(function() {
                context.wireValue(key, value);
                context.release(key);
            });
            it('should be determinable', function() {
                expect(context.hasWiring(key)).to.be.false;
            });
            it("should not be retrievable", function() {
                expect(function() {
                    context.getObject(key);
                }).to.
                throw (/no mapping found/);
            });
        });
        describe('when used with Backbone objects', function(){
            var clazzInstantiated;
            var clazz = function(){
                clazzInstantiated++;
            };
            var resolvedDependency;
            var singleton = Backbone.Model.extend({
                wiring : ['clazz'],
                initialize : function(){
                    resolvedDependency = this.clazz;
                }
            });
            beforeEach(function(){
                clazzInstantiated=0;
                context.wireClass('clazz', clazz);
                context.wireSingleton('singleton', singleton);
            });
            it("should not resolve singleton dependencies twice, see #51", function(){
                var actual = context.getObject('singleton');
                expect(clazzInstantiated ).to.equal(1);
            });
            it("should resolve dependencies before initialization", function(){
                var actual = context.getObject('singleton');
                expect(resolvedDependency ).to.be.instanceOf(clazz);
            });
        });
    });

});
