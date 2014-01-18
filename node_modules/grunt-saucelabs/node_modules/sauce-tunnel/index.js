/* npm */
var colors = require('colors');
var request = require('request').defaults({jar:false});

/* core */
var util = require('util');
var proc = require('child_process');
var EventEmitter = require('events').EventEmitter;

module.exports = SauceTunnel;

function SauceTunnel(user, key, identifier, tunneled, tunnelTimeout) {
  EventEmitter.call(this)
  this.user = user;
  this.key = key;
  this.identifier = identifier;
  this.tunneled = tunneled;
  this.tunnelTimeout = tunnelTimeout;
  this.baseUrl = ["https://", this.user, ':', this.key, '@saucelabs.com', '/rest/v1/', this.user].join("");
};

util.inherits(SauceTunnel, EventEmitter);

SauceTunnel.prototype.openTunnel = function(callback) {
  var me = this;
  var args = ["-jar", __dirname + "/vendor/Sauce-Connect.jar", this.user, this.key, "-i", this.identifier];
  this.proc = proc.spawn('java', args);
  var calledBack = false;

  this.proc.stdout.on('data', function(d) {
    var data = typeof d !== 'undefined' ? d.toString() : '';
    if (typeof data === 'string' && !data.match(/^\[-u,/g)) {
      me.emit('verbose:debug', data.replace(/[\n\r]/g, ''));
    }
    if (typeof data === 'string' && data.match(/Connected\! You may start your tests/)) {
      me.emit('verbose:ok', '=> Sauce Labs Tunnel established');
      if (!calledBack) {
        calledBack = true;
        callback(true);
      }
    }
  });

  this.proc.stderr.on('data', function(data) {
    me.emit('log:error', data.toString().replace(/[\n\r]/g, ''));
  });

  this.proc.on('exit', function(code) {
    me.emit('verbose:ok', 'Sauce Labs Tunnel disconnected ', code);
    if (!calledBack) {
      calledBack = true;
      callback(false);
    }
  });
};

SauceTunnel.prototype.getTunnels = function(callback) {
  request({
    url: this.baseUrl + '/tunnels',
    json: true
  }, function(err, resp, body) {
    callback(body);
  });
};

SauceTunnel.prototype.killAllTunnels = function(callback) {
  if (!this.tunneled) {
    return callback();
  }
  var me = this;

  me.emit('verbose:debug', 'Trying to kill all tunnels');
  this.getTunnels(function(tunnels) {
    (function killTunnel(i) {
      if (i >= tunnels.length) {
        setTimeout(callback, 1000 * 5);
        return;
      }
      me.emit('log:writeln', util.format("=> Killing tunnel %s", tunnels[i]));
      request({
        method: "DELETE",
        url: me.baseUrl + "/tunnels/" + tunnels[i],
        json: true
      }, function() {
        killTunnel(i + 1);
      });
    }(0));
  });
};

SauceTunnel.prototype.start = function(callback) {
  var me = this;
  if (!this.tunneled) {
    return callback(true);
  }
  this.getTunnels(function(tunnels) {
    if (!tunnels) {
      me.emit('verbose:error', "=> Could not get tunnels for Sauce Labs. Still continuing to try connecting to Sauce Labs".inverse);
    }
    if (tunnels && tunnels.length > 0) {
      me.emit('log:writeln', util.format("=> Looks like there are existing tunnels to Sauce Labs, need to kill them. TunnelID:%s", tunnels));
      (function waitForTunnelsToDie(retryCount) {
        if (retryCount > 5) {
          me.emit('verbose:writeln', util.format("=> Waited for %s retries, now trying to shut down all tunnels and try again", retryCount));
          me.killAllTunnels(function() {
            me.start(callback);
          });
        } else {
          me.emit('verbose:debug', util.format("=> %s. Sauce Labs tunnels already exist, will try to connect again %s milliseconds.", retryCount, me.tunnelTimeout / 5));
          setTimeout(function() {
            waitForTunnelsToDie(retryCount + 1);
          }, me.tunnelTimeout / 5);
        }
      }(0));
    } else {
      me.emit('verbose:writeln', "=> Sauce Labs trying to open tunnel".inverse);
      me.openTunnel(function(status) {
        callback(status);
      });
    }
  });
};

SauceTunnel.prototype.stop = function(callback) {
  if (this.proc) {
    this.proc.kill();
  }
  this.killAllTunnels(function() {
    callback();
  });
};
