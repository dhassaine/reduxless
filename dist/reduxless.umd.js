(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.reduxless = factory());
}(this, (function () { 'use strict';

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

return store$1;

})));
