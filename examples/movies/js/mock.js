define([
  'jquery',
  'mockjax'
  ], function($) {
	'use strict';

    var movies = "{'a': 2}";

	var mock = function() {

        $.ajaxSetup({
          dataType: 'json'
        });

        $.mockjax({
           url: '/api/posts',
           dataType: 'json',
           responseText: movies
        });
      };

    return {
      start: mock
    };
});
