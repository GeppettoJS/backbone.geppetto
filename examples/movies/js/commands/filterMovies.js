define([
  'backbone'
  ], function(Backbone) {

    var FilterMoviesCommand = function(){};

    FilterMoviesCommand.prototype.execute = function(){

      var filterBy = this.eventData.filterBy;

      var filteredMovies = _.filter(this.context.movies.toJSON(),function(movie){
        return _.contains(movie.genres, filterBy);
      });

      var filteredMoviesModel = new Backbone.Model({
        movies : filteredMovies
      });

      this.context.dispatch("ReloadMoviesEvent",{data:filteredMoviesModel});
      
    };

    return FilterMoviesCommand;

});
