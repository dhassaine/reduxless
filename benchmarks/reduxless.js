const reduxless = require("../dist/reduxless");
require("jsdom-global")();

const initialState = {};
for (let i = 1; i <= 100; i++) {
  initialState[`mount${i}`] = {};
}

const store = reduxless.createStore(initialState);
reduxless.enableHistory(store, [], [], {
  useHash: false
});

const setAction1 = (store, value1, value2) =>
  store.set("mount1", {
    value1: value1,
    value2: value2
  });

const selectors = [];
for (let i = 1; i <= 100; i++) {
  selectors.push(store => {
    const obj = store.get(`mount${i}`);
    return obj.value1 * obj.value2;
  });
}

module.exports = () => {
  setAction1(store, 2, 3);
  //selectors.forEach(selector => selector(store));
};
