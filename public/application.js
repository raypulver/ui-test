(function () {
  "use strict";
  var $ = this.$;
  var Deferred = $.Deferred;
  var util = (function () {
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

  var Component = (function () {
    function link(root, i) {
      this.el = root.children().eq(i);
    }
    function render(root, i) {
      if (root) root.append(this.compile());
      this.link(root, i);
    }
    function compile(root) {
      throw Error('compile must be overridden');
    }
    function Component(model) {
      if (!(this instanceof Component)) return new Component(model);
      this.model = model;
    }
    Component.prototype = {
      _link: link,
      link: link,
      _render: render,
      render: render,
      compile: compile
    };
    return Component;
  })();

  function TurtleModel(name, color, weapon, description, imageSource) {
    if (!(this instanceof TurtleModel)) return new TurtleModel(name, color, weapon, description, imageSource);
    this.name = name;
    this.color = color;
    this.weapon = weapon;
    this.description = description;
    this.imageSource = imageSource;
  }

  var TurtlePreviewComponent = (function () {
    function TurtlePreviewComponent(model) {
      if (!(this instanceof TurtlePreviewComponent)) return new TurtlePreviewComponent(model);
      Component.call(this, model);
    }
    TurtlePreviewComponent.prototype = util.create(Component.prototype, {
      render: function (root, i) {
        this._render(root, i);
        this.link(root, i);
        this.img.css('content', 'url(' + this.model.imageSource + ')');
        this.name.css('display', 'none');
        this.name.append(this.model.name);
        this.weapon.append(this.model.weapon);
        this.weapon.css('display', 'none');
        this.description.append(this.model.description);
        this.description.css('display', 'none');
        return this;
      },
      compile: function () {
        return '<div class="turtle"><div class="turtle-img-container"><div class="turtle-img"></div></div><div class="turtle-name"></div><div class="turtle-weapon"></div><div class="turtle-description"></div></div>';
      },
      link: function (root, i) {
        this._link(root, i);
        this.img = this.el.find('.turtle-img');
        this.name = this.el.find('.turtle-name');
        this.weapon = this.el.find('.turtle-weapon');
        this.description = this.el.find('.turtle-description');
        return this;
      }
    });
    return TurtlePreviewComponent;
  })();

  var Application = (function ($) {
    function fetchAndParseTurtleXML() {
      var deferred = Deferred();
      $.get({
        url: '/base/TMNT.xml',
        dataType: 'xml',
        success: function (result) {
          var turtles = $(result).find('turtle');
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

    function Application(config) {
      if (!(this instanceof Application)) return new Application(config);
      this.config = config;
    }
    
    Application.prototype = util.create(Component.prototype, {
      start: function () {
        var self = this;
        fetchAndParseTurtleXML().then(function (models) {
          self.turtles = models.map(function (v) {
            return TurtlePreviewComponent(v);
          });
          self.render();
        });
        return this;
      },
      link: function () {
        this.el = $('#application');
        return this;
      },
      render: function () {
        var self = this;
        self._render();
        self.turtles.forEach(function (v, i) {
          v.render(self.el, i);
        });
        return this;
      }
    });
    return Application;
  })($);

  this.util = util;
  this.Application = Application;

}).call(this);

var application = Application().start();
