'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var preact = _interopDefault(require('preact'));

const makeSubject = () => {
  const observers = new Map();
  let idPtr = 0;
  return {
    subscribe: callback => {
      const id = idPtr;
      idPtr++;
      observers.set(id, callback);
      return () => observers.delete(id);
    },
    next: function next() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      observers.forEach(callback => callback(...args));
    }
  };
};

var store = (function () {
  let store = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  const state$ = makeSubject();

  return {
    subscribe: func => state$.subscribe(func),
    set: (mountPoint, payload) => {
      store[mountPoint] = payload;
      state$.next();
    },
    get: mountPoint => store[mountPoint]
  };
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

class Container extends preact.Component {
  constructor() {
    super();
    this.update = this.update.bind(this);
  }

  componentWillMount() {
    this.unsubscribe = this.props.store.subscribe(this.update);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  update() {
    this.forceUpdate();
  }

  render(_ref) {
    let children = _ref.children,
        store = _ref.store;

    return React.createElement(
      'div',
      null,
      children.map(componentFunc => componentFunc(store))
    );
  }
}

const perf = (Component, keys) => class Perf extends preact.Component {
  shouldComponentUpdate(nextProps) {
    return keys.some(key => nextProps[key] !== this.props[key]);
  }

  render() {
    return React.createElement(Component, this.props);
  }
};

const mapper = function mapper() {
  let propMappings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let actionMappings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return Component => {
    const PerfComponent = perf(Component, Object.keys(propMappings));
    return (_ref2) => {
      let store = _ref2.store,
          props = _objectWithoutProperties(_ref2, ['store']);

      const mapped = Object.assign({}, ...Object.entries(propMappings).map((_ref3) => {
        var _ref4 = _slicedToArray(_ref3, 2);

        let key = _ref4[0],
            func = _ref4[1];
        return { [key]: func(store) };
      }));

      const actions = Object.assign({}, ...Object.entries(actionMappings).map((_ref5) => {
        var _ref6 = _slicedToArray(_ref5, 2);

        let key = _ref6[0],
            func = _ref6[1];
        return { [key]: function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return func(store, ...args);
          } };
      }));

      return React.createElement(PerfComponent, _extends({}, mapped, actions, props));
    };
  };
};

var main = {
  store,
  Container,
  mapper
};

module.exports = main;
//# sourceMappingURL=main.js.map
