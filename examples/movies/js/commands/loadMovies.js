define(['backbone',
        'collections/movies',
        'mock'
], function(Backbone, Movies, Mock) {

    var LoadMoviesCommand  = function(){};

    Mock.start();

    LoadMoviesCommand.prototype.execute = function(){
      this.context.movies = new Movies();
      
      var that = this;
      this.context.movies.fetch({success: function(movies) {
          that.context.dispatch('onMoviesLoaded', {data : movies});  
        }
      });
    };

    return LoadMoviesCommand;
});

