define([

   'underscore',
   'backbone',
   'handlebars',
   'geppetto',
   'text!templates/moviesList.hbs'

   ], function(_, Backbone, Handlebars, Geppetto, MoviesListTemplate) {


   var MovieListView = Backbone.View.extend({
     className: 'col-sm-9',

     template : Handlebars.compile(MoviesListTemplate),

     initialize : function(options) {
       _.bindAll.apply(_, [this].concat(_.functions(this)));
       //context passed from content view
       this.context = options.context;
       this.context.listen(this,"ReloadMoviesEvent",this.reloadMovies);
     },

     reloadMovies : function(result){
       this.constructList(result.data.toJSON());
     },

     render : function(){      
       this.constructList(this.model.toJSON());  
     },

     constructList: function(model){
         var html = this.template(model); 
         this.$el.empty();
         this.$el.append(html);
     }
   })

   return MovieListView;
});
