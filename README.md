# Backbone Geppetto

[![Build Status](https://travis-ci.org/ModelN/backbone.geppetto.png)](https://travis-ci.org/ModelN/backbone.geppetto)

## About
### What is it?
Geppetto is an extension for [Backbone.js](http://documentcloud.github.com/backbone/) that implements an event-driven Command framework, decoupling your View/Presenter code from your app's business logic.

The architecture of Geppetto was greatly inspired by the popular [Robotlegs](http://robotlegs.org) framework for Actionscript.

### Why Another Framework?
Backbone has been [called an MV* framework](http://lostechies.com/derickbailey/2011/12/23/backbone-js-is-not-an-mvc-framework/), because it's not strictly MVC, MVP, nor any other MV-something.  Sure, the Backbone Router can be made to act "controllery," but it's not really a good idea to tie all your business logic to URL change events.  

More commonly, in Backbone applications you'll find business logic implemented directly in Backbone.View components, or sometimes in the Model.  For smaller apps, it's convenient to declare your "events" and your callback functions in the same place.  But as applications grow, and business logic needs to be reused across separate view components, this practice starts to get messy.

To solve this issue, Geppetto implements a scalable **Controller** architecture for Backbone, prescribing an MVC-style separation of concerns.  This makes it possible to write code that is loosely-coupled, easy-to-reuse, and highly-testable.  

### Getting Geppetto

Download latest release: [v0.5](https://github.com/ModelN/backbone.geppetto/archive/0.5.zip)

Visit the [project repo](https://github.com/ModelN/backbone.geppetto) to download the latest unreleased code (may be unstable).

## Get Involved!

### Mailing List

Join the [Backbone.Geppetto Google Group](https://groups.google.com/forum/#!forum/backbone-geppetto) to discuss new features and stay-up-to-date on project updates.

### Contributing

Pull requests are welcome.  For any significant change or new feature, please start a discussion in the Google Group, or log an issue first.  This will save you some time, in case your idea is deemed not general enough to be included in Geppetto.

Before submitting a pull request, please run:

```
npm install
```

then

```
grunt
```

This will run the test suite, and lint the project files to be sure everything still works.

## Dependencies
You'll need to include the following projects for Geppetto to work:

### Backbone
[Backbone v0.9.10](http://documentcloud.github.com/backbone/) is required for its eventing system.

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
`Geppetto.Context` has many jobs, all of which involve providing a central place to share data and communication between related components. 

### Job #1: Event Bus

Each Context has an instance of Marionette.EventAggregator, exposed as the "vent" property on the Context instance.  You can use this "vent" in the same way that you would use any other Event Aggregator, to loosely-couple related parts of your application together with event-based communication.  

### Job #2: Command Registry

Do you have any business logic in your app that doesn't necessarily belong to a view?  For instance, you might have some code that loads some backing data which is shared across many views.  Sure, you could place that business logic in your outer-most view, but then that view would be responsible for telling the sub-views whenever new data is available.  Wouldn't it be great if we could completely decouple our shared client business logic from our views?

Well, now we can!  Each Context has a registry where you can assign a named event to an associated Command.  Whenever you want some work to be done, you simply dispatch an event onto the Context's Event Bus, and the appropriate command will automagically get instantiated, carry out its job, and clean itself up.  You may choose to have the Command dispatch another event when its work is done, so that any observers (such as Views) can be notified.

### Creating a Context

**Using Context factory method**

This method is handy if your view does not depend on a fully-initialized context.  With this method, you pass a view instance, and a Context constructor function.

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
		// map commands here...
	}
});
```

The factory method does a couple things automatically for you:

1. Automatically attaches a "close" handler to the view instance.  If you are using a Marionette view, you will already have a close handler.  So this is really just to support base Backbone Views
2. Automatically sets the "context" property on the view instance

**By manually creating a Context**

If your view requires your context to be fully-initialized when it, itself, is initialized, then you will have to create your Context manually.  One example for this is if your main view is a Marionette CollectionView, which requires an initialized Collection object, and your Collection is being initialized in your Context.

For example:

```javascript
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

// Since we didn't use BindContext, we need to manually attach our Context instance to the view
collectionViewInstance.context = contextInstance;
```

### Assigning a Parent Context

```javascript
// ShellView.js
return Backbone.View.extend({
	initialize: function() {
		Geppetto.bindContext({
			view: this, 
			context: ShellContext
		});
	},
	createModule: function() {
		var moduleView = new ModuleView({
			parentContext: this.context;
		});
		moduleView.render();
	}
});

// ShellContext.js
return Geppetto.Context.extend( {
	initialize: function () {
		// map commands here...
	}
});

// ModuleView.js
return Backbone.View.extend({
	initialize: function() {
		// use "this.options" to access Backbone constructor parameters
		Geppetto.bindContext({
			view: this,
			context: ModuleContext,
			parentContext: this.options.parentContext
		});
	}
});

// ModuleContext.js
return Geppetto.Context.extend( {
	initialize: function () {
		// map commands here...
	}
});
```


### Registering Commands

```javascript
return Geppetto.Context.extend( {
	initialize: function () {
		this.mapCommand( "appEventFoo", FooCommand );
		this.mapCommand( "appEventBar", BarCommand );
		this.mapCommand( "appCommandBaz", BazCommand );
	}
});
```

### Listening to Events

```javascript
// this usually goes in View code... to respond to an event fired by a Command finishing its job
context.listen(this, "fooCompleted", handleFooCompleted);

var handleFooCompleted = function() {
	// update the view or something...
}
```

NOTE: The first parameter passed to the `listen()` function represents the object that is the interested party (the one doing the listening) and should generally always be `this`, to mean the current view.  Geppetto will automatically attach a listener to the `close()` event on this view, and clean up all the view's associated listeners whenever it is closed.

### Event Bus
The Context provides an Event Bus for loosely-coupled communication between components.  When a component dispatches an event onto the Event Bus, it can choose whether that event should be targeted for the local Context, the parent Context, or all Contexts.  This allows inter-module communication when desired, while keeping events neatly segregated otherwise.

### Dispatching Local Events

```javascript
// Event only sent to Local Context
context.dispatch( "fooEvent");
```

### Dispatching Parent Events

```javascript
// Event only sent to Parent Context
context.dispatchToParent( "fooEvent");
```

### Dispatching Global Events

```javascript
// Event sent to every registered Context
context.dispatchGlobally( "fooEvent");
```

### Dispatching Events with a Payload

```javascript
context.dispatch( "fooEvent", 
						{
							payloadPropertyFoo: "payloadValueFoo",
							payloadPropertyBar: true,
							payloadPropertyBaz: 12345
						} );
```

### Un-Registering Commands

```javascript
// this is done automatically when a Context is destroyed, so you normally would not do this manually.
context.unmapAll();
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

### Dependency Injection

The Geppetto framework automatically injects a few things into each Command instance before it is executed.

The three injections are:

* context
* eventName
* eventData

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

[Give it a whirl here](http://modeln.github.com/backbone.geppetto/examples/).

Source code available in the `examples` directory in the Github Repo.

## Tests
### About
Geppetto test specs are written using [QUnit](http://docs.jquery.com/Qunit) with [BDD](http://en.wikipedia.org/wiki/Behavior_Driven_Development) syntax provided by the [Pavlov](https://github.com/mmonteleone/pavlov) plugin.  Mocks, Spies, and Stubs are provided by the fantastic [SinonJS](http://sinonjs.org/) library.

### Specs
Run the current Geppetto Test Specs in your browser [here](http://modeln.github.com/backbone.geppetto/specs/).  More specs to come!

## Version History

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

