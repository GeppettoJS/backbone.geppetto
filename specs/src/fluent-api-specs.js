/* suppress jshint warnings for chai syntax - https://github.com/chaijs/chai/issues/41#issuecomment-14904150 */
/* jshint -W024 */
/* jshint expr:true */
define([
    "underscore", "backbone", "geppetto"
], function(_, Backbone, Geppetto) {
    var expect = chai.expect;
    
    describe("Backbone.Geppetto fluent API", function() {
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
                context.wire(value).asValue('value');
                var actual = child.getObject('value');
                expect(actual).to.equal(value);
            });
        });

        describe("when mapping a singleton", function() {
            var key = 'a singleton';
            var foo = {};
            var contextEventSpy = sinon.spy();
            var SingletonClass = function() {};
            _.extend(SingletonClass.prototype, Backbone.Events);
            SingletonClass.prototype.contextEvents = {
            };
            beforeEach(function() {
                context.wire(foo).asValue('foo');
                context.wire(SingletonClass)
                    .asSingleton(key)
                    .withWiring({
                        foo: 'foo'
                    })
                    .withContextEvents({
                        "event:foo" : function(){
                            contextEventSpy();
                        }
                    });
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
                context.wire(dependerClass)
                    .asSingleton('depender')
                    .withWiring( {
                        dependency: key
                    });
                var depender = context.getObject('depender');
                expect(depender.dependency).to.equal(context.getObject(key));
            });
            it("should map context events when configured", function(){
                var actual = context.getObject(key);
                context.dispatch('event:foo');
                expect(contextEventSpy).to.have.been.called;
            });
        });
        describe("when mapping a value", function() {
            var key = 'a value';
            var value = {};
            beforeEach(function() {
                context.wire(value ).asValue(key);
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
            var contextEventSpy = sinon.spy();
            _.extend(clazz.prototype, Backbone.Events);
            beforeEach(function() {
                context.wire(foo ).asValue('foo');
                context.wire(clazz)
                    .asClass(key)
                    .withWiring({
                        foo : "foo"
                    })
                    .withContextEvents({
                        "event:foo" : function(){
                            contextEventSpy();
                        }                    
                    });
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
                context.wire(dependerClass)
                    .asClass('depender')
                    .withWiring({
                        dependency: key
                    });
                var depender = context.getObject('depender');
                expect(depender.dependency).to.be.an.instanceOf(clazz);
            });
            it("should map context events when instantiated", function(){
                var actual = context.getObject(key);
                context.dispatch('event:foo');
                expect(contextEventSpy).to.have.been.called;
            });
        });
        describe("when mapping a view", function() {
            var key = 'a class';
            var clazz;
            var foo = {};
            var contextEventSpy = sinon.spy();
            beforeEach(function() {
                contextEventSpy.reset();
                clazz = Backbone.View.extend();

                context.wire(clazz)
                    .asView(key)
                    .withWiring({
                        foo: 'foo'
                    })
                    .withContextEvents({
                        "event:foo" : function(){
                             contextEventSpy();
                        }
                    });
                context.wire(foo).asValue('foo');
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
                var ViewConstructor = context.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(viewInstance.foo).to.equal(foo);
            });
            it("should map context events when instantiated", function(){
                var ViewCtor = context.getObject(key);
                var view = new ViewCtor();
                context.dispatch('event:foo');
                expect(contextEventSpy).to.have.been.called;
            });
        });
        describe('when configuring wirings', function(){
            var key = "key";
            var passed;
            var ctor = function(){
                passed = _.toArray(arguments);
            };
            var payload = {};
            var a = {};
            var b = {};
            beforeEach(function(){
                passed = null;
                context.wire(ctor)
                    .asClass(key)
                    .withParameters(payload, a, b)
            });
            afterEach(function(){
                context.destroy();
            });
            it('should pass all arguments as payload to the constructor function', function(){
                context.getObject(key);
                expect(passed[0]).to.equal(payload);
                expect(passed[1]).to.equal(a);
                expect(passed[2]).to.equal(b);
            });
        });
    });

});
