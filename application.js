(function () {
  "use strict";
  var $ = this.$;
  var Deferred = $.Deferred;
  var Util = (function ($) {
    var hasOwnProperty =  Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString,
        getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
        forEach = Array.prototype.forEach || forEachShim,
        map = Array.prototype.map || mapShim,
        Deferred = $.Deferred;

    function timeout(n) {
      var deferred = Deferred();
      setTimeout(function () {
        deferred.resolve();
      }, n);
      return deferred;
    }
    function keysShim(o) {
      var retval = [];
      for (var i in o) {
        if (hasOwnProperty.call(o, i)) {
          retval.push(i);
        }
      }
      return retval;
    }
    var keys = Object.keys || keysShim;
    function forEachShim(cb, thisArg) {
      for (var i = 0; i < this.length; ++i) {
        cb.call(thisArg, this[i], i, this);
      }
    }
    function mapShim (cb, thisArg) {
      var retval = [];
      forEach.call(this, function (v, i, arr) {
        retval.push(cb.call(thisArg, v, i, arr));
      });
      return retval;
    }
    function assignShim(dest, src) {
      forEach.call(keys(src), function (v) {
        dest[v] = src[v];
      });
      return dest;
    }
    var assign = Object.assign || assignShim;
    function forOwn(obj, cb, thisArg) {
      return forEachEarlyExit.call(keys(obj), function (v, i) {
        return cb.call(thisArg, obj[v], v, i, obj);
      });
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
    function forEachEarlyExit(fn, thisArg) {
      try {
        forEach.call(this, function (v, i, arr) {
          if (fn.call(thisArg, v, i, arr) === false) throw Error('@EarlyExit');
        });
        return true;
      } catch (e) {
        if (e.message === '@EarlyExit') return false;
        throw e;
      }
    }
    function isDate (d) {
      return toString.call(d) === '[object Date]';
    }
    function isArrayShim(a) {
      return toString.call(d) === '[object Array]';
    }
    var isArray = Array.isArray || isArrayShim;
    function simpleEqual(a, b, depth) {
      if (typeof depth === 'undefined') depth = 1;
      if (!depth) return true;
      switch (typeof a) {
        case 'string':
        case 'boolean':
        case 'undefined':
        case 'function':
          return a === b;
        case 'number':
          // handle NaN
          if (a !== a) return b !== b;
          return a === b;
        case 'function':
        case 'object':
          if (typeof b !== 'object') return false;
          if (isArray(a)) {
            if (!isArray(b)) return false;
            if (a.length !== b.length) return false;
            if (!forEachEarlyExit.call(a, function (v, i) {
              if (!simpleEqual(v, b[i], depth - 1)) return false;
            })) return false;
            return true;
          }
          if (isDate(a)) {
            if (!isDate(b)) return false;
            else return a.getTime() === b.getTime();
          }
          if (!forOwn(a, function (value, key) {
            if (!simpleEqual(value, b[key], depth - 1)) return false;
          })) {
            return false;
          }
          return true;
      }
    }
    var find = Array.prototype.find || function (fn, thisArg) {
      var result = null;
      forEachEarlyExit.call(this, function (v, i, arr) {
        if (fn.call(thisArg, v, i, arr)) {
          result = v;
          return false;
        }
      });
      return result;
    };
    var findIndex = Array.prototype.findIndex || function (fn, thisArg) {
      var idx = -1;
      forEachEarlyExit.call(this, function (v, i, arr) {
        if (fn.call(thisArg, v, i, arr)) {
          idx = i;
          return false;
        }
      });
      return idx;
    };
    function capitalizeFirst(str) {
      if (/^[^A-Z]/.test(str)) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
      }
      return str;
    }
    return create(null, {
      timeout: timeout,
      keys: keys,
      _keysShim: keysShim,
      create: create,
      _createShim: createShim,
      assign: assign,
      _assignShim: assignShim,
      mapOwn: mapOwn,
      forOwn: forOwn,
      forEach: forEachEarlyExit,
      _forEachShim: forEachShim,
      map: map,
      _mapShim: mapShim,
      equal: simpleEqual,
      find: find,
      findIndex: findIndex,
      capitalizeFirst: capitalizeFirst,
      NOOP: function () {}
    });
  })($);

  var NetworkService = (function ($) {
    var Deferred = $.Deferred, get = $.get;
    function fetchAndParseTurtleXML() {
      var deferred = Deferred();
      get({
        url: '/TMNT.xml',
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
    return Util.create(null, {
      fetchAndParseTurtleXML: fetchAndParseTurtleXML
    });
  })($);

  var Store = (function () {
    var reducer = function (evt, state) { return state; };
    var observers = [];
    var state;
    function callReducer(evt, state, key, branch) {
      if (typeof branch[key] === 'function') {
        return branch[key](evt, state[key]);
      } else if (typeof branch[key] === 'object') {
        return Util.mapOwn(branch[key], function (v, k, i, self) {
          return callReducer(evt, state[key], k, self);
        });
      }
    }
    function getState() { return state; }
    function combineReducers(tree) {
      return function (evt, state) {
        if (!state) state = {};
        return Util.mapOwn(tree, function (v, k, i, self) {
          return callReducer(evt, state, k, self);
        });
      };
    }
    function setReducer(fn) {
      reducer = fn;
    }
    function dispatch(evt) {
      var oldState = state;
      state = reducer(evt, state);
      Util.forEach.call(observers, function (v) {
        v(state, oldState);
      });
    }
    function unsubscribe(fn) {
      var idx;
      if (~(idx = observers.indexOf(fn))) {
        observers.splice(idx, 1);
        return true;
      }
      return false;
    }
    function subscribe(fn) {
      return observers.push(fn);
    }
    return {
      dispatch: dispatch,
      setReducer: setReducer,
      combineReducers: combineReducers,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      getState: getState
    };
  })();

  var AnimateService = (function ($) {
    var Deferred = $.Deferred;
    return function (component, animation, duration) {
      var deferred = Deferred();
      var el;
      if (component instanceof Component) el = component.el;
      else el = component;
      if (!el) throw Error('Component is not linked -- cannot animate');
      el.animate(animation, duration);
      setTimeout(function () {
        deferred.resolve();
      }, duration);
      return deferred;
    };
  })($);

  var Component = (function () {
    function link(root, i) {
      this.el = root.children().eq(i);
    }
    function render(root, i) {
      if (this.el) this.el.html('');
      if (root === true) root = this.el;
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
    TurtlePreviewComponent.prototype = Util.create(Component.prototype, {
      render: function (root, i) {
        this._render(root, i);
        this.img.css('background-image', 'url(' + Store.getState().turtles[i].imageSource + ')');
        return this;
      },
      compile: function () {
        return '<span class="turtle">' +
                 '<div class="turtle-img-container">' +
                   '<div class="turtle-img"></div>' +
                 '</div>' +
               '</span>';
      },
      link: function (root, i) {
        this._link(root, i);
        this.el.click(function () {
          Store.dispatch({
            type: 'SELECT_TURTLE',
            select: Store.getState().turtles[i].name
          });
        });
        this.img = this.el.find('.turtle-img');
        this.name = this.el.find('.turtle-name');
        this.weapon = this.el.find('.turtle-weapon');
        this.description = this.el.find('.turtle-description');
        return this;
      }
    });
    return TurtlePreviewComponent;
  })();

  var TurtleSelectComponent = (function ($) {

    function TurtleSelectComponent(model) {
      if (!(this instanceof TurtleSelectComponent)) return new TurtleSelectComponent(model);
      Component.call(this, model);
    }

    TurtleSelectComponent.prototype = Util.create(Component.prototype, {
      link: function () {
        this.el = $('#turtle-select');
        return this;
      },
      render: function () {
        var self = this;
        self._render();
        self.previews = Util.map.call(Store.getState().turtles, function (v) {
          return TurtlePreviewComponent(v);
        });
        Util.forEach.call(self.previews, function (v, i) {
          v.render(self.el, i);
        });
        return this;
      }
    });

    return TurtleSelectComponent;

  })($);

  var TurtleDetailsComponent = (function ($) {
    function TurtleDetailsComponent(model) {
      if (!(this instanceof TurtleDetailsComponent)) return new TurtleDetailsComponent(model);
      Component.call(this, model);
    }
    TurtleDetailsComponent.prototype = Util.create(Component.prototype, {
      render: function (root, i) {
        this.el = $('#turtle-details');
        this.container = $('#turtle-details-container');
        this._render(true);
        var turtle = Util.find.call(Store.getState().turtles, function (v) {
          return v.name === Store.getState().selected;
        });
        if (turtle) {
          this.container.css('border-color', turtle.color);
          this.img.find('img').attr('src', turtle.imageSource);
//          this.img.css('background-image', 'url(' + turtle.imageSource + ')');
          this.name.append(turtle.name);
          this.weapon.append('Weapon: ' + turtle.weapon);
          this.description.append('<i>' + turtle.description + '</i>');
        }
        return this;
      },
      compile: function () {
                 return '<tr valign="middle">' + 
                   '<td class="turtle-img-full" valign="middle"><img src="#" /></td>' +
                   '<td class="turtle-information" valign="middle">' +
                     '<div class="turtle-name"></div>' +
                     '<div class="turtle-weapon"></div>' + 
                     '<div class="turtle-description"></div>' +
                     '<table class="back-button"><tr><td>Back</td></tr></table>' +
                    '</td>' +
                  '</tr>';
      },
      link: function (root, i) {
        this.el = $('#turtle-details');
        this.img = this.el.find('.turtle-img-full');
        this.name = this.el.find('.turtle-name');
        this.weapon = this.el.find('.turtle-weapon');
        this.description = this.el.find('.turtle-description');
        this.back = this.el.find('.back-button');
        this.back.click(function () {
          Store.dispatch({
            type: 'SELECT_TURTLE',
            select: 'none'
          });
        });
        return this;
      }
    });
    return TurtleDetailsComponent;
  })($);

  var Application = (function ($) {

    var Deferred = $.Deferred;

    function Application(config) {
      if (!(this instanceof Application)) return new Application(config);
      this.config = config;
    }
    
    Application.prototype = Util.create(Component.prototype, {
      run: function () {
        var self = this,
            deferred = Deferred();
        $(document).ready(function () {
          self.start().then(function () {
            deferred.resolve(self);
          });
        });
        return deferred;
      },
      link: function () {
        this.el = $('#application');
      },
      compile: function () {
          return '<tr>' + 
                   '<td class="viewport">' +
                     '<div id="select-banner">Select a turtle!</div>' +
                     '<div id="turtle-select"></div>' +
                   '</td>' +
                   '<td class="viewport">' +
                     '<table id="turtle-details-container">' +
                       '<tr>' +
                         '<td>' +
                           '<table id="turtle-details"></table>' +
                         '</td>' +
                       '</tr>' +
                     '</table>' +
                   '</td>' +
                 '</tr>'; 
      },
      start: function () {
        var self = this;
        this.link();
        this.render(true);
        this.turtleSelectComponent = TurtleSelectComponent();
        this.turtleDetailsComponent = TurtleDetailsComponent();
        Store.setReducer(Store.combineReducers({
          turtles: function (evt, state) {
            if (!state) state = [];
            switch (evt.type) {
              case 'LOAD_TURTLES':
                return evt.turtles;
              default:
                return state;
            }
          },
          selected: function (evt, state) {
            if (!state) state = 'none';
            switch (evt.type) {
              case 'SELECT_TURTLE':
                return evt.select;
              default:
                return state;
            }
          }
        }));
        $(window).on('hashchange', function () {
          self.handleHashChange();
        });
        Store.subscribe(function (state, oldState) {
          if (!oldState && state.turtles) {
            self.turtleSelectComponent.render();
            self.slideDown().then(function () {
              self.handleHashChange();
            });
          }
          if (oldState && (state.selected !== oldState.selected)) {
            if (oldState.selected === 'none') {
              self.turtleDetailsComponent.render();
              self.slideRight();
              window.location.hash = state.selected.toLowerCase();
            } else if (state.selected === 'none') {
              self.turtleSelectComponent.render();
              self.slideLeft();
              window.location.hash = '';
            } else {
              window.location.hash = state.selected.toLowerCase();
              self.slideUp().then(function () {
                self.turtleDetailsComponent.render();
                self.slideDown();
              });
            }
          }
        });
        var deferred = Deferred();
        NetworkService.fetchAndParseTurtleXML().then(function (models) {
          Store.dispatch({
            type: 'LOAD_TURTLES',
            turtles: models
          });
          deferred.resolve(self);
        });
        return deferred;
      },
      handleHashChange: function () {
        Store.dispatch({
          type: 'SELECT_TURTLE',
          select: Util.capitalizeFirst(window.location.hash.substr(1)) || 'none'
        });
        return this;
      },
      slideDown: function () {
        return AnimateService(this, {
          top: '10%'
        }, 400);
      },
      slideUp: function () {
        return AnimateService(this, {
          top: '-200%'
        }, 400);
      },
      slideLeft: function () {
        return AnimateService(this, {
          left: '0%'
        }, 400);
      },
      slideRight: function () {
        return AnimateService(this, {
          left: '-100%'
        }, 400);
      }
    });
    return Application;
  })($);

  Util.assign(this, {
    Util: Util,
    Application: Application,
    Store: Store,
    Component: Component,
    TurtlePreviewComponent: TurtlePreviewComponent,
    TurtleSelectComponent: TurtleSelectComponent,
    NetworkService: NetworkService
  });

}).call(this);

var application = Application();
var readyPromise = application.run();
