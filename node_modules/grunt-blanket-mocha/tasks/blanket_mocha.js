// grunt-blanket-mocha 0.2.0
//
// Copyright (C) 2013 Dave Cadwallader, Model N, Inc.
// Distributed under the MIT License
//
// Documentation and full license available at:
// https://github.com/ModelN/grunt-blanket-qunit
//
// Based on grunt-mocha
// https://github.com/kmiyashiro/grunt-mocha
// Copyright (c) 2012 "Cowboy" Ben Alman, contributors


'use strict';

module.exports = function(grunt) {

  var ok = true;

  var _ = grunt.util._;

  // Nodejs libs.
  var path = require('path');
  var EventEmitter = require('events').EventEmitter;

  // External lib.
  var phantomjs = require('grunt-lib-phantomjs').init(grunt);
  var reporters = require('mocha').reporters;

  // Helpers
  var helpers = require('../support/mocha-helpers');

  var reporter;

    var status, coverageThreshold, modulePattern, modulePatternRegex, excludedFiles;
    var totals = {
        totalLines: 0,
        coveredLines: 0,
        moduleTotalStatements : {},
        moduleTotalCoveredStatements : {}
    };

  // Growl is optional
  var growl;
  try {
    growl = require('growl');
  } catch(e) {
    growl = function(){};
    grunt.verbose.write('Growl not found, \'npm install growl\' for Growl support');
  }

  // Get an asset file, local to the root of the project.
  var asset = path.join.bind(null, __dirname, '..');

    var printPassFailMessage = function(name, numCovered, numTotal, threshold, printPassing) {
        var percent = (numCovered / numTotal) * 100;
        var pass = (percent >= threshold);

        //If not passed, check if file is marked for manual exclusion. Else, fail it.
        var result = pass ? "PASS" : (  excludedFiles.indexOf(name) === -1 /*File not found*/  ? "FAIL" : "SKIP");

        var percentDisplay = Math.floor(percent);
        if (percentDisplay < 10) {
            percentDisplay = "  " + percentDisplay;
        } else if (percentDisplay < 100) {
            percentDisplay = " " + percentDisplay;
        }

        var msg = result + " [" + percentDisplay + "%] : " + name + " (" + numCovered + " / " + numTotal + ")";

        status.blanketTotal++;
        if (pass) {
            status.blanketPass++;
            if (printPassing || grunt.option('verbose')) {
                grunt.log.writeln(msg.green);
            }
        } else if (result ===  "SKIP"){ //Visually mark that these have been skipped.
             grunt.log.writeln(msg.magenta);
        } else {
            ok = false;
            status.blanketFail++;
            grunt.log.writeln(msg.red);
        }

    };


  // Manage runners listening to phantomjs
  var phantomjsEventManager = (function() {
    var listeners = {};
    var suites = [];

        phantomjs.on('blanket:done', function() {
            phantomjs.halt();
        });

        phantomjs.on('blanket:fileDone', function(thisTotal, filename) {

            if (status.blanketPass === 0 && status.blanketFail === 0 ) {
                grunt.log.writeln();
            }

            var coveredLines = thisTotal[0];
            var totalLines = thisTotal[1];

            printPassFailMessage(filename, coveredLines, totalLines, coverageThreshold);

            totals.totalLines += totalLines;
            totals.coveredLines += coveredLines;

            if (modulePatternRegex) {
                var moduleName = filename.match(modulePatternRegex)[1];
                if(!totals.moduleTotalStatements.hasOwnProperty(moduleName)) {
                    totals.moduleTotalStatements[moduleName] = 0;
                    totals.moduleTotalCoveredStatements[moduleName] = 0;
                }

                totals.moduleTotalStatements[moduleName] += totalLines;
                totals.moduleTotalCoveredStatements[moduleName] += coveredLines;
            }
        });

    // Hook on Phantomjs Mocha reporter events.
    phantomjs.on('mocha.*', function(test) {
      var name, fullTitle, slow, err;
      var evt = this.event.replace('mocha.', '');

      // Expand test values (and façace the Mocha test object)
      if (test) {
        fullTitle = test.fullTitle;
        test.fullTitle = function() {
          return fullTitle;
        };

        slow = this.slow;
        test.slow = function() {
          return slow;
        };

        test.parent = suites[suites.length - 1] || null;

        err = test.err;
      }

      if (evt === 'suite') {
          suites.push(test);
      } else if (evt === 'suite end') {
          suites.pop(test);
      }

      // Trigger events for each runner listening
      for (name in listeners) {
        listeners[name].emit.call(listeners[name], evt, test, err);
      }
    });

    return {
      add: function(name, runner) {
        listeners[name] = runner;
      },
      remove: function(name) {
        delete listeners[name];
      }
    };
  }());

  // Built-in error handlers.
  phantomjs.on('fail.load', function(url) {
    phantomjs.halt();
    grunt.verbose.write('Running PhantomJS...').or.write('...');
    grunt.log.error();
    grunt.warn('PhantomJS unable to load "' + url + '" URI.', 90);
  });

    phantomjs.on("error.onError", function(msg, trace) {
        grunt.log.error(msg);
        grunt.log.error(trace);
    });

  phantomjs.on('fail.timeout', function() {
    phantomjs.halt();
    grunt.log.writeln();
    grunt.warn('PhantomJS timed out, possibly due to a missing Mocha run() call.', 90);
  });

  // Debugging messages.
  // phantomjs.on('debug', grunt.log.debug.bind(grunt.log, 'phantomjs'));

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('blanket_mocha', 'Run Mocha unit tests in a headless PhantomJS instance.', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      // Output console.log calls
      log: false,
      // Mocha reporter
      reporter: 'Dot',
      // Default PhantomJS timeout.
      timeout: 5000,
      // Mocha-PhantomJS bridge file to be injected.
      inject: asset('phantomjs/bridge.js'),
      // Main PhantomJS script file
      phantomScript: asset('phantomjs/main.js'),
      // Explicit non-file URLs to test.
      urls: [],
      // Fail with grunt.warn on first test failure
      bail: false
    });

        status = {blanketTotal: 0, blanketPass: 0, blanketFail: 0};
        coverageThreshold = grunt.option('threshold') || options.threshold;
        var grep = grunt.option('grep');
        options.mocha = options.mocha || {};

        //Get the array of excludedFiles
        //Users should be able to define it in the command-line as an array or include it in the test file.
        excludedFiles =  grunt.option('excludedFiles') || options.excludedFiles || [];

        if (grep) {
            options.mocha.grep = grep;
        }

    // console.log pass-through.
    if (options.log) {
      phantomjs.on('console', grunt.log.writeln.bind(grunt.log));
    }

    // Clean Phantomjs options to prevent any conflicts
    var PhantomjsOptions = _.omit(options, 'reporter', 'urls');

    var configStr = JSON.stringify(PhantomjsOptions, null, '  ');
    grunt.verbose.writeln('Additional configuration: ' + configStr);

    // Combine any specified URLs with src files.
    var urls = options.urls.concat(this.filesSrc);

    // Remember all stats from all tests
    var testStats = [];

    // This task is asynchronous.
    var done = this.async();

    // Process each filepath in-order.
    grunt.util.async.forEachSeries(urls, function(url, next) {
      grunt.log.writeln('Testing: ' + url);

      // create a new mocha runner façade
      var runner = new EventEmitter();
      phantomjsEventManager.add(url, runner);

      // Clear runner event listener when test is over
      runner.on('end', function() {
        phantomjsEventManager.remove(url);
      });

      // Set Mocha reporter
      var Reporter = null;
      if (reporters[options.reporter]) {
        Reporter = reporters[options.reporter];
      }
      else {
        // Resolve external reporter module
        var p;
        try {
          p = require.resolve(options.reporter);
        }
        catch (e) {
          // Resolve to local path
          p = path.resolve(options.reporter);
        }
        if (p) {
          try {
            Reporter = require(p);
          }
          catch (e) { }
        }
      }
      if (Reporter === null) {
        grunt.fatal('Specified reporter is unknown or unresolvable: ' + options.reporter);
      }
      reporter = new Reporter(runner);

      // Launch PhantomJS.
      phantomjs.spawn(url, {
        // Exit code to use if PhantomJS fails in an uncatchable way.
        failCode: 90,
        // Additional PhantomJS options.
        options: PhantomjsOptions,
        // Do stuff when done.
        done: function(err) {
          var stats = runner.stats;
          testStats.push(stats);

          if (err) {
            // Show Growl notice
            // @TODO: Get an example of this
            // growl('PhantomJS Error!');

            // If there was a PhantomJS error, abort the series.
            grunt.fatal(err);
            done();
          } else {
            // If failures, show growl notice
            if (stats.failures > 0) {
              var reduced = helpers.reduceStats([stats]);
              var failMsg = reduced.failures + '/' + reduced.tests +
                ' tests failed (' + reduced.duration + 's)';

              // Show Growl notice, if avail
              growl(failMsg, {
                image: asset('growl/error.png'),
                title: 'Failure in ' + grunt.task.current.target,
                priority: 3
              });

              // Bail tests if bail option is true
              if (options.bail) grunt.warn(failMsg);
            }

            // Process next file/url
            next();
          }
        }
      });
    },
    // All tests have been run.
    function() {

                    grunt.log.writeln();
                    grunt.log.writeln("Per-File Coverage Results: (" + coverageThreshold + "% minimum)");

                    if (status.blanketFail > 0) {
                        var failMsg = "FAIL : " + (status.blanketFail + "/" + status.blanketTotal + " files failed coverage");
                        grunt.log.write(failMsg.red);
                        grunt.log.writeln();
                        ok = false;
                    } else {
                        var blanketPassMsg = "PASS : " + status.blanketPass + " files passed coverage ";
                        grunt.log.write(blanketPassMsg.green);
                        grunt.log.writeln();
                    }

                    var moduleThreshold = grunt.option('moduleThreshold') || options.moduleThreshold;

                    if (moduleThreshold) {

                        grunt.log.writeln();

                        grunt.log.writeln("Per-Module Coverage Results: (" + moduleThreshold + "% minimum)");

                        if (modulePatternRegex) {
                            for (var thisModuleName in totals.moduleTotalStatements) {
                                if (totals.moduleTotalStatements.hasOwnProperty(thisModuleName)) {

                                    var moduleTotalSt = totals.moduleTotalStatements[thisModuleName];
                                    var moduleTotalCovSt = totals.moduleTotalCoveredStatements[thisModuleName];

                                    printPassFailMessage(thisModuleName, moduleTotalCovSt, moduleTotalSt, moduleThreshold, /*printPassing*/true);
                                }
                            }
                        }
                    }

                    var globalThreshold = grunt.option('globalThreshold') || options.globalThreshold;

                    if (globalThreshold) {
                        grunt.log.writeln();
                        grunt.log.writeln("Global Coverage Results: (" + globalThreshold + "% minimum)");
                        printPassFailMessage("global", totals.coveredLines, totals.totalLines, globalThreshold, /*printPassing*/true);
                    }
                    grunt.log.writeln();

                    grunt.log.write("Unit Test Results: ");

      var stats = helpers.reduceStats(testStats);

      if (stats.failures === 0) {
        var okMsg = stats.tests + ' specs passed!' + ' (' + stats.duration + 's)';

        growl(okMsg, {
          image: asset('growl/ok.png'),
          title: 'Tests passed',
          priority: 3
        });

        grunt.log.write(okMsg.green);
        grunt.log.writeln();
      } else {
          ok = false;
          var failMsg = stats.failures + '/' + stats.tests + ' tests failed (' +
          stats.duration + 's)';

        // Show Growl notice, if avail
        growl(failMsg, {
          image: asset('growl/error.png'),
          title: 'Failure in ' + grunt.task.current.target,
          priority: 3
        });

        grunt.log.write(failMsg.red);
        grunt.log.writeln();
      }

      if (!ok) {
        grunt.warn("Issues were found.");
      } else {
        grunt.log.ok("No issues found.");
      }

      // Async test done
      done();
    });
  });
};