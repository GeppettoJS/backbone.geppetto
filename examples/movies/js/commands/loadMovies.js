define(['backbone',
        'mock'
], function(Backbone, Mock) {

    var LoadMoviesCommand  = function(){};

    Mock.start();

    LoadMoviesCommand.prototype.execute = function(){
        this.context.movies = new Backbone.Collection();
        this.context.movies.fetch({success: function(movies) {
          this.context.dispatch('onMoviesLoaded', {data : movies});  
        }
      });
    };

    return LoadMoviesCommand;
});

