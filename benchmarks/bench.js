const Benchmark = require("benchmark");
const createSelector = require("reselect").createSelector;
const selectorMemoizer = require("../dist/reduxless").selectorMemoizer;

const selectorMemoizerOld = (selectors, fn) => {
  let lastResult = null;
  let lastProps = {};

  return store => {
    const props = Object.entries(selectors).reduce(
      (results, [key, selector]) => {
        results[key] = selector(store);
        return results;
      },
      {}
    );

    const hasPropsChanged = Object.entries(props).some(
      ([key, prop]) => lastProps[key] !== prop
    );

    if (!hasPropsChanged) return lastResult;

    lastProps = props;
    lastResult = fn(props);
    return lastResult;
  };
};

const suite = new Benchmark.Suite();

const selector1 = store => store.a;
const selector2 = store => store.b;
const fn = (a, b) => a.value * b.value;

const reduxlessSelector = selectorMemoizer(selector1, selector2, fn);
const reduxlessSelectorOld = selectorMemoizerOld(selector1, selector2, fn);
const reselectSelector = createSelector(selector1, selector2, fn);

const store1 = {
  a: { value: 10 },
  b: { value: 2 }
};
const store2 = { ...store1 };
let stores = [store1, store2];
let pointer = 0;
// add tests
suite
  .add("reselect", function() {
    reselectSelector(stores[pointer % 2]);
    pointer++;
  })
  .add("selectorMemoizer", function() {
    reduxlessSelector(stores[pointer % 2]);
    pointer++;
  })
  .add("selectorMemoizerOld", function() {
    reduxlessSelectorOld(stores[pointer % 2]);
    pointer++;
  })

  // add listeners
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run();
