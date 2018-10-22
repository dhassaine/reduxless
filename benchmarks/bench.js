const Benchmark = require("benchmark");
const createSelector = require("reselect").createSelector;
const selectorMemoizer = require("../dist").selectorMemoizer;

const suite = new Benchmark.Suite();

const selector1 = store => store.a;
const selector2 = store => store.b;
const fn = (a, b) => a.value * b.value;

const reduxlessSelector = selectorMemoizer(fn, selector1, selector2);
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

  // add listeners
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run();
