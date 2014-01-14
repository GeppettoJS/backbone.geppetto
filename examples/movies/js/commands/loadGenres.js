define([
  'backbone',
  'collections/genres'
], function(Backbone, Genres) {

     var LoadGenresCommand  = function(){};
     LoadGenresCommand.prototype.execute = function(){
       this.context.genres = new Genres()

       var that = this;
       this.context.genres.fetch({success: function(results) {
           that.context.dispatch('onGenresLoaded', { data : results});
         }
       });
     };

     return LoadGenresCommand

});

