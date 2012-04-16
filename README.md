Backbone Geppetto
=================

About
-------

Geppetto is an extension for [Backbone Marionette](https://github.com/derickbailey/backbone.marionette).  While Marionette lets you "make your Backbone applications dance," Geppetto gives them a life of their own!  Geppetto does this by implementing an event-driven Command framework, decoupling your View/Presenter code from your app's business logic.  

Instead of invoking business functions directly, your apps simply dispatch an application event when they need work to be done.  Geppetto will automatically instantiate and execute the appropriate Command, which is destroyed as soon as its job is complete. For larger, more complex applications, Geppetto also allows the creation of module-specific "Contexts," each with its own unique event bus and Command registry.  This separation of concerns promotes code reuse between views, easier testing of business logic, and a cleaner way to communicate between related but separate parts of your app.

License
-------
The MIT License (MIT)

Copyright (c) 2012 Model N, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
