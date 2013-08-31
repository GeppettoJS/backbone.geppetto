/* suppress jshint warnings for chai syntax - https://github.com/chaijs/chai/issues/41#issuecomment-14904150 */
/* jshint -W024 */
/* jshint expr:true */
define( [
    "underscore",
    "backbone",
    "geppetto"
], function(_, Backbone, Geppetto) {
	var expect = chai.expect;
	describe("Backbone.Geppetto.Injector", function(){
		var context;
        var injector;
        beforeEach(function() {
            context = new Geppetto.Context();
            injector = context.injector;
        });
        afterEach(function() {
            context.unmapAll();
            context = undefined;
            injector = undefined;
        });
        describe("declaration", function(){
			it("should be defined as a property on the Geppetto object", function(){
				expect(Geppetto.Injector).not.to.be.null;
			});
		});
		describe("when retrieving objects", function(){
			it("should throw an error if no corresponding mapping was found", function(){
				expect(function(){
					injector.getObject('unregistered key');
				}).to.throw(/no mapping found/);
			});
		});
		describe("when mapping a singleton", function(){
			var key = 'a singleton';
			var SingletonClass = function(){
			};
			beforeEach(function(){
				injector.mapSingleton(key, SingletonClass);
			});
			it('should be determinable',function(){
				expect(injector.hasMapping(key)).to.be.true;
			});
			it('should produce an instance of the mapped class',function(){
				var actual = injector.getObject(key);
				expect(actual).to.be.an.instanceOf(SingletonClass);
			});
			it('should produce a single, unique instance',function(){
				var first = injector.getObject(key);
				var second = injector.getObject(key);
				expect(second).to.equal(first);
			});
			it("should be instantiatable by brute force", function(){
				var first = injector.getObject(key);
				var second = injector.instantiate(key);
				expect(second).to.not.equal(first);
			});
			it("should be injected with its dependencies when instantiated", function(){
				SingletonClass.prototype.injections = ['foo'];
				var foo = {};
				injector.mapValue('foo',foo);
				var actual = injector.getObject(key);
				expect(actual.foo).to.equal(foo);
			});
		});
		describe("when mapping a value", function(){
			var key = 'a value';
			var value = {};
			beforeEach(function(){
				injector.mapValue(key, value);
			});
			it('should be determinable',function(){
				expect(injector.hasMapping(key)).to.be.true;
			});
			it("should be retrievable", function(){
				expect(injector.getObject(key)).to.equal(value);
			});
			it("it should always return the same value", function(){
				var first = injector.getObject(key);
				var second = injector.getObject(key);
				expect(second).to.equal(first);
			});
		});
		describe("when mapping a class", function(){
			var key = 'a class';
			var clazz = function(){};
			beforeEach(function(){
				injector.mapClass(key, clazz);
			});
			it('should be determinable',function(){
				expect(injector.hasMapping(key)).to.be.true;
			});
			it('should produce an instance of the mapped class',function(){
				var actual = injector.getObject(key);
				expect(actual).to.be.an.instanceOf(clazz);
			});
			it('should produce a new instance every time',function(){
				var first = injector.getObject(key);
				var second = injector.getObject(key);
				expect(second).to.not.equal(first);
			});
			it("should be injected with its dependencies when instantiated", function(){
				clazz.prototype.injections = ['foo'];
				var foo = {};
				injector.mapValue('foo',foo);
				var actual = injector.getObject(key);
				expect(actual.foo).to.equal(foo);
			});
		});
        describe("when mapping a view", function(){
            var key = 'a class';
            var clazz;
            beforeEach(function(){
                clazz = Backbone.View.extend();

                injector.mapView(key, clazz);
            });
            it('should be determinable',function(){
                expect(injector.hasMapping(key)).to.be.true;
            });
            it('should extend the view constructor',function(){
                var actual = injector.getObject(key);
                expect(actual).to.be.a("function");
            });
            it('should retrieve the same class every time',function(){
                var first = injector.getObject(key);
                var second = injector.getObject(key);
                expect(second).to.equal(first);
            });
            it("should call the view's original 'initialize' function when instantiated", function(){
                var initializeSpy = sinon.spy();
                expect(initializeSpy).not.to.have.been.called;
                clazz.prototype.initialize = function() {
                    initializeSpy();
                };
                var ViewConstructor = injector.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(initializeSpy).to.have.been.calledOnce;
            });
            it("should be injected with its dependencies when instantiated", function(){
                clazz.prototype.injections = ['foo'];
                var foo = {};
                injector.mapValue('foo',foo);
                var ViewConstructor = injector.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(viewInstance.foo).to.equal(foo);
            });
            it("should be injected with the context's 'listen' method when instantiated", function(){
                var ViewConstructor = injector.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(viewInstance.listen).to.be.a("function");
            });
            it("should be injected with the context's 'dispatch' method when instantiated", function(){
                var ViewConstructor = injector.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(viewInstance.dispatch).to.be.a("function");
            });
            it("should call injected 'listen' only on its own context", function(){
                var otherContext = new Geppetto.Context();
                var myContextStub = sinon.stub(context, "listen");
                var otherContextStub = sinon.stub(otherContext, "listen");

                var ViewConstructor = injector.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(myContextStub).not.to.have.been.called;
                expect(otherContextStub).not.to.have.been.called;

                viewInstance.listen(viewInstance, "abc", function(){});

                expect(myContextStub).to.have.been.calledOnce;
                expect(otherContextStub).not.to.have.been.called;

                otherContext.unmapAll();
            });
            it("should call injected 'dispatch' only on its own context", function(){
                var otherContext = new Geppetto.Context();
                var myContextStub = sinon.stub(context, "dispatch");
                var otherContextStub = sinon.stub(otherContext, "dispatch");

                var ViewConstructor = injector.getObject(key);
                var viewInstance = new ViewConstructor();
                expect(myContextStub).not.to.have.been.called;
                expect(otherContextStub).not.to.have.been.called;

                viewInstance.dispatch("abc");

                expect(myContextStub).to.have.been.calledOnce;
                expect(otherContextStub).not.to.have.been.called;

                otherContext.unmapAll();
            });
        });
		describe("when injecting objects", function(){
			var key = 'a value';
			var value = {};
			it("should have its dependencies fulfilled", function(){
				value.injections = ['foo'];
				var foo = {};
				injector.mapValue('foo',foo);
				injector.injectInto(value);
				expect(value.foo).to.equal(foo);
			});
		});
		describe("when unmapping objects", function(){
			var key = 'a value';
			var value = {};
			beforeEach(function(){
				injector.mapValue(key, value);
				injector.unmap(key);
			});
			it('should be determinable',function(){
				expect(injector.hasMapping(key)).to.be.false;
			});
			it("should not be retrievable", function(){
				expect( function(){
					injector.getObject(key);
				}).to.throw(/no mapping found/);
			});
		});
		describe("when creating childInjectors", function(){
			var parent,
				child;
			var key1 = 'key 1';
			var value1 = {};
			var key2 = 'key 2';
			var value2 = {};
			beforeEach(function(){
                parent = new Geppetto.Injector(context);
				parent.mapValue(key1, value1);
				child = parent.createChildInjector();
				child.mapValue(key2, value2);
			});
			it("should populate the child's parent property", function(){
				expect(child.parent).to.equal(parent);
			});
			it("should allow to retrieve objects mapped to the parent through the child", function(){
				expect(child.getObject(key1)).to.equal(value1);
			});
			it("should not allow to retrieve objects mapped to the child through the parent", function(){
				expect(function(){
					parent.getObject(key2);
				}).to.throw(/no mapping found/);
			});
		});
	});

});