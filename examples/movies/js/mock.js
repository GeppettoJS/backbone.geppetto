define([
  'jquery',
  'mockjax'
  ], function($) {
	'use strict';

    var movies = [{
       image : 'http://placekitten.com/g/800/600',
       title: 'The Avengers',
       rating: 3,
       genres:['Action','Adventure','Thriller','Sci-Fi']
     },
     {
       image : 'http://placekitten.com/800/600',
       title: 'Avatar',
       rating: 5,
       genres:['Action','Sci-Fi']
     },
     {
       image : 'http://placekitten.com/g/800/600',
       title: 'Whatever Works',
       rating: 4,
       genres:['Comedy']
    }];

    var genres = [
          {
            title:'Action',
            count:2
          },{
            title:'Adventure',
            count:1
          },{
            title:'Thriller',
            count:1
          },{
            title:'Sci-Fi',
            count:2
          },{
            title:'Comedy',
            count:1
          }
    ];

	var mock = function() {

        $.ajaxSetup({
          dataType: 'json'
        });

        $.mockjax({
           url: '/api/movies',
           dataType: 'json',
           responseText: JSON.stringify(movies)
        });

        $.mockjax({
           url: '/api/genres',
           dataType: 'json',
           responseText: JSON.stringify(genres)
        });
      };

    return {
      start: mock
    };
});
