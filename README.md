# Backbone Geppetto
## About
### What?
Geppetto is an extension for [Backbone Marionette](https://github.com/derickbailey/backbone.marionette).  While Marionette lets you "make your Backbone applications dance," Geppetto gives them a life of their own!  Geppetto does this by implementing an event-driven Command framework, decoupling your View/Presenter code from your app's business logic.  

The architecture of Geppetto was greatly inspired by the popular [Robotlegs](http://robotlegs.org) framework for Actionscript.

### Why?
Backbone has been [called an MV* framework](http://lostechies.com/derickbailey/2011/12/23/backbone-js-is-not-an-mvc-framework/), because it's not strictly MVC, MVP, nor any other MV-something.  Sure, the Backbone Router can be made to act "controllery," but it's not really a good idea to tie all your business logic to URL change events.  

More commonly, in Backbone applications you'll find business logic implemented directly in Backbone.View components.  For smaller apps, it's convenient to declare your "events" and your callback functions in the same place.  But as applications grow, and business logic needs to be reused across separate view components, this practice starts to get messy.

To solve this issue, Geppetto implements a scalable **Controller** architecture for Backbone, prescribing an MVC-style separation of concerns.  This makes it possible to write code that is loosely-coupled, easy-to-reuse, and highly-testable.  

## Technical Overview
Geppetto implements a standard MVC architecture, with the added flavor of the "Mediated View" pattern.  The key players are:

### Model
The standard Backbone Model.

### View
The View is your HTML, generated however you want (template framework, etc.)

### Mediator
Here's where it gets interesting... In a Geppetto App, Backbone.View is not really your view--it's your view's *Mediator*.  The Mediator has these main functions:
*   Instantiates the View by generating HTML
*   Listens for DOM events on the View's `el`
*   Responds to DOM events by triggering **Application Events** for the **Controller** to respond to
*   Listens for **Application Events** triggered by the **Controller** and manipulates the View in response

The last two points are the key differences between Geppetto Applications and traditional Backbone Applications.  Normally, your Backbone.View would both listen for DOM events *and* handle the business logic to respond to those events.  With Geppetto, your Backbone.View's job as a Mediator is simply to translate DOM events into Application Events (and vice-versa) *that's it*.  Once the Mediator has created and triggered an Application event, its job is done.

Who actually handles these Application Events?  Glad you asked!

### Controller
Geppetto implements the Controller piece using the Command Pattern.  A Command is a small, single-purpose piece of code with an `execute()` method.  When an Application Event is fired, Geppetto acts as a dispatcher, deciding which Command type should be executed in response.  Geppetto creates an instance of the appropriate Command, injects it with any dependencies it needs (such as the model and the event payload), and invokes its `execute()` method.  A Command can do things like invoke web services, modify the Model, or dispatch Application Events of its own.  When its work is done, the Command instance is destroyed automatically.

# API
Coming soon!

# Examples
## Modular Widgets
Pointless?  Yes.  Easy-to-understand?  I hope so!  Fun?  Probably just as much as Farmville!  [Give it a whirl here](http://modeln.github.com/backbone.geppetto/examples/).

# License
The MIT License (MIT)

Copyright (c) 2012 Model N, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
