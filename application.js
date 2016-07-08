(function () {
  "use strict";
  var $ = this.$;
  var Deferred = $.Deferred;
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
      forOwn(obj, function (value, key) {
        retval[key] = cb.apply(thisArg, arguments);
      });
      return retval;
    }
    function createNative(proto, o) {
      return Object.create(proto, mapOwn(o, function (value, key, i, obj) {
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
  var Component = (function ($) {
    Component.prototype = util.assign({
      _render: function () {
        if (!this._parent) {
          this.link();
        } else {
          var idx;
          if ((idx = this._parent._children.indexOf(this)) !== -1) {
            this.link(this._parent, idx);
          } else throw Error('Child not in shadow DOM');
        }
        if (this._parent) {
          this._parent.el.append(this.compile());
          var self = this;
          this._children.forEach(function (v) {
            v.render();
          });
        }
      },
      _compile: function () {
        return '<' + this.nodeType + (this.selfClosing ? ' />' : '></' + this.nodeType '>');
      },
      _link: function (parent, i) {
        if (!this._parent) {
          return this.el = $(this.rootSelector);
        }
        this.el = parent.el.children().eq(i);
        var self = this;
        if (this.classes) {
          this.classes.forEach(function (v) {
            this.el.addClass(v);
          });
        }
      }
    }, {
      render: function () { this._render(); },
      compile: function () { this._compile(); },
      link: function () { this._link(); }
    });
    function Component(config) {
      if (this instanceof Component) return Component(config);
      ApplicationComponent.prototype = util.create(Component.prototype, config); 
      function ApplicationComponent(model) {
        var component = util.create(ApplicationComponent.prototype, {
          model: model
        });
      }
      return ApplicationComponent;
    }
    return Component;
  })($);
      
  var Application = (function ($) {
    function turtleDOMString(id) {
      return '<div class="turtle-slide" id="' + id + '"></div>';
    }
    TurtleModel.prototype = {};
    function TurtleModel(name, color, weapon, description, imageSource) {
      return util.create(TurtleModel.prototype, {
        name: name,
        color: color,
        weapon: weapon,
        description: description,
        imageSource: imageSource
      });
    }
    function fetchAndParseXML() {
      var deferred = Deferred();
      $.get({
        url: '/TMNT.xml',
        dataType: 'xml',
        success: function (result) {
          var $doc = $.parseXML(result);
          var turtles = $doc('turtle');
          var parseResult = [];
          turtles.each(function () {
            parseResult.push(TurtleModel(
              $(this).find('name').text(),
              $(this).find('color').text(),
              $(this).find('weapon').text(),
              $(this).find('description').text(),
              $(this).find('imageSource').text()
            ));
          });
          deferred.resolve(parseResult);
        }
      });
      return deferred;
    }
    function render() {
      if (this._parent) {
        this._parent.el.append(this._compile());
      }
      this._link();
      this._children
    function TurtleComponent(model) {
      if (!(this instanceof TurtleComponent)) return new TurtleComponent(model);
      this._model = model;
    }
    TurtleComponent.prototype = {
      render: function () {
        this._parent.el.append(this._compile());
      },
      _compile: function () {
        
    };
    function Application(config) {
      if (!(this instanceof config)) return new Application(config);
      EventTarget.call(this);
      this.config = config;
      this._children = [];
    }
    Application.prototype = util.create(EventTarget.prototype, {
      start: function () {
        this._link();
        this._resolve();
        var self = this;
        this._resolve().then(function (turtles) {
          self._onTurtlesLoad(turtles);
        });
      },
      _resolve: fetchAndParseXML,
      _link: function () {
        this.el = $('#application');
      },
      addChildComponent: function (v) {
        v._parent = this;
        this._children.push(v);
      },
      _onTurtlesLoad: function (turtles) {
        this.el.html('');
        var self = this;
        turtles.forEach(function (v) {
          self.addChildComponent(TurtleComponent(v));
        });
        this.render();
      },
      render: function () {
        this._children.forEach(function (v) {
          v.render();
        });
      },
      children: function () {
        return this._children;
      },
    });
  })($);
  window.util = util;
  window.Application = Application;
}).call(this);

Application().start();
