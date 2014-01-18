define([
  'backbone',
  'geppetto',
  'commands/loadMovies',
  'commands/loadGenres',
  'commands/sortMovies',
  'commands/filterMovies'
  ], function(Backbone, Geppetto, LoadMoviesCommand, LoadGenresCommand, SortMoviesCommand, FilterMoviesCommand) {

   ApplicationContext = Backbone.Geppetto.Context.extend({
           initialize: function () {
                this.wireCommand( "LoadMoviesEvent", LoadMoviesCommand );
                this.wireCommand( "LoadGenresEvent", LoadGenresCommand );
                this.wireCommand( "SortMovieList",   SortMoviesCommand );
                this.wireCommand("FilterMovieList",  FilterMoviesCommand);

           }
   });

   return ApplicationContext;

});
