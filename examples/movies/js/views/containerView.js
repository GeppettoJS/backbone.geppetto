define(
  ['underscore',
  'backbone',
  'handlebars',
  'geppetto',
  'appContext',
  'views/moviesListView',
  'views/sortListView',
  'views/filterListView',
  'text!templates/containerView.hbs',
  ], function(_, Backbone, Handlebars, Geppetto, ApplicationContext, MovieListView, SortListView, FilterListView, ContainerViewTemplate) {


   var ContainerView = Backbone.View.extend({

       className:'row',

       template : Handlebars.compile(ContainerViewTemplate),

       initialize: function(){
         _.bindAll.apply(_, [this].concat(_.functions(this)));

         // use "this.options" to access Backbone constructor parameters
          Backbone.Geppetto.bindContext({
                view: this,
                context: ApplicationContext
          });

         this.context.listen(this,'onMoviesLoaded',this.constructMovieListView);
         this.context.listen(this,'onGenresLoaded',this.constructFilterListView);
       },

       render : function(){
         var html = this.template();
         this.$el.append(html);
         this.constructSortListView();
         this.context.dispatch("LoadMoviesEvent");
         this.context.dispatch("LoadGenresEvent");
      },

      constructMovieListView : function(result){
        console.log(this.context);
          var movieListView = new MovieListView({
              model : new Backbone.Model({
              movies : result.data
          }),
              context : this.context
        });

        movieListView.render();
        this.$('.content-section').append(movieListView.$el);
      },

      constructSortListView : function(){
        var sortListView = new SortListView({
          context : this.context
        });
        sortListView.render();
        this.$('.sort-section').append(sortListView.$el);
      },

      constructFilterListView : function(result){
        var filterListView = new FilterListView({
            collection: result.data,
            context : this.context
        });
        filterListView.render();
        this.$('.filters-section').append(filterListView.$el);
      }
    });

    return ContainerView;
});
