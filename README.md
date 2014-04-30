# Backbone Geppetto

[![Build Status](https://travis-ci.org/ModelN/backbone.geppetto.png)](https://travis-ci.org/ModelN/backbone.geppetto) [![devDependency Status](https://david-dm.org/ModelN/backbone.geppetto/dev-status.png)](https://david-dm.org/ModelN/backbone.geppetto#info=devDependencies) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Tested on these browsers:

[![Browser Test Results](https://saucelabs.com/browser-matrix/backbone-geppetto.svg)](https://saucelabs.com/u/backbone-geppetto)

## About
### What is it?

As client-side applications grow, they often turn into tangled messes of spaghetti and copy/pasted code.  Geppetto helps large-scale, multi-module Backbone applications to avoid these pitfalls by introducing these features:

* **Commands**: Single-purpose units of work invoked with events.  Decouples your View/Presenter code from your app's client-side business logic.  
* **Dependency-Injection**: Allows components to remain loosely-coupled without resorting to standard JS "hacks" such as namespacing and manually passing dependencies from parent to child.
* **The "Context"**: Provides a private pub/sub channel for related components to talk to each other, keeping your app from getting too noisy.  Also provides a place to wire up depenency injection mappings for specific areas of your app. 

### How big is it?
Geppetto is tiny, weighing in just over 1KB minified and gzipped.  Much of the value of Geppetto comes from the design philosophy that it prescribes, not from the code in the framework, itself.

### How will Geppetto help my project?

Geppetto might be a good fit for your project if:

* **...your project is heavy on client-side business logic.** Maybe you've got a lot of logic that computes previews of calculations before sending updates to the server.  Traditionally, Backbone would have you put this logic in the View or Model.  But what if this logic needs to be shared between multiple Views and Models? Geppetto gives complex client-side logic a place to live.
* **...your project uses a "composite design."** For example, your components are composed of smaller sub-components, and those sub-components might be reused across many different parent components.  Commonly this is seen in Marionette-based applications, which are composed of Layouts, Composite Views, Item Views, Collection Views, etc.  Manually managing dependencies between these views can be tedious, and Geppetto helps.  

### Why Another Framework?
Backbone has been [called an MV* framework](http://lostechies.com/derickbailey/2011/12/23/backbone-js-is-not-an-mvc-framework/), because it's not strictly MVC, MVP, nor any other MV-something.  Sure, the Backbone Router can be made to act "controllery," but it's not really a good idea to tie all your business logic to URL change events.

More commonly, in Backbone applications you'll find business logic implemented directly in Backbone.View components, or sometimes in the Model.  For smaller apps, it's convenient to declare your "events" and your callback functions in the same place.  But as applications grow, and business logic needs to be reused across separate view components, this practice starts to get messy.

To solve this issue, Geppetto implements a scalable **Controller** architecture for Backbone, prescribing an MVC-style separation of concerns.  This makes it possible to write code that is loosely-coupled, easy-to-reuse, and highly-testable.

The architecture of Geppetto was greatly inspired by the popular [Robotlegs](http://robotlegs.org) framework for Actionscript.

### What's in a name?
Geppetto works especially well with [MarionetteJS](http://marionettejs.com), and that's [where the name came from](http://en.wikipedia.org/wiki/Mister_Geppetto).  

While Marionette is not a dependency, if you're already using Marionette, your design philosophy is already pointed in the right direction for Geppetto to be helpful!

### Getting Geppetto

*Latest Stable Release: 0.7.0*

* Minified: [backbone.geppetto.min.js](https://github.com/ModelN/backbone.geppetto/blob/0.7.0/dist/backbone.geppetto.min.js)
* Development (Uncompressed, Comments): [backbone.geppetto.js](https://raw.github.com/ModelN/backbone.geppetto/0.7.0/backbone.geppetto.js)
* Full Release (Tests, Examples): [0.7.0.zip](https://github.com/ModelN/backbone.geppetto/archive/0.7.0.zip).

*Unreleased Edge Version (master)*

* Minified: [backbone.geppetto.min.js](https://raw.github.com/ModelN/backbone.geppetto/master/dist/backbone.geppetto.min.js)
* Development (Uncompressed, Comments): [backbone.geppetto.js](https://raw.github.com/ModelN/backbone.geppetto/master/backbone.geppetto.js)
* Full Release (Tests, Examples): [master.zip](https://github.com/ModelN/backbone.geppetto/archive/master.zip).

Visit the [project repo](https://github.com/ModelN/backbone.geppetto) to download the latest unreleased code (may be unstable).

## Get Involved!

### Mailing List

Join the [Backbone.Geppetto Google Group](https://groups.google.com/forum/#!forum/backbone-geppetto) to discuss new features and stay-up-to-date on project updates.


### Ways to Contribute

Has Geppetto been helpful to you?  If you'd like to give back, here are a few ways:

1. Blog about your experiences using Geppetto, and let us know about it!
2. Create a demo app using Geppetto and add it to the examples directory.
3. Improve the docs in the README.
4. Fix a bug or add a new feature and submit a pull request (see below)

### Pull Requests

Pull requests are welcome.  For any significant change or new feature, please start a discussion in the Google Group, or log an issue first.  This will save you some time, in case your idea is deemed not general enough to be included in Geppetto.

Before submitting a pull request, please:

1. Write unit tests to cover any new or modified lines of code, and add it to `specs/geppetto.specs.js`.  See the [Tests](#tests) section for more info.
2. Run the test specs to make sure everything works.  You can fire up a local web server, and point your browser to `http://localhost:<port>/specs/`
3. Run the Grunt task to lint, test, and run code coverage on the project.  See the [Build](#build) section for more info.

## Build

### Grunt

Geppetto uses [Grunt](http://gruntjs.com/) to verify each build.  If you are not familiar with Grunt, check out the [getting started guide](http://gruntjs.com/getting-started) for an introduction and installation instructions.

Before submitting a pull request, please run the grunt task.  To do so:

First, install local development dependencies.  From the root Geppetto directory, run:

```
npm install
```

then

```
grunt
```

Grunt will perform these tasks:

#### Beautify

To reduce merging and styling issues related to whitespace and formatting, the [jsbeautifier](https://github.com/vkadam/grunt-jsbeautifier) task normalizes all formatting in project source.  If you fail to run `grunt` prior to check-in, and any files have not been beautified, Travis-CI will reject the checkin.

#### Uglify

The code will be minified and saved to `dist/backbone.geppetto.min.js`.

#### Lint

Javascript files are checked for errors using [JSHint](http://jshint.com/).  The JSLint configuration is driven by the `.jshintrc` file.

#### Test

Test specs are run headlessly using [PhantomJS](www.phantomjs.org).  Note that Travis-CI will also run the tests across multiple browsers using [SauceLabs](http://saucelabs.com).

#### Coverage

Code coverage is enforced using [BlanketJS](http://blanketjs.org/).  Every line in Geppetto must have code coverage, with the exception of the AMD boilerplate at the top.  Currently this means that a 97% coverage rate is enforced.

### Travis-CI

The Grunt build is run automatically using [Travis-CI](travis-ci.org) upon every pull request and push to master.  But if any errors are found, you'll need to fix them and re-submit your pull request.  So please run the grunt task locally to save time.


## Dependencies
You'll need to include the following projects for Geppetto to work:

### Backbone
[Backbone v0.9.10](http://documentcloud.github.com/backbone/) or higher is required for its eventing system.

## Recommended Libraries

### Backbone Marionette
[Backbone Marionette](https://github.com/marionettejs/backbone.marionette) is recommended for its [anti-zombie technology](http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/), and its Composite View architecture, which works particularly well with Geppetto.

Geppetto was once dependent on Marionette because of its event binding components, but since Backbone v0.9.10, this logic is handled directly in Backbone, itself.

### RequireJS
[RequireJS](http://requirejs.org/) is not required, but is recommended.  In a large multi-module application, RequireJS makes it much easier to manage dependencies.

Here is the RequireJS config with all dependencies listed:

```javascript
require.config( {
    paths:{
        underscore:'libs/underscore',
        backbone:'libs/backbone',
        geppetto:'libs/backbone.geppetto'
    }
} );
```

## Technical Overview
Geppetto implements a standard MVC architecture, with the added flavor of the "Mediated View" pattern.  The key players are:

### Model
The standard Backbone Model.

### View

The View is implemented with Backbone.View or extensions of it such as Marionette.ItemView.  This implementation involves two separate concepts:

1) **The DOM**

* The truly visual portion of The View
* Represented with HTML
* Responds to user input
* Triggers events such as "click", "keyup", etc.


2) **The Mediator**

* The Javascript portion of The View
* Creates DOM elements by generating HTML
* Listens for DOM events on the View's `el`
* Responds to DOM events by triggering **Application Events** for the **Controller** to respond to
* Listens for **Application Events** triggered by the **Controller** and manipulates the View in response

The last two points are the key differences between Geppetto Applications and traditional Backbone Applications.  Normally, your Backbone.View would both listen for DOM events *and* handle the business logic to respond to those events.  With Geppetto, your Backbone.View's job as a Mediator is simply to translate DOM events into Application Events (and vice-versa) *that's it*.  Once the Mediator has created and triggered an Application event, its job is done.

### Controller
Geppetto implements the Controller piece using the Command Pattern.  Commands are automatically instantiated and executed in response to Application Events.

## Geppetto.Context
Metaphorically speaking, if different modules of your app could be considered separate *living entities*, the `Geppetto.Context` would be like each being's *central nervous system*.  The Context is responsible for facilitating communication and sharing data between components *within a given module*, providing encapsulation so that this sharing does not extend past the boundaries of that module.

The Context's specific jobs are:

### Job #1: Dependency Injection

The Context contains mappings for wiring Singletons, Classes, Views, and Values for injection into other components.  This means that instead of dependent components needing to "reach out and grab" their dependencies, Geppetto will inject them automatically.  This also has the advantage of dependent components being able to have different dependencies injected depending on the module.  

### Job #1: Event Bus

Each Context acts as an event bus, using the `Backbone.Events` system.  While the event bus is not exposed directly to components, each dependent component associated with a given Context is injected with a `dispatch` and `listen` function, which can be used to communicate with other components on the same Context.  You can think of this like each dependent component being given a walkie talkie tuned to the same frequency.  This pattern promotes loose-coupling between components.

### Job #3: Command Registry

Do you have any business logic in your app that doesn't necessarily belong to a view?  For instance, you might have some code that loads some backing data which is shared across many views.  Sure, you could place that business logic in your outer-most view, but then that view would be responsible for telling the sub-views whenever new data is available.  Wouldn't it be great if we could completely decouple our shared client business logic from our views?

Well, now we can!  Each Context has a registry where you can assign a named event to an associated Command.  Whenever you want some work to be done, you simply dispatch an event onto the Context's Event Bus, and the appropriate command will automagically get instantiated, carry out its job, and clean itself up.  You may choose to have the Command dispatch another event when its work is done, so that any observers (such as Views) can be notified.

### Creating a Context

**Using Context factory method**

With this method, you pass a view instance, and either a Context constructor function or an already-initialized Context object.

```javascript

// MainView.js
return Backbone.View.extend({
    initialize: function() {
		Geppetto.bindContext({
			view: this
			context: MainContext
		});
	}
});

// MainContext.js
return Geppetto.Context.extend( {
	initialize: function () {
		// set up injection and command mappings...
	}
});
```

The factory method does a couple things automatically for you:

1. If you pass a Context constructor function, it automatically attaches a "close" handler to the view instance.  If you are using a Marionette view, you will already have a close handler.  So this is really just to support base Backbone Views.  If you pass an already-initialized Context object, no functions will be attached, and you are responsible for cleaning up your own events.
2. Automatically sets the "context" property on the view instance

**By manually creating a Context**

If your view requires your context to be fully-initialized when it, itself, is initialized, then you will have to create your Context manually.  One example for this is if your main view is a Marionette CollectionView, which requires an initialized Collection object, and your Collection is being initialized in your Context.

For example:

```js
// instead of using Geppetto.BindContext to create the Context instance,
// directly call its constructor manually.

var contextInstance = new MyContext();

// the contextInstance now has a reference to the Collection instance,
// since that's how you wired up your Context's initialize() method...

// create a new instance of your CollectionView, and pass a reference to the
// Context's collection using the "options" param.  Before binding the events,
// Marionette will attach this param to the view instance...

var collectionViewInstance = new MyCollectionView({
    collection: contextInstance.collection
});

Geppetto.bindContext({
    view: collectionViewInstance,
    context: contextInstance
});
```


### Assigning a Parent Context

Feature still under development.

## Dependency Injection

### Setting up Wiring in the Context

The Context's `wiring` configuration controls how dependencies are injected within the Context.

```js

define([
	"backbone",
	"js/product/ProductModel",
	"js/user/model/UserModel",
	"js/util/LoggingSvc",
	"js/user/view/UserView",
	"js/product/view/ProductView"
], function(
	Backbone,
	ProductModel,
	UserModel,
	LoggingSvc,
	UserView,
	ProductView
) {

return Geppetto.Context.extend( {
	initialize: function () {
		wiring: {
			singletons: {
				"userModel": Backbone.Model,
				"productModel": ProductModel,
				"loggingSvc": LoggingSvc
			},
			views: {
				"UserView": UserView,
				"ProductView": ProductView
			}
		}
	}
});
});
```

### Wiring at the Component Level

Example injecting a model into a view.

UserModel.js

```js
	"backbone"
], function(
	Backbone
) {
	return Backbone.View.extend({
		wiring: [
			"userModel"
		],
		initialize: function() {
			// since "userModel" is in the wiring list, Geppetto
			// will inject it as "this.userModel" before initialize() is called
			var myValue = this.userModel.get("myValue"); 
		}
	)
});
});
```

## Commands

**Option 1: Using the `wireCommand` function:**

```javascript
return Geppetto.Context.extend( {
	initialize: function () {
		this.wireCommand( "appEventFoo", FooCommand );
		this.wireCommand( "appEventBar", BarCommand );
		this.wireCommand( "appEventBaz", BazCommand );
	}
});
```

**Option 2: Using the `commands` map:**

```javascript
return Geppetto.Context.extend( {
	commands: {
	    "appEventFoo":          FooCommand,
		"appEventBar":          BarCommand,
		"appEventBaz":          BazCommand,
		"appEventFooBarBaz":    [
		    FooCommand,
		    BarCommand,
		    BazCommand
		]
	}
});

```

## Events

### Event Bus
The Context provides an Event Bus for loosely-coupled communication between components.  When a component dispatches an event onto the Event Bus, it can choose whether that event should be targeted for the local Context, the parent Context, or all Contexts.  This allows inter-module communication when desired, while keeping events neatly segregated otherwise.

### Injection of Communication Methods

Any component mapped for injection will also have `listen` and `dispatch` methods injected into it.

### Listening

**Option 1: Using the `listen` method:**

```javascript
// this usually goes in View code... to respond to an event fired by a Command finishing its job
this.listen(this, "fooCompleted", handleFooCompleted);

var handleFooCompleted = function() {
	// update the view or something...
}
```

NOTE: The first parameter passed to the `listen()` function represents the object that is the interested party (the one doing the listening) and should generally always be `this`, to mean the current view.  Geppetto will automatically attach a listener to the `close()` event on this view, and clean up all the view's associated listeners whenever it is closed.

**Option 2: Using the `contextEvents` map:**

```javascript
// this usually goes in View code... to respond to an event fired by a Command finishing its job

contextEvents: {
    "fooCompleted": "handleFooCompleted"
}

var handleFooCompleted = function() {
	// update the view or something...
}
```

### Dispatching Local Events

```javascript
// Event only sent to Local Context
this.dispatch( "fooEvent");
```

### Dispatching Parent Events

```javascript
// Event only sent to Parent Context
this.dispatchToParent( "fooEvent");
```

### Dispatching Global Events

```javascript
// Event sent to every registered Context
this.dispatchGlobally( "fooEvent");
```

### Dispatching Events with a Payload

If your event has some associated data that should be available to the consumer of your event, you can
pass that event as an object as the second parameter of the call to `dispatch` like so:

```javascript
this.dispatch( "fooEvent",
						{
							payloadPropertyFoo: "payloadValueFoo",
							payloadPropertyBar: true,
							payloadPropertyBaz: 12345
						} );
```

### Un-Registering Commands

```javascript
// this is done automatically when a Context is destroyed, so you normally would not do this manually.
context.destroy();
```

### Destroying a Context

A Context is automatically destroyed when the `close()` method is called on its associated View.  You should already be in the habit of calling `close()` to properly clean up your View's event listeners.  If not, please read Derick Bailey's [article on killing zombies](http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/).  The `close()` method is available on any Marionette.View.  If you're using a plain old Backbone.View with Geppetto, a `close()` method will be created on the View for you when you call `bindContext()`.

When a Context is destroyed, all events on the Context's event bus will be unmapped.

## Geppetto.Command
A Command is a small, single-purpose piece of code with an `execute()` method.  When an Application Event is fired, Geppetto acts as a dispatcher, deciding which Command type should be executed in response.  Geppetto creates an instance of the appropriate Command, injects it with any dependencies it needs (such as the model and the event payload), and invokes its `execute()` method.  A Command can do things like invoke web services, modify the Model, or dispatch Application Events of its own.  When its work is done, the Command instance is destroyed automatically.

### Implementing a Command

All you need is a constructor function with an execute() method!

```javascript
var command = function () {};

command.prototype.execute = function () {

    // do some work here...
};

return command;
```

### Injected Data

The Geppetto framework automatically injects a few things into each Command instance before it is executed.

The three injections are:

* context
* eventName
* eventData

They can be accessed as properties of the command object via `this`.

See this example for their usage:

```javascript
var command = function () {};

command.prototype.execute = function () {

	// Injection #1: context
    // The Context which invoked this command will be injected automatically,
	// so any properties assigned to the Context will be available in the Command.
	// This is a good way to provide access to your Model data!
	this.updateModel(this.context.model);

	// Injection #2: eventName
	// The event name which triggered this Command.  You could have one command respond to many events, and you could
	// have conditional logic in your command to handle those events differently.
    if (this.eventName === "fooEvent") {
		// foo stuff
	} else if (this.eventName === "barEvent") {
		// bar stuff
	} else {
		// other stuff
	}

	// Injection #3: eventData
	// An object literal that was passed from the caller which first dispatched the application event.  This is a way
	// to provide payload data to a Command.  The Command may also dispatch an app event with payload data as a response back to the view.
	console.log("Payload Foo: " + this.eventData.payloadFoo);
	console.log("Payload Bar: " + this.eventData.payloadBar);
	console.log("Payload Baz: " + this.eventData.payloadBaz);
};

command.prototype.updateModel = function(theModel) {
	// do stuff to model...
}

return command;
```

### Responsibilities of a Command

* **Single Purpose**: A Command should have one purpose and one purpose only.  This makes understanding and testing the command very easy.
* **Short-Lived**: A Command should "get in and get out", doing its job and exiting the `execute()` function as soon as its job is done.  This allows the Command to be garbage collected.
* **Respectful of its Boundaries**: A Command should never manipulate the view directly.  Your Command's job is to act on Model data, and dispatch an event when it's done.  The View can listen for this event and handle updating itself.

## Debugging

Geppetto supports a debug mode, which can help with finding problems and measuring performance.

### Enabling Debug Mode

```javascript
Backbone.Geppetto.setDebug(true);
```

### Disabling Debug Mode

```javascript
Backbone.Geppetto.setDebug(false);
```

### Inspecting Contexts

```javascript
// Returns an Array of all registered Contexts
Backbone.Geppetto.debug.contexts

>> Object

```

* If you have a Model assigned to a Context, this is a great way to inspect its data
* To see which events are mapped to a Context, you can inspect the "vent._callbacks" property of a given Context.

### Counting Contexts

```javascript
// Returns the total number of registered Contexts
Backbone.Geppetto.debug.countContexts();

>> 5
```

### Counting Events

```javascript
// Returns the total number of registered Events across all Contexts
Backbone.Geppetto.debug.countEvents();

>> 25
```

## Diagrams

### MVC Overview

[![MVC Diagram](http://i.imgur.com/zsVjd.gif)](http://i.imgur.com/zsVjd.gif)


## FAQ

### How Many Contexts?
How many Contexts do I need in my app?

Like most questions about application structure, the answer is the familiar and often-frustrating, "It depends."

The best way to understand Contexts is to step back and think about which pieces of your application could theoretically exist as their own totally independent applications.

* Single-Context Apps: If your app has many sub-views, which all need to communicate but could not really function on their own, then you might benefit from a Single-Context app.  You can still benefit from a loosely-coupled architecture using the Context's Service Locator pattern, and the Command Registry to keep your business logic neat and tidy.

* Multiple-Context Apps: If I have a multi-tabbed application, for instance, where each tab has its own self-contained UI, its own backing data, and its own business logic, then you might consider creating one Context per tab.  After all, the tab generally doesn't need to communicate with other tabs, nor should other tabs be informed of what actions are taking place within its boundaries.  Depending on your app's needs, you may choose to have one "parent" Context that represents the outer application shell, which handles global things like navigation, tab creation, etc.  See the example app below for a demo of communicating between parent and child contexts.

## Examples
### Modular Widgets
Pointless?  Yes.
Easy-to-understand?  I hope so!
Fun?  Probably just as much as Farmville!

[Give it a whirl here](http://modeln.github.com/backbone.geppetto/examples/widgets/).

Source code available in the `examples` directory in the Github Repo.

To run it from this repository, you can simply use from the main directory:

   $ python -m SimpleHTTPServer

Now, the example is running at:  `http://0.0.0.0:8000/examples/widgets/`


### Movies
Often, you want to provide a user interface to browse data, combined with easy filtering and sorting. The movies example show how to combine a context with commands, and where to place the dependencies of the context.

[Give it a whirl here](http://jsbin.com/uleXOjOx/15).


## Tests
### About
Geppetto test specs are written using [Mocha](http://visionmedia.github.io/mocha/) with [BDD](http://en.wikipedia.org/wiki/Behavior_Driven_Development)
syntax provided by the [Chai](http://chaijs.com/) plugin.
Mocks, Spies, and Stubs are provided by the fantastic [SinonJS](http://sinonjs.org/) library.

### Specs
Run the current Geppetto Test Specs in your browser [here](http://modeln.github.com/backbone.geppetto/specs/).  More specs to come!

## Buzz
### Articles and Blogs
* [Developing modular apps with backbone and Geppetto](http://niki4810.github.io/blog/2013/05/26/building-modular-apps-using-backbone-and-geppetto/) - Nikhilesh Katakam
* [Backbone and Pinocchio](http://lazywithclass.tumblr.com/post/44717340559/backbone-and-pinocchio) - Alberto Zaccagni 

### Who uses Geppetto?

Geppetto is used in production by these organizations.  

[![Revvy](http://i.imgur.com/nyA0jnR.png)](http://revvy.com)

[![Face IT](http://play.faceit.com/wp-content/themes/faceitv2/images/small-logo.png)](http://faceit.com)

To add your logo, please open an issue.  Include a link to a hosted .png image of your logo no wider than 200px and no taller than 70px.  We'd also love to hear a quick story about how Geppetto has helped you out!

## Version History

### 0.7.0
*Released 29 Apr 2014*

* Official release for DI features
* Fix bower config
* Happy 2-year Geppettiversary!

### 0.7.0 RC5
*Released 18 Jan 2014*

* Bug fixes for DI
* Update docs with first pass at DI APIs (work in progress)

### 0.7.0 RC1
*Released 17 Nov 2013*

* Initial pre-release with dependency injection support

### 0.6.3
*Released 31 July 2013*

* Switch test specs from qunit/pavlov to mocha/chai.

### 0.6.2
*Released 31 July 2013*

* Enforce that commands are constructable.
* Allow batch registration of several commands for a single event
* Thanks to [creynders](https://github.com/creynders) for these enhancements!

### 0.6.1
*Released 17 July 2013*

* Enforce that event payloads are objects, and not other types.

### 0.6
*Released 2 June 2013*

* When registering commands on a Context, you can now declare a `commands` object instead of using the `wireCommand` function.  This is more in line with the "Backbone Way" of preferring configuration over code.  (Thanks, [@mtsr](https://github.com/ModelN/backbone.geppetto/pull/13))
* Similar to the above, you can register context event listeners on a View, using the `contextEvents` object. (Thanks, [@mtsr](https://github.com/ModelN/backbone.geppetto/pull/13))
* To facilitate binding an existing context to a sub-view, you can now pass an existing Context instance to `Geppetto.bindContext`, instead of just a Context constructor function. (Thanks, [@mtsr](https://github.com/ModelN/backbone.geppetto/pull/13))
* Added test coverage enforcement to Grunt task using the [grunt-blanket-qunit](https://npmjs.org/package/grunt-blanket-qunit) plugin.
* Added JSHint config file to allow tweaking the JSHint flags.
* Updated Travis-CI config to use Grunt instead of custom Phantom script
* README updates to several sections.

### 0.5.1
*Released 13 May 2013*

* Add grunt build which runs the test specs, and lints the project.  See the docs section "Get Involved > Contributing" for more info.
* Fixed several lint errors
* Bump backbone to 1.0.
* Moved marionette and associated libs from "dependencies" to "example-dependencies" since Geppetto itself does not depend on them.
* Bump Marionette versions to latest (used only by example app, not by Geppetto itself)
* Refactored test specs to use plain Backbone views instead of Marionette views
* Add bower config for integration with bower.io

### 0.5
*Released: 24 February 2013*

* **BREAKING**: Removed Marionette dependency.  Geppetto now lives on the Backbone namespace as `Backbone.Geppetto` and not `Backbone.Marionette.Geppetto`.  If you're using AMD, you can also just `define(["geppetto"], function(Geppetto) {...});` without using any namespaces (recommended).  Marionette still works well with Geppetto; it's just no longer required.
* Removed RequireJS dependency.  Added conditional support for AMD or browser globals.
* Automatically inject `eventName` param into `eventData` payload, to facilitate re-dispatching of events, or registering a common handler for multiple events (and being able to tell them apart).
* Added some sanity checks to `Context.listen()` to fail-fast if the right params are not provided.
* Added a bunch of tests for 100% unit test coverage!  (Well, technically 97.59% since I haven't found a good way to test for missing dependencies).  Thanks to the awesome developers who made the [Blanket.js](http://migrii.github.com/blanket/) code coverage tool.
* Updated some 3rd party testing libraries

### 0.4.1
*Released: 29 January 2013*

* Compatibility with Marionette v1.0.0-rc4.  Thanks to [Mark Fayngersh](https://github.com/pheuter) for this fix.

### 0.4
*Released: 25 January 2013*

* Use new ["inversion-of-control"](http://documentcloud.github.com/backbone/#upgrading)-style Backbone `listenTo` API to allow consumers of Context events to maintain their own event references,
instead of Geppetto managing all the binding/unbinding logic.
* Consumers of Geppetto Context events which are not views, can use `Marionette.addEventBinder()` to mix-in the `listenTo` API into themselves.
* Refactored internals to work with Backbone v0.9.10.
* Updated dependencies to latest versions (Backbone, Marionette, jQuery)
* Added unit tests to cover event cleanup cases.
* Big thanks to [Kelvin Luck](https://github.com/vitch) for [his help](https://github.com/ModelN/backbone.geppetto/pull/8) with this release!

### 0.3
*Released: 7 December 2012*

* BREAKING: Added another required parameter to the `listen()` function representing the object (view) doing the listening. If it's a view, Geppetto will automatically unbind the view's listeners when the view is `close()`d.

### 0.2.2
*Released: 12 November 2012*

* Updated Geppetto to work with Marionette v1.0.0 beta 5
* Marionette can now be downloaded as a bundled build which includes EventAggregator and Wreqr, so these secondary dependencies have been removed from Geppetto.  Instead, Geppetto's dependency is now on the bundled Marionette build.
* Removed redundant "contexts" variable which was defined twice.

### 0.2.1
*Released: 18 October 2012*

* Updated Geppetto to work with Marionette v1.0.0 beta 1

### 0.2.0
*Released: 26 April 2012*

* Removed Livequery and service-locator to simplify the framework and remove all ties to the DOM.
* Added logic to automatically destroy a Context and unmap its events when the close() method is called on the parent View

### 0.1.1
*Released: 19 April 2012*

* Added DOM-based service locator using Livequery, allowing sub-views to find their parent context without it being passed to them

### 0.1
*Released: 16 April 2012*

* Initial release

## License
The MIT License (MIT)

Copyright (c) 2012 Model N, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/ModelN/backbone.geppetto/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

[![Analytics](https://ga-beacon.appspot.com/UA-35812735-2/backbone.geppetto/readme?pixel)](https://github.com/igrigorik/ga-beacon)
