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
You'll need to include the following projects for Geppeto to work:

### Backbone Marionette
[Backbone Marionette](https://github.com/derickbailey/backbone.marionette) is required for its Event Aggregator, and recommended for its Composite View architecture, which works particularly well with Geppetto.

### RequireJS
[RequireJS](http://requirejs.org/) is currently required, but will likely be demoted to "recommended" in an upcoming release.  In a large multi-module application, RequireJS makes it much easier to manage dependencies.

## Technical Overview
Geppetto implements a standard MVC architecture, with the added flavor of the "Mediated View" pattern.  The key players are:

### Model
The standard Backbone Model.

### View
The View is your HTML, generated however you want (template framework, etc.)

### View Mediator
In a Geppetto App, Backbone.View is the View *Mediator*.  When we use the term "View" in our examples, we'll be referring both to the View Mediator (Javascript) and the View (HTML).  The Mediator has these main functions:

* Instantiates the View by generating HTML
* Listens for DOM events on the View's `el`
* Responds to DOM events by triggering **Application Events** for the **Controller** to respond to
* Listens for **Application Events** triggered by the **Controller** and manipulates the View in response

The last two points are the key differences between Geppetto Applications and traditional Backbone Applications.  Normally, your Backbone.View would both listen for DOM events *and* handle the business logic to respond to those events.  With Geppetto, your Backbone.View's job as a Mediator is simply to translate DOM events into Application Events (and vice-versa) *that's it*.  Once the Mediator has created and triggered an Application event, its job is done.

Who actually handles these Application Events?  Glad you asked!

### Controller
Geppetto implements the Controller piece using the Command Pattern described below.

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

Here's how we could accomplish this with Geppetto:

```javascript
// ParentView.js
return Backbone.View({
	initialize: function(){
		this.model = new Model();	
	},
	render: function(){
		
		this.context = new ParentViewContext();
		this.context.model = this.model;
		
		var childView = new ChildView({
			// ChildView doesn't need the model, so I won't pass it...
		}
	}
});

// GrandchildView.js
return Backbone.View({
	render: function(){
		// I'll just attach myself to the DOM here...
	},
	onRender: function(){
		// Let Geppetto find my Context based on the DOM hierarchy
		this.context = Geppetto.getContext(this.el);
		
		// I've got my Model, and nobody had to pass it to me!
		doSomeRenderingWithTheModel(this.context.model);		
	}
});
```

### Job #2: Command Registry

A Context instance is tied to a specific View Mediator, which will generally represent a complex parent view with many sub-views. 

Medium-sized apps might only have one Context, while larger multi-module apps may have one "parent" Context for the application shell, and individual Contexts for sub-sections of the app.

### How Many Contexts Do I Need?
Like most questions about application structure, the answer is the familiar and often-frustrating, "It depends."

The best way to understand Contexts is to step back and think about which pieces of your application could theoretically exist as their own totally independent applications.  

*   Single-Context Apps: If your app has many sub-views, which all need to communicate but could not really function on their own, then you might benefit from a Single-Context app.  

*   Multiple-Context Apps: If I have a multi-tabbed application, for instance, where each tab has its own self-contained UI, its own backing data, and its own business logic, then I might consider creating one Context per tab.  After all, the tab generally doesn't need to communicate with other tabs, nor should other tabs be informed of what actions are taking place within its boundaries.  

### Creating a Context

```javascript
return Geppetto.Context.extend( {

});

### Finding a Component's Context

### Registering Commands

### Listening to Events

### Event Bus
The Context provides an Event Bus for loosely-coupled communication between components.  When a component dispatches an event onto the Event Bus, it can choose whether that event should be targeted for the local Context, the parent Context, or all Contexts.  This allows inter-module communication when desired, while keeping events neatly segregated otherwise.

### Dispatching Local Events

### Dispatching Parent Events

### Dispatching Global Events

### Un-Registering Commands

### Destroying a Context

## Geppetto.Command
A Command is a small, single-purpose piece of code with an `execute()` method.  When an Application Event is fired, Geppetto acts as a dispatcher, deciding which Command type should be executed in response.  Geppetto creates an instance of the appropriate Command, injects it with any dependencies it needs (such as the model and the event payload), and invokes its `execute()` method.  A Command can do things like invoke web services, modify the Model, or dispatch Application Events of its own.  When its work is done, the Command instance is destroyed automatically.

### Implementing a Command

### Dependency Injection

### Responsibilities of a Command

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
