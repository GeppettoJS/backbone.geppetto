module.exports = function(grunt) {
  var _ = (grunt.utils || grunt.util)._,
    request = require('request'),
    wd = require('wd'),
    SauceTunnel = require('sauce-tunnel'),
    rqst = request.defaults({
      jar: false
    });

  var SauceStatus = function(user, key) {
    this.user = user;
    this.key = key;
    this.baseUrl = ["https://", this.user, ':', this.key, '@saucelabs.com', '/rest/v1/', this.user].join("");
  };

  SauceStatus.prototype.passed = function(jobid, status, callback) {
    var _body = JSON.stringify({
      "passed": status
    }),
      _url = this.baseUrl + "/jobs/" + jobid;
    rqst({
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: "PUT",
      url: _url,
      body: _body,
      json: true
    }, function() {
      callback();
    });
  };

  SauceStatus.prototype.result = function(jobid, data, callback) {
    var _body = JSON.stringify(data),
      _url = this.baseUrl + "/jobs/" + jobid;
    rqst({
      headers: {
        'content-type': 'application/json'
      },
      method: "PUT",
      url: _url,
      body: _body,
      json: true
    }, function() {
      callback();
    });
  };

  var TestRunner = function(user, key) {
    this.user = user;
    this.key = key;
    this.host = 'ondemand.saucelabs.com';
    this.port = 80;
    this.report = new SauceStatus(user, key);
  };

  TestRunner.prototype.forEachBrowser = function(configs, runner, saucify, concurrency, onTestComplete) {
    var me = this;
    return {
      testPages: function(pages, testTimeout, testInterval, testReadyTimeout, detailedError, callback) {
        function initBrowser(cfg) {
          var success = true;
          var results = [];

          function onPageTested(status, page, config, browser, cb) {
            var waitForAsync = false;
            this.async = function() {
              waitForAsync = true;
              return function(ret) {
                success = success && (typeof ret === "undefined" ? status : ret);
                cb();
              };
            };
            if (typeof onTestComplete === "function") {
              var ret = onTestComplete(status, page, config, browser);
              status = typeof ret === "undefined" ? status : ret;
            }
            if (!waitForAsync) {
              success = success && status;
              cb();
            }
          }

          return function(done) {
            var driver = wd.remote(me.host, me.port, me.user, me.key);
            grunt.verbose.writeln("Starting tests on browser configuration", cfg);
            driver.init(cfg, function(err, sessionId) {
              if (err) {
                grunt.log.error("[%s] Could not initialize browser for session", cfg.prefix, sessionId, cfg);
                success = false;
                me.report.passed(driver.sessionID, success, function() {
                  done(success);
                });
                return;
              }
              var finished = function(cb) {
                if (results.length > 0 && typeof saucify === 'function') {
                  me.report.result(driver.sessionID, saucify(results), function() {
                    cb(success);
                  });
                } else {
                  cb(success);
                }
              };
              (function testPage(j) {
                if (j >= pages.length) {
                  driver.quit(function() {
                    me.report.passed(driver.sessionID, success, function() {
                      finished(done);
                    });
                  });
                  return;
                }
                grunt.verbose.writeln("[%s] Testing page#%s %s at http://saucelabs.com/tests/%s", cfg.prefix, j, pages[j], driver.sessionID);
                driver.get(pages[j], function(err) {
                  if (err) {
                    grunt.log.error("[%s] Could not fetch page (%s)%s", cfg.prefix, j, pages[j]);
                    onPageTested(false, pages[j], cfg, driver, function() {
                      testPage(j + 1);
                    });
                    return;
                  }
                  driver.page = pages[j];
                  runner.call(me, driver, cfg, testTimeout, testInterval, testReadyTimeout, detailedError, function(status, obj) {
                    results.push(obj);
                    onPageTested(status, pages[j], cfg, driver, function() {
                      testPage(j + 1);
                    });
                  });
                });
              }(0));
            });
          };
        }

        var brwrs = [],
          colors = ['yellow', 'cyan', 'magenta', 'blue', 'green', 'red'],
          curr = 0,
          running = 0,
          res = true;
        _.each(configs, function(_c, i) {
          _c.prefix = _c.name || (_c.platform ? _c.platform + '::' : '') + _c.browserName + (_c.version ? '(' + _c.version + ')' : '');
          _c.prefix = _c.prefix[colors[i % colors.length]];
          brwrs.push(initBrowser(_c));
        });

        (function next(success) {
          if (typeof success !== 'undefined') {
            res = res && success;
            running--;
          }

          if (curr >= brwrs.length && running <= 0) {
            return callback(res);
          }

          if (running < concurrency && curr < brwrs.length) {
            brwrs[curr](next);
            curr++;
            running++;
            next();
          }
        }());
      }
    };
  };

  TestRunner.prototype.jasmineRunner = function(driver, cfg, testTimeout, testInterval, testReadyTimeout, detailedError, callback) {
    grunt.verbose.writeln("Starting Jasmine tests");
    driver.waitForElementByClassName('alert', testReadyTimeout, function() {
      driver.elementsByClassName('version', function(err, el) {
        if (err) {
          grunt.log.error("[%s] Could not read test result", cfg.prefix, err);
          grunt.log.error("[%s] More details about error at http://saucelabs.com/tests/%s", cfg.prefix, driver.sessionID);
          callback(false);
          return;
        }
        driver.text(el, function(err, versionText) {
          if (err) {
            grunt.log.error("[%s] Could not see test inside element", cfg.prefix, err);
            grunt.log.error("[%s] More details about error at http://saucelabs.com/tests/%s", cfg.prefix, driver.sessionID);

            callback(false);
            return;
          }

          var versionMatch = versionText.match(/[0-9]+(\.[0-9]+)*/);
          var version = versionMatch && versionMatch[0];
          grunt.verbose.writeln("[%s] Detected jasmine version %s", cfg.prefix, version);

          var descriptionResultParser = {
            "resultClass": "description",
            "success": /0 failures/,
            "fail": /([1-9][0-9]*)\s*failure/
          };
          var alertResultParser = {
            "resultClass": "alert",
            "success": /Passing/,
            "fail": /Failing/
          };
          var resultParser = {
            "1.2.0": descriptionResultParser,
            "1.3.0": alertResultParser,
            "1.3.1": alertResultParser
          };


          var showDetailedError = function(callback) {
            driver.elementById('details', function(err, detailEl) {
              driver.text(detailEl, function(err, detailText) {
                grunt.log.error("[%s] Error: %s", detailText, cfg.prefix);
                callback();
              });
            });
          };

          driver.elementsByClassName(resultParser[version].resultClass, function(err, els) {
            if (err) {
              grunt.log.error("[%s] Could not get element by id", cfg.prefix, err);
              grunt.log.error("[%s] More details about error at http://saucelabs.com/tests/%s", cfg.prefix, driver.sessionID);

              callback(false);
              return;
            }
            grunt.verbose.writeln("Fetched test result element, waiting for text inside it to change to complete");
            var el = els[0];
            var retryCount = 0;

            var fetchResults = function(cb, status) {
              driver.safeEval("jasmine.getJSReport ? jasmine.getJSReport() : null;", function(err, obj) {
                cb(status, obj);
              });
            };

            (function isCompleted() {
              driver.text(el, function(err, text) {
                grunt.log.subhead("\nTested %s", driver.page);
                grunt.log.writeln("Environment: %s", cfg.prefix);
                if (err) {
                  grunt.log.error("Could not see test inside element", err);
                  fetchResults(callback, false);
                } else if (retryCount * testInterval > testTimeout) {
                  grunt.log.error("Failed, waited for more than %s milliseconds", testTimeout);
                  fetchResults(callback, false);
                } else if (typeof text !== 'string') {
                  grunt.log.error('Result : Error. Text not defined when trying to fetch results %s', typeof text);
                  fetchResults(callback, false);
                } else if (text.match(resultParser[version].fail)) {
                  grunt.log.error("Result:  %s", text);
                  if (detailedError) {
                    return showDetailedError(function() {
                      fetchResults(callback, false);
                    });
                  }
                  fetchResults(callback, false);
                } else if (text.match(resultParser[version].success)) {
                  grunt.log.writeln("Result: %s", text.replace(/\n/g, ' '));
                  fetchResults(callback, true);
                } else if (++retryCount * testInterval <= testTimeout) {
                  grunt.verbose.writeln("[%s] %s. Still running, Time passed - %s of %s milliseconds", cfg.prefix, retryCount, testInterval * retryCount, testTimeout);
                  setTimeout(isCompleted, testInterval);
                }
                grunt.log.writeln("Test Video: http://saucelabs.com/tests/%s", driver.sessionID);
              });
            }());
          });
        });
      });
    });
  };

  TestRunner.prototype.jasmineSaucify = function(results) {
    var out = {'custom-data': {}};
    _.each(results, function (result, i) {
      if ( result !== null) {
        var keyName = i === 0 ? 'jasmine' : 'jasmine' + i;
        out['custom-data'][keyName] = result;
      }
    });
    return out;
  };

  TestRunner.prototype.qunitSaucify = function(results) {
    var _data = _.reduce(results, function(a, b) {
      if (a === null) {
        return b;
      } else {
        _.each(b, function(value, key, lst) {
          a[key] += lst[key];
        });
        return a;
      }
    }, null);
    return {
      'custom-data': {
        qunit: _data
      }
    };
  };

  TestRunner.prototype.yuiSaucify = function(results) {
    var out = {'custom-data': {}};
    _.each(results, function (result, i) {
      if ( result !== null) {
        var keyName = i === 0 ? 'yui' : 'yui' + i;
        out['custom-data'][keyName] = {
          failed: result.failed,
          passed: result.passed,
          total: result.total,
          runtime: result.duration
        };
      }
    });
    return out;
  };

  TestRunner.prototype.mochaSaucify = function(results) {
    var out = {'custom-data': {}};
    _.each(results, function (result, i) {
      if ( result !== null) {
        var keyName = i === 0 ? 'mocha' : 'mocha' + i;
        out['custom-data'][keyName] = {
          failed: result[2],
          passed: result[1],
          total: result[4],
          runtime: +result[3] * 1000
        };
      }
    });
    return out;
  };

  TestRunner.prototype.qunitRunner = function(driver, cfg, testTimeout, testInterval, testReadyTimeout, detailedError, callback) {
    var testResult = "qunit-testresult";
    grunt.verbose.writeln("[%s] Starting qunit tests for page", cfg.prefix);
    driver.waitForElementById(testResult, testReadyTimeout, function() {
      grunt.verbose.writeln("[%s] Test div found, fetching the test result element", cfg.prefix);
      driver.elementById(testResult, function(err, el) {
        if (err) {
          grunt.log.error("[%s] Could not read test result for %s", cfg.prefix, err, driver.page);
          grunt.log.error("[%s] More details at http://saucelabs.com/tests/%s", cfg.prefix, driver.page);
          callback(false);
          return;
        }
        grunt.verbose.writeln("[%s] Fetched test result element, waiting for text inside it to change to complete", cfg.prefix);
        var retryCount = 0;

        var showDetailedError = function(cb) {
          driver.elementById('qunit-tests', function(err, detailEl) {
            driver.text(detailEl, function(err, detailText) {
              grunt.log.error("\n%s", detailText);
              cb();
            });
          });
        };

        var fetchResults = function(cb, status) {
          driver.safeEval("window.global_test_results", function(err, obj) {
            cb(status, err || obj);
          });
        };

        (function isCompleted() {
          driver.text(el, function(err, text) {
            if (typeof text !== 'string'){
              grunt.log.error('Error - Could not read text to check if this was completed %s', typeof text);
              callback(false);
              return;
            }
            if (!text.match(/completed/) && ++retryCount * testInterval <= testTimeout) {
              grunt.verbose.writeln("[%s] %s. Still running, Time passed - %s of %s milliseconds", cfg.prefix, retryCount, testInterval * retryCount, testTimeout);
              setTimeout(isCompleted, testInterval);
              return;
            }

            // Test is now completed, so parse the results
            grunt.log.subhead('\nTested %s', driver.page);
            grunt.log.writeln('Environment: %s', cfg.prefix);
            if (err) {
              grunt.log.error("Could not see test results: %s", err.replace(/\n/g, ' '));
              fetchResults(callback, false);
              return;
            }
            if (retryCount * testInterval > testTimeout) {
              grunt.log.error("Timeout, waited for more than %s milliseconds", testTimeout);
              fetchResults(callback, false);
              return;
            }
            var x = text.split(/\n|of|,/);
            if (parseInt(x[1], 10) !== parseInt(x[2], 10)) {
              if (detailedError) {
                return showDetailedError(function() {
                  fetchResults(callback, false);
                });
              }
              fetchResults(callback, false);
            } else {
              grunt.log.ok("Result: %s", text.replace(/\n/g, '  '));
              fetchResults(callback, true);
            }
            grunt.log.writeln("Test Video: http://saucelabs.com/tests/%s", driver.sessionID);
          });
        }());
      });
    });
  };

  TestRunner.prototype.yuiRunner = function(driver, cfg, testTimeout, testInterval, testReadyTimeout, detailedError, callback) {
    grunt.verbose.writeln("[%s] Starting YUI tests for page", cfg.prefix);
    driver.waitForConditionInBrowser("YUI.YUITest.Runner.getResults() !=== null", testReadyTimeout, function() {
      grunt.verbose.writeln("[%s] Test results ready, fetching", cfg.prefix);
      driver.safeEval("YUI.YUITest.Runner.getResults()", function(err, json) {
        if (err) {
          grunt.log.error("[%s] Could not read test result for %s", cfg.prefix, err, driver.page);
          grunt.log.error("[%s] More details at http://saucelabs.com/tests/%s", cfg.prefix, driver.page);
          callback(false);
          return;
        }
        grunt.verbose.writeln("[%s] Fetched test results", cfg.prefix);

        var showDetailedError = function(cb) {
          var outputFailures = function(obj) {
            _.forOwn(obj, function (val, key, iobj) {
              if (_.isObject(val)) {
                return outputFailures(val);
              }
              if (val === 'fail' && key === 'result') {
                grunt.log.error("\n%s", iobj.message.replace(/\n/g, ' '));
              }
            });
          };
          outputFailures(json);
          cb();
        };

        if (typeof json !== 'object'){
          grunt.log.error('Error - Could not read test run results %s', typeof text);
          callback(false);
          return;
        }

        // Test is now completed, so parse the results
        grunt.log.subhead('\nTested %s', driver.page);
        grunt.log.writeln('Environment: %s', cfg.prefix);
        if (err) {
          grunt.log.error("Could not see test results: %s", err.replace(/\n/g, ' '));
          callback(false);
          return;
        }

        if (json.failed !== 0) {
          return showDetailedError(function () { callback(false, json); });
        }

        grunt.log.ok("Result: total: %s passed: %s failed: %s", json.total, json.passed, json.failed);
        grunt.log.writeln("Test Video: http://saucelabs.com/tests/%s", driver.sessionID);
        callback(true, json);
      });
    });
  };

  TestRunner.prototype.mochaRunner = function(driver, cfg, testTimeout, testInterval, testReadyTimeout, detailedError, callback) {
    var testResult = "mocha-stats",
        currentState = null,
        retryCount = 0;
    grunt.verbose.writeln("[%s] Starting mocha tests for page", cfg.prefix);
    driver.waitForElementById(testResult, testReadyTimeout, function() {
      grunt.verbose.writeln("[%s] Test div found, fetching the test results elements", cfg.prefix);
      driver.elementById(testResult, function(err, el) {
        if (err) {
          grunt.log.error("[%s] Could not read test result for %s", cfg.prefix, err, driver.page);
          grunt.log.error("[%s] More details at http://saucelabs.com/tests/%s", cfg.prefix, driver.page);
          callback(false);
          return;
        }
        grunt.verbose.writeln("[%s] Fetched test result element, waiting for text inside it show complete status", cfg.prefix);
        var showDetailedError = function(cb) {
          driver.elementById(testResult, function(err, detailEl) {
            driver.text(detailEl, function(err, detailText) {
              grunt.log.error("\n%s", detailText);
              cb();
            });
          });
        };

        var fetchResults = function(cb, status) {
          cb(status, err || currentState);
        };

        driver.safeEval("mocha.suite.total()", function(err, totalResults) {
          (function isCompleted() {
            driver.text(el, function(err, text) {
              if (typeof text !== 'string'){
                grunt.log.error('Error - Could not read text to check if this was completed %s', typeof text);
                callback(false);
                return;
              }

              // extract values from text, ex: "passes: 5pending: 0failures: 0duration: 0.01s"
              try {
                var pending = 0;
                try {
                  pending = parseInt(text.match(/pending: (\d+)/)[1], 10);   // number of pending tests
                } catch (e) {
                  pending = 0;
                }

                currentState = [
                  text,
                  parseInt(text.match(/passes: (\d+)/)[1], 10),    // number of tests that pass
                  parseInt(text.match(/failures: (\d+)/)[1], 10),  // number of tests that fail
                  pending,
                  text.match(/duration: ([\d,.]*)/)[1]             // duration, just the number
                ];
                currentState.push(totalResults);
              } catch(err) {
                grunt.log.error('Error - Could not extract passes, failures, or duration from text %s', err );
                callback(false);
                return;
              }
              
              if ((!currentState || currentState[1] + currentState[2] + currentState[3] < totalResults) && ++retryCount * testInterval <= testTimeout) {
                grunt.verbose.writeln("[%s] %s. Still running, Time passed - %s of %s milliseconds", cfg.prefix, retryCount, testInterval * retryCount, testTimeout);
                setTimeout(isCompleted, testInterval);
                return;
              }

              // Test is now completed, so parse the results
              grunt.log.subhead('\nTested %s', driver.page);
              grunt.log.writeln('Environment: %s', cfg.prefix);
              if (err) {
                grunt.log.error("Could not see test results: %s", err.replace(/\n/g, ' '));
                fetchResults(callback, false);
                return;
              }
              if (retryCount * testInterval > testTimeout) {
                grunt.log.error("Timeout, waited for more than %s milliseconds", testTimeout);
                fetchResults(callback, false);
                return;
              }
              if (+currentState[2] !== 0) {
                if (detailedError) {
                  return showDetailedError(function() {
                    fetchResults(callback, false);
                  });
                }
                fetchResults(callback, false);
              } else {
                grunt.log.ok("Result: %s", text.replace(/\n/g, '  '));
                fetchResults(callback, true);
              }
              grunt.log.writeln("Test Video: http://saucelabs.com/tests/%s", driver.sessionID);
            });
          }());
        });

        


      });
    });
  };

  var defaultsObj = {
    username: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    identifier: Math.floor((new Date()).getTime() / 1000 - 1230768000).toString(),
    tunneled: true,
    testTimeout: (1000 * 60 * 5),
    tunnelTimeout: 120,
    testInterval: 1000 * 5,
    testReadyTimeout: 1000 * 5,
    onTestComplete: function() {

    },
    detailedError: false,
    testname: "",
    tags: [],
    browsers: [{}]
  };

  function defaults(data) {
    var result = data;
    result.pages = result.url || result.urls;
    if (!_.isArray(result.pages)) {
      result.pages = [result.pages];
    }

    _.map(result.browsers, function(d) {
      return _.extend(d, {
        'name': result.testname,
        'tags': result.tags,
        'build': result.build,
        'tunnel-identifier': result.tunneled ? result.identifier : ''
      });
    });
    result.concurrency = result.concurrency || result.browsers.length;
    return result;
  }

  function configureLogEvents(tunnel) {
    var methods = ['write', 'writeln', 'error', 'ok', 'debug'];
    methods.forEach(function (method) {
      tunnel.on('log:'+method, function (text) {
        grunt.log[method](text);
      });
      tunnel.on('verbose:'+method, function (text) {
        grunt.verbose[method](text);
      });
    });
  }

  grunt.registerMultiTask('saucelabs-jasmine', 'Run Jasmine test cases using Sauce Labs browsers', function() {
    var done = this.async(),
      arg = defaults(this.options(defaultsObj), this.data.browsers);
    var tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, arg.tunneled, arg.tunnelTimeout);
    configureLogEvents(tunnel);
    grunt.log.writeln("=> Connecting to Saucelabs ...");
    if (this.tunneled) {
      grunt.verbose.writeln("=> Starting Tunnel to Sauce Labs".inverse.bold);
    }
    tunnel.start(function(isCreated) {
      if (!isCreated) {
        done(false);
        return;
      }
      grunt.log.ok("Connected to Saucelabs");
      var test = new TestRunner(arg.username, arg.key);
      test.forEachBrowser(arg.browsers, test.jasmineRunner, test.jasmineSaucify, arg.concurrency, arg.onTestComplete).testPages(arg.pages, arg.testTimeout, arg.testInterval, arg.testReadyTimeout, arg.detailedError, function(status) {
        grunt.log[status ? 'ok' : 'error']("All tests completed with status %s", status);
        tunnel.stop(function() {
          done(status);
        });
      });
    });
  });

  grunt.registerMultiTask('saucelabs-qunit', 'Run Qunit test cases using Sauce Labs browsers', function() {
    var done = this.async(),
      arg = defaults(this.options(defaultsObj));
    var tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, arg.tunneled, arg.tunnelTimeout);
    configureLogEvents(tunnel);
    grunt.log.writeln("=> Connecting to Saucelabs ...");
    if (this.tunneled) {
      grunt.verbose.writeln("=> Starting Tunnel to Sauce Labs".inverse.bold);
    }
    tunnel.start(function(isCreated) {
      if (!isCreated) {
        done(false);
        return;
      }
      grunt.log.ok("Connected to Saucelabs");
      var test = new TestRunner(arg.username, arg.key);
      test.forEachBrowser(arg.browsers, test.qunitRunner, test.qunitSaucify, arg.concurrency, arg.onTestComplete).testPages(arg.pages, arg.testTimeout, arg.testInterval, arg.testReadyTimeout, arg.detailedError, function(status) {
        grunt.log[status ? 'ok' : 'error']("All tests completed with status %s", status);
        tunnel.stop(function() {
          done(status);
        });
      });
    });
  });

  grunt.registerMultiTask('saucelabs-yui', 'Run YUI test cases using Sauce Labs browsers', function() {
    var done = this.async(),
      arg = defaults(this.options(defaultsObj));
    var tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, arg.tunneled, arg.tunnelTimeout);
    grunt.log.writeln("=> Connecting to Saucelabs ...");
    if (this.tunneled) {
      grunt.verbose.writeln("=> Starting Tunnel to Sauce Labs".inverse.bold);
    }
    tunnel.start(function(isCreated) {
      if (!isCreated) {
        done(false);
        return;
      }
      grunt.log.ok("Connected to Saucelabs");
      var test = new TestRunner(arg.username, arg.key);
      test.forEachBrowser(arg.browsers, test.yuiRunner, test.yuiSaucify, arg.concurrency, arg.onTestComplete).testPages(arg.pages, arg.testTimeout, arg.testInterval, arg.testReadyTimeout, arg.detailedError, function(status) {
        grunt.log[status ? 'ok' : 'error']("All tests completed with status %s", status);
        tunnel.stop(function() {
          done(status);
        });
      });
    });
  });

  grunt.registerMultiTask('saucelabs-mocha', 'Run Mocha test cases using Sauce Labs browsers', function() {
    var done = this.async(),
      arg = defaults(this.options(defaultsObj));
    var tunnel = new SauceTunnel(arg.username, arg.key, arg.identifier, arg.tunneled, arg.tunnelTimeout);
    grunt.log.writeln("=> Connecting to Saucelabs ...");
    if (this.tunneled) {
      grunt.verbose.writeln("=> Starting Tunnel to Sauce Labs".inverse.bold);
    }
    tunnel.start(function(isCreated) {
      if (!isCreated) {
        done(false);
        return;
      }
      grunt.log.ok("Connected to Saucelabs");
      var test = new TestRunner(arg.username, arg.key);
      test.forEachBrowser(arg.browsers, test.mochaRunner, test.mochaSaucify, arg.concurrency, arg.onTestComplete).testPages(arg.pages, arg.testTimeout, arg.testInterval, arg.testReadyTimeout, arg.detailedError, function(status) {
        grunt.log[status ? 'ok' : 'error']("All tests completed with status %s", status);
        tunnel.stop(function() {
          done(status);
        });
      });
    });
  });
};
