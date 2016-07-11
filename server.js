#!/usr/bin/env node
var join = require('path').join,
    fs = require('fs'),
    readdirSync = fs.readdirSync,
    lstatSync = fs.lstatSync,
    format = require('url').format,
    log = console.log,
    error = console.error,
    express = require('express'),
    morgan = require('morgan');


var cfg;
try {
  cfg = require('./config');
} catch (e) {
  cfg = {};
}

var DEFAULT_PORT = 8088,
    DEFAULT_HOST = '0.0.0.0';

cfg.port = cfg.port || DEFAULT_PORT;
cfg.hostname = cfg.hostname || DEFAULT_HOST;


function returnLoggerIfEnabled(type) {
  if (cfg.logging === false) return nullMiddleware;
  else return morgan(type);
  function nullMiddleware(err, req, res, next) { next(); }
}

express()
  .use(returnLoggerIfEnabled('combined'))
  .use('/', serveDir())
  .listen(cfg.host, cfg.port, function () {
    log('Site available at ' + format({
      hostname: cfg.hostname,
      port: cfg.port,
      protocol: 'http:',
      slashes: 'false'
    }));
  });

function serveDir(r, lastPath) {
  if (!r) r = express.Router();
  if (!lastPath) lastPath = '/';
  var entirePath = join(__dirname, lastPath);
  r.use(lastPath, express.static(entirePath));
  readdirSync(entirePath).forEach(function (v) {
    try {
      if (lstatSync(join(entirePath, v)).isDirectory()) {
        serveDir(r, join(lastPath, v));
      }
    } catch (e) {
      error(e.stack);
    }
  });
  return r;
}
