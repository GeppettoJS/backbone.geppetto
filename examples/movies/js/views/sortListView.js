define(
  ['underscore',
   'backbone',
   'handlebars',
   'geppetto',
   'text!templates/sortList.hbs'
   ], function(_, Backbone, Handlebars, Geppetto, MoviesListTemplate) {


   var SortListView = Backbone.View.extend({

     className :'nav nav-pills nav-stacked',

     tagName :'ul',

     template : Handlebars.compile(MoviesListTemplate),

     events:{
       'click li > a' : 'handleSortClick'
     },

     initialize : function(){

       _.bindAll.apply(_, [this].concat(_.functions(this)));
       //context passed from content view
       this.context = this.options.context;
     },

     handleSortClick : function(e){
       e.preventDefault();
       if(this.active){
         this.active.removeClass('active');
       }
       this.active = $(e.currentTarget).closest('li');
       this.active.addClass('active');
       this.context.dispatch('SortMovieList',{sortBy:$(e.currentTarget).data('name')});
     },
     render : function(){
       var html = this.template();
       this.$el.append(html);
     }
   });

   return SortListView;
});
