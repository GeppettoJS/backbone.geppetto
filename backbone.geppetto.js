// Backbone.Geppetto v0.3
//
// Copyright (C) 2012 Model N, Inc.  
// Distributed under the MIT License
//
// Documentation and full license available at:
// http://modeln.github.com/backbone.geppetto/

define( [
    "jquery",
    "underscore",
    "backbone",
    "marionette"
], function ( $, _, Backbone, Marionette ) {

    Backbone.Marionette.Geppetto = (function ( Backbone, _, $ ) {

        var Geppetto = {};

        Geppetto.EVENT_CONTEXT_SHUTDOWN = "Geppetto:contextShutdown";

        var VIEW_ID_KEY = "__geppettoViewId__";

        var contexts = {};

        Geppetto.Context = function Context( options ) {

            this.options = options || {};

            this.parentContext = this.options.parentContext;

            this.vent = {};

			Marionette.addEventBinder(this.vent);

            this.initialize && this.initialize();

            this._contextId = _.uniqueId("Context");

            this._viewBindings = {};

            contexts[this._contextId] = this;
        };

        Geppetto.bindContext = function bindContext( options ) {

            this.options = options || {};

            var context = new this.options.context(this.options);
            var view = this.options.view;

            if (!view.close) {
                view.close = Backbone.Marionette.View.close;
            }

            view.on("close", function() {

                // todo: is it really necessary to unmap "close" here? 
                // todo: might already be taken care of by marionette...
                view.off("close");

                context.unmapAll();
            });

            view.context = context;

            return context;
        };

        Geppetto.Context.prototype.listen = function listen( target, eventName, callback ) {

            if (arguments.length !== 3) {
                throw "Geppetto.Context.listen(): Expected 3 arguments (target, eventName, callback)";
            }

            var viewId;
            
            // if the target object doing the listening is a backbone view (or extension thereof)
            // then keep track of its event bindings in an array of bindings specific to that view,
            // so that when the view is closed, we can unbind all the bindings automatically.
            if (target instanceof Backbone.View) {

                viewId = target[VIEW_ID_KEY];
                if ( ! viewId ) {

                    // track the mapping of event bindings to the view by registering a unique ID on the view
                    viewId = target[VIEW_ID_KEY] = _.uniqueId();

                    // if the view does not already have a close() implementation, borrow the one from Marionette
                    if (!target.close) {
                        target.close = Backbone.Marionette.View.close;
                    }

                    var that = this;

                    // when the view is closed, invoke our cleanup function
                    target.on("close", function() {

                        target.off("close");

                        // unbind all the event bindings tied to this view
                        _.each(that._viewBindings[viewId], function(binding) {
                            that.vent.stopListening(binding[0], binding[1], binding[2]);
                        });

                        target[VIEW_ID_KEY] = undefined;
                        delete that._viewBindings[viewId];
                    });

                }

                if ( ! this._viewBindings[viewId]) {
                    this._viewBindings[viewId] = [];
                }
            }

			this.vent.listenTo( this.vent, eventName, callback, target );
			// The arguments to listenTo are enough to stop listening to an event so we'll store those as the binding
            var binding = [this.vent, eventName, callback];

            if (target instanceof Backbone.View) {
                this._viewBindings[viewId].push(binding);
            }

            return binding;
        };

        Geppetto.Context.prototype.dispatch = function dispatch( eventName, eventData ) {
            this.vent.trigger( eventName, eventData );
        };

        Geppetto.Context.prototype.dispatchToParent = function dispatchToParent( eventName, eventData ) {
            if ( this.parentContext ) {
                this.parentContext.vent.trigger( eventName, eventData );
            }
        };

        Geppetto.Context.prototype.dispatchGlobally = function dispatchGlobally( eventName, eventData ) {

            _.each( contexts, function ( context, contextId ) {
                context.vent.trigger( eventName, eventData );
            } );
        };

        Geppetto.Context.prototype.mapCommand = function mapCommand( eventName, commandClass ) {

            this.vent.listenTo( this.vent, eventName, function ( eventData ) {

                var commandInstance = new commandClass();

                commandInstance.context = this;
                commandInstance.eventName = eventName;
                commandInstance.eventData = eventData;
                commandInstance.execute && commandInstance.execute();

            }, this );
        };

        Geppetto.Context.prototype.unmapAll = function unmapAll() {

            this.vent.stopListening();

            delete contexts[this._contextId];

            this.dispatchToParent(Geppetto.EVENT_CONTEXT_SHUTDOWN);
        };

        var extend = Backbone.View.extend;
        Geppetto.Context.extend = extend;

        var debug = {

            contexts : contexts,

            countEvents : function countEvents() {

                var numEvents = 0;

                _.each(contexts, function(context, id) {
                    if (contexts.hasOwnProperty(id)) {
                        numEvents += _.size(context.vent._callbacks);
                    }
                });

                return numEvents;
            },

            countContexts: function countContexts() {

                var numContexts = 0;

                _.each(contexts, function(context, id) {
                    if (contexts.hasOwnProperty(id)){
                        numContexts++;
                    }
                });
                return numContexts;
            }

        };

        Geppetto.setDebug = function setDebug( enableDebug ) {
            if (enableDebug) {
                this.debug = debug;
            } else {
                this.debug = undefined;
            }
            return this.debug;
        };

        var counter = 0;
        var childCounter = 0;

        return Geppetto;

    })( Backbone, _, window.jQuery || window.Zepto || window.ender );

    return Backbone.Marionette.Geppetto;
} );