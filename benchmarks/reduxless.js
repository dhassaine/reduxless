const reduxless = require("../dist");
const STATE_SIZE = require("./constants").STATE_SIZE;

const { createStore } = reduxless;

const initialState = {};
for (let i = 1; i <= STATE_SIZE; i++) {
  initialState[`mount${i}`] = {
    value1: 1,
    value2: 2
  };
}

const store = createStore(initialState);

const setAction1 = (store, value1, value2) =>
  store.set("mount1", {
    value1: value1,
    value2: value2
  });

const selectors = [];
for (let i = 1; i <= STATE_SIZE; i++) {
  selectors.push(store => store.get(`mount${i}`).value1);
}

exports.actionTest = () => setAction1(store, 2, 3);

exports.actionAndSelectorTest = () => {
  setAction1(store, 2, 3);
  selectors.forEach(selector => selector(store));
};
