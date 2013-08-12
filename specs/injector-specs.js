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
		describe("declaration", function(){
			it("should be defined as a property on the Geppetto object", function(){
				expect(Geppetto.Injector).not.to.be.null;
			});
		});
		describe("when retrieving objects", function(){
			var injector;
			beforeEach(function(){
				injector = new Geppetto.Injector();
			});
			it("should throw an error if no corresponding mapping was found", function(){
				expect(function(){
					injector.getObject('unregistered key');
				}).to.throw(/no mapping found/);
			});
		});
		describe("when mapping a singleton", function(){
			var injector;
			var key = 'a singleton';
			var SingletonClass = function(){
			};
			beforeEach(function(){
				injector = new Geppetto.Injector();
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
			var injector;
			var key = 'a value';
			var value = {};
			beforeEach(function(){
				injector = new Geppetto.Injector();
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
			var injector;
			var key = 'a class';
			var clazz = function(){};
			beforeEach(function(){
				injector = new Geppetto.Injector();
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
		describe("when injecting objects", function(){
			var injector;
			var key = 'a value';
			var value = {};
			beforeEach(function(){
				injector = new Geppetto.Injector();
			});
			it("should have its dependencies fulfilled", function(){
				value.injections = ['foo'];
				var foo = {};
				injector.mapValue('foo',foo);
				injector.injectInto(value);
				expect(value.foo).to.equal(foo);
			});
		});
		describe("when unmapping objects", function(){
			var injector;
			var key = 'a value';
			var value = {};
			beforeEach(function(){
				injector = new Geppetto.Injector();
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
				parent = new Geppetto.Injector();
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