define([
   'underscore',
   'backbone',
   'handlebars',
   'geppetto',
   'text!templates/filterList.hbs'
  ], function(_, Backbone, Handlebars, Geppetto, FilterViewTemplate) {

    var FilterListView = Backbone.View.extend({

      className :'nav nav-pills',

      tagName :'ul',

      template : Handlebars.compile(FilterViewTemplate),

      events:{
        'click li > a' :'handleFilterClick'
      },

      initialize : function(options) {
        _.bindAll.apply(_, [this].concat(_.functions(this)));
        //context passed from content view
        this.context = options.context;
      },

      handleFilterClick : function(e){
        e.preventDefault();
        if(this.active){
          this.active.removeClass('active');
        }
        this.active = $(e.currentTarget).closest('li');
        this.active.addClass('active');
        this.context.dispatch('FilterMovieList',{filterBy:$(e.currentTarget).data('name')});
      },

      render : function(){
        var html = this.template({genres: this.collection.toJSON()});
        this.$el.append(html);
      }
    });

    return FilterListView;
});

