define(['backbone'
], function(Backbone) {

     var LoadGenresCommand  = function(){};
     LoadGenresCommand.prototype.execute = function(){
         this.context.genres = new Backbone.Collection(MyApp.Genres);
         this.context.dispatch('onGenresLoaded',{data : MyApp.Genres});  
     };
     return LoadGenresCommand

});

