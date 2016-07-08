(function () {
  "use strict";
  var $ = this.$;
  var util = (function util () {
    var hasOwnProperty =  Object.prototype.hasOwnProperty,
        getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    function keysShim(o) {
      var retval = [];
      for (var i in o) {
        if (hasOwnProperty.call(o, i)) {
          retval.push(o[i]);
        }
      }
      return retval;
    }
    var keys = Object.keys || keysShim;
    function assignShim(dest, src) {
      keys(src).forEach(function (v) {
        dest[v] = src[v];
      });
      return dest;
    }
    var assign = Object.assign || assignShim;
    function forOwn(obj, cb, thisArg) {
      try {
        keys(obj).forEach(function (v, i) {
          if (cb.call(thisArg, obj[v], v, i, obj) === false) throw Error();
        });
        return true;
      } catch (e) { return false; }
    }
    function mapOwn(obj, cb, thisArg) {
      var retval = {};
      forOwn(obj, function () {
        retval[key] = cb.apply(thisArg, arguments);
      });
      return retval;
    }
    function createNative(proto, o) {
      return Object.create(proto, mapOwn(o, function (key, value, i, obj) {
        return getOwnPropertyDescriptor(obj, key);
      }));
    }
    function createShim (proto, o) {
      function Type() {}
      Type.prototype = proto;
      var retval = new Type();
      return assign(retval, o);
    }
    var create = Object.create && Object.getOwnPropertyDescriptor && createNative || createShim;
    return {
      keys: keys,
      create: create,
      assign: assign,
      mapOwn: mapOwn,
      forOwn: forOwn
    };
  })();
  var Application = (function ($) {
    function Application(config) {
      if (!(this instanceof config)) return new Application(config);
      this.config = config;
    }
    Application.prototype = {
      start: function () {
        this.link();
      },
      link: function () {
        this.el = $('#application');
      }
    };
  })($);
  window.util = util;
  window.Application = Application;
}).call(this);
