define(['backbone'
], function(Backbone) {

    var SortMoviesCommand = function(){};

    SortMoviesCommand.prototype.execute = function(){
      var sortBy = this.eventData.sortBy;
      this.context.movies.comparator = sortBy;
      this.context.movies.sort();
      var sortedMoviesModel = new Backbone.Model({
           movies : this.context.movies.toJSON()
      });  

      this.context.dispatch("ReloadMoviesEvent",{data:sortedMoviesModel});
    };

    return SortMoviesCommand;

});
    
