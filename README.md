# Backbone Geppetto
## About
### What is it?
Geppetto is an extension for [Backbone Marionette](https://github.com/derickbailey/backbone.marionette).  While Marionette lets you "make your Backbone applications dance," Geppetto gives them a life of their own!  Geppetto does this by implementing an event-driven Command framework, decoupling your View/Presenter code from your app's business logic.  

The architecture of Geppetto was greatly inspired by the popular [Robotlegs](http://robotlegs.org) framework for Actionscript.

### Why Another Framework?
Backbone has been [called an MV* framework](http://lostechies.com/derickbailey/2011/12/23/backbone-js-is-not-an-mvc-framework/), because it's not strictly MVC, MVP, nor any other MV-something.  Sure, the Backbone Router can be made to act "controllery," but it's not really a good idea to tie all your business logic to URL change events.  

More commonly, in Backbone applications you'll find business logic implemented directly in Backbone.View components.  For smaller apps, it's convenient to declare your "events" and your callback functions in the same place.  But as applications grow, and business logic needs to be reused across separate view components, this practice starts to get messy.

To solve this issue, Geppetto implements a scalable **Controller** architecture for Backbone, prescribing an MVC-style separation of concerns.  This makes it possible to write code that is loosely-coupled, easy-to-reuse, and highly-testable.  

## Dependencies
You'll need to include the following projects for Geppetto to work:

### Livequery
[Livequery](http://docs.jquery.com/Plugins/livequery) is required to respond to an element being added to the DOM.  This is used by Geppetto's `getContext()` method, which allows an element to look up its parent Context instead of "passing the baton" from parent views to child views.

### Backbone Marionette
[Backbone Marionette](https://github.com/derickbailey/backbone.marionette) is required for its Event Aggregator, and recommended for its Composite View architecture, which works particularly well with Geppetto.

### RequireJS
[RequireJS](http://requirejs.org/) is currently required, but will likely be demoted to "recommended" in an upcoming release.  In a large multi-module application, RequireJS makes it much easier to manage dependencies.

Here is the RequireJS config with all dependencies listed:

```javascript
require.config( {
    paths:{
        jquery:'libs/jquery-1.7.1.min',
        livequery: 'libs/jquery.livequery',
        underscore:'libs/underscore',
        backbone:'libs/backbone',
        marionette:'libs/backbone.marionette',
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

### Job #1: Service/Model Locator
The Context helps with dependency management, saving you from the tedious task of manually passing dependencies around.  Let's say that we've got a nested view structure, with three components: ParentView, ChildView, and GrandchildView, all nested like Russian dolls, and all backed by the same Model.  

Let's say that ChildView handles layouts, but doesn't actually need a handle to the Model instance since it doesn't display any Model data.  GrandchildView, however, does display data.  If the Model is created by ParentView, how does GrandchildView get a handle to the Model?

You've probably written some code like this:

```javascript

// ParentView.js
return Backbone.View({
	initialize: function(){
		// I don't need this model, but my child does!
		this.model = new Model();	
	},
	render: function(){
		var childView = new ChildView({
			// Pass the model along to my child view...
			model: this.model 
		}
	}
});

// ChildView.js
return Backbone.View({
	render: function(){
		var grandchildView = new GrandchildView({
			// Actually, I don't need the model, myself... 
			// I just know that the grandchild view needs it, so I'm passing it along!
			model: this.model 
		}
	}
});

// GrandchildView.js
return Backbone.View({
	render: function(){
		    // Oh, thanks for the Model!  
		    // I hope you didn't have to work too hard to bring it to me!
			doSomeRenderingWithTheModel(this.model);
		}
	}
});
```
Oftentimes, we find ourselves manually passing around dependencies through hierarchical Views, like a game of pass-the-baton.  This is tedious and fragile, and does not promote good separation of concerns.  Instead, wouldn't it be great if ChildView didn't need any Model reference at all, and GrandchildView could simply ask for it?

Here's how we could accomplish this with Geppetto (Don't worry for now about where ParentViewContext comes from... we'll get to that!):

```javascript
// ParentView.js
return Backbone.View({
	initialize: function(){
		this.model = new Model();	
	},
	render: function(){		
		this.context = Backbone.createContext(this.el, ParentViewContext);
		this.context.model = this.model;
		
		var childView = new ChildView({
			// ChildView doesn't need the model, so I won't pass it...
		}
	}
});

// GrandchildView.js
return Backbone.View({
	render: function(){
		// Let Geppetto find my Context based on the DOM hierarchy.
		Geppetto.getContext(this.el, onContextLoad);		
	},
	onContextLoad: function(context) {
		
		// I got my Model all by myself, and no parent view had to pass it to me!		
		this.context = context;
		
		doSomeRenderingWithTheModel(this.context.model);
	}
});
```

In the above example, we're seeing the service/model locator pattern in action.  First, our ParentView registers itself with Geppetto using `createContext()`.  We do this in the `render()` function because Geppetto uses the DOM to track relationships between components, and when we're inside this method, we can be sure that the View's `el` has been created. 

Behind the scenes, Geppetto sets an attribute on the ParentView's DOM element, tying it to a Context instance with a unique identifier.  This will allow any of the ParentView's child Views to look up the Context later.  

ParentView also is responsible for creating the Model, but we don't want out View to be responsible for keeping track of it.  Instead, once the Context is created, we assign the Model to it.  Our Model data now lives in a centralized place, accessible from any component belonging to this Context.

Later on, instead of passing the "model" property from component-to-component, the GrandchildView can simply ask Geppetto for the Context it belongs to.  Since the View's "el" might not be attached to the DOM yet, we provide a callback function to `getContext()` which will be fired as soon as the View is attached to the DOM and its parent Context is found.   

### Job #2: Command Registry

Do you have any business logic in your app that doesn't necessarily belong to a view?  For instance, you might have some code that loads some backing data which is shared across many views.  Sure, you could place that business logic in your outer-most view, but then that view would be responsible for telling the sub-views whenever new data is available.  Wouldn't it be great if we could completely decouple our shared client business logic from our views?

Well, now we can!  Each Context has a registry where you can assign a named event to an associated Command.  Whenever you want some work to be done, you simply dispatch an event onto the Context's Event Bus, and the appropriate command will automagically get instantiated, carry out its job, and clean itself up.  You may choose to have the Command dispatch another event when its work is done, so that any observers (such as Views) can be notified.

### Creating a Context

```javascript

// MainView.js
return Backbone.View.extend({
	render: function() {
		this.context = Geppetto.createContext(this.el, MainContext);
	}
});

// MainContext.js
return Geppetto.Context.extend( {
    // map commands here...
});
```

### Assigning a Parent Context

```javascript

// ShellView.js
return Backbone.View.extend({
	render: function() {
		this.context = Geppetto.createContext(this.el, ShellContext);
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
    // map commands here...
});

// ModuleView.js
return Backbone.View.extend({
	render: function() {
		// use "this.options" to access Backbone constructor parameters
		this.context = Geppetto.createContext(
			this.el, ModuleContext, this.options.parentContext
		);
	}
});

// ModuleContext.js
return Geppetto.Context.extend( {
    // map commands here...
});


```

### Finding a Component's Context

```javascript
return Backbone.View({
	render: function(){
		// Let Geppetto find my Context based on the DOM hierarchy.
		Geppetto.getContext(this.el, onContextLoad);		
	},
	onContextLoad: function(context) {		
		// I got my Model all by myself, and no parent view had to pass it to me!		
		this.context = context;		
		doSomeRenderingWithTheModel(this.context.model);
	}
});
```

### Registering Commands

```javascript
return Geppetto.Context.extend( {
    this.mapCommand( "appEventFoo", FooCommand );
    this.mapCommand( "appEventBar", BarCommand );
    this.mapCommand( "appCommandBaz", BazCommand );
});
```

### Listening to Events

```javascript

// this usually goes in View code... to respond to an event fired by a Command finishing its job
context.listen("fooCompleted", handleFooCompleted);

var handleFooCompleted = function() {
	// update the view or something...
}

```

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

```javascript
// This will unregister all events bound to the Context and will also call close() on the Context's View (if available).
// When used with Marionette.ItemView, this means that all your View Events get cleaned up, too.  Nice and tidy!
Geppetto.removeContext(context);
```

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
Backbone.Marionette.Geppetto.setDebug(true);
```

### Disabling Debug Mode

```javascript
Backbone.Marionette.Geppetto.setDebug(false);
```

### Inspecting Contexts

```javascript
// Returns an Array of all registered Contexts
Backbone.Marionette.Geppetto.debug.contexts

>> Object

```

* If you have a Model assigned to a Context, this is a great way to inspect its data
* To see which events are mapped to a Context, you can inspect the "vent._callbacks" property of a given Context.

### Counting Contexts

```javascript
// Returns the total number of registered Contexts
Backbone.Marionette.Geppetto.debug.countContexts();

>> 5
```

### Counting Events

```javascript
// Returns the total number of registered Events across all Contexts
Backbone.Marionette.Geppetto.debug.countEvents();

>> 25
```

## FAQ

### How Many Contexts? 
How many Contexts do I need in my app?

Like most questions about application structure, the answer is the familiar and often-frustrating, "It depends."

The best way to understand Contexts is to step back and think about which pieces of your application could theoretically exist as their own totally independent applications.  

* Single-Context Apps: If your app has many sub-views, which all need to communicate but could not really function on their own, then you might benefit from a Single-Context app.  You can still benefit from a loosely-coupled architecture using the Context's Service Locator pattern, and the Command Registry to keep your business logic neat and tidy.

* Multiple-Context Apps: If I have a multi-tabbed application, for instance, where each tab has its own self-contained UI, its own backing data, and its own business logic, then you might consider creating one Context per tab.  After all, the tab generally doesn't need to communicate with other tabs, nor should other tabs be informed of what actions are taking place within its boundaries.  Depending on your app's needs, you may choose to have one "parent" Context that represents the outer application shell, which handles global things like navigation, tab creation, etc.  See the example app below for a demo of communicating between parent and child contexts.


### Livequery Performance
*"Livequery uses polling and timers to check for DOM events... will this affect performance?"*

Geppetto invokes Livequery when a View uses the `getContext()` method to find its Parent Context.  Since this requires a DOM hierarchy check, and since the View might not yet be added to the DOM, we use Livequery to notify us when the DOM attachment has taken place.  Only then can we run the Context selector, and retrieve the appropriate Context.  Immediately after this has taken place, we clean up the Livequery reference and the polling stops.  

I tested this performance using the Modular Widgets example, and found that the `getContext()` call took an average of 25ms to complete with up to 50 Contexts on the page.  As the number of Contexts increased, the time did increase, but not by much.  Even with hundreds of Contexts on the page, the call still returned in about 100ms.  Even a very modular app should not need more than a dozen or so Contexts to be active at one time, so this should not be a huge concern for most.  

Still, if that 25ms is a deal-breaker for you, you can still opt to manually pass around your Context from parent-to-child instead of using the Service locator pattern.  

## Examples
### Modular Widgets
Pointless?  Yes.  
Easy-to-understand?  I hope so!  
Fun?  Probably just as much as Farmville!  

[Give it a whirl here](http://modeln.github.com/backbone.geppetto/examples/).

Source code available in the `examples` directory in the Github Repo.

## License
The MIT License (MIT)

Copyright (c) 2012 Model N, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
