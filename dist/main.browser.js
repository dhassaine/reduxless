'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var preact = _interopDefault(require('preact'));

var makeSubject = function makeSubject() {
  var observers = new Map();
  var idPtr = 0;
  return {
    subscribe: function subscribe(callback) {
      var id = idPtr;
      idPtr++;
      observers.set(id, callback);
      return function () {
        return observers.delete(id);
      };
    },
    next: function next() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      observers.forEach(function (callback) {
        return callback.apply(undefined, args);
      });
    }
  };
};

var store = (function () {
  var store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var state$ = makeSubject();

  return {
    subscribe: function subscribe(func) {
      return state$.subscribe(func);
    },
    set: function set(mountPoint, payload) {
      store[mountPoint] = payload;
      state$.next();
    },
    get: function get(mountPoint) {
      return store[mountPoint];
    }
  };
});

var Container = function (_preact$Component) {
  babelHelpers.inherits(Container, _preact$Component);

  function Container() {
    babelHelpers.classCallCheck(this, Container);

    var _this = babelHelpers.possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this));

    _this.update = _this.update.bind(_this);
    return _this;
  }

  babelHelpers.createClass(Container, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.unsubscribe = this.props.store.subscribe(this.update);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.unsubscribe();
    }
  }, {
    key: 'update',
    value: function update() {
      this.forceUpdate();
    }
  }, {
    key: 'render',
    value: function render(_ref) {
      var children = _ref.children,
          store = _ref.store;

      return React.createElement(
        'div',
        null,
        children.map(function (componentFunc) {
          return componentFunc(store);
        })
      );
    }
  }]);
  return Container;
}(preact.Component);

var perf = function perf(Component, keys) {
  return function (_preact$Component2) {
    babelHelpers.inherits(Perf, _preact$Component2);

    function Perf() {
      babelHelpers.classCallCheck(this, Perf);
      return babelHelpers.possibleConstructorReturn(this, (Perf.__proto__ || Object.getPrototypeOf(Perf)).apply(this, arguments));
    }

    babelHelpers.createClass(Perf, [{
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps) {
        var _this3 = this;

        return keys.some(function (key) {
          return nextProps[key] !== _this3.props[key];
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return React.createElement(Component, this.props);
      }
    }]);
    return Perf;
  }(preact.Component);
};

var mapper = function mapper() {
  var propMappings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var actionMappings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (Component) {
    var PerfComponent = perf(Component, Object.keys(propMappings));
    return function (_ref2) {
      var store = _ref2.store,
          props = babelHelpers.objectWithoutProperties(_ref2, ['store']);

      var mapped = Object.assign.apply(Object, [{}].concat(babelHelpers.toConsumableArray(Object.entries(propMappings).map(function (_ref3) {
        var _ref4 = babelHelpers.slicedToArray(_ref3, 2),
            key = _ref4[0],
            func = _ref4[1];

        return babelHelpers.defineProperty({}, key, func(store));
      }))));

      var actions = Object.assign.apply(Object, [{}].concat(babelHelpers.toConsumableArray(Object.entries(actionMappings).map(function (_ref6) {
        var _ref7 = babelHelpers.slicedToArray(_ref6, 2),
            key = _ref7[0],
            func = _ref7[1];

        return babelHelpers.defineProperty({}, key, function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return func.apply(undefined, [store].concat(args));
        });
      }))));

      return React.createElement(PerfComponent, babelHelpers.extends({}, mapped, actions, props));
    };
  };
};

var main = {
  store: store,
  Container: Container,
  mapper: mapper
};

module.exports = main;
//# sourceMappingURL=main.browser.js.map
