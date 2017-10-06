import { Component } from 'react';
import { Component as Component$1 } from 'preact';
import Component$2 from 'inferno-component';

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

var store$1 = (function () {
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var noop = function noop() {};

var createContainer = function createContainer(Component$$1) {
  return function (_Component) {
    _inherits(Container, _Component);

    function Container(props) {
      _classCallCheck(this, Container);

      var _this = _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).call(this, props));

      _this.unsubscribe = noop;
      _this.update = _this.update.bind(_this);
      return _this;
    }

    _createClass(Container, [{
      key: "update",
      value: function update() {
        this.forceUpdate();
      }
    }, {
      key: "componentWillMount",
      value: function componentWillMount() {
        this.unsubscribe = this.props.store.subscribe(this.update);
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        this.unsubscribe();
      }
    }, {
      key: "render",
      value: function render() {
        var _props = this.props,
            children = _props.children,
            store = _props.store;

        if (Array.isArray(children)) {
          return children.length > 1 ? React.createElement(
            "div",
            null,
            children.map(function (f) {
              return f(store);
            })
          ) : children[0] && children[0](store);
        } else {
          return children(store);
        }
      }
    }]);

    return Container;
  }(Component$$1);
};

var perf = function perf(Component$$1, Wrapped, keys) {
  return function (_Component2) {
    _inherits(Perf, _Component2);

    function Perf() {
      _classCallCheck(this, Perf);

      return _possibleConstructorReturn(this, (Perf.__proto__ || Object.getPrototypeOf(Perf)).apply(this, arguments));
    }

    _createClass(Perf, [{
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps) {
        var _this3 = this;

        return keys.some(function (key) {
          return nextProps[key] !== _this3.props[key];
        });
      }
    }, {
      key: "render",
      value: function render() {
        return React.createElement(Wrapped, this.props);
      }
    }]);

    return Perf;
  }(Component$$1);
};

var createMapper = function createMapper(Component$$1) {
  return function () {
    var propMappings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var actionMappings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return function (Wrapped) {
      var PerfComponent = perf(Component$$1, Wrapped, Object.keys(propMappings));
      return function (_ref) {
        var store = _ref.store,
            props = _objectWithoutProperties(_ref, ["store"]);

        var mapped = Object.assign.apply(Object, [{}].concat(_toConsumableArray(Object.entries(propMappings).map(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
              key = _ref3[0],
              func = _ref3[1];

          return _defineProperty({}, key, func(store));
        }))));

        var actions = Object.assign.apply(Object, [{}].concat(_toConsumableArray(Object.entries(actionMappings).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              key = _ref6[0],
              func = _ref6[1];

          return _defineProperty({}, key, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return func.apply(undefined, [store].concat(args));
          });
        }))));

        return React.createElement(PerfComponent, _extends({}, mapped, actions, props));
      };
    };
  };
};

var Container = createContainer(Component);
var mapper = createMapper(Component);

var react$1 = Object.freeze({
	Container: Container,
	mapper: mapper
});

var Container$1 = createContainer(Component$1);
var mapper$1 = createMapper(Component$1);

var preact$1 = Object.freeze({
	Container: Container$1,
	mapper: mapper$1
});

var Container$2 = createContainer(Component$2);
var mapper$2 = createMapper(Component$2);

var inferno = Object.freeze({
	Container: Container$2,
	mapper: mapper$2
});

export { react$1 as react, preact$1 as preact, inferno };
export default store$1;
